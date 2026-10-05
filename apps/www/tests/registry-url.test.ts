import { describe, expect, it } from "vitest"

import { PRODUCTION_URL, registryUrl } from "../../../scripts/registry-url"

describe("registry address", () => {
  it("is production by default", () => {
    expect(registryUrl({})).toBe(PRODUCTION_URL)
    expect(registryUrl({ VERCEL_ENV: "production", VERCEL_BRANCH_URL: "x.vercel.app" })).toBe(PRODUCTION_URL)
  })
  it("is the branch address on a Vercel preview, so the preview is self-contained", () => {
    expect(registryUrl({ VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "ballmac-ui-git-preprod-team.vercel.app" })).toBe("https://ballmac-ui-git-preprod-team.vercel.app")
  })
  it("lets REGISTRY_URL win, without a trailing slash", () => {
    expect(registryUrl({ REGISTRY_URL: "http://127.0.0.1:4455/", VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "x.vercel.app" })).toBe("http://127.0.0.1:4455")
  })
  it("ignores an empty preview address", () => {
    expect(registryUrl({ VERCEL_ENV: "preview", VERCEL_BRANCH_URL: " " })).toBe(PRODUCTION_URL)
  })
})
