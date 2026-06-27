# Security Policy

## Supported versions

MonoStart is a browser extension distributed as a single rolling release. Only the
**latest published version** receives security fixes. Please update to the newest
version before reporting an issue.

| Version | Supported |
| --- | --- |
| Latest release | ✅ |
| Older versions | ❌ |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report privately through either channel:

- **GitHub Security Advisories** (preferred):
  [Report a vulnerability](https://github.com/paurushrai/monostart-extension/security/advisories/new)
- **Email:** paurushrai96@gmail.com

To help triage quickly, please include:

- A clear description of the vulnerability and its impact.
- Steps to reproduce (a minimal proof of concept if possible).
- Affected version, your Chrome version, and OS.
- Any relevant console output (`chrome://extensions` → _Inspect views_).

## What to expect

- **Acknowledgement** of your report as soon as possible.
- An assessment of validity and severity, and a fix timeline for confirmed issues.
- Credit for the disclosure if you'd like it, once a fix is released.

Please give us a reasonable window to release a fix before any public disclosure.

## Scope

In scope: vulnerabilities in MonoStart's own code — the extension (new-tab
dashboard, background service worker, popup, offscreen document) and the hosted
privacy-policy site under [`site/`](site/).

Out of scope: vulnerabilities in third-party dependencies (report those upstream),
issues that require a compromised device or browser, and the security of websites
you choose to embed or link to from your dashboard.
