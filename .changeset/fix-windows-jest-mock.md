---
'jw-library-linker': patch
---

Fix Windows compatibility: rename locale:all mock to locale-all and add moduleNameMapper entry. Also fixes a path resolution bug in the mock that prevented YAML files from being found.
