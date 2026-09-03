# ShowHiddenChannels

ShowHiddenChannels is a plugin for [BetterDiscord](https://betterdiscord.app/) that allows users to view information about hidden channels in a Discord server, such as their name, description and which roles or users have access to these hidden channels.
**Please note that this plugin will not allow you to read the messages in these channels, it will only show you information about them.**

The original plugin by [@rauenzi](https://github.com/rauenzi/) was discontinued and removed from the official BetterDiscordAddons repository, so this plugin was created to fill that void.

If you are searching for the [Replugged](https://replugged.dev/) version of this plugin, there is one made by ["Nanakusa"](https://github.com/YofukashiNo) you can find it [here](https://github.com/YofukashiNo/ShowHiddenChannels).

## Warning, this plugin might soon stop working

Discord is working on an experimental feature that should hide private channels on the server side making it impossible for plugins like this to work, so it is possible that this plugin will soon be useless.

![image](https://github.com/user-attachments/assets/fbe4a5df-e8dc-4afd-a43a-510ba6831632)

## How to Install

-   Go to the [releases page](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/releases/tag/Nightly-Fork) of this repository.
-   Download the latest version of the plugin by clicking on the `ShowHiddenChannels.plugin.js` file.
-   Move the downloaded `ShowHiddenChannels.plugin.js` file into your BetterDiscord plugins folder.
-   Enable the ShowHiddenChannels plugin.
-   Restart Discord to complete the installation.
-   Enjoy the plugin!

In addition, you can also use the [PermissionsViewer](https://github.com/rauenzi/BetterDiscordAddons/tree/master/Plugins/PermissionsViewer) plugin by [@rauenzi](https://github.com/rauenzi/) to see the channel permissions/access.

## Building

Install dependencies and build the plugin with:

```sh
corepack pnpm install
corepack pnpm exec webpack --progress --color
```

A local build resolves the GitHub repository from the checkout's `origin`. To override it, pass `--env updateRepo=owner/repo`. GitHub Actions supplies its workflow repository automatically; the original [JustOptimize/ShowHiddenChannels](https://github.com/JustOptimize/ShowHiddenChannels) repository remains the fallback. The resolved repository is used for the generated `@source`, `@updateUrl`, and stable self-update endpoint. Fork builds publish to the rolling `Nightly-Fork` release; prereleases are not used.

## Preview

![image](https://user-images.githubusercontent.com/54294419/225766894-48d40546-ed7a-4794-888f-f0aafba26100.png)

## Changelog

You can see all the changes made to the plugin in the [commit history](https://github.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/commits/main) of this repository.
