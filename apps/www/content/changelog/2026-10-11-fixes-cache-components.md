---
title: "Server-component fixes and Next.js 16.4 Cache Components"
date: 2026-10-11
tags: [components, blocks]
summary: "Four components no longer crash when a server component renders them, and calendars build with Cache Components on."
---

### Improved

- A new build check fails when a file that runs on the server imports a function from a file marked "use client", so this crash is caught before it ships.
- Every free component, block and template, and every Pro block, now builds in a fresh Next.js 16.4 app with Cache Components on.

### Fixed

- Bento Grid, Team Switcher, Lock Screen and Control Center failed with "Attempted to call isMediaImage() from the server". The helper now lives in its own small item, media-image (Media still exports it); each is 1.0.1, so `ballmac update` merges the fix.
- Calendar, Date Picker and the Calendar 1 block read the current time while prerendering, which Cache Components (the default in new Next.js 16.4 apps) does not allow. Calendar now reads it inside Suspense with a same-size placeholder (pass `today` to skip that), Date Picker works out its year dropdown only when it opens, and Calendar 1 uses its own today.
- The Atlas, Goods, Podcast and Publication templates read `params` inside Suspense, as Cache Components requires.
