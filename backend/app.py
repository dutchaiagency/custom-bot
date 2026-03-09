import json
import os
from datetime import date, timedelta
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import anthropic

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Multi-bot system ---

BOTS_DIR = Path(__file__).parent.parent / "bots"

DEFAULT_CONFIG = {
    "name": "Assistent",
    "welcome": "Hoi! Hoe kan ik je helpen?",
    "primary_color": "#1a1a2e",
    "accent_color": "#e94560",
    "avatar_letter": "A",
    "subtitle": "Online - antwoordt direct",
    "powered_by": "Powered by Dutch AI Agency",
}

DEFAULT_SYSTEM_PROMPT = """Je bent een vriendelijke chat-assistent voor {name}.
Vandaag is het {today}.

FORMATTING: Schrijf ALLEEN gewone zinnen. Nooit bold, italic, sterretjes, lijsten, opsommingen, of "Label: waarde" formatting. Gewoon praten zoals een mens.

DATUMS: Als iemand "morgen", "overmorgen" of een dag noemt, vertaal het zelf naar de juiste datum en bevestig die. Vraag de klant NOOIT om een exacte datum te geven, jij rekent het zelf uit.

STIJL: Max 2-3 zinnen per bericht. Warm, vriendelijk, behulpzaam. Gebruik alleen info uit de kennisbank. Bij klachten of lastige vragen: schakel een medewerker in.

Kennisbank:
{knowledge}

DATUM REFERENTIE: Vandaag = {today}. Morgen = {tomorrow}. Overmorgen = {day_after}. Gebruik deze datums direct."""


def load_bot(bot_id: str) -> dict:
    """Load a bot's config and knowledge from bots/<bot_id>/"""
    bot_dir = BOTS_DIR / bot_id
    if not bot_dir.exists():
        return None

    # Config
    config_path = bot_dir / "config.json"
    if config_path.exists():
        custom = json.loads(config_path.read_text(encoding="utf-8"))
        config = {**DEFAULT_CONFIG, **custom}
    else:
        config = DEFAULT_CONFIG.copy()

    # Knowledge
    knowledge_dir = bot_dir / "knowledge"
    texts = []
    if knowledge_dir.exists():
        for file in knowledge_dir.glob("*.md"):
            texts.append(file.read_text(encoding="utf-8"))
    config["_knowledge"] = "\n\n---\n\n".join(texts)

    return config


def build_system_prompt(bot: dict) -> str:
    """Build the system prompt for a bot."""
    today_date = date.today()
    today = nl_date(today_date)
    tomorrow = nl_date(today_date + timedelta(days=1))
    day_after = nl_date(today_date + timedelta(days=2))

    # Use custom system_prompt from config if available
    if "system_prompt" in bot:
        prompt = bot["system_prompt"]
        prompt += f"\n\nVandaag is het {today}."
        prompt += f"\n\nKennisbank:\n{bot['_knowledge']}"
        prompt += f"\n\nDATUM REFERENTIE: Vandaag = {today}. Morgen = {tomorrow}. Overmorgen = {day_after}. Gebruik deze datums direct."
        return prompt

    return DEFAULT_SYSTEM_PROMPT.format(
        name=bot["name"],
        today=today,
        tomorrow=tomorrow,
        day_after=day_after,
        knowledge=bot["_knowledge"],
    )


# Preload all bots
bots: dict[str, dict] = {}
if BOTS_DIR.exists():
    for bot_dir in BOTS_DIR.iterdir():
        if bot_dir.is_dir():
            bot = load_bot(bot_dir.name)
            if bot:
                bots[bot_dir.name] = bot
                print(f"Loaded bot: {bot_dir.name} ({bot['name']})")

# Fallback: load legacy single-bot config
LEGACY_CONFIG_PATH = Path(__file__).parent.parent / "config.json"
LEGACY_KNOWLEDGE_DIR = Path(__file__).parent.parent / "knowledge"

if not bots and LEGACY_CONFIG_PATH.exists():
    legacy_config = json.loads(LEGACY_CONFIG_PATH.read_text(encoding="utf-8"))
    config = {**DEFAULT_CONFIG, **legacy_config}
    texts = []
    if LEGACY_KNOWLEDGE_DIR.exists():
        for file in LEGACY_KNOWLEDGE_DIR.glob("*.md"):
            texts.append(file.read_text(encoding="utf-8"))
    config["_knowledge"] = "\n\n---\n\n".join(texts)
    bots["default"] = config
    print("Loaded legacy bot as 'default'")

# Set first bot as default
DEFAULT_BOT_ID = list(bots.keys())[0] if bots else None

NL_DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"]
NL_MONTHS = ["januari", "februari", "maart", "april", "mei", "juni",
             "juli", "augustus", "september", "oktober", "november", "december"]


def nl_date(d: date) -> str:
    return f"{NL_DAYS[d.weekday()]} {d.day} {NL_MONTHS[d.month - 1]} {d.year}"


client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


def get_bot(bot_id: str | None) -> dict:
    if bot_id and bot_id in bots:
        return bots[bot_id]
    if DEFAULT_BOT_ID:
        return bots[DEFAULT_BOT_ID]
    raise HTTPException(status_code=404, detail="No bot configured")


@app.get("/api/config")
async def get_config(bot: str = None):
    bot_data = get_bot(bot)
    # Return config without internal fields
    return JSONResponse({k: v for k, v in bot_data.items() if not k.startswith("_")})


@app.post("/api/chat")
async def chat(request: ChatRequest, bot: str = None):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=500, detail="API key not configured")

    bot_data = get_bot(bot)

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=512,
            system=build_system_prompt(bot_data),
            messages=[{"role": m.role, "content": m.content} for m in request.messages],
        )
        return {"reply": response.content[0].text}
    except anthropic.APIError as e:
        raise HTTPException(status_code=500, detail=str(e))


# Health check
@app.get("/api/health")
async def health():
    return {"status": "ok", "bots": list(bots.keys())}


# Serve frontend
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
