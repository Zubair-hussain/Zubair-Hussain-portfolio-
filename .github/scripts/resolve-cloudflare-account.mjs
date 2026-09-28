import { appendFile } from "node:fs/promises";

const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const configuredAccountId =
  process.env.CONFIGURED_CLOUDFLARE_ACCOUNT_ID?.trim();
const githubEnv = process.env.GITHUB_ENV;

if (!token) throw new Error("CLOUDFLARE_API_TOKEN is not configured.");
if (!githubEnv) throw new Error("GITHUB_ENV is unavailable.");

const response = await fetch(
  "https://api.cloudflare.com/client/v4/accounts?per_page=50",
  { headers: { Authorization: `Bearer ${token}` } },
);
const data = await response.json();

if (!response.ok || data?.success !== true) {
  throw new Error(`Cloudflare account lookup failed with HTTP ${response.status}.`);
}

const accounts = Array.isArray(data.result) ? data.result : [];
const configuredIsValid = /^[A-Za-z0-9_-]+$/.test(
  configuredAccountId || "",
);
const configuredAccount = configuredIsValid
  ? accounts.find((account) => account?.id === configuredAccountId)
  : undefined;
const selectedAccount = configuredAccount || (accounts.length === 1 ? accounts[0] : null);

if (!selectedAccount?.id) {
  throw new Error(
    accounts.length === 0
      ? "The API token cannot access a Cloudflare account."
      : "The API token can access multiple accounts; set CLOUDFLARE_ACCOUNT_ID to one account ID.",
  );
}

if (!/^[A-Za-z0-9_-]+$/.test(selectedAccount.id)) {
  throw new Error("Cloudflare returned an invalid account ID.");
}

// Keep the resolved identifier out of logs even though an account ID is not a
// credential. GITHUB_ENV makes it available only to subsequent workflow steps.
console.log(`::add-mask::${selectedAccount.id}`);
await appendFile(githubEnv, `CLOUDFLARE_ACCOUNT_ID=${selectedAccount.id}\n`, "utf8");
console.log("Resolved the Cloudflare deployment account.");
