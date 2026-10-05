/**
 * Whether this deployment may take payments and accept licence keys. A Vercel production deployment running in Dodo's test mode is never live:
 * anyone could buy with a test card and get a key that unlocks Pro, so it sells nothing and refuses every key until the live settings are in.
 * Previews and local development are unaffected. No framework imports.
 */
export const testModeInProduction = (env: Record<string, string | undefined>) => env.VERCEL_ENV === "production" && env.DODO_MODE === "test"

export const paymentsLive = (env: Record<string, string | undefined> = process.env) => !testModeInProduction(env)
