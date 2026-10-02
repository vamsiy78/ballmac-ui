import "server-only"

import { createLicenseValidator, type LicenseEnv } from "@/lib/license-core"

/** Validates Ballmac UI Pro licence keys with the provider configured in the environment. */
export const validateLicense = createLicenseValidator(process.env as LicenseEnv)
export { keyFromHeaders } from "@/lib/license-core"
