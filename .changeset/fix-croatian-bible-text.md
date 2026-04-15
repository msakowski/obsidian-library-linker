---
"jw-library-linker": patch
---

Fix Croatian Bible text fetched in Haitian Creole instead of Croatian

The plugin used `CR` as the wtlocale parameter when fetching Bible text from jw.org, but `CR` maps to Haitian Creole on jw.org. The correct code for Croatian is `C`. Added a central `LANGUAGES` config in types.ts with an optional `wtlocale` override field, and updated BibleTextFetcher and settings to use it.
