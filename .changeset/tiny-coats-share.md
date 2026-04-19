---
"jw-library-linker": minor
---

Switch Bible quote fetching from jw.org to wol.jw.org as the primary source.

Fetching Bible text from `jw.org` through Obsidian's built-in request path fails on desktop Electron with `ERR_HTTP2_PROTOCOL_ERROR`. This release switches the primary fetch target to `wol.jw.org`, which serves the same NWT Bible text at a directly constructible URL — no redirect chain, different CDN infrastructure, and the same `requestUrl` API that works on all platforms.

On desktop, if `requestUrl` still fails against `wol.jw.org`, the plugin falls back to the existing curl or webviewer strategies. Mobile continues to use `requestUrl` directly, which already works well.

The extraction logic now supports both the WOL HTML format (`id="v40-24-14-1"`) and the jw.org format (`id="v40024014"`), so fallback paths that may return jw.org HTML continue to work.
