import { describe, expect, it } from "vitest"

import { PRODUCTION_URL, registryUrl } from "../../../scripts/registry-url"

describe("registry address", () => {
  it("is production by default", () => {
    expect(registryUrl({})).toBe(PRODUCTION_URL)
    expect(registryUrl({ DEPLOY_ENV: "production" })).toBe(PRODUCTION_URL)
  })
  it("lets REGISTRY_URL win, without a trailing slash (the preview deploy sets it to the preview's address)", () => {
    expect(registryUrl({ REGISTRY_URL: "https://preprod.ui.ballmac.com/" })).toBe("https://preprod.ui.ballmac.com")
    expect(registryUrl({ REGISTRY_URL: "http://127.0.0.1:4455/" })).toBe("http://127.0.0.1:4455")
  })
  it("ignores an empty REGISTRY_URL", () => {
    expect(registryUrl({ REGISTRY_URL: " " })).toBe(PRODUCTION_URL)
  })
})
