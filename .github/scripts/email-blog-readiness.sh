#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SMTP_USERNAME:-}" || -z "${SMTP_PASSWORD:-}" || -z "${EMAIL_TO:-}" ]]; then
  echo "::error::Blog readiness email cannot be sent. Configure AUDIT_EMAIL_USERNAME, AUDIT_EMAIL_PASSWORD, and AUDIT_EMAIL_TO repository secrets."
  exit 1
fi

smtp_server="${SMTP_SERVER:-smtp.gmail.com}"
smtp_port="${SMTP_PORT:-465}"
urls_file="${NEW_URLS_FILE:-.sitemap-monitor-cache/new-urls.txt}"
report_path="${REPORT_PATH:-artifacts/new-blog-seo-report.md}"
run_url="${RUN_URL:-unknown}"
message_path="${RUNNER_TEMP:-/tmp}/new-blog-ready-${GITHUB_RUN_ID:-unknown}.txt"

{
  printf 'From: %s\r\n' "$SMTP_USERNAME"
  printf 'To: %s\r\n' "$EMAIL_TO"
  printf 'Subject: New blog passed SEO audit - ready for Google Search Console\r\n'
  printf 'Content-Type: text/plain; charset=UTF-8\r\n'
  printf '\r\n'
  printf 'Your new blog post passed the automated crawlability and SEO checks.\r\n\r\n'
  printf 'Ready URLs:\r\n'
  while IFS= read -r url; do
    [[ -n "$url" ]] && printf -- '- %s\r\n' "$url"
  done < "$urls_file"
  printf '\r\nSubmit each URL manually in Google Search Console using URL Inspection, then choose Request indexing.\r\n'
  printf 'Workflow run: %s\r\n' "$run_url"
  if [[ -f "$report_path" ]]; then
    printf '\r\nSEO audit report:\r\n'
    sed 's/$/\r/' "$report_path"
  fi
} > "$message_path"

if [[ "$smtp_port" == "465" ]]; then
  smtp_url="smtps://${smtp_server}:${smtp_port}"
else
  smtp_url="smtp://${smtp_server}:${smtp_port}"
fi

curl --fail --silent --show-error \
  --url "$smtp_url" \
  --ssl-reqd \
  --user "${SMTP_USERNAME}:${SMTP_PASSWORD}" \
  --mail-from "$SMTP_USERNAME" \
  --mail-rcpt "$EMAIL_TO" \
  --upload-file "$message_path"

echo "Blog readiness email sent to ${EMAIL_TO}."
