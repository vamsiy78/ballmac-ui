---
title: "Cove, a native-looking Tauri starter"
date: 2026-10-12
tags: [pro, docs]
summary: "Cove is a third Pro starter and the first for the desktop: a Tauri 2 notes app that looks native on macOS and Windows."
image: /marketing/cove-macos.webp
imageAlt: "Cove, a Tauri notes app with a macOS window, a blurred sidebar and traffic lights."
---

### New

- Cove is a real notes app you can ship: folders, pinning, search that needs every word, trash with undo, Markdown with a preview and a command palette. It is the quickest way to see the [platform feels](/docs/concepts/platform-feels) in a working window.
- On a Mac it has traffic lights in the sidebar column that dim in the background, a real NSVisualEffectView blur, the native menu bar and rounded corners; on Windows, 46 px caption buttons, an icon title bar with a menu bar, a 3 px accent bar on the current item and system-rounded corners.
- Every command is defined once and runs from the palette, the keyboard and both menus, with shortcuts written the platform's way (⇧⌘N, Ctrl+Shift+N); settings switch the look between macOS, Windows, iOS and the web, the theme and the motion.
- The README, a customisation guide and a release guide cover signing and notarizing on macOS, signing on Windows, and updates.

### Improved

- The interface also runs in a browser with no Rust installed, and is tested in WebKit and Chromium with each platform's user agent: both looks, light and dark, keyboard, axe, High Contrast, reduced motion and the smallest window. Notes are one JSON file; replace the four-method storage to add sync.
