---
'jw-library-linker': patch
---

Fix Bible quote insertion failing with `ERR_HTTP2_PROTOCOL_ERROR`. `BibleTextFetcher` now sends browser-like headers (including `Connection: keep-alive`) with `requestUrl`, which prevents Electron from upgrading to HTTP/2 for jw.org requests. Also fixes shared regex state in `findJWLibraryLinksInLine` that could cause "No JW Library link found" errors immediately after link insertion. Fixes debug logging never appearing in dev builds — the `DEBUG` flag in `esbuild.config.mjs` was not wrapped in `JSON.stringify`, so it was emitted as a boolean instead of the string `'true'` that the logger checks against.

`BibleTextFetcher` now fetches at chapter level and caches the HTML for 5 minutes, so multiple verses from the same chapter (e.g. Matt 5:3, Matt 5:7, Matt 5:12 in one document) result in a single HTTP request. Consecutive requests to different chapters are throttled to at most one every 800 ms to avoid triggering jw.org rate limiting — this applies globally across both batch ("Insert all") and individual cursor-based insertions.

Fixes plugin failing to load on builds produced on Windows (`nepodařilo se načíst plugin`) — the YAML locale bundle used OS-native backslash path separators as keys, which never matched the forward-slash lookups in `TranslationService`.
