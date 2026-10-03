import "server-only"

import { keyFromHeaders, validateLicense } from "@/lib/license"
import { createProGate } from "@/lib/pro-gate-core"
import { clientId, licenseFailures } from "@/lib/rate-limit"
import { SITE_URL } from "@/lib/registry"

export { proHeaders } from "@/lib/pro-gate-core"
export const proGate = createProGate({ validate: validateLicense, limiter: licenseFailures, keyFromHeaders, clientId, siteUrl: SITE_URL })
