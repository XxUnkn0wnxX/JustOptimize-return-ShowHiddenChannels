# ShowHiddenChannels Fork-Specific Behavior

This document tracks intentional behavior in this fork that must survive future
upstream merges. It is not a list of every textual difference from upstream.
Ordinary upstream changes should be accepted unless they overlap one of the
contracts below.

The latest reviewed upstream boundary is
[`affc379d`](https://github.com/JustOptimize/ShowHiddenChannels/commit/affc379d8d9490c32842d40a970c0a52937d7cbc)
on 2026-09-03, using
[`460103d2`](https://github.com/JustOptimize/ShowHiddenChannels/commit/460103d29ea849db77e99df8ab16cd91b7c977bf)
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
| Topic rendering | Treats Discord's topic renderer as optional. | Missing topic rendering must not make plugin startup fatal. | Keep both the optional module lookup and optional renderer call. |
| Message loading | Stops message fetching for a channel classified as hidden. | Does not patch `MessageActions.fetchMessages`; Discord retains normal message and state refreshes for every channel. | Never restore fetch suppression as part of a routine upstream merge. |
| Locked voice and stage channels | Uses the ordinary hidden-channel route and presentation. | Visible guild voice and stage rows that the user cannot connect to retain Discord's native locked/limited presentation and open SHC's information route. The lockscreen distinguishes locked from hidden channels. | Preserve the fork route, icon treatment, and fail-closed tree lookup. |
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

Key commits:

- [`e39b87c`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/e39b87c889aaaca6a0ca64f08cd97fc043c77acc) — native limited-icon handling.
- [`a74fa48`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/a74fa480f6fb7d288822e07024bc1b98ef966624) — locked voice/stage details navigation and lockscreen wording.
- [`b51a4ed`](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commit/b51a4ed56f08c38eea7fbbf7676eb27f2f9fa547) — normal Discord message fetching for all channels.
