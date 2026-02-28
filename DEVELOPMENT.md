# Development

## Prerequisites

- [Node.js](https://nodejs.org/) v22.12.0 (see `.nvmrc`)
- [pnpm](https://pnpm.io/) v10.27.0+ (defined in `packageManager` field of `package.json`)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development mode (watch for changes, debug logging enabled)
pnpm dev
```

## Testing the Plugin Locally in Obsidian

1. Start dev mode with `pnpm dev`
2. Symlink the project directory into your Obsidian vault's plugins folder:

   ```bash
   ln -s /path/to/jw-library-linker /path/to/your/vault/.obsidian/plugins/jw-library-linker
   ```

3. In Obsidian, go to **Settings > Community Plugins** and enable **JW Library Linker**
4. After making code changes, run the Obsidian command **"Reload app without saving"** to pick up the new build

## Available Scripts

| Script                | Description                                         |
| --------------------- | --------------------------------------------------- |
| `pnpm dev`            | Watch mode with debug logging enabled               |
| `pnpm build`          | Type-check and production build (minified, no sourcemaps) |
| `pnpm test`           | Run lint, type-check, and unit tests                |
| `pnpm test:lint`      | ESLint check                                        |
| `pnpm test:lint-fix`  | ESLint with auto-fix                                |
| `pnpm test:types`     | TypeScript type-check (`tsc --noEmit`)              |
| `pnpm test:jest`      | Run Jest unit tests                                 |
| `pnpm test:jest-watch`| Run Jest in watch mode                              |
| `pnpm changeset`      | Create a changeset for versioning                   |

## Project Structure

```
src/
├── __tests__/            # Unit tests (Jest + SWC)
├── consts/               # Constants (chapter counts, etc.)
├── services/             # BibleTextFetcher, TranslationService
├── stores/               # Bible books data store
├── utils/                # Utility functions (parsers, formatters, logger)
├── BibleReferenceSuggester.ts  # Editor suggester for /b command
├── ConvertSuggester.ts         # Suggester for link conversion
├── JWLibraryLinkerSettings.ts  # Plugin settings tab
├── main.ts                     # Plugin entry point
└── types.ts                    # Shared TypeScript types
```

## Debug Logging

The project uses a custom logger (`src/utils/logger.ts`) that wraps `console` with a `[JWLinker]` prefix. Logging is controlled at build time via a `DEBUG` compile-time constant:

- **`pnpm dev`** sets `DEBUG=true` — all `logger.*` calls output to the dev console
- **`pnpm build`** leaves `DEBUG` undefined — all logging is silenced in production

All source files use `import { logger } from '@/utils/logger'` instead of calling `console.*` directly. This means:

- Logs are easy to find in the Obsidian dev console (filter by `[JWLinker]`)
- Production builds have zero logging overhead (calls are no-ops when `DEBUG` is off)
- Log levels (`logger.log`, `logger.warn`, `logger.error`, etc.) work the same as `console` methods

To view debug output, open the Obsidian developer console (**Ctrl+Shift+I** / **Cmd+Option+I**) while running a dev build.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Bundler**: esbuild (configured in `esbuild.config.mjs`)
- **Testing**: Jest with SWC transform, jsdom environment
- **Linting**: ESLint with TypeScript type-checked rules + Prettier
- **Path aliases**: `@/*` maps to `./src/*` (configured in `tsconfig.json`, `jest.config.js`, and esbuild)
- **Locales**: YAML files bundled at build time via a custom esbuild plugin (`esbuild-yaml-plugin.mjs`)

## CI

GitHub Actions runs on every push to `main` and on all pull requests (`.github/workflows/test.yml`):

1. Lint (`pnpm test:lint`)
2. Unit tests (`pnpm test:jest`)
3. Type-check (`pnpm test:types`)