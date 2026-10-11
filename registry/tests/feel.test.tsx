import * as React from "react"
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { detectFeel, feelScript, feelStorageKey, isFeel, readFeel, setFeel, storedFeel, useFeel } from "@/lib/ballmac/feel"

const nav = (userAgent: string, platform = "", maxTouchPoints = 0) => ({ userAgent, platform, maxTouchPoints })

const UA = {
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  tauriMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)",
  win: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  electronWin: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) notes/1.0.0 Chrome/126.0.6478.127 Electron/31.0.0 Safari/537.36",
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  ipadDesktop: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
}

afterEach(() => {
  document.documentElement.removeAttribute("data-feel")
  localStorage.clear()
})

describe("detectFeel", () => {
  it("reads the platform from a browser, a Tauri window and an Electron window", () => {
    expect(detectFeel(nav(UA.mac, "MacIntel"))).toBe("macos")
    expect(detectFeel(nav(UA.tauriMac, "MacIntel"))).toBe("macos")
    expect(detectFeel(nav(UA.win, "Win32"))).toBe("windows")
    expect(detectFeel(nav(UA.electronWin, "Win32"))).toBe("windows")
    expect(detectFeel(nav(UA.iphone, "iPhone", 5))).toBe("ios")
  })
  it("counts an iPad that asks for the desktop site as iOS, and a Mac with no touch as macOS", () => {
    expect(detectFeel(nav(UA.ipadDesktop, "MacIntel", 5))).toBe("ios")
    expect(detectFeel(nav(UA.mac, "MacIntel", 0))).toBe("macos")
  })
  it("falls back to the web feel for everything else", () => {
    expect(detectFeel(nav(UA.linux, "Linux x86_64"))).toBe("web")
    expect(detectFeel(nav(UA.android, "Linux armv8l", 5))).toBe("web")
    expect(detectFeel(nav("", ""))).toBe("web")
  })
})

describe("setFeel and readFeel", () => {
  it("is web until something sets it", () => {
    expect(readFeel()).toBe("web")
  })
  it("sets data-feel on the page and remembers the choice", () => {
    setFeel("windows")
    expect(document.documentElement.getAttribute("data-feel")).toBe("windows")
    expect(readFeel()).toBe("windows")
    expect(storedFeel()).toBe("windows")
  })
  it("goes back to the device's own feel with auto, and forgets the override", () => {
    setFeel("ios")
    setFeel("auto")
    expect(storedFeel()).toBeNull()
    expect(document.documentElement.getAttribute("data-feel")).toBe(detectFeel())
  })
  it("reads a scope inside the page", () => {
    document.documentElement.setAttribute("data-feel", "macos")
    const el = document.createElement("div")
    el.setAttribute("data-feel", "windows")
    el.innerHTML = "<span></span>"
    document.body.appendChild(el)
    expect(readFeel(el.firstElementChild)).toBe("windows")
    el.remove()
  })
  it("ignores junk", () => {
    document.documentElement.setAttribute("data-feel", "beos")
    expect(readFeel()).toBe("web")
    localStorage.setItem(feelStorageKey, "amiga")
    expect(storedFeel()).toBeNull()
    expect(isFeel("macos")).toBe(true)
    expect(isFeel("android")).toBe(false)
  })
})

function Probe() {
  const { feel } = useFeel()
  return <span data-testid="feel">{feel}</span>
}

describe("useFeel", () => {
  it("follows the page live", () => {
    render(<Probe />)
    expect(screen.getByTestId("feel")).toHaveTextContent("web")
    act(() => setFeel("macos"))
    expect(screen.getByTestId("feel")).toHaveTextContent("macos")
  })
})

describe("feelScript", () => {
  const run = (env: { userAgent: string; platform: string; maxTouchPoints: number }, stored?: string) => {
    if (stored) localStorage.setItem(feelStorageKey, stored)
    // run the script as the browser would, with a stand-in navigator
    new Function("navigator", `return (${feelScript.replace(/^\(function\(\)\{/, "function(){").replace(/\}\)\(\)$/, "}")})()`)(env)
    return document.documentElement.getAttribute("data-feel")
  }
  it("picks the same feel as detectFeel for every platform", () => {
    for (const [ua, platform, touch] of [[UA.mac, "MacIntel", 0], [UA.win, "Win32", 0], [UA.iphone, "iPhone", 5], [UA.ipadDesktop, "MacIntel", 5], [UA.linux, "Linux", 0]] as const) {
      document.documentElement.removeAttribute("data-feel")
      expect(run({ userAgent: ua, platform, maxTouchPoints: touch })).toBe(detectFeel(nav(ua, platform, touch)))
    }
  })
  it("prefers a remembered choice and ignores a bad one", () => {
    expect(run({ userAgent: UA.mac, platform: "MacIntel", maxTouchPoints: 0 }, "windows")).toBe("windows")
    localStorage.clear()
    document.documentElement.removeAttribute("data-feel")
    expect(run({ userAgent: UA.mac, platform: "MacIntel", maxTouchPoints: 0 }, "amiga")).toBe("macos")
  })
})
