#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SMTP_USERNAME:-}" || -z "${SMTP_PASSWORD:-}" || -z "${EMAIL_TO:-}" ]]; then
  echo "::notice::Lighthouse email skipped. Configure AUDIT_EMAIL_USERNAME, AUDIT_EMAIL_PASSWORD, and AUDIT_EMAIL_TO repository secrets."
  exit 0
fi

smtp_server="${SMTP_SERVER:-smtp.gmail.com}"
smtp_port="${SMTP_PORT:-465}"
audit_status="${AUDIT_STATUS:-unknown}"
audit_url="${AUDIT_URL:-unknown}"
run_url="${RUN_URL:-unknown}"
email_html_path="${EMAIL_HTML_PATH:-artifacts/branded-lighthouse-audit/portfolio-audit-email.html}"
email_text_path="${EMAIL_TEXT_PATH:-artifacts/branded-lighthouse-audit/portfolio-audit-email.txt}"
pdf_path="${PDF_PATH:-artifacts/branded-lighthouse-audit/Zubair-Hussain-Portfolio-Quality-Audit.pdf}"
message_path="${RUNNER_TEMP:-/tmp}/lighthouse-email-${GITHUB_RUN_ID:-unknown}.eml"
boundary="lighthouse-${GITHUB_RUN_ID:-unknown}-${RANDOM}"
alternative_boundary="lighthouse-body-${GITHUB_RUN_ID:-unknown}-${RANDOM}"

if [[ -f "$email_text_path" ]]; then
  email_text="$(cat "$email_text_path")"
else
  email_text="The portfolio production audit completed with status: ${audit_status}. Audited site: ${audit_url}. Workflow: ${run_url}."
fi

if [[ -f "$email_html_path" ]]; then
  email_html="$(cat "$email_html_path")"
else
  email_html="<p>The portfolio production audit completed with status: <strong>${audit_status}</strong>.</p><p>Audited site: ${audit_url}</p><p><a href=\"${run_url}\">View the workflow run</a></p>"
fi

{
  printf 'From: Zubair Hussain Portfolio <%s>\r\n' "$SMTP_USERNAME"
  printf 'To: %s\r\n' "$EMAIL_TO"
  printf 'Subject: Portfolio quality audit %s | Zubair Hussain\r\n' "$audit_status"
  printf 'MIME-Version: 1.0\r\n'
  printf 'Content-Type: multipart/mixed; boundary="%s"\r\n' "$boundary"
  printf '\r\n'
  printf -- '--%s\r\n' "$boundary"
  printf 'Content-Type: multipart/alternative; boundary="%s"\r\n\r\n' "$alternative_boundary"
  printf -- '--%s\r\n' "$alternative_boundary"
  printf 'Content-Type: text/plain; charset=UTF-8\r\n'
  printf 'Content-Transfer-Encoding: 8bit\r\n\r\n'
  printf '%s\r\n' "$email_text"
  printf -- '--%s\r\n' "$alternative_boundary"
  printf 'Content-Type: text/html; charset=UTF-8\r\n'
  printf 'Content-Transfer-Encoding: 8bit\r\n\r\n'
  printf '%s\r\n' "$email_html"
  printf -- '--%s--\r\n' "$alternative_boundary"

  if [[ -s "$pdf_path" ]]; then
    printf -- '--%s\r\n' "$boundary"
    printf 'Content-Type: application/pdf; name="Zubair-Hussain-Portfolio-Quality-Audit.pdf"\r\n'
    printf 'Content-Transfer-Encoding: base64\r\n'
    printf 'Content-Disposition: attachment; filename="Zubair-Hussain-Portfolio-Quality-Audit.pdf"\r\n\r\n'
    base64 -w 76 "$pdf_path"
    printf '\r\n'
  fi
  printf -- '--%s--\r\n' "$boundary"
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

echo "Branded Lighthouse audit email sent to ${EMAIL_TO}."
