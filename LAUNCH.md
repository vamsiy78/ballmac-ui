# Launching Ballmac UI Pro

What is built and what still needs the owner. Everything marked **Owner** cannot be done from the repository.

## What the repository already does

- `pnpm pro:fetch` clones the private Pro source into `registry/pro` before the build (`apps/www` `build` runs it first). It uses `PRO_REPO_TOKEN`, never writes the token to disk, and removes `.git` afterwards. On Vercel production it fails the build when Pro cannot be fetched, so production never ships without Pro by accident.
- The licence server validates keys with Polar or Lemon Squeezy. Test keys are ignored on Vercel production, and repeated invalid attempts from one address are rate limited (20 per 10 minutes per instance).
- `pnpm verify:pro` scans the built site for Pro source and checks git history for Pro paths. With `--base-url` it also checks gating: 401 without a key, 403 with a bad key, 200 with a good key, Pro names not public.
- `pnpm launch:check` lists what is missing in the environment (`--production` to treat gaps as failures, `--live` to call the provider).
- `.github/workflows/ci.yml` runs the full gate on every push and pull request, and the leak scan when `PRO_REPO_TOKEN` is a repository secret.
- **Browser login at `/pro`.** Buyers paste their licence key once (no account, no password). The key is sealed into an httpOnly cookie with `PRO_SESSION_SECRET` and validated again on every request through the same licence check, so revoking a key ends access within the cache window (ten minutes). A logged-in buyer reads and copies Pro block code on its page (`/api/pro/items/<name>`), downloads the starters and kits as zip or tar.gz (`/api/pro/download/...`) and gets install commands with their key filled in. The cookie never opens `/r/pro`, which stays header-only for the CLI and MCP. `pnpm verify:pro --base-url ... --key ...` probes all of it.
- Starter apps are packed into the private build (`pnpm starter:pack`, run by `pnpm build:registry`) and downloaded with the licence key from `/r/pro/starters/<name>.tar.gz`. `pnpm starter:pack beacon-saas --verify` proves a fresh copy installs, lints, typechecks, passes its tests and builds.
- The pricing page shows a price only when the owner sets one, lists only what exists today (150 blocks, private registry), and shows the Team plan only when its checkout URL and price are set.

## Owner checklist

1. **Payment provider.** Polar, Lemon Squeezy and Dodo Payments are supported (`BALLMAC_LICENSE_PROVIDER` = `polar`, `lemonsqueezy` or `dodopayments`). For Dodo Payments: create the Pro product with the licence key feature on, set `BALLMAC_LICENSE_PROVIDER=dodopayments`, buy it once in test mode (`DODO_MODE=test`) and run `pnpm launch:check --live --key <that key>`. The adapter was written from Dodo's public licence-validate call and could not be run against Dodo from the build environment, so this live check is the proof. Dodo's validate answer is only `valid` (checked against Dodo's docs and a real test purchase), so the product restriction uses `DODO_PRODUCT_IDS` with `DODO_API_KEY`; `--live` also lists the Pro keys to prove the API key works.
2. **Decide the prices and what Team means.** The site shows no price until you set the variables below. Nothing is invented.
3. **Write the Pro licence terms** (yourself or with a lawyer) and publish them. Set `NEXT_PUBLIC_PRO_LICENSE_URL`.
4. **Create `PRO_REPO_TOKEN`**: a fine-grained GitHub personal access token, Repository access limited to `vamsiy78/ballmac-ui-pro`, permission Contents read-only, with an expiry. Put a reminder in your calendar before it expires; builds fail loudly when it does.
5. **Merge the Pro repo `preprod` into `main`** if Vercel production builds the public `main` branch (the fetch step uses `main` in production). Or set `PRO_REPO_REF=preprod`.
6. **Set environment variables in Vercel** (Production):

| Variable | Value |
| --- | --- |
| `PRO_REPO_TOKEN` | the token from step 4 (secret) |
| `BALLMAC_LICENSE_PROVIDER` | `polar` or `lemonsqueezy` |
| Polar: `POLAR_ORGANIZATION_ID`, `POLAR_BENEFIT_IDS` | from the Polar dashboard. The benefit IDs matter: without them any key from your organisation unlocks Pro |
| Lemon Squeezy: `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_PRODUCT_IDS` | from the Lemon Squeezy dashboard, same warning |
| Dodo Payments: `DODO_PRODUCT_IDS`, `DODO_API_KEY`, `DODO_MODE` | `DODO_PRODUCT_IDS` is the `pdt_` id of the Pro product and `DODO_API_KEY` a Dodo API key of the same mode (secret). Dodo's public validate answer is only `valid`, so a key from another product in the same business would unlock Pro; with both set the site also checks the key against the list of keys issued for the Pro product (cached five minutes, reloaded at most every thirty seconds for a key it has not seen). Set `DODO_PRODUCT_IDS` only together with `DODO_API_KEY`, otherwise every key is refused. Leave `DODO_MODE` empty for live |
| `NEXT_PUBLIC_PRO_CHECKOUT_URL`, `NEXT_PUBLIC_PRO_PRICE` | the checkout link and price in whole dollars |
| `NEXT_PUBLIC_PRO_TEAM_CHECKOUT_URL`, `NEXT_PUBLIC_PRO_TEAM_PRICE` | only if you sell Team |
| `NEXT_PUBLIC_PRO_LICENSE_URL` | link to the licence terms |
| `PRO_SESSION_SECRET` | 32 or more random characters (`openssl rand -base64 32`), secret. Without it `/pro` cannot log anyone in. Changing it logs every buyer out |
| `NEXT_PUBLIC_PRO_FOUNDING_LIMIT` | optional, for example `25`: shows the founding price banner (home and pricing) and a note on the Pro card, "first 25 buyers at $49, then the price goes up". It is a notice, not a lock: when the last founding licence is sold, archive or disable the founding payment link in Dodo, put the regular price and link in `NEXT_PUBLIC_PRO_PRICE` and `NEXT_PUBLIC_PRO_CHECKOUT_URL`, and unset this variable |
| `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO_EMAIL`, `CONTACT_REPLY_TO` | the `/support` form, same setup as ballmac.com. `RESEND_API_KEY` (secret) can be the key ballmac.com uses; `RESEND_FROM` like `Ballmac UI <hello@ballmac.com>` (the domain is already verified in Resend); `CONTACT_TO_EMAIL` (secret) is your private inbox and is never shown; `CONTACT_REPLY_TO` is `hello@ballmac.com`. Mail sent to `hello@ballmac.com` is already forwarded privately by the inbound route on ballmac.com, so the public address needs nothing new. Optional `NEXT_PUBLIC_SUPPORT_EMAIL` changes the address shown on the page |
| `NEXT_PUBLIC_PRO_PORTAL_URL` | optional: the provider's customer portal, where buyers find their key again. Shown under "I can't find my key" |
| `BALLMAC_PRO_TEST_KEYS` | leave empty |

   Turborepo runs the Vercel build in strict environment mode: only variables listed in `turbo.json` reach the build. `PRO_REPO_TOKEN`, `PRO_REPO`, `PRO_REPO_REF`, `PRO_FORCE_REFRESH`, `BALLMAC_REQUIRE_PRO` and `VERCEL_ENV` are listed under `passThroughEnv` of `@ballmac-ui/www#build` (and its cache is off, so a free-only build can never be restored for a build that should contain Pro). A new build-time variable that is not `NEXT_PUBLIC_*` must be added there. Check a deployment's build log for `pro:fetch` and a Pro item count: `PRO_REPO_TOKEN is not set; building the free registry only` means the token did not reach the build.

   Vercel project settings: Root Directory `apps/www`, and enable "Include source files outside of the Root Directory in the Build Step" (the build reads `registry/` and `scripts/`).
7. **Add the GitHub secret** `PRO_REPO_TOKEN` to this repository so CI can build Pro. `@ballmac/mcp` 1.0.0 is published. Later releases use npm trusted publishing (configured on npmjs.com, no token): bump the version in `packages/mcp/package.json`, then push the tag `mcp-v<version>`.
8. **Return after payment: nothing to set in Dodo.** The Get Pro button adds `redirect_url=<this site>/pro` to the payment link, so a purchase on a preview returns to that preview. Dodo sends the buyer back with `payment_id`, `status`, `email` and `license_key`; `/pro` logs them in automatically and removes the key from the address bar (if anything fails it asks them to paste the key from the email). A payment link shared elsewhere needs `&redirect_url=https://<your-site>/pro` added by hand.
9. **Run a real purchase** in the provider's test mode, then verify:

```bash
pnpm launch:check --production --live --key <real-test-key>
pnpm verify:pro --base-url https://<your-site> --key <real-test-key>
```

10. **Smoke install** on a machine that can reach `ui.shadcn.com`: `pnpm smoke`.
11. **Manual screen-reader pass** on a few Pro blocks (VoiceOver or NVDA).
12. **Approve the public `preprod` → `main` merge.** Nothing in this repository merges to `main` without you.

## Testing the CLI and MCP before the production merge

The install commands on `/pro` follow the site you are on, so a preview shows commands that use that preview (the MCP one adds `BALLMAC_UI_URL`). A Vercel preview is behind Vercel Authentication, which answers the CLI and the MCP server with a login page instead of JSON. To test them against a preview, either:

1. turn Vercel Authentication off for previews while you test (Project, Settings, Deployment Protection). Pro code stays behind the licence key either way; or
2. for the shadcn CLI only, enable Protection Bypass for Automation, then add `"x-vercel-protection-bypass": "${VERCEL_BYPASS}"` to the `headers` of both registries in `components.json` and set that variable. The MCP server cannot send extra headers, so for MCP use option 1 or test after the merge.

Otherwise the real CLI and MCP check happens right after `preprod` is merged to `main`, against `https://ui.ballmac.com`.

## Rollback and key leaks

- Rollback: redeploy the previous Vercel deployment. The Pro registry is built into the deployment, so the old one keeps working.
- A licence key leaks: revoke or rotate it in the provider dashboard. Validation results are cached for at most ten minutes (one minute for invalid keys).
- `PRO_REPO_TOKEN` leaks: revoke it on GitHub, create a new one, update Vercel and the repository secret.
- Pro source appears somewhere public: run `pnpm verify:pro`, remove it, rotate anything exposed, and rebuild.
