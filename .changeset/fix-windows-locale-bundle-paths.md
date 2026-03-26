---
'jw-library-linker': patch
---

Fix locale bundle keys using backslashes on Windows, which caused the plugin to fail with "English locale not found in bundle" when built on Windows.
