# Botpress vs Custom Chatbot — Vergelijking

## Voor intern gebruik + salespitch

---

## Snelle Samenvatting

| | Botpress (Budget) | Custom Bot (Premium) |
|---|---|---|
| **Prijs voor klant** | €500 setup + €99/mnd | €1.500 setup + €199/mnd |
| **Bouwtijd** | 2-4 uur | 1-2 dagen |
| **AI kwaliteit** | Goed (OpenAI) | Uitstekend (Claude) |
| **Aanpasbaarheid** | Beperkt | Volledig |
| **Eigen branding** | Gedeeltelijk (Botpress logo) | 100% whitelabel |
| **Schaalbaarheid** | Afhankelijk van Botpress | Volledig in eigen hand |

---

## Gedetailleerde Vergelijking

### 1. Setup & Bouwtijd

**Botpress:**
- Account aanmaken, flows bouwen, knowledge base vullen
- Visuele editor — snel werkend prototype
- 2-4 uur voor een werkende bot
- Goed voor: snelle demo's, eerste indruk maken

**Custom:**
- Config aanmaken, knowledge base schrijven, deployen
- 1-2 dagen voor volledige setup met demo-website
- Meer werk upfront, maar daarna makkelijk te schalen
- Nieuwe klant = nieuw mapje + config, klaar

### 2. AI Kwaliteit

**Botpress:**
- Gebruikt OpenAI (GPT)
- Goede antwoorden, soms te lang of te formeel
- Beperkte controle over toon en stijl
- Knowledge base via URL scraping (kan missen)

**Custom:**
- Claude API — betere conversatie, natuurlijker Nederlands
- Volledige controle over system prompt
- Handmatige knowledge base = 100% accurate info
- Datum-herkenning, reserveringen, specifieke flows ingebouwd
- Kan per klant de persoonlijkheid aanpassen

### 3. Uiterlijk & Branding

**Botpress:**
- Standaard widget, kleuren aanpasbaar
- "Powered by Botpress" in gratis/goedkoop tier
- Beperkte styling opties
- Ziet eruit als een chatbot van een platform

**Custom:**
- Volledig whitelabel — "Powered by Dutch AI Agency" of niets
- Elke kleur, font, avatar aanpasbaar via config
- Widget past naadloos in de website
- Professioneler en unieker

### 4. Kosten (voor ons)

**Botpress:**
- Gratis tier: 5 bots, 2.000 berichten/mnd
- Pro tier: $79/mnd voor meer bots en berichten
- Geen API kosten
- Risico: prijsverhogingen, limieten, afhankelijkheid

**Custom:**
- Claude API: ~€0,003-0,01 per bericht (Sonnet)
- Server hosting: €5-10/mnd (VPS) of gratis (Render/Railway free tier)
- Totale kosten: ~€10-30/mnd per actieve klant
- Marge: klant betaalt €199/mnd, wij betalen ~€20 = €179 winst

### 5. Schaalbaarheid

**Botpress:**
- Gebonden aan hun platform en pricing
- Als zij prijzen verhogen, dalen onze marges
- Migreren is lastig (vendor lock-in)

**Custom:**
- Multi-tenant systeem: 1 server, onbeperkt bots
- Nieuwe klant = nieuw mapje in `bots/`, 30 min werk
- Kosten schalen lineair en voorspelbaar
- Volledige controle, geen afhankelijkheid

### 6. Features

| Feature | Botpress | Custom |
|---|---|---|
| FAQ beantwoorden | ✅ | ✅ |
| Reserveringen/afspraken | ✅ (met flows) | ✅ (in prompt) |
| Datum-herkenning NL | ❌ | ✅ |
| WhatsApp integratie | ✅ | 🔧 (te bouwen) |
| Email notificaties | ✅ | 🔧 (te bouwen) |
| Analytics dashboard | ✅ | 🔧 (te bouwen) |
| Handoff naar mens | ✅ | 🔧 (te bouwen) |
| Embeddable widget | ✅ | ✅ |
| Multi-taal | ✅ | ✅ |
| Custom system prompt | Beperkt | ✅ Volledig |

---

## Strategie: Twee Pakketten

### Pakket 1: Starter (Botpress)
- **€500 eenmalig + €99/mnd**
- Voor: kleine bedrijven die snel een chatbot willen
- Botpress onder de motorkap
- Basis styling, FAQ + knowledge base
- Goede instap, snel live

### Pakket 2: Professional (Custom)
- **€1.500 eenmalig + €199/mnd**
- Voor: bedrijven die een premium oplossing willen
- Volledig whitelabel, eigen branding
- Betere AI (Claude), volledig aanpasbaar
- Demo-website erbij (upsell!)
- Hogere marge voor ons

### Pakket 3: Enterprise (Custom + extras)
- **€3.000+ eenmalig + €349/mnd**
- Alles van Professional +
- WhatsApp/Instagram integratie
- Email notificaties bij leads
- Maandelijkse optimalisatie
- Voor: grotere bedrijven, meerdere locaties

---

## Conclusie

**Botpress = instapper om snel klanten binnen te halen.**
Laagdrempelig, snel op te zetten, goede demo.

**Custom = waar het geld zit.**
Hogere marge, meer controle, schaalbaarder, professioneler.

**Ideale flow:**
1. Klant binnenhalen met Botpress demo (lage drempel)
2. Na 1-3 maanden upgraden naar Custom (hogere marge)
3. Of direct Custom verkopen aan bedrijven die kwaliteit willen

---

*Laatst bijgewerkt: 2026-03-08*
