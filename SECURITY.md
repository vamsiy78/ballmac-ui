# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Use GitHub's private reporting: open the **Security** tab of this repository and choose **Report a vulnerability**.
Include what you found, how to reproduce it, and which item, route or package it affects.

What to expect: we read every report, confirm whether it reproduces, and tell you what we plan to do. Please give us a
reasonable chance to ship a fix before you disclose publicly.

## Scope

In scope:

- The website and registry endpoints (`/r/*`, `/r/pro/*`, `/api/*`), including the Pro licence gate.
- The `@ballmac/mcp` package.
- Source of the registry items and the starter templates, where it causes an exploitable flaw in code that people install.

Out of scope: findings that need a compromised machine or browser, missing best-practice headers with no demonstrated
impact, and issues in third-party services we depend on (report those to the service).

## Supported versions

Only the latest release of the registry items and of `@ballmac/mcp` receives fixes.
