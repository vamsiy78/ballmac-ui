# Releasing Ballmac UI to production

`preprod` is where all work lands. `main` is production. Nothing here has been merged; the owner approves the merge.

## 1. Owner prerequisites

Everything in `LAUNCH.md` (owner checklist) must be done first: payment provider verified in test mode, prices, Pro licence
terms, `PRO_REPO_TOKEN`, Vercel environment variables, Pro repo `preprod` merged to `main` (or `PRO_REPO_REF=preprod`).
Also: enable GitHub private vulnerability reporting (the Security tab links to it), and decide where to host the Figma
capture archive (`pnpm figma:capture`, about 200 MB, not in git).

## 2. Pre-merge checks (on `preprod`)

```bash
pnpm install --frozen-lockfile
pnpm build:registry && pnpm check
pnpm lint && pnpm typecheck && pnpm test
(cd apps/www && npx next build)
pnpm seo:audit --base-url http://localhost:3400     # after `next start -p 3400`
pnpm link:crawl --base-url http://localhost:3400    # every link on every sitemap page (drop --no-external on a machine with open internet)
pnpm verify:pro --base-url http://localhost:3400 --key <test key>
pnpm launch:check --production                       # with the production env vars loaded
pnpm a11y                                            # axe, light and dark
pnpm smoke                                           # needs ui.shadcn.com
```

## 3. Merge

1. Open a pull request `preprod` -> `main` (only when the owner says so). CI must be green.
2. Merge. Vercel builds production: `pro:fetch` runs first and fails the build if Pro cannot be fetched.
3. Point the domain (`ui.ballmac.com`) at the Vercel project if not already.

## 4. Post-deploy checks

```bash
pnpm seo:audit --base-url https://ui.ballmac.com
pnpm verify:pro --base-url https://ui.ballmac.com --key <a real licence key>
pnpm launch:check --live --key <a real licence key>
curl -I https://ui.ballmac.com/        # security headers present
```

Also: buy Pro once with a real card (or provider test mode first), install a Pro block with that key, open the 404 page,
check `/llms.txt`, `/sitemap.xml`, and an Open Graph card in a link preview.

## 5. MCP package

`@ballmac/mcp` is released separately. Bump the version in `packages/mcp/package.json`, merge, then create the release/tag
`mcp-v<version>` on GitHub; the workflow publishes through npm trusted publishing.

## 6. Rollback

- Site: in Vercel, promote the previous deployment. Registry JSON is static per deployment, so rollback is immediate.
- Pro leak suspected: remove the affected files, rotate `PRO_REPO_TOKEN`, redeploy, and run `pnpm verify:pro` against the site.
- Bad licence provider config: unset `BALLMAC_LICENSE_PROVIDER`; the gate then refuses all keys (fails closed) until fixed.
- MCP: `npm deprecate @ballmac/mcp@<bad version> "<reason>"` and publish a fixed patch version.

## 7. Last verified results (2026-10-03, `preprod`)

- Axe: 1,642 previews in light and dark, 0 findings. RTL sweep: no preview over 30% mirror mismatch, 0 axe findings.
- Link crawl: 502 pages, 4,041 internal link targets, none broken. External links (about 590) could not be checked from the build sandbox (its network allowlist answers 403); run `pnpm link:crawl` once from a normal machine.
- `https://github.com/vamsiy78/ballmac-ui` is linked from the home page and docs and answers 404 to the public while the repository is private. Make the repository public before launch, or remove the links.
- Lighthouse (local production build): accessibility, best practices and SEO 100 on all sampled pages. Performance: desktop 80 to 100; mobile (simulated slow 4G, 4x CPU) 56 to 90, lowest on `/templates` (many live previews, TBT about 900 ms) and about 75 on the home page (LCP 4.6 s).
- `@ballmac/mcp` end to end: all tools, resources and prompts pass, and Pro source is withheld without a valid key.

## 8. Known, accepted

- `pnpm audit` reports one high advisory (`braces`) reachable only through the shadcn CLI (dev tooling, no patched release).
  Production dependencies of the site and the starter audit clean.
