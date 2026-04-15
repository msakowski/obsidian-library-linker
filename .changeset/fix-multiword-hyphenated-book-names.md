---
'jw-library-linker': patch
---

Support Bible book names containing spaces and hyphens in silent mode, /b explicit mode, and bulk convert. This fixes matching for Korean multi-word names (e.g. "고린도 전서", "요한 계시록") and Vietnamese hyphenated names (e.g. "Lê-vi", "Sa-mu-ên"). Fixes #220.
