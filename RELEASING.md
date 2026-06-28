# Releasing MonoStart

A release is driven entirely by a git tag. Push a `vX.Y.Z` tag from `main` and
[`.github/workflows/release.yml`](.github/workflows/release.yml) builds, packages,
creates a GitHub Release, and publishes to the Chrome Web Store.

## Cut a release

1. **Pick the version** (SemVer):
   - `PATCH` (1.2.**1**) — bug fix / copy tweak
   - `MINOR` (1.**3**.0) — new feature
   - `MAJOR` (**2**.0.0) — breaking change to stored settings/data
2. **Bump both files to the same version**, in one commit on `main`:
   ```bash
   git checkout main && git pull
   # edit "version" in package.json AND public/manifest.json to X.Y.Z
   git commit -am "chore(release): vX.Y.Z"
   ```
3. **Tag and push** (this triggers the release):
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin main --follow-tags
   ```
4. **Watch it**: `gh run watch` (or the Actions tab). That's it.

> The two `version` fields **must match** — CI fails the build otherwise.

## What the tag triggers (automatic)

1. Verify `tag == package.json == manifest.json`.
2. Lint + typecheck + test + build.
3. Zip `dist/` → `monostart-vX.Y.Z.zip` (attached to the Release).
4. Create the GitHub Release (notes auto-generated from commits).
5. **Stable tag** + secrets set → upload & publish live to the Chrome Web Store.
   **Pre-release tag** (any hyphen, e.g. `v1.3.0-beta.1`) → GitHub Release only, store skipped.

## One-time setup: Chrome Web Store secrets

Without these, releases still produce a GitHub Release; the store step just warns and skips.

1. [Google Cloud Console](https://console.cloud.google.com) → new project → enable **Chrome Web Store API**.
2. **APIs & Services → Credentials → Create OAuth client ID → Desktop app**. Save `CLIENT_ID` and `CLIENT_SECRET`.
3. **OAuth consent screen**: keep app in *Testing*, add your Google account under *Test users*.
4. Get an auth code — open this URL (replace `CLIENT_ID`), approve, then copy the `code=` value from the (failed-to-load) `localhost` redirect URL:
   ```
   https://accounts.google.com/o/oauth2/auth?response_type=code&access_type=offline&prompt=consent&scope=https://www.googleapis.com/auth/chromewebstore&client_id=CLIENT_ID&redirect_uri=http://localhost
   ```
5. Exchange the code for a **refresh token** (it's long-lived):
   ```bash
   curl -s https://oauth2.googleapis.com/token \
     -d client_id=CLIENT_ID -d client_secret=CLIENT_SECRET \
     -d code=AUTH_CODE -d grant_type=authorization_code \
     -d redirect_uri=http://localhost | jq -r .refresh_token
   ```
6. Add three repo secrets at **Settings → Secrets and variables → Actions**:
   `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`.

The extension ID (`hhfeihcppmfepeeainafmaifpmdemmlg`) is hardcoded in the workflow — it's public.

## Troubleshooting

- **Version mismatch** — fix the two files, re-commit, then recreate the tag (below).
- **Store error "version already exists"** — the store won't re-accept a published version. Bump to a new one.
- **Flaky run** — re-run the job from the Actions tab; the steps are re-run safe.
- **Recreate a tag**:
  ```bash
  git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z
  # fix, then re-tag and push as in "Cut a release"
  ```

## Rules of thumb

- Tag only from a green `main`. Never move or reuse a published tag.
- `package.json` and `public/manifest.json` versions always match.
- A hyphen in the tag = pre-release = no store publish.
