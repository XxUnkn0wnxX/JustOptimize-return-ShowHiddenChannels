# ShowHiddenChannels Fork-Specific Behavior

This document tracks intentional behavior in this fork that must survive future
upstream merges. It is not a list of every textual difference from upstream.
Ordinary upstream changes should be accepted unless they overlap one of the
contracts below.

The latest reviewed upstream boundary is
[`0426b6bc`](https://github.com/JustOptimize/ShowHiddenChannels/commit/0426b6bc815491d1d1b0bd3475563ee3b32cea58)
on 2026-10-03, using
[`affc379d`](https://github.com/JustOptimize/ShowHiddenChannels/commit/affc379d8d9490c32842d40a970c0a52937d7cbc)
as the shared range base. Commit labels are abbreviated for readability; links
target full SHAs.

## Merge policy

- Prefer upstream behavior and ancestry by default.
- A local textual difference is not automatically protected.
- Review every upstream hunk that overlaps a protected contract below.
- Port small compatible upstream fixes around fork behavior where possible.
- Preserve current fork behavior when compatibility is unclear and ask before
  changing a user-visible contract.
- Update this document only after every hunk in the new upstream range is
  accepted, adapted, or intentionally retained and the result passes its
  verification gate.

## Upstream versus this fork

| Area | Upstream behavior | Fork contract | Merge rule |
| --- | --- | --- | --- |
| Channel discovery | Uses Discord's `createChannelRecord` factory and a local `VIEW_CHANNEL` permission predicate. | Uses the same current Discord model through BetterDiscord's `BdApi.Webpack`, with guarded lookup and synthetic category permission overwrites. | Treat the model fix as upstream-owned. Keep the direct BetterDiscord lookup and its stronger function guard unless upstream provides a better equivalent. |
| Hidden-channel predicate | Rejects non-channel values, direct messages, and Discord's `browse`, `customize`, and `guide` pseudo-channels. | Uses the same exclusions in the fork's `isHiddenChannel` helper, which is also used by locked-voice and experiment-related paths. | Port future predicate hardening without renaming the fork helper or bypassing its callers. |
| Native channel view and topics | Keeps Discord's native header while replacing hidden-channel content and sidebars; removes the separate topic-renderer lookup. | Uses the native header for hidden and visible locked voice/stage channels. Preserves the header when replacing the call view, installs hooks only after checking the captured view, and restores instance toolbar patches on stop. If capture fails, the route information screen displays available non-forum/media topics as plain text. Topic discovery cannot block startup. | Prefer native rendering. Preserve locked-channel handling, hook cleanup, and the route fallback; do not restore a separate topic lookup without a demonstrated need. |
| Dispatcher storage | Reads store handlers from the legacy dependency graph. | Resolves handlers by dispatch token from the store's own dispatcher, supporting the current `_nodes` Map and the legacy graph. The isolated experiment hotfix uses the same compatible node enumeration. Missing required handlers still fail module validation. | Preserve both dispatcher layouts and the existing failure gate until a reviewed upstream replacement covers them. |
| Message loading | Stops message fetching for a channel classified as hidden. | Does not patch `MessageActions.fetchMessages`; Discord retains normal message and state refreshes for every channel. | Never restore fetch suppression as part of a routine upstream merge. |
| Locked voice and stage channels | Uses the native header and information screen for hidden channels. | Hidden and visible non-connectable guild voice/stage rows replace Discord's generic padlock with the native channel-type icon and small lock badge. Other native icon states and locked tooltips remain intact; optional icon discovery failure retains Discord's original icon. Visible non-connectable rows open SHC's information screen. Native rendering and the route fallback distinguish locked from hidden channels and leave the current connected channel alone. | Preserve the fork navigation, distinct badged icons, information predicate, and fail-closed tree lookup. |
| Private-channel-hiding experiment | Documents a manual `Not Eligible` override for Discord's `2026-02-private-channel-hiding` experiment. | Applies an isolated `Not Eligible` override at startup, verifies the resulting bucket, warns once on failure, and documents manual steps only as a fallback. | Keep the hotfix isolated; do not turn it into a general experiment framework. Remove it only after a reviewed replacement exists. |
| Build metadata and self-updates | Uses upstream repository metadata and the latest stable upstream release. | Resolves the repository from explicit `--env updateRepo`, `SHC_GITHUB_REPOSITORY`, Actions' `GITHUB_REPOSITORY`, or the checkout's GitHub `origin`, then falls back to upstream. The resolved repository stamps `@source`, `@updateUrl`, and the runtime route. Fork builds consume only the stable rolling `Nightly-Fork` release; prereleases are unsupported. | Preserve repository-derived metadata and the stable-only updater policy. Never hardcode this fork into generated runtime logic. |
| Publication | Uses upstream's release process. | Keeps `develop` source-only with no tracked root plugin, while `main` tracks the Actions-generated `ShowHiddenChannels.plugin.js`. Builds only for pushes or manual dispatches on `main`, commits only that generated file, and passes its exact bytes and commit SHA to publication. Publishing deletes and recreates `Nightly-Fork`, attaches exactly one explicit plugin asset, and relies on GitHub for source archives. | Keep the branch-specific artifact boundary and the split build/publish chain with its ancestry, metadata, freshness, and byte-identity gates. |
| Attribution | Credits the upstream author and repository. | Keeps the original author ID while adding `XxUnkn0wnxX (AI)` to fork-facing author metadata. Generated source and update links remain repository-derived. | Preserve both upstream credit and fork attribution. |

## Reviewed integration: upstream v6.11

The `460103d2..affc379d` range was handled as follows:

- Accepted: upstream ownership of the `createChannelRecord` compatibility fix,
  optional topic rendering, the hardened pseudo-channel exclusions, the v6.11
  version boundary, and the new private-channel-hiding README explanation.
- Adapted: retained the direct `BdApi.Webpack` lookup, stronger function check,
  fork `isHiddenChannel` name, automatic experiment hotfix, fork release links,
  and fork build instructions while taking the compatible upstream behavior.
- Intentionally retained from the fork: normal message fetching, locked
  voice/stage navigation and presentation, experiment verification and cache
  guidance, fork metadata, stable-only self-updates, and rolling publication.
- Not imported: upstream's `MessageActions.fetchMessages` interception,
  upstream-only author/source metadata, and README wording that described the
  experiment override as manual-only.

Upstream commits
[`d2c672b`](https://github.com/JustOptimize/ShowHiddenChannels/commit/d2c672b504e03905260ad0d63a1e1083b1322773)
and
[`82ca9d4`](https://github.com/JustOptimize/ShowHiddenChannels/commit/82ca9d417fc3804ccdb2d452b59e542e5030c739)
now own the core Discord channel-record compatibility behavior. The fork's
earlier implementation in
[`ec6e330`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/ec6e33081be21b683be4632b397f2930ab6bdecf)
is historical context, not a protected divergence.

## Reviewed integration: upstream v6.12

The `affc379d..0426b6bc` range contains
[`d48412f`](https://github.com/JustOptimize/ShowHiddenChannels/commit/d48412f8196da230491c46c3d3c4da93a6deedb1)
and its merge commit, with identical resulting upstream trees.

- Accepted: native channel headers, removal of `ChannelUtils` and its old topic
  styles, forum/media labels, optional spoiler metadata, refreshed theme
  variables, flex centering, and the v6.12 version boundary.
- Adapted: use the fork's `isHiddenChannel` predicate and visible locked
  voice/stage handling; preserve the header when Discord delegates it to the
  replaced call view; suppress other content slots and side panels only for
  channels showing SHC information. Toolbar wrapping uses owned patches with
  cleanup, and failed hook installation rolls back before using the route
  fallback. That fallback renders topics as plain text without another Webpack
  lookup.
- Retained: the current/legacy dispatcher fix, normal message fetching,
  experiment override, guarded native locked-row navigation, fork attribution,
  repository-derived update metadata, stable rolling publication, and existing
  fork changelog history. Upstream's changelog pruning was not imported.
- Client-test follow-up: restore the user's preferred distinct voice/stage
  symbols with native lock badges, without changing permissions, row navigation,
  or locked tooltips. Preserve other native icon states. The native voice/stage
  header retains Discord's call-mode styling. Settings controls now update their
  mounted React state as well as the persisted values.
- Verification: matched the native view hooks to the current cached Discord
  source, exercised its render methods and the adapted hooks with mocked
  dependencies, checked stop/restart and failed-capture behavior, and rechecked
  current/legacy dispatcher discovery. Follow-up checks exercised the current
  native icon selector, row renderer, tooltip, and badge components with mocked
  dependencies; the badge paths match a client HTML capture exactly. A settings
  regression check reproduces the stale selection before the fix and verifies
  updates with the original mounted props afterward. The standalone-pnpm build
  and fresh live startup logs also passed. Initial client checks confirmed hidden text
  and voice information screens and their headers render. The follow-up icon
  and settings changes require a further client smoke test.

## Source and commit map

### Fork-aware builds and self-updates

Primary files:

- `webpack.config.js`
- `src/index.js`
- `src/globals.d.ts`
- `src/config.json`

Key commit:

- [`2f20582`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/2f20582b964c8045256bf8dc70b9cd0e74a2ba65) — repository-derived build metadata, stable updater policy, and split release flow.

The updater removes the legacy `usePreRelease` setting on load. Downloads are
accepted only when the release asset is `ShowHiddenChannels.plugin.js` and the
downloaded header identifies ShowHiddenChannels with the expected dotted
numeric version.

Local development and Actions use standalone pnpm installed with npm, pinned
by `package.json`. Invoke `pnpm install` and `pnpm exec webpack` directly;
Corepack is not part of this fork's build workflow.

### Rolling release workflow

Primary files:

- `.github/workflows/build-plugin.yml`
- `.github/workflows/publish-nightly.yml`

Key commits:

- [`54f702e`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/54f702eb256a4c942ebacab26441486007ecdc48) — recreate the rolling release on every publication.
- [`fa76c0a`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/fa76c0ade41be1579e8f5ff0a13371ff5dc23c59) — simplify Nightly-Fork publication.
- [`aaaacad`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/aaaacad776d10ccae84a925e467ab8dabdf6ce92) — harden stable release validation.

#### Release metadata extraction contract

The `nightly-release-input` artifact contains exactly the compiled
`ShowHiddenChannels.plugin.js` and `release-sha.txt`. The publisher parses only
the plugin's dotted numeric `@version` from its generated header, checks out the
exact release SHA, then reads `version` and the first changelog entry from
`src/config.json`. It requires the plugin and source versions to match. Release
notes consist of the full commit comparison followed by that changelog title
and its items; changelog text is not scraped back out of the compiled plugin.

Changes to the plugin header, config version/changelog schema, artifact names or
layout, or release-note structure must update the matching workflow parser and
gate in the same reviewed change. Before publication, tell the user exactly
what changed and whether the fix belongs in the header `awk`, config/release
note `jq`, or artifact validation. Verify the repair with a manual `Build
Plugin` dispatch and its automatic publisher, then inspect the final release
tag, target, title, body, single asset, and downloaded plugin bytes.

`develop` and `main` intentionally cannot share the same tree or tip commit:
the root plugin is absent from `develop` and present on `main`. Promotion must
record real merge ancestry while retaining the generated plugin on `main`.
After Actions commits a fresh build, fast-forward local `main` from
`origin/main`, then record that ancestry in `develop` with a source-only merge
that keeps the root plugin absent. This leaves `develop` zero commits behind
while normally one merge-marker commit ahead. Verify source and documentation
parity by excluding only `ShowHiddenChannels.plugin.js`; never force the
branches to identical SHAs.

### Private-channel-hiding hotfix

Primary file: `src/index.js`.

Key commits:

- [`570f35e`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/570f35ed0b0b1d22ba0006e4d6304af2ca75134d) — isolated experiment override.
- [`757b3d1`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/757b3d1bd4c3686402bc1026307c3a7f7f8e1977) — cached `No Access` recovery guidance.

### Locked voice behavior and normal message loading

Primary files:

- `src/index.js`
- `src/components/Lockscreen.jsx`
- `src/utils/modules.js`

The optional icon patch in `src/utils/channelIcons.js` replaces only the generic
locked glyph for hidden or non-connectable guild voice/stage channels. It uses
Discord's existing badge components and restores the original selector on stop.
This restores the earlier custom voice-icon preference and extends it to stage
channels; it supersedes the generic-padlock choice in `a74fa48` below.

Key commits:

- [`e39b87c`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/e39b87c889aaaca6a0ca64f08cd97fc043c77acc) — native limited-icon handling.
- [`a74fa48`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/a74fa480f6fb7d288822e07024bc1b98ef966624) — locked voice/stage details navigation and lockscreen wording.
- [`b51a4ed`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/b51a4ed56f08c38eea7fbbf7676eb27f2f9fa547) — normal Discord message fetching for all channels.
