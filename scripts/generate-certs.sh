#!/bin/bash
set -e

if ! command -v mkcert &>/dev/null; then
  echo "mkcert is not installed."
  echo "Install it from https://github.com/FiloSottile/mkcert"
  exit 1
fi

CERT_DIR="certs"
mkdir -p "$CERT_DIR"

CERT_FILE="$CERT_DIR/local-domains.pem"
KEY_FILE="$CERT_DIR/local-domains-key.pem"

REQUIRED_DOMAINS=(
  "war9a.localhost"
  "api.war9a.localhost"
  "traefik.war9a.localhost"
  "cdn.war9a.localhost"
  "storage.war9a.localhost"
)

needs_regen=1
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  if command -v openssl &>/dev/null; then
    SAN_OUTPUT="$(openssl x509 -in "$CERT_FILE" -noout -ext subjectAltName 2>/dev/null || true)"
    if [ -n "$SAN_OUTPUT" ]; then
      missing_domain=0
      for domain in "${REQUIRED_DOMAINS[@]}"; do
        if ! grep -q "DNS:$domain" <<<"$SAN_OUTPUT"; then
          missing_domain=1
          break
        fi
      done
      if [ "$missing_domain" -eq 0 ]; then
        needs_regen=0
      fi
    fi
  fi
fi

if [ "$needs_regen" -eq 0 ]; then
  echo "Certificates are up to date. Skipping generation."
  exit 0
fi

echo "Installing local CA (you might be prompted for your password)..."
mkcert -install

echo "Generating certificate for War9a domains..."
mkcert -cert-file "$CERT_FILE" -key-file "$KEY_FILE" "${REQUIRED_DOMAINS[@]}"

echo "Certificates generated successfully in $CERT_DIR/"
