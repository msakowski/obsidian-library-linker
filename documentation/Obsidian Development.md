# Obsidian implementation reference

Consult this reference when changing Obsidian UI, DOM handling, networking, styles, or addressing catalog review feedback. Installed declarations and repository lint configuration are the immediate source of truth; external review requirements can evolve.

## API conventions (DOM, timers, popouts)

- `document` → `activeDocument` (so popout windows hit their own DOM).
- Timers — `setTimeout`/`clearTimeout`/`setInterval`/`clearInterval`/`requestAnimationFrame`/`cancelAnimationFrame` → `window.X`. **Not `activeWindow.X`** — the rule complains either way for timers.
- Browser timer handles are `number`; `ReturnType<typeof setTimeout>` can resolve to a server-runtime handle instead.
- `document.createElement(tag)` → `createEl(tag, …)` / `createSpan(…)` / `createDiv(…)`. Prefer parent-bound `el.createEl(…)` when a parent exists; the child is appended automatically.
- `globalThis.X` for plugin-injected globals (Excalidraw etc.) → `window.X`.
- `processFrontMatter` callback param type: `(frontmatter: Record<string, unknown>) => …` — Obsidian's default is `any` and trips unsafe-access rules.
- External SDKs that need a custom `fetch`: inject a `requestUrl`-based adapter via the SDK's `fetch` option (most SDKs that need a custom fetch — Replicate, OpenAI, etc. — expose one). Never `node-fetch`, never `globalThis.fetch = require('node-fetch')`. The adapter wraps `requestUrl` in a `fetch`-shaped function and refuses non-string/ArrayBuffer bodies; no streaming, no AbortSignal, no FormData. Adequate for plain GET/POST polling.

## TypeScript review patterns

- `eslint-disable @typescript-eslint/no-explicit-any` is **forbidden** — the reviewer treats both the violation and the disable as an **error** (blocks the scorecard). Type properly instead: `typeof Chart` for dynamically-imported classes, widen your custom interface rather than `as any`, narrow `unknown` at the call site.
- Every other `eslint-disable-next-line <rule>` requires a `-- reason` description.
- `new Array(n)` leaks `any[]` — write `new Array<T>(n)` or `Array.from({ length: n }, () => …)`. `Array.from` is cleaner when each slot needs a fresh sub-array.
- When `Object.values()` loses useful typing, annotate values as `unknown[]` and narrow at use.
- Drop redundant `as T` casts after `instanceof T` narrowing.
- Switch over an enum: case labels reference enum members (`TimeGranularity.Daily`), not raw string literals.
- `.catch((error: unknown) => …)`: coerce to `Error` before rethrowing — `error instanceof Error ? error : new Error(String(error))`.
- Async function passed to a void-returning callback: wrap in `void (async () => { … })()`, or widen the callback type to `() => void | Promise<void>` for helpers you own.
- "Legacy" ≠ "@deprecated": types that migration code intentionally keeps reading (V1 on-disk shapes etc.) are **legacy**, not deprecated. Drop the `@deprecated` tag and document them as legacy formats — the tag will otherwise fire the no-deprecated rule on every legitimate consumer.

## CSS rules

- No hand-written `!important`. Bump specificity with a doubled-class selector (`.foo.foo`) — that goes from 0,1,0 to 0,2,0 and beats most Obsidian defaults (`.setting-item-control button` 0,1,1; `.modal-container .modal` 0,2,0).
- Before removing an existing `!important`, identify the competing declaration. Normal inline declarations beat stylesheet rules of any selector specificity; an important stylesheet declaration can override normal inline styles. Request manual live-vault verification with `getComputedStyle()` when the cascade cannot be verified locally.
- When `!important` is genuinely load-bearing (visibility toggles like `.lt-hidden` are the canonical example), restore it and add a `/* stylelint-disable-next-line declaration-no-important -- reason: … */` comment. The reviewer accepts descriptive disables.
- Collapse mirrored 4-value shorthands: `8px 0 12px 0` → `8px 0 12px`.
- `obsidianmd/no-static-styles-assignment` only flags **literal** RHS — dynamic style assignments (template literals with expressions, ternaries, variable RHS) can stay inline. Move only the static ones to a CSS class.

## UI and lifecycle

- Register commands with `this.addCommand(...)`; visible names omit the plugin name because Obsidian supplies it. Search README and user documentation when renaming visible commands.
- Use `registerEvent`, `registerDomEvent`, `registerInterval`, and lifecycle helpers for cleanup. Keep reload/unload idempotent.
- Use `AbstractInputSuggest` for inline file autocomplete, `FuzzySuggestModal` for browse dialogs, and a `Modal` subclass instead of `window.confirm()`.
- Provide sensible settings defaults and validation; await `loadData()`/`saveData()`.
- Use sentence case, short translated strings, action-oriented instructions, **bold** literal UI labels, and navigation such as **Settings → Community plugins**.
- Use Obsidian theme variables for colors and interactive states. Edit the tracked `styles.css` for stylesheet changes; there is no stylesheet generator.
- Do not add direct `console.*` calls outside `src/utils/logger.ts`.

## Networking

Use Obsidian's `requestUrl` for plugin HTTP requests. Document services, data sent, and user controls. Preserve the configured online/offline quote-provider behavior; do not add hidden requests or analytics.

## Changeset format

For a change that affects the released plugin, add `.changeset/<descriptive-name>.md`:

```markdown
---
'jw-library-linker': patch
---

Describe the user-visible fix or improvement.
```

Use `minor` for new features. See AGENTS.md for changeset scope and approval boundaries.

## Release checks

Perform releases only when explicitly requested. Use Changesets and the existing version/release workflow; do not hand-edit generated bundles.

- Keep `manifest.json`, `package.json`, and `versions.json` consistent. The latter maps plugin versions to minimum supported app versions.
- Keep `minAppVersion` accurate for APIs used; consult installed declarations.
- Catalog IDs and names omit “Obsidian”; names are not all uppercase. Descriptions omit “Obsidian”, do not start with the plugin name, and end with punctuation. Keep related package metadata consistent where applicable.
- Tags exactly match the manifest version, without `v`. A version tag triggers the GitHub release workflow.
- Build in CI and attach individual `main.js`, `manifest.json`, and `styles.css` assets, never zips.

## References

- [Obsidian API](https://docs.obsidian.md)
- [Developer policies](https://docs.obsidian.md/Developer+policies)
- [Plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Style guide](https://help.obsidian.md/style-guide)

When fixing catalog warnings, inspect relevant sibling plugin commits for established fixes when available. Do not change sibling projects as part of this task.
