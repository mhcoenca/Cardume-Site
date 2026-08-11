# Scryfall Studio — Backlog

Running list of known gaps and possible next features. Not prioritized —
grouped by kind. Add to it as things come up; strike through or remove
once done rather than letting it drift from reality.

## Known limitations (found during implementation, not fixed)

- [ ] **Main JS bundle**: split into `vendor-react`/`vendor-base-ui`/app
      chunks (`vite.config.ts`'s `manualChunks`) to clear Vite's "over
      500kB" warning and improve long-term caching. Total transferred
      bytes are unchanged — this is a caching/chunking win, not a size
      reduction — worth revisiting with real route- or feature-level
      `dynamic import()` if the app grows enough surfaces that aren't
      needed on first paint.

## Deferred / explicitly not built (revisit if wanted)

- [ ] **Ads (AdMob vs AdSense)** — raised once, never resolved. AdMob is
      native-app-only (Android/iOS SDK); the web equivalent is Google
      AdSense. Needs a decision on which surface this is even for
      (Scryfall Studio the website, or the native Cardume app) before any
      implementation starts.
- [x] ~~**"Copy Link" button**~~ — built, then removed: it made the
      sidebar footer submenu feel cluttered for the gain (the address bar
      already reflects the shareable `?state=` link live, so the button
      was mostly redundant). Don't re-add without a different placement in
      mind, not just re-adding it to the same submenu.
