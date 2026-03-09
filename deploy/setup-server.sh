#!/bin/bash
# ==============================================
# Dutch AI Agency - VPS Setup Script
# Run as root on a fresh Ubuntu 24.04 server
# ==============================================

set -e

echo "=== System update ==="
apt update && apt upgrade -y

echo "=== Install Python, pip, git ==="
apt install -y python3 python3-pip python3-venv git

echo "=== Install Caddy ==="
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

echo "=== Configure firewall ==="
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "=== Create daia user ==="
useradd -r -s /bin/false daia || true

echo "=== Clone repo ==="
if [ ! -d /opt/custom-bot ]; then
    git clone https://github.com/dutchaiagency/custom-bot.git /opt/custom-bot
else
    cd /opt/custom-bot && git pull
fi

echo "=== Setup Python venv ==="
python3 -m venv /opt/custom-bot/venv
/opt/custom-bot/venv/bin/pip install -r /opt/custom-bot/backend/requirements.txt

echo "=== Setup .env ==="
if [ ! -f /opt/custom-bot/backend/.env ]; then
    echo "ANTHROPIC_API_KEY=sk-ant-..." > /opt/custom-bot/backend/.env
    echo ""
    echo "!!! BELANGRIJK: Pas /opt/custom-bot/backend/.env aan met je echte API key !!!"
    echo ""
fi

echo "=== Set permissions ==="
chown -R daia:daia /opt/custom-bot

echo "=== Install systemd service ==="
cp /opt/custom-bot/deploy/daia-bot.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable daia-bot
systemctl start daia-bot

echo "=== Done! ==="
echo "Bot draait op http://localhost:8000"
echo ""
echo "Volgende stappen:"
echo "1. Pas /opt/custom-bot/backend/.env aan met je Anthropic API key"
echo "2. Pas /etc/caddy/Caddyfile aan met je domein"
echo "3. systemctl restart daia-bot"
echo "4. systemctl restart caddy"
