# ShowHiddenChannels

ShowHiddenChannels is a plugin for [BetterDiscord](https://betterdiscord.app/) that shows hidden channel entries and the information Discord still provides about them.

The original plugin by [@rauenzi](https://github.com/rauenzi/) was discontinued and removed from the official BetterDiscordAddons repository, so this plugin was created to fill that void.

If you are searching for the [Replugged](https://replugged.dev/) version of this plugin, there is one made by ["Nanakusa"](https://github.com/YofukashiNo) you can find it [here](https://github.com/YofukashiNo/ShowHiddenChannels).

## Channel names show up as "No Access"

Discord redacts information about channels your account cannot view. The channel list can still show a "No Access" entry with its channel type and position. The information screen can show a creation date from the channel ID, optional fields such as slowmode and spoiler status when present, and guild-wide administrator roles according to your settings. The real name, topic, messages, and channel-specific permissions are unavailable on redacted records.

![image](https://github.com/user-attachments/assets/fbe4a5df-e8dc-4afd-a43a-510ba6831632)

The previous experiment workaround is obsolete. For visible voice and stage channels you cannot join, the information screen can show channel-specific join permissions when the channel data is available. [Upstream discussion #279](https://github.com/JustOptimize/ShowHiddenChannels/issues/279)

## How to Install

-   Go to the [releases page](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/releases/tag/Nightly-Fork) of this repository.
-   Download the latest version of the plugin by clicking on the `ShowHiddenChannels.plugin.js` file.
-   Move the downloaded `ShowHiddenChannels.plugin.js` file into your BetterDiscord plugins folder.
-   Enable the ShowHiddenChannels plugin.
-   Restart Discord to complete the installation.
-   Enjoy the plugin!

For channels with permission data available, you can also inspect permissions with [PermissionsViewer by rauenzi](https://github.com/rauenzi/BetterDiscordAddons/tree/master/Plugins/PermissionsViewer).

## Building

Install pnpm directly with npm, then install dependencies and build the plugin:

```sh
npm install --global pnpm@12.8.1
pnpm install
pnpm exec webpack --progress --color
```

A local build resolves the GitHub repository from the checkout's `origin`. To override it, pass `--env updateRepo=owner/repo`. GitHub Actions supplies its workflow repository automatically; the original [JustOptimize/ShowHiddenChannels](https://github.com/JustOptimize/ShowHiddenChannels) repository remains the fallback. The resolved repository is used for the generated `@source`, `@updateUrl`, and stable self-update endpoint. Fork builds publish to the rolling `Nightly-Fork` release; prereleases are not used.

The `develop` branch is source-only and does not track the generated root plugin. The release-ready `ShowHiddenChannels.plugin.js` is built and tracked on `main`.

Fork maintenance notes are recorded in [docs/fork-specific-changes.md](docs/fork-specific-changes.md).

## Preview

![image](https://user-images.githubusercontent.com/54294419/225766894-48d40546-ed7a-4794-888f-f0aafba26100.png)

## Changelog

You can see all the changes made to the plugin in the [commit history](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commits/main) of this repository.
