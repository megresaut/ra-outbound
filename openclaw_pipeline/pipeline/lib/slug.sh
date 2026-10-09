#!/usr/bin/env bash
# Convert a company name to a stable slug.
# Usage: ./slug.sh "Acme HVAC Services, Inc."  →  acme-hvac-services

set -euo pipefail

name="${1:-}"
if [[ -z "$name" ]]; then
  echo "Usage: $0 <company name>" >&2
  exit 1
fi

# 1. Lowercase
slug="${name,,}"
# 2. Strip common corporate suffixes (must come before non-alphanum strip)
slug=$(echo "$slug" | sed -E 's/,?\s*(inc|llc|corp|corporation|co|company|the)\b\.?//g')
# 3. Replace non-alphanum with hyphens
slug=$(echo "$slug" | sed -E 's/[^a-z0-9]+/-/g')
# 4. Trim leading/trailing hyphens
slug=$(echo "$slug" | sed -E 's/^-+|-+$//g')

echo "$slug"
