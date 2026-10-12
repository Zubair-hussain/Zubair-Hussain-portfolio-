#!/usr/bin/env bash
set -euo pipefail

html_path="${1:-}"
pdf_path="${2:-}"

if [[ -z "$html_path" || -z "$pdf_path" ]]; then
  echo "Usage: render-audit-pdf.sh <report-html> <output-pdf>" >&2
  exit 1
fi

if [[ ! -f "$html_path" ]]; then
  echo "Audit report HTML was not found: $html_path" >&2
  exit 1
fi

chrome=""
for candidate in google-chrome-stable google-chrome chromium chromium-browser; do
  if command -v "$candidate" >/dev/null 2>&1; then
    chrome="$candidate"
    break
  fi
done

if [[ -z "$chrome" ]]; then
  echo "No Chrome or Chromium executable is available to render the audit PDF." >&2
  exit 1
fi

mkdir -p "$(dirname "$pdf_path")"
absolute_html="$(realpath "$html_path")"
absolute_pdf="$(realpath -m "$pdf_path")"

"$chrome" \
  --headless \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --no-pdf-header-footer \
  --print-to-pdf="$absolute_pdf" \
  "file://$absolute_html"

if [[ ! -s "$pdf_path" ]]; then
  echo "Chrome did not produce the expected PDF: $pdf_path" >&2
  exit 1
fi

echo "Rendered premium audit PDF: $pdf_path"
