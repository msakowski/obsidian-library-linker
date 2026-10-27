# Business rules

These invariants consolidate existing project requirements. Changing or bypassing one requires explicit user approval. Add newly stated business rules here concisely and precisely.

- The released plugin ID `jw-library-linker` and released command IDs are stable. Preserve installed settings compatibility; use migrations when changing persisted formats.
- Keep UI locale codes (`Locale`, such as `en`) distinct from JW Library language codes (`Language`, such as `E`). Preserve book identity and reference targets across aliases and translations.
- Support desktop and mobile unless explicitly approved otherwise. Do not introduce a desktop-only dependency into a mobile execution path.
- Plugin runtime access is limited to necessary vault data. Do not read/write outside the vault or collect/transmit vault contents, filenames, or personal information unless essential and explicitly consented. This restriction concerns plugin behavior; agents may access repository files and development tooling within their granted permissions.
- Prefer local/offline operation; preserve user-configured offline/online citation behavior. External requests must serve an essential, documented feature. Disclose services, data sent, and risks; require explicit opt-in for optional analytics or third-party integrations. No hidden telemetry.
- Never execute remote code, fetch/eval scripts, or update plugin code outside normal releases. No deceptive patterns, ads, or spammy notifications.
- Respect copyright; do not expose or reveal copyrighted JW Library content beyond the intended, authorized feature behavior. Do not broaden content collection or redistribution without review.
