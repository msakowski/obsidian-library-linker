# Agent instructions

This is the sole agent instruction file for JW Library Linker, an Obsidian community plugin for Bible-reference links, suggestions, conversion, and online/offline quotes. Keep this file focused on workflow and constraints; put detailed reference material in `documentation/`.

## Start here

1. Read [Business rules](documentation/Business%20Rules.md), the latest `documentation/history/yyyy-mm-dd.md`, and any active plans relevant to the task under `documentation/plans/`.
2. Inspect `git status`, the current branch, and relevant code before editing. Preserve unrelated changes; never reset, stash, overwrite, or commit someone else's work implicitly.
3. Read [Architecture and testing](documentation/Architecture.md) for affected components and [Obsidian development](documentation/Obsidian%20Development.md) for UI, networking, styles, or catalog work. Consult installed `node_modules/obsidian/obsidian.d.ts` before using or extending Obsidian APIs; do not guess signatures.
4. Follow the user's explicit scope. For implementation requests, carry the workflow below through a reviewable PR unless the user limits the task to local edits, investigation, or a draft.

## Branch → worktree → PR

- For a new implementation task, fetch `origin` and create a focused branch from current `origin/main`: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `perf/<topic>`, or `docs/<topic>`.
- Create worktrees only under the primary checkout's gitignored `.worktrees/`, mirroring the full branch name. From the primary checkout: `git worktree add -b docs/update-guide .worktrees/docs/update-guide origin/main`. Run edits, installation, checks, commits, and pushes in that worktree. Do not share or symlink `node_modules` between checkouts.
- When continuing an existing task or PR, use its branch/worktree. Do not move existing uncommitted work automatically. Finish an already-started local task in its checkout unless isolation is needed; never commit it on `main` by default. Transfer only task-owned changes to a task branch before committing.
- Make the smallest complete change, add meaningful regression coverage, and update relevant documentation. Keep commits scoped to one logical change.
- Run the validation below. Inspect the final diff, including untracked files and hook edits; stage explicit paths only.
- In worktrees, verify the effective hook path; use the existing common hooks as described in [worktree hooks](DEVELOPMENT.md#git-hooks-in-worktrees) if the installer cannot handle the `.git` file. Never treat an installer warning as permission to skip hooks.
- Commit using Conventional Commits, for example `fix(parser): handle single-chapter references`. Keep hooks enabled; fix hook failures. Never use `--no-verify` or `-n`.
- Push the task branch with upstream tracking. Check for an existing PR for that branch before creating one against `main`; update it rather than opening duplicates. Use the available GitHub connector or `gh` CLI. Do not post additional comments or contact reviewers unless requested.
- A PR needs a clear problem/result description, checks actually run, and any required manual checks. Mark it draft if validation is blocked or review-critical work remains. Report the PR URL and blockers; do not claim completion when required checks failed.
- Do not push directly to `main`, force-push, merge PRs, create release tags, publish releases, or delete worktrees/branches unless explicitly instructed. Keep the task worktree available for review. If access or credentials block publishing, leave the local result ready and report the precise next step; never bypass controls.

## Tooling

Use **pnpm**, pinned in `package.json`, and Node from `.nvmrc`. CI uses `pnpm-lock.yaml`. Do not add alternate lockfiles or migrate build tools incidentally. esbuild bundles `src/main.ts` to root `main.js`; `styles.css` is tracked source, with no CSS generator or Tailwind pipeline.

| Command                                         | Use                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                | Install dependencies in the task checkout                                                   |
| `pnpm dev`                                      | esbuild watch with debug logging                                                            |
| `pnpm exec tsc --watch --noEmit --skipLibCheck` | Start before code edits; inspect diagnostics after edits and stop the process when finished |
| `pnpm exec prettier --write <files>`            | Format changed source files                                                                 |
| `pnpm test:lint`                                | Zero-warning ESLint and Markdown lint                                                       |
| `pnpm test:types`                               | No-emit type check                                                                          |
| `pnpm test:vitest`                              | Full Vitest suite                                                                           |
| `pnpm build`                                    | Type-check and production build                                                             |

`pnpm test` also applies lint fixes; prefer explicit check commands for final verification. Hooks run nano-staged before commit and `pnpm test:affected` before push; affected tests do not replace the full suite for code changes.

For dependency overrides, update `pnpm-workspace.yaml`, regenerate with `pnpm install --lockfile-only --ignore-scripts --config.optimistic-repeat-install=false`, then validate with `pnpm install --frozen-lockfile --config.optimistic-repeat-install=false`. Review the lock diff for unrelated upgrades.

## Validation and completion

| Change                                                                     | Required checks                                                                                                      |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Documentation only, including agent instructions                           | `pnpm test:lint-md` and `git diff --check`; verify local links and command accuracy                                  |
| Code, localization data, styles, dependencies, or build/test configuration | Format changed source; `pnpm test:lint`, `pnpm test:types`, `pnpm test:vitest`, `pnpm build`, and `git diff --check` |
| CI or release workflow only                                                | Review workflow syntax, permissions, triggers, and referenced commands; run checks for any affected executable code  |

Use the stricter row for mixed changes. Add focused regression tests for changed logic; no implementation-mirroring tests for documentation or formatting. Fix failures caused by the change; identify unrelated failures explicitly. Hooks and CI may run broader checks and must not be bypassed.

Tests and builds do not prove GUI behavior. For UI or runtime changes, state what still needs manual verification in Obsidian, including mobile where relevant. See [local testing](DEVELOPMENT.md#testing-the-plugin-locally-in-obsidian). Report changes, validation, PR/local status, and material blockers concisely.

## Project conventions

- Use `@/` source aliases, `import type`, existing strict TypeScript/lint configuration, and the shared logger at `@/utils/logger`. Keep lifecycle code small and modules focused.
- New tests are colocated `.spec.ts` files using Vitest. Existing `src/__tests__/**/*.test.ts` files remain supported. Reuse the mocks/helpers described in [Architecture and testing](documentation/Architecture.md#test-support).
- Preserve stable plugin/command IDs, settings compatibility, desktop/mobile support, and the privacy constraints in [Business rules](documentation/Business%20Rules.md). Business-rule changes require explicit approval; routine implementation choices do not.
- Use Obsidian lifecycle cleanup helpers and theme variables. Use native suggesters/modals rather than custom pickers or blocking browser dialogs. Keep UI copy short, translated, and in sentence case.
- Read [LOCALIZATION.md](LOCALIZATION.md#contributing-a-new-language) for new languages; do not conflate UI locales and JW Library language codes.

## Documentation and changesets

- `README.md` is the landing page; `docs/` is for end users when present; `documentation/` is for architecture, business rules, history, and plans. `DEVELOPMENT.md` covers local setup and `LOCALIZATION.md` covers translations.
- Update today's `documentation/history/yyyy-mm-dd.md` with changes, decisions, validation, and blockers. Store actionable plans in `documentation/plans/`; update or close them as work progresses. Plans never include timing estimates. Keep durable instructions free of session-specific state.
- Add or update a `.changeset/<descriptive-name>.md` when the released plugin changes: `'jw-library-linker': patch` for fixes or `minor` for features. Request approval for breaking behavior and a major release. Docs-only, test-only, CI-only, and development-tooling changes need no changeset unless they alter shipped behavior/artifacts. Reuse an existing changeset only when it covers the same logical change.
- Do not manually bump versions for ordinary changes; Changesets and the existing release workflow handle versioning. Releases require explicit instructions; see [release checks](documentation/Obsidian%20Development.md#release-checks).

## Protected material

Do not read or modify root `TODO.md`, `documentation/archived/`, release archives, or attached build artifacts unless explicitly requested. Do not read or hand-edit generated `main.js` or `dist/`; builds may regenerate them. Dependencies in `node_modules/` are read-only. Never commit generated bundles, dependencies, vault data, credentials, or unrelated files. The tracked root `styles.css` is editable source, not a generated artifact.
