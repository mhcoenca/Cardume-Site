# Handoff prompt: embed Scryfall Studio in the Cardume Android app

Written 2026-08 by a Claude Code session working in the `Cardume-Site` repo
(the `scryfall-studio/` subproject). Paste this whole doc into a Claude
session running inside the **Cardume Android app repo** (Kotlin) as the
starting prompt for that work.

---

## What Scryfall Studio is

A Visual IDE for Scryfall's card-search query language — pick filters
("clauses") from a sidebar (Oracle Text, Colors, Mana Cost, Type Line,
Rarity, Set, Price, Legality, Criteria, etc.), each renders its own
purpose-built UI (a visual mana-cost builder with real MTG symbol icons, a
type-category picker, color pips, a "reverse oracle tag" card-lookup tool,
...), and the app assembles them into a real Scryfall search string live,
showing actual card results in-app as you build the query.

- Stack: React + TypeScript + Vite + Tailwind v4 + shadcn (base-ui
  primitives). No backend, no database — 100% static SPA. All data comes
  directly from `api.scryfall.com` and `svgs.scryfall.io` (official Scryfall
  mana symbol icons) at request time, client-side.
- Architecture is registry-driven: each filter is a self-contained
  `QueryClause` (id, label, icon, its own input component, `toQuery`/
  `fromQuery` serialization). See `scryfall-studio/ARCHITECTURE.md` in this
  repo if you need to understand or extend the query-builder logic itself —
  that's almost certainly out of scope for the Android work below, which is
  purely "embed the existing deployed web app," not "reimplement it."
- Fully responsive — has a dedicated mobile layout (off-canvas sidebar
  drawer, bottom sheets instead of centered dialogs, stacked/fill-width
  control rows) already built and shipped, so it's a legitimate phone-sized
  experience already, not a desktop app being squeezed into a WebView.
- Dark by default, persisted via `localStorage`, toggle in the header.

## The decision already made: WebView, not a rewrite, not a separate app

This was discussed and decided in the web-app session before this handoff.
Recap of the reasoning, so it doesn't get re-litigated:

- **WebView** (`android.webkit.WebView`, or `AndroidView` wrapping it if the
  app is Jetpack Compose): reuses 100% of the existing UI and logic as one
  unit. Near-zero APK size impact — `WebView` is an OS-provided component
  (the "Android System WebView" package, Play-Store-updated independently),
  not something bundled into the app; only the Kotlin/Compose chrome you
  write around it adds any size, on the order of a few KB. Every future
  update to the web app ships instantly with no new Play Store release.
- **Native rewrite** was rejected: the query-builder logic (the clause
  registry, the Oracle Tag reverse-lookup index, the mana-cost symbol
  builder) would need porting to Kotlin, and — critically — this tool is
  still being actively iterated on (new clauses, UX refinements), so a
  native port would mean permanently duplicating every future change in two
  languages.
- **A separate standalone app** was rejected: pure overhead (its own store
  listing, review cycle, versioning) for a tool that already works fully in
  a browser and that you want to funnel back toward the main Cardume app,
  not fragment away from it.

Don't relitigate this unless something material has changed since this
doc was written — the analysis holds regardless of exactly how "big" the
tool has grown, since the whole point of the WebView choice is that its
cost doesn't scale with the tool's complexity.

## What's NOT settled yet — read this before hardcoding a URL

The tool is deployed today at **`https://card-u.me/scryfall`**. Separately,
there's an *unexecuted* plan to make it the **root** of card-u.me
(`https://card-u.me/`) and move the current Cardume marketing landing page
to `card-u.me/app`. That migration has **not happened** as of this
handoff — it's blocked on:
1. Deciding/building a "back to the tool" section on the landing page
   (the reverse-navigation piece), which itself is still just an idea.
2. Careful handling of this repo's existing `/.well-known/apple-app-site-
   association` and `/.well-known/assetlinks.json` (Universal Links / App
   Links domain verification — must keep working unmodified) and the
   existing `/pedido/*` redirect rule (order-share deep links), so any new
   catch-all routing added for the migration doesn't clobber them.

**Implication for you:** don't hardcode `card-u.me/scryfall` deep into the
Android code as if it's permanent. Put it behind a single named constant
(e.g. `SCRYFALL_STUDIO_URL`) so updating it later — if/when the migration
lands and the tool moves to the bare root — is a one-line change, not a
find-and-replace across the codebase.

## Implementation guidance for the WebView screen

- Enable JavaScript and DOM storage (`WebSettings.javaScriptEnabled = true`,
  `domStorageEnabled = true`) — required for a React SPA and for the
  dark-mode preference (stored in `localStorage`) to persist across visits.
- Give it a minimal native chrome: a top bar with a title/close action is
  enough. Override `onBackPressed` (or the Compose `BackHandler`) to first
  try `webView.goBack()` if `webView.canGoBack()`, only falling through to
  closing the screen when there's no more in-page history — otherwise the
  system back button will unexpectedly exit the tool instead of navigating
  its internal state (e.g. closing an open filter drawer, going back from
  a Scryfall card page opened via "Open in Scryfall").
- Handle outbound links deliberately via `shouldOverrideUrlLoading`: the
  tool links out to `scryfall.com` (card pages, "Open Query in Scryfall")
  and to `marcelocoenca.com` / a Ko-fi page (footer credits) — decide
  whether those should open in a Custom Tab / external browser (recommended
  — don't trap the user navigating Scryfall's full site inside your app's
  WebView with no easy way back) versus staying in-WebView. Same-origin
  navigation (anything under the `card-u.me` host) should stay in the
  WebView.
- Card images and mana symbol icons load from `cards.scryfall.io` /
  `svgs.scryfall.io` as plain `<img>` tags — no special handling needed,
  they're not navigations.
- Add a basic offline/load-failure state (`WebViewClient.onReceivedError`)
  with a retry action — it's a live network-dependent tool, not a bundled
  asset, so there's no offline fallback to fall back to.
- No auth, no API keys, no backend calls from your side — it's a fully
  self-contained static site hitting Scryfall's public API directly. You're
  purely embedding a URL.

## Suggested entry point

A single new screen/activity/composable (e.g. `ScryfallStudioScreen`) that
hosts the WebView pointed at `SCRYFALL_STUDIO_URL`, reachable from wherever
in the existing app's navigation makes sense for "advanced card search" —
that's a product decision for that app's own navigation structure, not
something this doc prescribes.
