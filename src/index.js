// @ts-check
/** @typedef {import('./discord').SHCChannel} SHCChannel */
import styles from "./styles.css";

const config = {
	info: {
		name: "ShowHiddenChannels",
		authors: [
			{
				name: "JustOptimize (Oggetto)",
			},
		],
		description:
			"A plugin which displays all hidden Channels and allows users to view information about them, this won't allow you to read them (impossible).",
		version: __VERSION__,
		github: "https://github.com/JustOptimize/ShowHiddenChannels",
	},

	changelog: __CHANGELOG__,

	main: "ShowHiddenChannels.plugin.js",
	github_short: "JustOptimize/ShowHiddenChannels",
};

export default (() => {
	// biome-ignore lint/security/noGlobalEval: This is a necessary evil
	const RuntimeRequire = eval("require");

	const defaultSettings = {
		hiddenChannelIcon: "lock",
		sort: "native",
		showPerms: true,
		showAdmin: "channel",
		MarkUnread: false,

		checkForUpdates: true,
		usePreRelease: false,

		shouldShowEmptyCategory: false,
		debugMode: false,

		channels: {
			GUILD_TEXT: true,
			GUILD_VOICE: true,
			GUILD_ANNOUNCEMENT: true,
			GUILD_STORE: true,
			GUILD_STAGE_VOICE: true,
			GUILD_FORUM: true,
		},

		blacklistedGuilds: {},
	};

	return class ShowHiddenChannels {
		constructor(meta) {
			this.meta = meta;
			this.api = new BdApi(meta.name);

			this.hiddenChannelCache = {};
			this.channelListObserver = null;
			this.pendingDecorationFrame = 0;
			this.hasRendererHiddenIconPatch = false;
			this.hiddenIconRetryInterval = null;

			this.collapsed = {};
			this.processContextMenu = this?.processContextMenu?.bind(this);
			this.settings = Object.assign(
				{},
				defaultSettings,
				this.api.Data.load("settings"),
			);
		}

		async checkForUpdates() {
			const { Logger } = require("./utils/modules").getModules();

			Logger.debug(
				`Checking for updates, current version: ${config.info.version}`,
			);

			const releases_raw = await fetch(
				`https://api.github.com/repos/${config.github_short}/releases`,
			);
			if (!releases_raw?.ok) {
				return this.api.UI.showToast(
					"(ShowHiddenChannels) Failed to check for updates.",
					{
						type: "error",
					},
				);
			}

			let releases = await releases_raw.json();
			if (!releases?.length) {
				return this.api.UI.showToast(
					"(ShowHiddenChannels) Failed to check for updates.",
					{
						type: "error",
					},
				);
			}

			// Remove releases that do not have in the assets a file named ShowHiddenChannels.plugin.js
			releases = releases.filter((m) =>
				m.assets.some((n) => n.name === config.main),
			);

			const latestRelease = this.settings.usePreRelease
				? releases[0]?.tag_name?.replace("v", "")
				: releases.find((m) => !m.prerelease)?.tag_name?.replace("v", "");

			Logger.debug(
				`Latest version: ${latestRelease}, pre-release: ${!!this.settings.usePreRelease}`,
			);

			if (!latestRelease) {
				this.api.UI.alert(
					config.info.name,
					"Failed to check for updates, version not found.",
				);

				return Logger.err("Failed to check for updates, version not found.");
			}

			const semverGt = (a, b) => {
				const parse = (v) => {
					const [base, pre] = v.split("-pre");
					return {
						parts: base.split(".").map(Number),
						pre: pre !== undefined ? Number(pre) : null,
					};
				};
				const av = parse(a);
				const bv = parse(b);
				for (let i = 0; i < Math.max(av.parts.length, bv.parts.length); i++) {
					const diff = (av.parts[i] ?? 0) - (bv.parts[i] ?? 0);
					if (diff !== 0) return diff > 0;
				}
				// base versions equal — no pre > pre, higher pre number wins
				if (av.pre === null && bv.pre !== null) return true;
				if (av.pre !== null && bv.pre === null) return false;
				if (av.pre !== null && bv.pre !== null) return av.pre > bv.pre;
				return false;
			};

			if (!semverGt(latestRelease, config.info.version)) {
				return Logger.info("No updates found.");
			}

			this.api.UI.showConfirmationModal(
				"Update available",
				`ShowHiddenChannels has an update available. Would you like to update to version ${latestRelease}?`,
				{
					confirmText: "Update",
					cancelText: "Cancel",
					danger: false,

					onConfirm: async () => {
						const SHCContent = await this.api.Net.fetch(
							`https://github.com/JustOptimize/ShowHiddenChannels/releases/download/v${latestRelease}/${config.main}`,
						)
							.then((res) => res.text())
							.catch(() => {
								this.api.UI.showToast("Failed to fetch the latest version.", {
									type: "error",
								});
							});

						this.proceedWithUpdate(SHCContent, latestRelease);
					},

					onCancel: () => {
						this.api.UI.showToast("Update cancelled.", {
							type: "info",
						});
					},
				},
			);
		}

		shouldDecorateHiddenChannel(channel) {
			const { DiscordConstants } = require("./utils/modules").getModules();
			return (
				channel?.isHidden?.() &&
				channel.type !== DiscordConstants.ChannelTypes.GUILD_CATEGORY
			);
		}

		async proceedWithUpdate(SHCContent, version) {
			const { Logger } = require("./utils/modules").getModules();

			Logger.debug(
				`Update confirmed by the user, updating to version ${version}`,
			);

			function failed() {
				this.api.UI.showToast("(ShowHiddenChannels) Failed to update.", {
					type: "error",
				});
			}

			if (!SHCContent) return failed();

			if (!SHCContent.match(/(?<=version: ").*(?=")/)) {
				return failed();
			}

			try {
				const fs = RuntimeRequire("fs");
				const path = RuntimeRequire("path");

				await fs.writeFile(
					path.join(this.api.Plugins.folder, config.main),
					SHCContent,
					(err) => {
						if (err) return failed();
					},
				);

				this.api.UI.showToast(
					`ShowHiddenChannels updated to version ${version}`,
					{
						type: "success",
					},
				);
			} catch (_err) {
				return failed();
			}
		}

		async start() {
			console.log(
				`%c[${config.info.name}] Starting plugin...`,
				"color: #2f3781; font-weight: bold;",
			);

			// Keep the upstream idle delay, but let optional module drift fail soft elsewhere.
			await new Promise((resolve) => setTimeout(resolve, 1000));

			console.log(
				`%c[${config.info.name}] Checking for updates...`,
				"color: #2f3781; font-weight: bold;",
			);

			const { Logger, ChannelPermissionStore } =
				require("./utils/modules").getModules();

			Logger.isDebugging = this.settings.debugMode;

			this.can =
				ChannelPermissionStore?.can?.__originalFunction ??
				ChannelPermissionStore?.can;

			if (this.settings.checkForUpdates) {
				this.checkForUpdates();
			}

			const { loaded_successfully } = require("./utils/modules");

			if (loaded_successfully) {
				this.doStart();
			} else {
				this.api.UI.showConfirmationModal(
					"(SHC) Broken Modules",
					"ShowHiddenChannels has detected that some modules are broken, would you like to start anyway? (This might break the plugin or Discord itself)",
					{
						confirmText: "Start anyway",
						cancelText: "Cancel",
						danger: true,

						onConfirm: () => {
							this.doStart();
						},

						onCancel: () => {
							this.api.Plugins.disable("ShowHiddenChannels");
						},
					},
				);
			}
		}

		doStart() {
			const { DOMTools } = require("./utils/modules").getModules();

			const savedVersion = this.api.Data.load("version");
			if (savedVersion !== this.meta.version) {
				this.api.UI.showChangelogModal({
					title: this.meta.name,
					subtitle: `v${this.meta.version}`,
					changes: config.changelog,
				});
				this.api.Data.save("version", config.info.version);
			}

			DOMTools.addStyle(config.info.name, styles);
			this.Patch();
			this.rerenderChannels();
		}

		Patch() {
			const { Lockscreen } = require("./components/Lockscreen");
			const { HiddenChannelIcon } = require("./components/HiddenChannelIcon");
			const Patcher = this.api.Patcher;

			const {
				/* Library */
				Utilities,
				// DOMTools,
				// Logger,
				// ReactTools,

				/* Discord Modules (From lib) */
				ChannelStore,
				MessageActions,
				React,
				GuildChannelStore,
				NavigationUtils,

				/* BdApi */
				ContextMenu,

				/* Manually found modules */
				DiscordConstants,
				chat,
				Route,
				ChannelItemRenderer,
				ChannelItemUtils,
				ChannelPermissionStore,
				// PermissionStoreActionHandler,
				// ChannelListStoreActionHandler,
				// container,
				ChannelRecordBase,
				ChannelListStore,
				iconItem,
				actionIcon,
				ReadStateStore,
				Voice,
				CategoryStore,
			} = require("./utils/modules").getModules();

			// Check for needed modules
			if (
				!ChannelRecordBase ||
				!DiscordConstants ||
				!ChannelStore ||
				!ChannelPermissionStore?.can ||
				!ChannelListStore?.getGuild ||
				!DiscordConstants?.ChannelTypes
			) {
				return this.api.UI.showToast(
					"(SHC) Some crucial modules are missing, aborting. (Wait for an update)",
					{
						type: "error",
					},
				);
			}

			Patcher.instead(
				ChannelRecordBase.prototype,
				"isHidden",
				(unknownChannel) => {
					const channel = /** @type {SHCChannel} */ (unknownChannel);
					return (
						![1, 3].includes(channel.type) &&
						!this.can(DiscordConstants.Permissions.VIEW_CHANNEL, channel)
					);
				},
			);

			if (!ReadStateStore) {
				this.api.UI.showToast(
					"(SHC) ReadStateStore module is missing, channels will be marked as unread.",
					{
						type: "warning",
					},
				);
			} else {
				Patcher.after(
					ReadStateStore,
					"getGuildChannelUnreadState",
					(_, args, res) => {
						if (this.settings.MarkUnread) return res;

						const [channel] = /** @type {[SHCChannel]} */ (args);
						return channel?.isHidden()
							? {
									mentionCount: 0,
									unread: false,
								}
							: res;
					},
				);

				Patcher.after(ReadStateStore, "getMentionCount", (_, args, res) => {
					if (this.settings.MarkUnread) return res;

					return ChannelStore.getChannel(args[0])?.isHidden() ? 0 : res;
				});

				Patcher.after(ReadStateStore, "getUnreadCount", (_, args, res) => {
					if (this.settings.MarkUnread) return res;

					return ChannelStore.getChannel(args[0])?.isHidden() ? 0 : res;
				});

				Patcher.after(ReadStateStore, "hasTrackedUnread", (_, args, res) => {
					if (this.settings.MarkUnread) return res;

					return res && !ChannelStore.getChannel(args[0])?.isHidden();
				});

				Patcher.after(ReadStateStore, "hasUnread", (_, args, res) => {
					if (this.settings.MarkUnread) return res;

					return res && !ChannelStore.getChannel(args[0])?.isHidden();
				});

				Patcher.after(ReadStateStore, "hasUnreadPins", (_, args, res) => {
					if (this.settings.MarkUnread) return res;

					return res && !ChannelStore.getChannel(args[0])?.isHidden();
				});
			}

			//* Make hidden channel visible
			Patcher.after(ChannelPermissionStore, "can", (_, args, res) => {
				const [permission, channel] = /** @type {[bigint, SHCChannel]} */ (
					args
				);
				if (!channel?.isHidden?.()) return res;

				if (permission === DiscordConstants.Permissions.VIEW_CHANNEL) {
					return (
						!this.settings.blacklistedGuilds[channel.guild_id] &&
						this.settings.channels[DiscordConstants.ChannelTypes[channel.type]]
					);
				}

				if (permission === DiscordConstants.Permissions.CONNECT) {
					return false;
				}

				return res;
			});

			if (!Voice || !Route) {
				this.api.UI.showToast(
					"(SHC) Voice or Route modules are missing, channel lockscreen won't work.",
					{
						type: "warning",
					},
				);
			} else {
				Patcher.after(Route, "A", (_, _args, res) => {
					const channelId = res.props?.computedMatch?.params?.channelId;
					const guildId = res.props?.computedMatch?.params?.guildId;
					const channel = ChannelStore?.getChannel(channelId);

					if (
						guildId &&
						channel?.isHidden?.() &&
						channel?.id !== Voice.getChannelId()
					) {
						res.props.render = () =>
							React.createElement(Lockscreen, {
								chat,
								channel,
								settings: this.settings,
							});
					}

					return res;
				});
			}

			//* Stop fetching messages if the channel is hidden
			if (!MessageActions?.fetchMessages) {
				this.api.UI.showToast(
					"(SHC) MessageActions module is missing, this mean that the plugin could be detected by Discord.",
					{
						type: "warning",
					},
				);
			} else {
				Patcher.instead(
					MessageActions,
					"fetchMessages",
					(instance, args, res) => {
						const [fetchConfig] = /** @type {[{channelId: string}]} */ (args);
						if (ChannelStore.getChannel(fetchConfig.channelId)?.isHidden?.()) {
							return;
						}

						return res.call(instance, fetchConfig);
					},
				);
			}

			if (this.settings.hiddenChannelIcon) {
				if (!ChannelItemRenderer || !iconItem || !actionIcon) {
					// Keep icons visible immediately, then upgrade back to Discord's real renderer path once those modules load.
					this.startChannelItemDomFallback();
					this.startHiddenIconRetry();
				} else {
					this.patchHiddenChannelRenderer({
						Patcher,
						Utilities,
						React,
						HiddenChannelIcon,
						NavigationUtils,
						DiscordConstants,
						ChannelItemRenderer,
						iconItem,
						actionIcon,
					});
				}
			}

			//* Remove lock icon from hidden voice channels
			if (!ChannelItemUtils?.icon) {
				this.api.UI.showToast(
					"(SHC) ChannelItemUtils is missing, voice channel lock icon won't be removed.",
					{
						type: "warning",
					},
				);
			} else {
				Patcher.before(ChannelItemUtils, "icon", (_, args) => {
					const [channel, , opts] =
						/** @type {[SHCChannel, any, {locked: boolean}]} */ (args);
					if (!opts) return;

					if (channel?.isHidden?.() && opts.locked) {
						opts.locked = false;
					}
				});
			}

			//* Manually collapse hidden channel category
			if (!ChannelStore?.getChannel || !GuildChannelStore?.getChannels) {
				this.api.UI.showToast(
					"(SHC) ChannelStore or GuildChannelStore are missing, extra category settings won't work.",
					{
						type: "warning",
					},
				);
			}

			Patcher.after(ChannelStore, "getChannel", (_, args, res) => {
				const [channelId] = /** @type {[string]} */ (args);
				const guild_id = channelId?.replace("_hidden", "");
				const isHiddenCategory = channelId?.endsWith("_hidden");

				if (
					this.settings.sort !== "extra" ||
					!isHiddenCategory ||
					this.settings.blacklistedGuilds[guild_id]
				) {
					return res;
				}

				const HiddenCategoryChannel = new ChannelRecordBase({
					guild_id: guild_id,
					id: channelId,
					name: "Hidden Channels",
					type: DiscordConstants.ChannelTypes.GUILD_CATEGORY,
				});

				return HiddenCategoryChannel;
			});

			Patcher.after(
				ChannelStore,
				"getMutableGuildChannelsForGuild",
				(_, args, GuildChannels) => {
					const [guildId] = /** @type {[string]} */ (args);
					if (!GuildChannelStore?.getChannels) return;

					if (
						this.settings.sort !== "extra" ||
						this.settings.blacklistedGuilds[guildId]
					) {
						return;
					}

					const hiddenCategoryId = `${guildId}_hidden`;
					const HiddenCategoryChannel = new ChannelRecordBase({
						guild_id: guildId,
						id: hiddenCategoryId,
						name: "Hidden Channels",
						type: DiscordConstants.ChannelTypes.GUILD_CATEGORY,
					});

					const GuildCategories =
						GuildChannelStore.getChannels(guildId)[
							DiscordConstants.ChannelTypes.GUILD_CATEGORY
						];
					Object.defineProperty(HiddenCategoryChannel, "position", {
						value:
							(
								GuildCategories[GuildCategories.length - 1] || {
									comparator: 0,
								}
							).comparator + 1,
						writable: true,
					});

					if (!GuildChannels[hiddenCategoryId]) {
						GuildChannels[hiddenCategoryId] = HiddenCategoryChannel;
					}

					return GuildChannels;
				},
			);

			Patcher.after(GuildChannelStore, "getChannels", (_, [guildId], res) => {
				const GuildCategories =
					res[DiscordConstants.ChannelTypes.GUILD_CATEGORY];
				const hiddenCategoryId = `${guildId}_hidden`;
				const hiddenCategory = GuildCategories?.find(
					(m) => m.channel.id === hiddenCategoryId,
				);

				if (!hiddenCategory) return res;

				const OtherCategories = GuildCategories.filter(
					(m) => m.channel.id !== hiddenCategoryId,
				);
				const newComparator =
					(
						OtherCategories[OtherCategories.length - 1] || {
							comparator: 0,
						}
					).comparator + 1;

				Object.defineProperty(hiddenCategory.channel, "position", {
					value: newComparator,
					writable: true,
				});

				Object.defineProperty(hiddenCategory, "comparator", {
					value: newComparator,
					writable: true,
				});

				return res;
			});

			//* Custom category or sorting order
			Patcher.after(ChannelListStore, "getGuild", (_, args, res) => {
				const [guildId] = /** @type {[string]} */ (args);
				if (this.settings.blacklistedGuilds[guildId]) {
					return;
				}

				const guildChannels = res.guildChannels;
				const specialCategories = [
					guildChannels.favoritesCategory,
					guildChannels.recentsCategory,
					guildChannels.noParentCategory,
					guildChannels.voiceChannelsCategory,
				];

				switch (this.settings.sort) {
					case "bottom": {
						for (const category of specialCategories) {
							this.sortChannels(category);
						}

						for (const category of Object.values(guildChannels.categories)) {
							this.sortChannels(category);
						}

						break;
					}

					case "extra": {
						const hiddenCategoryId = `${guildId}_hidden`;
						const HiddenCategory =
							res.guildChannels.categories[hiddenCategoryId];
						const HiddenChannels = this.getHiddenChannelRecord(
							[
								...specialCategories,
								...Object.values(res.guildChannels.categories).filter(
									(category) => category.id !== hiddenCategoryId,
								),
							],
							guildId,
						);

						HiddenCategory.channels = Object.fromEntries(
							Object.entries(HiddenChannels.records).map(([id, channel]) => {
								channel.category = HiddenCategory;
								channel.record.parent_id = hiddenCategoryId;
								return [id, channel];
							}),
						);

						HiddenCategory.isCollapsed =
							res.guildChannels.collapsedCategoryIds[hiddenCategoryId] ??
							CategoryStore.isCollapsed(hiddenCategoryId);
						if (HiddenCategory.isCollapsed) {
							res.guildChannels.collapsedCategoryIds[hiddenCategoryId] = true;
						}

						HiddenCategory.shownChannelIds =
							res.guildChannels.collapsedCategoryIds[hiddenCategoryId] ||
							HiddenCategory.isCollapsed
								? []
								: HiddenChannels.channels
										.sort((x, y) => {
											const xPos = x.position + (x.isGuildVocal() ? 1e4 : 1e5);
											const yPos = y.position + (y.isGuildVocal() ? 1e4 : 1e5);
											return xPos - yPos;
										})
										.map((m) => m.id);
						break;
					}
				}

				if (this.settings.shouldShowEmptyCategory) {
					this.patchEmptyCategoryFunction([
						...Object.values(res.guildChannels.categories).filter(
							(m) => !m.id.includes("hidden"),
						),
					]);
				}

				return res;
			});

			//* add entry in guild context menu
			if (!ContextMenu?.patch) {
				this.api.UI.showToast("(SHC) ContextMenu is missing, skipping.", {
					type: "warning",
				});
			}

			ContextMenu?.patch("guild-context", this.processContextMenu);
		}

		processContextMenu(menu, { guild }) {
			const { ContextMenu } = require("./utils/modules").getModules();

			const menuCategory = menu?.props?.children?.find((buttonCategory) => {
				const children = buttonCategory?.props?.children;
				return (
					Array.isArray(children) &&
					children.some((button) => button?.props?.id === "hide-muted-channels")
				);
			});

			if (!menuCategory || !guild) return;

			menuCategory.props.children.push(
				ContextMenu.buildItem({
					type: "toggle",
					label: "Disable SHC",
					checked: this.settings.blacklistedGuilds[guild.id],
					action: () => {
						this.settings.blacklistedGuilds[guild.id] =
							!this.settings.blacklistedGuilds[guild.id];
						this.saveSettings();
					},
				}),
			);
		}

		patchEmptyCategoryFunction(categories) {
			for (const category of categories) {
				if (!category.shouldShowEmptyCategory.__originalFunction) {
					category.shouldShowEmptyCategory = () => true;
				}
			}
		}

		sortChannels(category) {
			if (!category || category.isCollapsed) return;

			const channelArray = Object.values(category.channels);

			const calculatePosition = (record) => {
				return (
					record.position +
					(record.isGuildVocal() ? 1000 : 0) +
					(record.isHidden() ? 10000 : 0)
				);
			};

			category.shownChannelIds = channelArray
				.sort((x, y) => {
					const xPos = calculatePosition(x.record);
					const yPos = calculatePosition(y.record);
					return xPos - yPos;
				})
				.map((n) => n.id);
		}

		getHiddenChannelRecord(categories, guildId) {
			const hiddenChannels = this.getHiddenChannels(guildId);
			if (!hiddenChannels) return;

			if (!this.hiddenChannelCache[guildId]) {
				this.hiddenChannelCache[guildId] = [];
			}

			for (const category of categories) {
				const channelRecords = Object.entries(category.channels);
				const filteredChannelRecords = channelRecords.filter(
					([channelID, channelRecord]) => {
						const isHidden = hiddenChannels.channels.some(
							(m) => m.id === channelID,
						);
						if (
							isHidden &&
							!this.hiddenChannelCache[guildId].some((m) => m[0] === channelID)
						) {
							this.hiddenChannelCache[guildId].push([channelID, channelRecord]);
						}
						return !isHidden;
					},
				);
				category.channels = Object.fromEntries(filteredChannelRecords);
				if (category.hiddenChannelIds) {
					category.hiddenChannelIds = category.hiddenChannelIds.filter((v) =>
						filteredChannelRecords.some(([id]) => id === v),
					);
				}

				if (category.shownChannelIds) {
					category.shownChannelIds = category.shownChannelIds.filter((v) =>
						filteredChannelRecords.some(([id]) => id === v),
					);
				}
			}

			return {
				records: Object.fromEntries(this.hiddenChannelCache[guildId]),
				...hiddenChannels,
			};
		}

		/**
		 * Retrieves the hidden channels for a given guild.
		 * @param {string} guildId - The ID of the guild.
		 * @returns {object} - An object containing the hidden channels and the amount of hidden channels.
		 */
		getHiddenChannels(guildId) {
			const { ChannelStore, DiscordConstants } =
				require("./utils/modules").getModules();

			if (!guildId) {
				return {
					channels: [],
					amount: 0,
				};
			}

			const guildChannels =
				ChannelStore.getMutableGuildChannelsForGuild(guildId);
			const hiddenChannels = Object.values(guildChannels).filter(
				(m) =>
					m.isHidden() &&
					m.type !== DiscordConstants.ChannelTypes.GUILD_CATEGORY,
			);

			const ChannelsAndCount = {
				channels: hiddenChannels,
				amount: hiddenChannels.length,
			};
			return ChannelsAndCount;
		}

		rerenderChannels() {
			const { container, PermissionStoreActionHandler, ChannelListStoreActionHandler } =
				require("./utils/modules").getModules();

			PermissionStoreActionHandler?.CONNECTION_OPEN();
			ChannelListStoreActionHandler?.CONNECTION_OPEN();

			this.forceUpdate(this.findChannelTreeContainer(container));
			this.scheduleHiddenChannelDecoration();
		}

		startHiddenIconRetry() {
			if (this.hiddenIconRetryInterval || this.hasRendererHiddenIconPatch) {
				return;
			}

			this.hiddenIconRetryInterval = setInterval(() => {
				this.tryUpgradeHiddenIconRenderer();
			}, 1000);
		}

		stopHiddenIconRetry() {
			if (!this.hiddenIconRetryInterval) {
				return;
			}

			clearInterval(this.hiddenIconRetryInterval);
			this.hiddenIconRetryInterval = null;
		}

		tryUpgradeHiddenIconRenderer() {
			if (this.hasRendererHiddenIconPatch || !this.settings.hiddenChannelIcon) {
				this.stopHiddenIconRetry();
				return;
			}

			const moduleLoader = require("./utils/modules");
			moduleLoader.UnloadModules();
			const modules = moduleLoader.getModules();
			const { HiddenChannelIcon } = require("./components/HiddenChannelIcon");

			if (
				!modules.ChannelItemRenderer ||
				!modules.iconItem ||
				!modules.actionIcon
			) {
				return;
			}

			this.patchHiddenChannelRenderer({
				Patcher: this.api.Patcher,
				Utilities: modules.Utilities,
				React: modules.React,
				HiddenChannelIcon,
				NavigationUtils: modules.NavigationUtils,
				DiscordConstants: modules.DiscordConstants,
				ChannelItemRenderer: modules.ChannelItemRenderer,
				iconItem: modules.iconItem,
				actionIcon: modules.actionIcon,
			});
			this.stopChannelItemDomFallback();
			this.stopHiddenIconRetry();
			this.rerenderChannels();
		}

		startChannelItemDomFallback() {
			if (this.channelListObserver) {
				return;
			}

			const fallbackTarget = this.findChannelTreeContainer() ?? document.body;
			if (!fallbackTarget) {
				return;
			}

			this.channelListObserver = new MutationObserver(() => {
				this.scheduleHiddenChannelDecoration();
			});
			this.channelListObserver.observe(fallbackTarget, {
				childList: true,
				subtree: true,
			});

			this.scheduleHiddenChannelDecoration();
		}

		stopChannelItemDomFallback() {
			if (this.pendingDecorationFrame) {
				cancelAnimationFrame(this.pendingDecorationFrame);
				this.pendingDecorationFrame = 0;
			}

			this.channelListObserver?.disconnect();
			this.channelListObserver = null;

			for (const element of document.querySelectorAll(".shc-hidden-channel")) {
				element.classList.remove("shc-hidden-channel");
				for (const className of [...element.classList]) {
					if (className.startsWith("shc-hidden-channel-type-")) {
						element.classList.remove(className);
					}
				}
			}

			for (const badge of document.querySelectorAll(".shc-hidden-channel-badge")) {
				badge.remove();
			}
		}

		scheduleHiddenChannelDecoration() {
			if (!this.settings.hiddenChannelIcon || this.pendingDecorationFrame) {
				return;
			}

			this.pendingDecorationFrame = requestAnimationFrame(() => {
				this.pendingDecorationFrame = 0;
				this.decorateHiddenChannelItems();
			});
		}

		decorateHiddenChannelItems() {
			const { ChannelStore } = require("./utils/modules").getModules();

			for (const item of document.querySelectorAll('[data-list-item-id^="channels___"]')) {
				const channelId = this.extractChannelIdFromElement(item);
				if (!channelId) {
					continue;
				}

				const channel = ChannelStore.getChannel(channelId);
				const row = this.findDecoratedChannelElement(item);
				if (!row) {
					continue;
				}

				const hiddenTypeClasses = [...row.classList].filter((className) =>
					className.startsWith("shc-hidden-channel-type-"),
				);
				if (!this.shouldDecorateHiddenChannel(channel)) {
					row.classList.remove("shc-hidden-channel", ...hiddenTypeClasses);
					row.querySelector(".shc-hidden-channel-badge")?.remove();
					continue;
				}

				row.classList.add("shc-hidden-channel");
				row.classList.remove(...hiddenTypeClasses);
				if (channel?.type != null) {
					row.classList.add(`shc-hidden-channel-type-${channel.type}`);
				}

				this.ensureHiddenChannelBadge(row);
			}
		}

		ensureHiddenChannelBadge(row) {
			let badge = row.querySelector(".shc-hidden-channel-badge");
			if (!badge) {
				badge = document.createElement("span");
				badge.className = "shc-hidden-channel-badge";
				badge.setAttribute("aria-hidden", "true");
				badge.style.display = "inline-flex";
				badge.style.alignItems = "center";
				badge.style.justifyContent = "center";
				badge.style.marginLeft = "auto";
				badge.style.minWidth = "16px";
				badge.innerHTML =
					this.settings.hiddenChannelIcon === "eye"
						? '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5C5.648 5 1 12 1 12C1 12 5.648 19 12 19C18.352 19 23 12 23 12C23 12 18.352 5 12 5ZM12 16C9.791 16 8 14.21 8 12C8 9.79 9.791 8 12 8C14.209 8 16 9.79 16 12C16 14.21 14.209 16 12 16Z"/><path fill="currentColor" d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"/></svg>'
						: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17 11V7C17 4.243 14.756 2 12 2C9.242 2 7 4.243 7 7V11C5.897 11 5 11.896 5 13V20C5 21.103 5.897 22 7 22H17C18.103 22 19 21.103 19 20V13C19 11.896 18.103 11 17 11ZM12 18C11.172 18 10.5 17.328 10.5 16.5C10.5 15.672 11.172 15 12 15C12.828 15 13.5 15.672 13.5 16.5C13.5 17.328 12.828 18 12 18ZM15 11H9V7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V11Z"/></svg>';
				row.appendChild(badge);
			}

			// Prefer the row's existing icon color, then fall back to Discord's normal channel icon color.
			badge.style.color = this.getHiddenChannelBadgeColor(row, badge);
		}

		getHiddenChannelBadgeColor(row, badge) {
			const referenceIcon = [...row.querySelectorAll("svg")].find(
				(icon) => !badge.contains(icon),
			);
			const referenceElement =
				referenceIcon?.parentElement ||
				row.querySelector('[class*="icon"], [class*="Icon"]');

			if (referenceElement) {
				const { color } = getComputedStyle(referenceElement);
				if (color) {
					return color;
				}
			}

			return "var(--channels-default)";
		}

		patchHiddenChannelRenderer({
			Patcher,
			Utilities,
			React,
			HiddenChannelIcon,
			NavigationUtils,
			DiscordConstants,
			ChannelItemRenderer,
			iconItem,
			actionIcon,
		}) {
			if (this.hasRendererHiddenIconPatch) {
				return;
			}

			this.hasRendererHiddenIconPatch = true;

			Patcher.after(ChannelItemRenderer, "render", (_, args, res) => {
				const [instance] =
					/** @type {[{channel: SHCChannel, connected: boolean}]} */ (args);
				if (!this.shouldDecorateHiddenChannel(instance?.channel)) {
					return res;
				}

				const item = res?.props?.children?.props;
				if (item?.className) {
					item.className += ` shc-hidden-channel shc-hidden-channel-type-${instance.channel.type}`;
				}

				const children = Utilities.findInTree(
					res,
					(m) =>
						m?.props?.onClick?.toString().includes("stopPropagation") &&
						m.type === "div",
					{
						walkable: ["props", "children", "child", "sibling"],
						maxRecursion: 100,
					},
				);

				if (children?.props?.children) {
					children.props.children = [
						React.createElement(HiddenChannelIcon, {
							icon: this.settings.hiddenChannelIcon,
							iconItem: iconItem,
							actionIcon: actionIcon,
						}),
					];
				}

				const isInCallInThisChannel =
					instance.channel.type ===
						DiscordConstants.ChannelTypes.GUILD_VOICE &&
					!instance.connected;
				if (!isInCallInThisChannel) {
					return res;
				}

				const wrapper = Utilities.findInTree(
					res,
					(channel) =>
						channel?.props?.className?.includes("shc-hidden-channel-type-2"),
					{
						walkable: ["props", "children", "child", "sibling"],
						maxRecursion: 100,
					},
				);

				if (!wrapper) {
					return res;
				}

				wrapper.props.onMouseDown = () => {};
				wrapper.props.onMouseUp = () => {};

				const mainContent = wrapper?.props?.children[1]?.props?.children;

				if (!mainContent) {
					return res;
				}

				mainContent.props.onClick = () => {
					if (instance.channel?.isGuildVocal()) {
						NavigationUtils.transitionTo(
							`/channels/${instance.channel.guild_id}/${instance.channel.id}`,
						);
					}
				};
				mainContent.props.href = null;

				return res;
			});
		}

		findChannelTreeContainer(container) {
			const channelTree =
				container && document.querySelector(`.${container}`);
			if (channelTree) {
				return channelTree;
			}

			// Discord's container class changes often, so fall back to the channel list itself.
			return (
				document.querySelector('[data-list-id="channels"]') ||
				document
					.querySelector('[data-list-item-id^="channels___"]')
					?.closest?.('[class]')
			);
		}

		findDecoratedChannelElement(item) {
			return (
				item.querySelector('a[href^="/channels/"]') ||
				item.querySelector('[role="link"]') ||
				item.firstElementChild ||
				item
			);
		}

		extractChannelIdFromElement(element) {
			const listItem = element?.closest?.('[data-list-item-id^="channels___"]');
			const dataListId = listItem?.getAttribute("data-list-item-id");
			if (dataListId?.startsWith("channels___")) {
				return dataListId.replace("channels___", "");
			}

			const anchor = element?.closest?.('a[href^="/channels/"]');
			const href = anchor?.getAttribute("href");
			if (!href) {
				return null;
			}

			const parts = href.split("/").filter(Boolean);
			return parts.at(-1) ?? null;
		}

		/**
		 * Forces the rerender of a React element.
		 * @param {HTMLElement} element - The element to rerender.
		 * @returns {void}
		 */
		forceUpdate(element) {
			if (!element) return;

			const { ReactTools } = require("./utils/modules").getModules();

			const toForceUpdate = ReactTools.getOwnerInstance(element);
			if (!toForceUpdate) return;
			const forceRerender = this.api.Patcher.instead(
				toForceUpdate,
				"render",
				() => {
					forceRerender();
					return null;
				},
			);

			toForceUpdate.forceUpdate(() => toForceUpdate.forceUpdate(() => {}));
		}

		stop() {
			const { DOMTools, ContextMenu } = require("./utils/modules").getModules();
			const { UnloadModules } = require("./utils/modules");

			this.api.Patcher.unpatchAll();
			this.stopChannelItemDomFallback();
			this.stopHiddenIconRetry();
			this.hasRendererHiddenIconPatch = false;
			DOMTools.removeStyle(config.info.name);
			ContextMenu?.unpatch("guild-context", this.processContextMenu);
			this.rerenderChannels();
			UnloadModules();
		}

		getSettingsPanel() {
			const { Logger, React } = require("./utils/modules").getModules();
			const { SettingsPanel } = require("./components/SettingsPanel");

			return React.createElement(SettingsPanel, {
				settings: this.settings,
				onSettingsChange: (newSetting, value) => {
					this.settings = {
						...this.settings,
						[newSetting]: value,
					};
					Logger.debug(`Setting changed: ${newSetting} => ${value}`);
					this.saveSettings();
				},
			});
		}

		reloadNotification(
			coolText = "Reload Discord to apply changes and avoid bugs",
		) {
			this.api.UI.showConfirmationModal("Reload Discord?", coolText, {
				confirmText: "Reload",
				cancelText: "Later",
				onConfirm: () => {
					window.location.reload();
				},
			});
		}

		saveSettings() {
			const { Logger } = require("./utils/modules").getModules();

			this.api.Data.save("settings", this.settings);
			Logger.debug("Settings saved.", this.settings);
			this.rerenderChannels();
		}
	};
})();
