#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  echo
  echo "==> $*"
}

append_path_once() {
  local file="$1"
  local marker="$2"

  touch "$file"

  if ! grep -q "$marker" "$file"; then
    cat <<EOF >> "$file"

# $marker
export PATH="\$HOME/.npm-global/bin:\$HOME/.local/bin:\$HOME/bin:\$PATH"
EOF
  fi
}

export DEBIAN_FRONTEND=noninteractive
export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/bin:$PATH"

mkdir -p "$HOME/.npm-global" "$HOME/.local/bin" "$HOME/bin"

append_path_once "$HOME/.bashrc" "Codespaces classroom tools path"
append_path_once "$HOME/.profile" "Codespaces classroom tools path"

log "Installing apt packages"

sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  curl \
  ca-certificates \
  git \
  jq \
  ripgrep \
  fd-find \
  tree \
  build-essential \
  pkg-config \
  unzip \
  less

if command -v fdfind >/dev/null 2>&1 && ! command -v fd >/dev/null 2>&1; then
  sudo ln -sf "$(command -v fdfind)" /usr/local/bin/fd
fi

log "Installing Antigravity CLI"

if ! command -v agy >/dev/null 2>&1; then
  curl -fsSL https://antigravity.google/cli/install.sh | bash
fi

export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/bin:$PATH"
hash -r || true

if ! command -v agy >/dev/null 2>&1; then
  FOUND_AGY="$(find "$HOME" -type f -name agy 2>/dev/null | head -n 1 || true)"

  if [ -n "$FOUND_AGY" ]; then
    chmod +x "$FOUND_AGY" || true
    ln -sf "$FOUND_AGY" "$HOME/.local/bin/agy"
    export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/bin:$PATH"
    hash -r || true
  fi
fi

if command -v agy >/dev/null 2>&1; then
  echo "Antigravity CLI found at: $(command -v agy)"
else
  echo "WARNING: Antigravity CLI installer ran, but agy was not found on PATH."
  echo "Try opening a new terminal, then run:"
  echo "  find \$HOME -type f -name agy 2>/dev/null"
fi

log "Setting up Python tools"

python3 -m pip install --user --upgrade pip pipx

export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/bin:$PATH"

python3 -m pipx ensurepath || true

install_pipx_tool() {
  local tool="$1"

  if command -v "$tool" >/dev/null 2>&1; then
    echo "$tool already available: $(command -v "$tool")"
  else
    pipx install "$tool"
  fi
}

install_pipx_tool uv
install_pipx_tool ruff
install_pipx_tool mypy
install_pipx_tool pytest
install_pipx_tool ipython

log "Setting up Node / TypeScript tools"

npm config set prefix "$HOME/.npm-global"

export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/bin:$PATH"

npm install -g \
  pnpm \
  typescript \
  tsx \
  ts-node \
  eslint \
  prettier \
  vitest

log "Configuring Git defaults"

git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.editor "code --wait"

log "Installed versions"

echo "--- Git ---"
git --version || true

echo
echo "--- GitHub CLI ---"
gh --version | head -n 1 || true

echo
echo "--- Python ---"
python3 --version || true
pipx --version || true
uv --version || true
ruff --version || true
mypy --version || true
pytest --version || true

echo
echo "--- Node / TypeScript ---"
node --version || true
npm --version || true
pnpm --version || true
tsc --version || true
tsx --version || true
eslint --version || true
prettier --version || true
vitest --version || true

echo
echo "--- Antigravity CLI ---"
if command -v agy >/dev/null 2>&1; then
  echo "agy path: $(command -v agy)"
  agy --help | head -n 20 || true
else
  echo "agy not found"
fi

log "Setup complete"

echo "Open a new terminal if PATH changes are not reflected."
echo "To start Antigravity CLI, run:"
echo "  agy"