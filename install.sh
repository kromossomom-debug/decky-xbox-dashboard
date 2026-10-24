#!/usr/bin/env bash
# Instala o plugin Xbox Dashboard no Decky Loader (pede a senha do sudo).
set -euo pipefail
cd "$(dirname "$0")"
[ -f dist/index.js ] || { echo "dist/index.js não encontrado. Rode 'npm install && npm run build' antes."; exit 1; }
DEST="$HOME/homebrew/plugins/xbox-dashboard"
sudo rm -rf "$DEST"
sudo mkdir -p "$DEST/dist"
sudo cp dist/index.js "$DEST/dist/"
sudo cp main.py plugin.json package.json LICENSE README.md "$DEST/"
sudo systemctl restart plugin_loader
echo "Instalado em $DEST. O Decky foi reiniciado."
