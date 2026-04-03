---
"jw-library-linker": minor
---

Add configurable desktop Bible citation modes for quote insertion.

Fetching Bible text from `jw.org` works reliably through Obsidian's built-in request path on iOS and Android, but fails on desktop Electron with `ERR_HTTP2_PROTOCOL_ERROR` for the same URLs. Investigation showed that the page URLs still load successfully through other desktop client paths on the same machine, which points to a desktop-specific network/client mismatch rather than broken references, parsing, or page availability.

This release keeps the existing direct request strategy for mobile, where it already works well, and introduces a desktop-only choice:

- `Webviewer`: faster, because it uses Obsidian's working webviewer path to load the page and extract the text, but it briefly opens the website while the page is loaded.
- `Background request`: slower, but stays in the editor while the page is fetched in the background.

Desktop still falls back to the background fetch path if the selected mode fails, so quote insertion remains resilient even when the faster path cannot be used.
