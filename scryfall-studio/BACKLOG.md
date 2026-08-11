# Scryfall Studio — Backlog

Running list of known gaps and possible next features. Not prioritized —
grouped by kind. Add to it as things come up; strike through or remove
once done rather than letting it drift from reality.

## Known limitations (found during implementation, not fixed)

- [x] ~~**Main JS bundle**~~ — split into `vendor-react`/`vendor-base-ui`/app
      chunks via `manualChunks` in `vite.config.ts`. Clears Vite's "over
      500kB" warning and improves long-term caching. Worth revisiting with
      real route- or feature-level `dynamic import()` if the app grows
      enough surfaces that aren't needed on first paint.

## Feature ideas (raised, not built)

- [x] ~~**Set field: dropdown with search/autocomplete**~~ — `s:`
      (`src/clauses/plugins/set.ts`) now uses a `SetInput` combobox
      (`src/components/sets/`) backed by Scryfall's `/sets` endpoint (a
      single ~1047-item JSON response, no bulk-data dance needed), with a
      sort control (A–Z / Newest / Oldest) sticky at the top of the
      dropdown. Falls back to whatever's typed if it doesn't match a
      listed set, so an already-known code still works.
- [x] ~~**Collapsible sidebar category sections**~~ — added
      `CollapsibleSection` (`src/components/shared/CollapsibleSection.tsx`)
      and wired it into `Sidebar.tsx`. All sections open by default;
      collapsing is per-section and forced back open while searching (so a
      collapsed section doesn't hide a search match).
- [x] ~~**Art Tag filter (`atag:`)**~~ — added under "Flavor"
      (`src/clauses/plugins/art-tag.ts`), mirroring Oracle Tag's UX
      (`src/components/art-tags/`). Confirmed Scryfall does publish a
      separate `art_tags` bulk-data type (`type: "illustration"`, ~12.5MB
      gzipped / ~11.5k tags — about 2x Oracle Tags), so it got its own
      service pipeline rather than a shared one, keeping `taggingOracleIds`
      vs `taggingIllustrationIds` honest instead of forcing one shape.
      Fixed a latency bug found while testing: the larger dataset takes
      long enough to load that the load promise could resolve after the
      user had already typed a query, and the callback was overwriting
      results with a stale empty search — fixed via a ref to the live
      input value instead of a closed-over one.
- [x] ~~**Loyalty filter (planeswalkers)**~~ — added
      (`src/clauses/plugins/loyalty.ts`) under "Type & Stats", same
      `createOperatorNumberClause` factory as Power/Toughness.
- [x] ~~**Visual AND/OR/NOT builder for prose text clauses**~~ — raised
      by u/Aerim on r/magicTCG (2026-08-11). Originally scoped as a
      boolean-tree editor bolted onto Oracle/Flavor/Lore Text; design
      discussion moved it to something more general — a live, two-way
      "Query syntax" text bar (`src/components/clauses/QueryTextBar.tsx`,
      top of `CanvasArea`) that reuses `parseQuery` (the same parser
      "Import from Scryfall" already used as a one-shot paste) to keep
      raw syntax and the clause cards continuously in sync in both
      directions — type `t:creature`, the Type Line card opens with
      Creature selected; delete it from the bar, the card disappears.
      Covers Aerim's case and more, since it accepts *any* Scryfall
      syntax, not just a fixed AND/OR/NOT vocabulary. Full plan/phase
      history: `~/.claude/plans/bright-crafting-gem.md`.
- [ ] **Query syntax bar: operator-name autocomplete** — Phase 2 of the
      above. Typing a partial operator (`t:c`) should suggest the full
      name (`t:`, `type:`) — source list already exists via
      `listQueryClauses()` in `src/clauses/registry.ts`
      (`.operator`/`.metadata.aliases`), no new data needed.
- [ ] **Query syntax bar: value-level autocomplete** — Phase 3. `t:c` →
      suggest `t:creature`, per-operator, reusing each clause's existing
      value data source (Type Line's `typeCatalog.ts`, Set's
      `SetService.ts`, Oracle/Art Tag's search functions). Free-text/
      numeric operators (Oracle Text, Power…) get no suggestions — nothing
      meaningful to offer. Build one operator at a time.

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
