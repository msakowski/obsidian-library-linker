# Development

## Prerequisites

- [Node.js](https://nodejs.org/), using the version in `.nvmrc`
- [pnpm](https://pnpm.io/), using the version pinned by `packageManager` in `package.json`

## Getting Started

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Start development mode (watch for changes, debug logging enabled)
pnpm dev
```

## Testing the Plugin Locally in Obsidian

1. Start dev mode with `pnpm dev`

2. Symlink the project directory into your Obsidian vault's plugins folder:

   ```bash
   ln -s /path/to/jw-library-linker /path/to/your/vault/.obsidian/plugins/jw-library-linker
   ```

3. In Obsidian, go to **Settings → Community plugins** and enable **JW Library Linker**

4. After making code changes, run the Obsidian command **"Reload app without saving"** to pick up the new build

## Available Scripts

| Script                   | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| `pnpm dev`               | Watch mode with debug logging enabled                     |
| `pnpm build`             | Type-check and production build (minified, no sourcemaps) |
| `pnpm test`              | Apply lint fixes, then type-check and unit tests          |
| `pnpm test:lint`         | ESLint and Markdown checks                                |
| `pnpm test:lint-fix`     | ESLint and Markdown auto-fixes                            |
| `pnpm test:types`        | TypeScript type-check (`tsc --noEmit`)                    |
| `pnpm test:vitest`       | Run Vitest unit tests                                     |
| `pnpm test:vitest-watch` | Run Vitest in watch mode                                  |
| `pnpm changeset`         | Create a changeset for versioning                         |

## Project structure and agent workflow

See [Architecture and testing](documentation/Architecture.md) for the source map, language systems, and test helpers. `styles.css` is a tracked stylesheet; esbuild generates only the JavaScript bundle.

[AGENTS.md](AGENTS.md) defines the agent contribution workflow, validation, and PR boundaries. Human contribution guidance remains in [CONTRIBUTING.md](CONTRIBUTING.md).

## Git hooks in worktrees

The hook installer can report `ENOTDIR` because a linked worktree has a `.git` file rather than a directory. A relative `core.hooksPath=.git/hooks` also fails there. Use the hooks installed in the primary checkout, without changing shared Git configuration:

```bash
# Run inside the task worktree; verify these hooks exist first.
common_hooks="$(git rev-parse --path-format=absolute --git-common-dir)/hooks"
ls "$common_hooks/pre-commit" "$common_hooks/pre-push"
git -c core.hooksPath="$common_hooks" commit -m "docs: describe the change"
git -c core.hooksPath="$common_hooks" push -u origin HEAD
```

If the common hooks are absent, run `pnpm exec simple-git-hooks` in the primary checkout, then verify them again. Keep dependencies installed independently in each worktree. Do not disable hooks to work around installation errors.

## Debug Logging

The project uses a custom logger (`src/utils/logger.ts`) that wraps `console` with a `[JWLinker]` prefix. Logging is controlled at build time via a `DEBUG` compile-time constant:

- **`pnpm dev`** sets `DEBUG=true` — all `logger.*` calls output to the dev console
- **`pnpm build`** disables debug logging — warnings and errors remain enabled in production

All source files use `import { logger } from '@/utils/logger'` instead of calling `console.*` directly. This means:

- Logs are easy to find in the Obsidian dev console (filter by `[JWLinker]`)
- Production builds suppress debug/info output; warning and error calls still pass through
- Log levels (`logger.log`, `logger.warn`, `logger.error`, etc.) work the same as `console` methods

To view debug output, open the Obsidian developer console (**Ctrl+Shift+I** / **Cmd+Option+I**) while running a dev build.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Bundler**: esbuild (configured in `esbuild.config.mjs`)
- **Testing**: Vitest, jsdom environment
- **Linting**: ESLint with TypeScript type-checked rules + Prettier
- **Path aliases**: `@/*` maps to `./src/*` (configured in `tsconfig.json`, `vitest.config.ts`, and esbuild)
- **Locales**: YAML files bundled at build time via a custom esbuild plugin (`esbuild-yaml-plugin.mjs`)

## CI

GitHub Actions runs on every push to `main` and on all pull requests (`.github/workflows/test.yml`):

1. Lint (`pnpm test:lint`)
2. Unit tests (`pnpm test:vitest`)
3. Type-check (`pnpm test:types`)
4. Production build (`pnpm build`)
