# Launching Ballmac UI Pro

What is built and what still needs the owner. Everything marked **Owner** cannot be done from the repository.

## What the repository already does

- `pnpm pro:fetch` clones the private Pro source into `registry/pro` before the build (`apps/www` `build` runs it first). It uses `PRO_REPO_TOKEN`, never writes the token to disk, and removes `.git` afterwards. On Vercel production it fails the build when Pro cannot be fetched, so production never ships without Pro by accident.
- The licence server validates keys with Polar or Lemon Squeezy. Test keys are ignored on Vercel production, and repeated invalid attempts from one address are rate limited (20 per 10 minutes per instance).
- `pnpm verify:pro` scans the built site for Pro source and checks git history for Pro paths. With `--base-url` it also checks gating: 401 without a key, 403 with a bad key, 200 with a good key, Pro names not public.
- `pnpm launch:check` lists what is missing in the environment (`--production` to treat gaps as failures, `--live` to call the provider).
- `.github/workflows/ci.yml` runs the full gate on every push and pull request, and the leak scan when `PRO_REPO_TOKEN` is a repository secret.
- The pricing page shows a price only when the owner sets one, lists only what exists today (150 blocks, private registry), and shows the Team plan only when its checkout URL and price are set.

## Owner checklist

1. **Choose the payment provider** (Polar or Lemon Squeezy). Create a product with a licence key benefit.
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
| `NEXT_PUBLIC_PRO_CHECKOUT_URL`, `NEXT_PUBLIC_PRO_PRICE` | the checkout link and price in whole dollars |
| `NEXT_PUBLIC_PRO_TEAM_CHECKOUT_URL`, `NEXT_PUBLIC_PRO_TEAM_PRICE` | only if you sell Team |
| `NEXT_PUBLIC_PRO_LICENSE_URL` | link to the licence terms |
| `BALLMAC_PRO_TEST_KEYS` | leave empty |

   Vercel project settings: Root Directory `apps/www`, and enable "Include source files outside of the Root Directory in the Build Step" (the build reads `registry/` and `scripts/`).
7. **Add the GitHub secret** `PRO_REPO_TOKEN` to this repository so CI can build Pro. Optional: `NPM_TOKEN` and tag `mcp-v1.0.0` to publish `@ballmac/mcp`.
8. **Run a real purchase** in the provider's test mode, then verify:

```bash
pnpm launch:check --production --live --key <real-test-key>
pnpm verify:pro --base-url https://<your-site> --key <real-test-key>
```

9. **Smoke install** on a machine that can reach `ui.shadcn.com`: `pnpm smoke`.
10. **Manual screen-reader pass** on a few Pro blocks (VoiceOver or NVDA).
11. **Approve the public `preprod` → `main` merge.** Nothing in this repository merges to `main` without you.

## Rollback and key leaks

- Rollback: redeploy the previous Vercel deployment. The Pro registry is built into the deployment, so the old one keeps working.
- A licence key leaks: revoke or rotate it in the provider dashboard. Validation results are cached for at most ten minutes (one minute for invalid keys).
- `PRO_REPO_TOKEN` leaks: revoke it on GitHub, create a new one, update Vercel and the repository secret.
- Pro source appears somewhere public: run `pnpm verify:pro`, remove it, rotate anything exposed, and rebuild.
