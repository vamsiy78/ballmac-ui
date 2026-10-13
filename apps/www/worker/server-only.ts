// `server-only` throws when it is imported outside React's server environment. The Worker is server code, so it gets this empty module instead (wrangler.jsonc alias).
export {}
