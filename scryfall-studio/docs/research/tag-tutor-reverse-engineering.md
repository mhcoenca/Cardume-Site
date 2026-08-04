> Reference research, not implementation guidance. Investigation date: 3 August 2026.
> Saved for possible future use — most likely if/when the `oracle-tag` clause
> (`src/clauses/plugins/oracle-tag.ts`) gets real autocomplete instead of a
> plain text input. The source report ends mid-sentence in section 7; that is
> the original's actual ending, not a paste truncation (confirmed with the user).

# Reverse-Engineering Report: Tag Tutor & the Oracle Tag Ecosystem

Investigation date: 3 August 2026. All figures reflect data fetched live that day.

Throughout, claims are marked as **[Observed]** (directly measured) or **[Inferred]** (reasoned from evidence). Where something could not be determined, it is said explicitly.

A note before the findings: the headline discovery is that the original premise needs updating. Oracle Tags are no longer something that has to be scraped from Tagger. Scryfall now publishes them as first-class, documented, daily bulk data. Tag Tutor is a straightforward consumer of that feed, and its numbers were verified against Scryfall's own search index to the exact card.

## 0. Source of Truth Investigation (Highest Priority)

### The canonical source is Scryfall's official bulk data

**[Observed]** `GET https://api.scryfall.com/bulk-data` returns seven bulk objects. Two of them are tag datasets:

| Type | Name | Compressed | Updated (observed) | Bulk object ID |
|---|---|---|---|---|
| `oracle_tags` | Oracle Tags | 5,896,524 B (5.62 MB) | 2026-08-03T21:00:39.518Z | `bd8df61e-5d0a-47a2-9086-40137a645b98` |
| `art_tags` | Art Tags | 12,395,021 B (11.8 MB) | 2026-08-03T21:01:26.728Z | `48da5752-eeb6-4126-bf97-8829e20ad14f` |

Stable metadata endpoints: `https://api.scryfall.com/bulk-data/oracle_tags` and `.../art_tags`. Each returns a `jsonl_download_uri` whose timestamped filename changes daily — on the day of investigation, `https://data.scryfall.io/oracle-tags/oracle-tags-20260803210039.jsonl.gz`.

Scryfall's own description of the file: *"A JSON file containing all Oracle tags sourced from Tagger, the Scryfall community tagging project."*

**[Observed]** There is now a dedicated documentation page at `https://scryfall.com/docs/api/tags`, flagged NEW in the sidebar, which formally specifies the Tag object, the Tagging object, the four weight values, the hierarchy semantics, and how to join tags to cards. Older notes claiming tags are only obtainable by scraping are outdated.

### Which repository is authoritative? None — the pipeline is closed-source, but the output is open

**[Observed]** `https://github.com/scryfall` is a verified organisation with exactly 9 public repositories: `google-sheets`, `art-game`, `gatherer-bugs`, `api-types`, `manamoji-slack`, `manamoji-discord`, `servo`, `scion`, `thopter`. Tagger is not among them.

**[Observed]** A GitHub repository search for "scryfall tagger" returns 14 results, all third-party: browser extensions (`natefinch/moxtags`, `lethangomes/Scryfall-tag-displayer`, `patcolyn/scryfall-tagger-button-overlay`), cube/deck tooling (`nathan-pham/mtg-cube-tagger`, `TrumanAmsler/Tagit`, `benjamin-fouilleul/mtg_ultimate_tag`), and scrapers/ETL experiments (`Nickolas161202/scryfall-tagger-webscrapper`, `YhaliWaizman/scryfall-tagger-etl`, `ItsGoldeneyes/scryfall-tagger`). Star counts are 0–6. None is authoritative; all predate or work around the official bulk feed.

**[Inferred]** The authoritative artefact is therefore the bulk file itself, not any repository. Tagger's own application code is proprietary. This is arguably the better outcome for downstream consumers: a documented, versioned, daily data contract is a more stable dependency than a third-party scraper.

### Tagger's own stack and API surface

**[Observed]** `tagger.scryfall.com` is a Rails application served through Vite (`/vite/assets/application-BbPcA3w0.js`, `application-DSwDP_YS.css`). Loading a tag page issues one `POST https://tagger.scryfall.com/graphql` (HTTP 200). Google Fonts (Lato) and GTM (`G-XMVWH04BTD`) are also loaded.

**[Observed]** Tag pages resolve at `https://tagger.scryfall.com/tags/card/<slug>` for oracle tags and `/tags/artwork/<slug>` for art tags, matching the `uri` field in the bulk data. The page for `tutor-creature-giant` shows breadcrumbs `tutor › tutor-creature › tutor-creature-giant`, the line "Also known as: tutor-giant", a taggings count, and the description — the UI rendering of `parent_ids`, `aliases`, `taggings`, and `description`.

**[Undetermined / not pursued]** The GraphQL endpoint is undocumented and unversioned; its schema was not probed. For a production dependency the bulk feed is the sanctioned path — treat `/graphql` as an implementation detail that can change without notice.

## BONUS: Complete Oracle Tags dataset extraction

The entire file was streamed and parsed (computing aggregate statistics rather than retaining or reproducing the dataset).

### Dataset location and shape

- Metadata endpoint: `https://api.scryfall.com/bulk-data/oracle_tags` (stable)
- File: `https://data.scryfall.io/oracle-tags/oracle-tags-YYYYMMDDHHMMSS.jsonl.gz` (rotates daily)
- Wire format: gzipped JSON Lines, `content-type: application/gzip`, `cache-control: public, max-age=31556952` (immutable per filename)
- Compressed: 5,896,524 bytes. Uncompressed (measured): 18,362,984 bytes ≈ 17.5 MiB
- Update frequency: documented as daily; Scryfall states bulk data is collected once every 12–24 hours. Observed `updated_at` 21:00 UTC.

Scryfall's docs describe the file as containing "a JSON array of tag objects," but the actual artefact is JSONL (one object per line, no enclosing array). Parsers should target the JSONL form actually shipped.

### JSON schema (observed, all 4,522 records)

Tag object keys, exhaustively: `object`, `id`, `label`, `slug`, `type`, `uri`, `description`, `parent_ids`, `child_ids`, `aliases`, `taggings`.

Tagging object keys, exhaustively (oracle file): `oracle_id`, `weight`, `annotation`. The art file uses `illustration_id` in place of `oracle_id`.

A representative record, abbreviated:

```json
{"object":"tag","id":"00155182-…","label":"tutor-creature-giant","slug":"tutor-creature-giant",
 "type":"oracle","uri":"https://tagger.scryfall.com/tags/card/tutor-creature-giant",
 "description":"Cards that tutor Giant cards.","parent_ids":["23fd5e7c-…"],"child_ids":[],
 "aliases":["tutor-giant"],"taggings":[{"oracle_id":"2445e58b-…","weight":"median"}]}
```

### Measured statistics — Oracle Tags

| Metric | Value |
|---|---|
| Tags | 4,522 (all `type: "oracle"`) |
| Taggings | 231,650 |
| Distinct `oracle_id`s covered | 35,881 |
| Weight `median` | 231,047 |
| Weight `very_strong` | 602 |
| Weight `strong` | 1 |
| Weight `weak` | 0 (documented but unused in oracle tags) |
| Taggings carrying an annotation | 3,993 |
| Tags with a non-null description | 1,327 (29%) |
| Tags with ≥1 alias | 714 (813 aliases total) |
| Tags with ≥1 parent | 3,593 (79%) |
| Tags with ≥1 child | 676 |
| Root tags (no parent) | 929 |
| Tags with >1 parent (DAG, not tree) | 684 |
| Max depth from roots | 4 (929 / 2,397 / 1,006 / 171 / 19 by level) |
| Orphans unreachable from roots | 0 |
| Tags where label ≠ slug | 1,232 |
| Largest tag by direct taggings | `activated-ability` (9,088) |
| Largest root by child count | `cycle` (1,338 children, 0 direct taggings) |

**Critical semantic**: the file contains only *direct* taggings. Scryfall's docs are explicit that a parent tag such as `animal` has no taggings of its own and consumers must traverse `child_ids`. This was verified empirically: `sacrifice-outlet` has 0 direct taggings but 14 children and a descendant closure covering 1,504 oracle IDs. Any consumer that reads `taggings` without closure traversal will silently return nothing for many of the most useful tags.

Closure measurements (descendant-expanded unique oracle IDs vs. direct):

| Tag | Direct | Children | Closure tags | Closure oracle IDs |
|---|---|---|---|---|
| `lifegain` | 891 | 8 | 18 | 2,751 |
| `sacrifice-outlet` | 0 | 14 | 23 | 1,504 |
| `activated-ability` | 9,088 | 7 | 11 | 10,302 |
| `landfall` | 234 | 7 | 8 | 290 |

### Art Tags, for contrast

**[Observed]** Same schema, `type: "illustration"`, taggings keyed by `illustration_id`, weight values include `very_strong`. Example first record: `rashida-scalebane`, five `parent_ids`, one tagging at `very_strong`. Larger file (11.8 MB compressed) because artwork tagging is denser.

### Stability warning from the source

Scryfall's tag documentation carries an explicit caution worth respecting in any downstream architecture: tag data is community-maintained and subject to change, slugs and labels are not permanent identifiers, only `id` (UUID) is stable, and downstream applications are "strongly recomended" [sic] to implement a way to temporarily disable display of individual tags. Scryfall does content moderation but does not guarantee freedom from abuse.

## 1. Frontend Architecture

Tag Tutor is not a JavaScript SPA. It is a server-rendered PHP application. Every framework in the original candidate list (React, Vue, Svelte, Next, Astro) is absent.

| Layer | Technology | Evidence |
|---|---|---|
| Backend framework | Laravel | `/up` returns 200 (Laravel's default health-check route); `/build/manifest.json` maps `resources/js/app.js` and `resources/css/app.css` — canonical Laravel paths; `X-RateLimit-Limit: 60` / `X-RateLimit-Remaining` headers on `/tags.json` (Laravel throttle middleware) |
| UI/reactivity | Livewire 3 | `GET /livewire-3b986e7b/livewire.min.js` (241,096 B); `POST /livewire-3b986e7b/update` on interaction; HTML contains `wire:snapshot`, `wire:effects`, `wire:id`, `wire:model`, `wire:navigate`, `wire:ignore`, `wire:key`, `wire:loading.attr`; the `<!--[if BLOCK]><![endif]-->` / `<!--[if ENDBLOCK]><![endif]-->` markers are a Livewire 3 conditional-block fingerprint; an HTML comment reads `<!-- Livewire Styles -->` |
| Component library | Flux UI (official Livewire component kit) | `GET /flux/flux.min.js` (314,009 B); markup uses `<ui-pillbox>`, `<ui-pillbox-trigger>`, `<ui-options>` with `data-flux-control` / `data-flux-pillbox` attributes; `flux` appears in the compiled CSS |
| Client reactivity | Alpine.js | `app.js` registers `window.Alpine.data('tagCombobox', …)` on `alpine:init`; `x-data` present in HTML. Alpine ships bundled inside `livewire.min.js`, not separately |
| CSS | Tailwind CSS v4 | `app-Duz7nCF3.css` is 300,308 B with `tailwind` at byte offset 4 (v4 emits its source marker at the top; no v3-style preflight comment block) |
| Bundler | Vite via `laravel-vite-plugin` | `/build/assets/*` with content-hashed filenames; `/build/manifest.json` present at the Laravel default location (not `/build/.vite/manifest.json`, which 404s) |
| Fonts | Poppins 400/500, Bebas Neue 400, self-hosted | Six files under `/build/assets/` in woff2 + woff; a `_fonts-DkMI0NOD.css` chunk in the manifest. **[Inferred]** Fontsource-style local font packages, though the literal string `fontsource` does not appear |
| State management | Server-side, in the Livewire component | Selected tags live in a Livewire property (`wire:model="selectedTags"`), mutated via `$wire`. There is no client store — no Redux/Pinia/Zustand/Alpine.store |
| Analytics | First-party, self-built | Privacy policy describes cookieless anonymous event capture respecting DNT/GPC; `robots.txt` disallows `/insights` (**[Inferred]** an internal dashboard, likely Laravel Pulse or a custom one). No third-party analytics scripts loaded |
| Hosting | cyon (Switzerland), shared hosting with AWStats | Stated in the privacy policy |

Total first-party JS is 1,443 bytes. The entire client-side codebase is one Alpine component. All heavy lifting is server-side.

## 2. Network Analysis (hard refresh)

Thirteen requests on cold load of `/`:

| # | URL | Purpose | Loading |
|---|---|---|---|
| 1 | `/` | Server-rendered HTML, 51,109 B | eager |
| 2–4 | `/build/assets/{poppins-400,poppins-500,bebas-neue-400}-normal-*.woff2` | fonts | eager (preloaded) |
| 5 | `/build/assets/app-Duz7nCF3.css` | Tailwind v4 + Flux styles, 300,308 B | eager |
| 6 | `/build/assets/app-kFIDYAYf.js` | first-party JS, 1,443 B | eager |
| 7–9 | same fonts in `.woff` | legacy fallbacks | eager |
| 10 | `/livewire-3b986e7b/livewire.min.js?id=f4724cc4` | Livewire 3 + Alpine, 241,096 B | eager |
| 11 | `/flux/flux.min.js?id=1ea4120f` | Flux web components, 314,009 B | eager |
| 12 | `/tags.json` | the tag catalogue | eager, fired by Alpine `init()` |
| 13 | `/favicon.svg` | icon | eager |

Zero requests to any Scryfall API on page load. Card images later come directly from `cards.scryfall.io`.

(For transparency: some `api.scryfall.com` / `data.scryfall.io` entries appeared in the captured traffic during this investigation. Those were the investigator's own fetches executed in the page context, not requests made by Tag Tutor. Tag Tutor itself never contacts Scryfall from the browser except for card images.)

### `/tags.json` — the only data file

- URL: `https://tag-tutor.com/tags.json`
- Size: 343,222 B uncompressed; served `content-encoding: br` (Brotli)
- Headers: `cache-control: max-age=3600, public`, `vary: Accept-Encoding`, `x-ratelimit-limit: 60`
- Structure: flat JSON array, 4,509 entries, alphabetically sorted by `value`, exactly three keys each:

```json
[{"value":"40k-model","label":"40k model","keywords":[]},
 {"value":"alternate-win-condition","label":"alternate win condition",
  "keywords":["automatic win","win condition"]}, …]
```

- Purpose: feeds the client-side tag autocomplete only. It contains no card data, no hierarchy, no descriptions, no weights.
- Loading: eager but non-blocking, once per component mount. Observed re-fetching on Livewire re-renders (the combobox remounts), which is mildly wasteful given the 1-hour cache.

### Probed and absent

`/cards.json`, `/dataset.json`, `/search.json`, `/oracle-tags.json`, `/index.json`, `/manifest.json`, `/themes.json`, `/api`, `/api/tags`, `/build/.vite/manifest.json`, and `/build/assets/app-kFIDYAYf.js.map` all return 404. There are no source maps and no public API.

Present: `/robots.txt` (200), `/sitemap.xml` (200, four URLs: `/`, `/search`, `/privacy`, `/imprint`), `/build/manifest.json` (200), `/up` (200).

## 3. Oracle Tags in Tag Tutor — where they come from

Direct answers:

- **Embedded in the JS bundle?** No. `app.js` is 1,443 B and contains no tag data.
- **Downloaded separately?** Yes — the tag catalogue is `/tags.json`, fetched at runtime.
- **Fetched from an API?** No public API exists, and no Scryfall call is made client-side.
- **Generated at build/import time?** Yes — `/tags.json` is a derived artefact of a periodic server-side import from Scryfall's bulk data, and the tag→card mapping lives in a server-side database, not in any downloadable file.
- **Loaded dynamically?** The catalogue yes; the tag→card resolution no (server-side).

### Proof that `/tags.json` is generated from Scryfall's Oracle Tags bulk file

All 4,509 Tag Tutor entries were compared against the 4,522 records in the same-day bulk file:

- `keywords` is byte-for-byte Scryfall's `aliases`. All 4,509 comparable entries match exactly after sorting; zero mismatches. Independently, the bulk file has 714 tags with aliases / 813 aliases total; `/tags.json` has 713 with keywords / 811 total — the difference accounted for entirely by the 13 dropped tags.
- `label` is Scryfall's `label` field verbatim. All 4,509 match. Notably it is not the slug with hyphens replaced (only 1,384 would match that rule), which rules out independent derivation.
- `value` is Scryfall's `slug`. Tag Tutor's set is a strict subset — zero entries exist in `/tags.json` that are absent from the bulk file.
- The 13 missing tags are all recent additions, twelve with a single tagging (`typal-trilobite`, `typal-starfish`, `typal-camel`, `typal-lobster`, `typal-nautilus`, `typal-nephilim`, `tutor-creature-nephilim`, `hate-typal-archon`, `gives-saddle`, `gives-assist`, `gives-living-weapon`, `synergy-saddle`) plus `creates-bigger-body` (201 taggings). This is a snapshot-lag signature, not a filtering rule.

### Proof that resolution happens against a local snapshot, not live Scryfall

**[Observed]** Requesting `/search?id=wubrg&tags=typal-trilobite` — a tag that genuinely exists in today's bulk file — returns an empty result page byte-comparable to a deliberately bogus tag slug. If Tag Tutor were proxying Scryfall it would resolve. It cannot, because the tag is not in its imported snapshot.

**[Observed]** The footer on every page states: "Card data as of August 3, 2026 at 09:00 UTC." Attribution reads: "Card data and oracle tags courtesy of Scryfall and the community-maintained Tagger project."

**[Inferred]** A scheduled import (cron / Laravel scheduler) pulls Scryfall bulk data, writes a database snapshot, regenerates `/tags.json`, and stamps a timestamp rendered into the layout. The 09:00 UTC stamp against Scryfall's 21:00 UTC publication implies roughly a half-day-old snapshot at minimum, consistent with the 13 missing tags.

## 4. The Scryfall Tagger Ecosystem

Official, first-party, authoritative:

- `https://tagger.scryfall.com` — the human-facing crowdsourced tagging application (Rails + Vite + GraphQL). Closed-source. Where tags are created.
- `https://api.scryfall.com/bulk-data/{oracle_tags,art_tags}` — the sanctioned machine-readable export. Where tags are consumed.
- `https://scryfall.com/docs/api/tags` — the formal object specification.
- `https://scryfall.com/docs/api/bulk-data` — file listing, sizes, JSONL guidance.
- Scryfall's search index exposes tags as query operators: `otag:` / `oracletag:` / `function:` for oracle tags, `atag:` / `arttag:` / `art:` for art tags. The syntax reference states plainly: "Data for these two features comes from the Tagger project."

Official but unrelated to tags: `github.com/scryfall/api-types` (MIT, TypeScript, 43 stars). Its `src/objects/` tree was enumerated: `Card`, `Catalog`, `Error`, `List`, `Migration`, `Object`, `Ruling`, `Set`, `Symbology`. There is no `Tag` type, and last push was 2024-09-09 — i.e. it predates the tags feature. This is a gap that could be filled or worked around.

Third-party, none authoritative: the 14 repositories listed in §0. Their historical role was working around the absence of an official export; that need has largely evaporated.

No release artefacts, no update scripts, no build scripts, no data pipelines are published by Scryfall. Only the output.

## 5. Can the Oracle Tags dataset be reproduced from public resources?

Yes — completely, and trivially. This is a solved problem now.

Steps:

1. `GET https://api.scryfall.com/bulk-data/oracle_tags` → read `jsonl_download_uri` and `updated_at`.
2. Download the `.jsonl.gz` (5.6 MB) and stream-decompress line by line. Never buffer the whole thing; 17.5 MiB uncompressed for oracle tags, and the card files run to 372 MB.
3. Index tags by `id`; build the parent/child DAG from `parent_ids` / `child_ids`.
4. Compute descendant closures. Without this, wrong answers result — `sacrifice-outlet` has zero direct taggings.
5. `GET https://api.scryfall.com/bulk-data/oracle_cards` → 23.3 MB compressed, one card per `oracle_id`. Join `taggings[].oracle_id` → card `oracle_id`.
6. For art tags, join `taggings[].illustration_id` → the `illustration_id` field in the Unique Artwork file (35.5 MB) instead.
7. Re-run daily; compare `updated_at` to skip no-op downloads.

**What is genuinely not reproducible**: tag provenance and history. The bulk file is a flat snapshot. There is no author attribution, no created/updated timestamp per tag or tagging, no revision history, no moderation log, no voting data. "Who added this tag and when" lives only in Tagger's private database and possibly its undocumented GraphQL layer. Also unavailable: any notion of tag quality/confidence beyond the four-value weight enum.

## 6. Card Dataset

**[Observed]** No card data is delivered to the browser. No `cards.json`, no local dataset, no public API. Result pages are fully server-rendered HTML; card images are `<img>` tags pointing at `cards.scryfall.io/normal/front/…`.

**[Observed]** The pool's exact identity was determined by comparing Tag Tutor's reported counts against Scryfall's live search API:

| Query | Tag Tutor | Scryfall equivalent | Scryfall result |
|---|---|---|---|
| `id=wubrg&tags=lifegain` | 2,426 | `f:commander otag:lifegain unique:cards` | 2,426 ✓ |
| `id=wubrg&tags=activated-ability` | 9,486 | `f:commander otag:activated-ability` | 9,486 ✓ |
| `id=wubrg&tags=landfall` | 251 | `f:commander otag:landfall` | 251 ✓ |
| `id=br` 2-of-2 bucket | 79 | `f:commander id<=br otag:lifegain otag:sacrifice-outlet` | 79 ✓ |
| `id=br` 1-of-2 bucket | 1,488 | …(`otag:lifegain` or `otag:sacrifice-outlet`) 1,567 − 79 | 1,488 ✓ |

Five exact matches, including a derived subtraction. Conclusions:

- **Pool**: Commander-legal cards, deduplicated by oracle identity — semantically `f:commander unique:cards`. Scryfall reports 31,623 such cards, which is the upper bound on Tag Tutor's card table.
- **Colour filter**: `id=<letters>` means colour identity ⊆ that set, equivalent to Scryfall's `id<=`. Colourless (`id=c`) narrows lifegain from 2,426 to 183.
- **Tag semantics** match Scryfall's `otag:` exactly, which means Tag Tutor performs the same hierarchy closure. Direct-taggings-only would have returned 891 for lifegain, not 2,426.
- **Update frequency**: daily-ish. Footer stamp 2026-08-03 09:00 UTC; 13 tags behind the 21:00 UTC bulk file.
- **Payload strategy**: server-side query, HTML down the wire (~115 KB for a single-tag result page, ~188 KB for three tags), 32 cards per bucket with a "Show all N" expander. Images lazy-load from Scryfall's CDN, so Tag Tutor pays no image bandwidth.

**[Undetermined]** The exact row count of the card table, the database engine, and the schema. Not observable without server access. **[Inferred]** MySQL or SQLite on cyon shared hosting; **[Inferred]** a normalised `cards` / `tags` / `card_tag` join, since bucketed match-counting maps naturally onto `GROUP BY card HAVING COUNT(matched_tag)`.

## 7. Search Engine

Two independent search mechanisms, and neither uses a well-known search library.

### Tag autocomplete — custom, client-side

The absence of every common candidate was confirmed: Fuse, FlexSearch, MiniSearch, lunr, TomSelect, select2, levenshtein, htmx — none appear anywhere in `app.js` or the CSS.

Instead the HTML declares `x-data="tagCombobox([], 'https://tag-tutor.com/tags.json')"`, and `app.js` registers that Alpine component. Reading the (unminified) logic, the algorithm is:

1. On `init()`, set `wire:ignore` on the `<ui-options>` element so Livewire won't clobber the list, then fetch the catalogue.
2. A match predicate combines three tests: case-insensitive substring on `label`, prefix on `value` (slug), or prefix on any entry in `keywords`.
3. Currently-selected tags are always kept in the list (hidden rather than removed when they stop matching), preserving pill state.
4. Unselected matches are ranked by a binary key: 0 if the query is a prefix of `label` or `value`, 1 otherwise — so prefix hits float above mid-string hits, with the catalogue's alphabetical order acting as a stable tie-break.
5. Results are capped at 30 suggestions.
6. A `handlePaste` handler splits clipboard text on whitespace/commas, dedupes, resolves each token by exact slug match or exact alias

*(The source report ends here, mid-sentence — this is the original's actual ending, not a paste truncation.)*
