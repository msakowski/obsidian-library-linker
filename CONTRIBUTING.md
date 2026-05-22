# Contributing

Thank you for your interest in contributing to this project!

Before getting started, please take a moment to familiarize yourself with our guiding principles and contribution process.

## Adding a Language

Want to add support for a new language? Head straight to [LOCALIZATION.md](LOCALIZATION.md) for a step-by-step guide on how to do that.

## Development Principles

Our development approach is driven by the following core principles:

- Enhancing the integration between Obsidian and JW Library is our primary focus.
- We strive to keep the plugin lightweight and free from unnecessary complexity.
- Our design philosophy is opinionated—favoring a minimalist, keyboard-centric experience—while remaining open to thoughtful enhancements.
- Writing should be a distraction-free experience.
- We aim to be compatible with other well-established plugins and avoid interference. Please report issues if found. [Known issues](https://github.com/msakowski/obsidian-library-linker/#known-issues)
- We respect copyright laws and do not expose or reveal copyrighted content from JW Library.

## Linting & Formatting

This project uses two linters:

- **ESLint** (type-checked rules) — TypeScript/JavaScript source under `src/`
- **remark** (`remark-preset-lint-recommended` + `remark-gfm`) — Markdown files

| Command                 | Purpose                                |
| ----------------------- | -------------------------------------- |
| `pnpm test:lint`        | Run ESLint and remark                  |
| `pnpm test:lint-fix`    | Run both with auto-fix                 |
| `pnpm test:lint-ts`     | ESLint only                            |
| `pnpm test:lint-md`     | remark only                            |
| `pnpm test:lint-md-fix` | remark with `--output` to rewrite docs |

### Git hooks

Managed via `simple-git-hooks` (configured in `package.json`):

- **pre-commit** — runs `lint-staged`, which lints (and auto-fixes) only staged files
- **pre-push** — runs `pnpm test:affected` (ESLint + remark + `tsc` + Jest on tests related to changes since `origin/main`); a push is aborted if any check fails. Use `pnpm test` for the full suite.

### Recommended VS Code extensions

Install these for inline diagnostics matching CI:

- [`dbaeumer.vscode-eslint`](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) — ESLint
- [`unifiedjs.vscode-remark`](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-remark) — remark for Markdown

## Contribution Process

To ensure a smooth contribution, please follow these steps:

1. **Review Guidelines**: Familiarize yourself with our contribution guidelines before starting.
2. **Bug Fixes**: Feel free to submit pull requests (PRs) directly for bug fixes.
3. **New Ideas**: For feature requests, enhancements, or ideas, please engage in the [discussions section](https://github.com/msakowski/obsidian-library-linker/discussions) first. You can join existing topics or create new ones.
4. **Pre-PR Discussion**: We strive to keep the plugin lightweight. Discussing your ideas before coding helps ensure alignment with our vision and saves you time and effort on work that might not be merged.
5. **Submit Your Work**: Once there’s agreement on the approach, submit your pull request with the proposed changes. Every contribution is valuable!

We appreciate your support in making this project better!
