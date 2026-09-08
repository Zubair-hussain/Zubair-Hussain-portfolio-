#!/usr/bin/env bash
set -euo pipefail

# Email is optional until repository secrets are configured. Do not turn an
# otherwise healthy production audit red just because mail delivery is not set
# up yet.
if [[ -z "${SMTP_USERNAME:-}" || -z "${SMTP_PASSWORD:-}" || -z "${EMAIL_TO:-}" ]]; then
  echo "::notice::Lighthouse email skipped. Configure AUDIT_EMAIL_USERNAME, AUDIT_EMAIL_PASSWORD, and AUDIT_EMAIL_TO repository secrets."
  exit 0
fi

smtp_server="${SMTP_SERVER:-smtp.gmail.com}"
smtp_port="${SMTP_PORT:-465}"
audit_status="${AUDIT_STATUS:-unknown}"
audit_url="${AUDIT_URL:-unknown}"
run_url="${RUN_URL:-unknown}"
report_dir="${REPORT_DIR:-.lighthouseci}"
run_id="${GITHUB_RUN_ID:-unknown}"
repository="${GITHUB_REPOSITORY:-portfolio}"
temp_dir="${RUNNER_TEMP:-/tmp}"
archive_path="${temp_dir}/lighthouse-report-${run_id}.zip"
message_path="${temp_dir}/lighthouse-email-${run_id}.txt"
boundary="lighthouse-${run_id}-${RANDOM}"
attachment_name="lighthouse-report-${run_id}.zip"

has_attachment=false
if [[ -d "$report_dir" ]] && find "$report_dir" -type f -print -quit | grep -q .; then
  (
    cd "$report_dir"
    zip -q -r "$archive_path" .
  )
  has_attachment=true
fi

subject="Lighthouse audit ${audit_status}: ${repository}"

{
  printf 'From: %s\r\n' "$SMTP_USERNAME"
  printf 'To: %s\r\n' "$EMAIL_TO"
  printf 'Subject: %s\r\n' "$subject"
  printf 'MIME-Version: 1.0\r\n'
  printf 'Content-Type: multipart/mixed; boundary="%s"\r\n' "$boundary"
  printf '\r\n'
  printf -- '--%s\r\n' "$boundary"
  printf 'Content-Type: text/plain; charset=UTF-8\r\n'
  printf 'Content-Transfer-Encoding: 8bit\r\n'
  printf '\r\n'
  printf 'The scheduled production Lighthouse audit has completed.\r\n\r\n'
  printf 'Result: %s\r\n' "$audit_status"
  printf 'Audited site: %s\r\n' "$audit_url"
  printf 'Repository: %s\r\n' "$repository"
  printf 'Workflow run: %s\r\n' "$run_url"
  if [[ "$has_attachment" == true ]]; then
    printf 'Reports: attached as %s\r\n' "$attachment_name"
  else
    printf 'Reports: no Lighthouse files were produced; review the workflow logs.\r\n'
  fi

  if [[ "$has_attachment" == true ]]; then
    printf '\r\n'
    printf -- '--%s\r\n' "$boundary"
    printf 'Content-Type: application/zip; name="%s"\r\n' "$attachment_name"
    printf 'Content-Transfer-Encoding: base64\r\n'
    printf 'Content-Disposition: attachment; filename="%s"\r\n' "$attachment_name"
    printf '\r\n'
    base64 -w 76 "$archive_path"
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

echo "Lighthouse completion email sent to ${EMAIL_TO}."
