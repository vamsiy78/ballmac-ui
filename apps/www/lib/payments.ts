/**
 * Whether this deployment may take payments and accept licence keys. A production deployment running in Dodo's test mode is never live:
 * anyone could buy with a test card and get a key that unlocks Pro, so it sells nothing and refuses every key until the live settings are in.
 * Previews and local development are unaffected. No framework imports.
 */
/** True on the production deployment: DEPLOY_ENV is "production" there (set in wrangler.jsonc and by the deploy workflow). */
export const isProduction = (env: Record<string, string | undefined>) => env.DEPLOY_ENV === "production"

export const testModeInProduction = (env: Record<string, string | undefined>) => isProduction(env) && env.DODO_MODE === "test"

export const paymentsLive = (env: Record<string, string | undefined> = process.env) => !testModeInProduction(env)
