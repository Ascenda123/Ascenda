#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

NODE_VERSION="20"

info() {
  printf '\033[1;34m[setup]\033[0m %s\n' "$1"
}

error() {
  printf '\033[1;31m[error]\033[0m %s\n' "$1" >&2
}

# Ensure curl and build essentials exist for Node installs when running in bare containers
if ! command -v curl >/dev/null 2>&1; then
  info "Installing curl (requires sudo access)..."
  sudo apt-get update -y
  sudo apt-get install -y curl
fi

if ! command -v make >/dev/null 2>&1; then
  info "Installing build essentials (requires sudo access)..."
  sudo apt-get update -y
  sudo apt-get install -y build-essential
fi

# Install nvm + Node.js if node is missing or too old
install_node() {
  info "Installing Node.js ${NODE_VERSION} via nvm..."
  export NVM_DIR="$HOME/.nvm"
  if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  fi

  # shellcheck disable=SC1090
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install ${NODE_VERSION}
  nvm use ${NODE_VERSION}
}

if command -v node >/dev/null 2>&1; then
  INSTALLED=$(node -v | sed 's/v\([0-9]*\).*/\1/')
  if [ "$INSTALLED" -lt "$NODE_VERSION" ]; then
    info "Detected Node.js $(node -v); upgrading to ${NODE_VERSION}.x"
    install_node
  else
    info "Using existing Node.js $(node -v)"
  fi
else
  install_node
fi

# shellcheck disable=SC1090
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  \. "$HOME/.nvm/nvm.sh"
  nvm use ${NODE_VERSION} >/dev/null
fi

info "Installing project npm dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

info "Setup complete. You can now run 'npm run dev' or other project scripts."
