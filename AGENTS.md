# Repository Guidelines

## 計画

- 修正を始める前に計画をマークダウンファイルで .plans フォルダ配下に日本語で生成してください。
- 計画のファイル名は連番とし、1つ目を 001 始まりとして修正にあった適切なファイル名としてください。
- 具体的なファイル編集をする前に、修正案を提示すること。
- API に関しては https://github.com/inkdropapp/api-docs/ サイトを確認すること。特に、inkdrop v5 から v6 への plugin アップデートに関しては https://github.com/inkdropapp/api-docs/blob/main/src/app/appendix/plugin-migration-from-v5-to-v6/page.mdx を参照すること。

## Project Structure & Module Organization
This repository is a small Inkdrop plugin. Runtime code lives in `lib/`: `plugin.js` registers the plugin and config, and `narrow-book-dialog.js` implements the modal UI and notebook filtering logic. Styles are in `styles/switch-notebook.css`. Package metadata and dependencies are defined in `package.json`, and `README.md` documents installation and the `narrow-book:open` command. When editor integration is needed, assume Inkdrop uses CodeMirror v6 APIs rather than legacy CodeMirror 5 patterns.

## Build, Test, and Development Commands
There is no build step or bundled CLI in this repository. Use these commands during development:

- `npm install`: install plugin dependencies.
- `ipm install`: install the plugin into Inkdrop from the package root.
- `npm pack`: create a tarball to sanity check publishable package contents.

For local verification, open Inkdrop, run `narrow-book:open`, and confirm notebook selection, `Escape`, and Migemo search behavior.

## Coding Style & Naming Conventions
Follow the existing JavaScript style in `lib/`:

- Use 2-space indentation, semicolons, and double quotes.
- Keep filenames lowercase with hyphens, for example `narrow-book-dialog.js`.
- Export the main UI component as the default export and keep plugin entry points in `module.exports`.
- Match existing state/helper naming when editing old code. Current code uses trailing underscores such as `modal_` and `options_`; keep changes consistent within the touched file.

Keep CSS selectors scoped with the `narrow-book-` prefix to avoid collisions in Inkdrop.

## Testing Guidelines
This project currently has no automated test suite and no coverage gate. Validate changes manually inside Inkdrop:

- check command registration for `narrow-book:open`
- verify navigation to a selected notebook or `All Notes`
- verify keyboard handling such as `Ctrl-w`, `Ctrl-n`, `Ctrl-p`, and `Escape`
- if changing Migemo logic, test with and without `narrow-book.migemoDictPath`

## Commit & Pull Request Guidelines
Recent commit subjects are short, imperative, and lowercase, for example `fix config key` and `return on escape`. Keep commit messages concise and focused on one change. For pull requests, include:

- a short summary of user-visible behavior
- linked issue or context when applicable
- screenshots or a brief screen recording for dialog or styling changes
- manual test notes covering the Inkdrop flows you verified
