# Contributing

## Project structure

The root **`ShowHiddenChannels.plugin.js`** is the generated complete plugin tracked
only on `main`; `develop` is source-only. Do not edit the generated file directly.

The actual plugin source lives in **`src/`**. The build writes the distributable
to **`dist/`**, which is ignored. A normal local webpack build also copies the
generated plugin into BetterDiscord's live plugin folder, so run it only when
you intend to live-test that copy.

```bash
pnpm exec webpack --progress --color
```

## Testing startup regressions

Run the offline regression checks with:

```bash
pnpm run test:unit
```

These checks execute the plugin's module loader and startup source with mocked
BetterDiscord modules and timers. They verify the optional upstream bug fixes
recorded in `docs/fork-specific-changes.md`; they do not access a live Discord
client or establish current-client module discovery or rendering compatibility.

## Testing Discord module discovery

Use Node.js 22 or newer. This test requires an existing Discord
**Stable** client with BetterDiscord loaded and a local debugger port. Fully
quit Discord, then launch it with debugging enabled (Linux example):

```bash
discord --remote-debugging-address=127.0.0.1 --remote-debugging-port=9222
```

Once Discord has loaded, run:

```bash
pnpm run test:discord
```

This runs `src/utils/modules.js` inside Discord's actual renderer using its loaded
Webpack modules and the real `BdApi`. Discord must be logged in. The probe waits
up to 10 seconds for BetterDiscord, the logged-in user store, and module discovery;
it retries discovery while lazy chunks load, without relying on Discord's private
performance markers.

The test checks every returned variable plus an explicit contract for the methods,
React components, CSS classes, constants, and nested exports used by the plugin.
Empty groups and missing or incorrectly typed methods fail. Keep the contract in
`tests/discord-probe.js` aligned with new usages in `src/`. It also exercises the
real channel-record factory used for synthetic categories, checking its fields and
writable position without inserting the record into Discord's stores. Results
include Discord's desktop version, web build/hash, and BetterDiscord's version,
including when discovery fails.

This verifies module contracts and channel-record creation. It does not verify
patch installation, hidden-channel rendering, or locked voice/stage behavior;
those still need a live plugin behavior check.

The runner compiles a probe from the current source and evaluates it through the
local debugger connection. It does not install a plugin or apply patches. There
are no mocked Discord modules or bundled Discord fixtures. Discord Stable and
BetterDiscord must already be running; missing prerequisites fail the test rather
than silently skipping it. Set `DISCORD_DEBUG_PORT` to use another port.

## Bumping the version

1. Edit **`src/config.json`**:
   - Increment `"version"`.
   - Add a new entry at the **top** of the `"changelog"` array.
   - Preserve the existing fork changelog history. See
     **`docs/fork-specific-changes.md`** for the source, version, and release
     metadata contract.

Example structure:

```json
"changelog": [
  { "title": "v1.2.0 - New stuff", "type": "added",   "items": ["Added X."] },
  { "title": "v1.1.0 - Fixes",     "type": "fixed",   "items": ["Fixed Y."] },
  { "title": "v1.0.0 - Release",   "type": "added",   "items": ["Initial release."] }
]
```

Valid values for `type`: `"fixed"`, `"added"`, `"progress"`, `"changed"`.
