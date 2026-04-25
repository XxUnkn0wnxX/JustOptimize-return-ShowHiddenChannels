# Contributing

## Project structure

**`ShowHiddenChannels.plugin.js`** (root) is **not** the real plugin, it is only an auto-updater stub that BetterDiscord loads to keep the plugin up to date. Do not edit it directly.

The actual plugin source lives in **`src/`**. After making changes, run the build to produce the distributable:

```bash
bun run build
```

## Bumping the version

1. Edit **`src/config.json`**:
   - Increment `"version"`.
   - Add a new entry at the **top** of the `"changelog"` array.
   - Remove the **oldest** (last) entry so the array always contains exactly **3** entries.

Example structure:

```json
"changelog": [
  { "title": "v1.2.0 - New stuff",  "items": ["Added X."] },
  { "title": "v1.1.0 - Fixes",      "items": ["Fixed Y."] },
  { "title": "v1.0.0 - Release",    "items": ["Initial release."] }
]
```
