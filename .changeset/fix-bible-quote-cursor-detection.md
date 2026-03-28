---
'jw-library-linker': patch
---

Fix Bible quote insertion failing with `ERR_HTTP2_PROTOCOL_ERROR`. `BibleTextFetcher` now sends browser-like headers (including `Connection: keep-alive`) with `requestUrl`, which prevents Electron from upgrading to HTTP/2 for jw.org requests. Also fixes shared regex state in `findJWLibraryLinksInLine` that could cause "No JW Library link found" errors immediately after link insertion. Fixes debug logging never appearing in dev builds — the `DEBUG` flag in `esbuild.config.mjs` was not wrapped in `JSON.stringify`, so it was emitted as a boolean instead of the string `'true'` that the logger checks against.
