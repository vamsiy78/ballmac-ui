import { describe, expect, it } from "vitest"

import { planFetch } from "../../../scripts/fetch-pro"

describe("planFetch", () => {
  it("skips when Pro is already present", () => {
    expect(planFetch({}, true).action).toBe("skip")
  })
  it("refreshes when forced", () => {
    expect(planFetch({ PRO_REPO_TOKEN: "t", PRO_FORCE_REFRESH: "1" }, true).action).toBe("fetch")
  })
  it("builds free-only without a token outside production", () => {
    expect(planFetch({}, false).action).toBe("free-only")
  })
  it("fails without a token in production or when required", () => {
    expect(planFetch({ VERCEL_ENV: "production" }, false).action).toBe("fail")
    expect(planFetch({ BALLMAC_REQUIRE_PRO: "1" }, false).action).toBe("fail")
  })
  it("defaults the ref by environment", () => {
    expect(planFetch({ PRO_REPO_TOKEN: "t", VERCEL_ENV: "production" }, false)).toMatchObject({ ref: "main", required: true })
    expect(planFetch({ PRO_REPO_TOKEN: "t", VERCEL_ENV: "preview" }, false)).toMatchObject({ ref: "preprod", repo: "vamsiy78/ballmac-ui-pro" })
    expect(planFetch({ PRO_REPO_TOKEN: "t", PRO_REPO_REF: "v1.0.0" }, false)).toMatchObject({ ref: "v1.0.0" })
  })
  it("rejects malformed repo and ref values", () => {
    expect(planFetch({ PRO_REPO_TOKEN: "t", PRO_REPO: "a b/c" }, false).action).toBe("fail")
    expect(planFetch({ PRO_REPO_TOKEN: "t", PRO_REPO_REF: "--upload-pack=x" }, false).action).toBe("fail")
    expect(planFetch({ PRO_REPO_TOKEN: "t", PRO_REPO_REF: "a;b" }, false).action).toBe("fail")
  })
})
