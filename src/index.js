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
			{
				name: "XxUnkn0wnxX (AI)",
			},
		],
		description:
			"A plugin which displays all hidden Channels and allows users to view information about them, this won't allow you to read them (impossible).",
		version: __VERSION__,
		github: `https://github.com/${__GITHUB_REPOSITORY__}/tree/main`,
	},

	changelog: __CHANGELOG__,

	main: "ShowHiddenChannels.plugin.js",
	github_short: __GITHUB_REPOSITORY__,
};

export default (() => {
	// biome-ignore lint/security/noGlobalEval: This is a necessary evil
	const RuntimeRequire = eval("require");
	const PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID =
		"2026-02-private-channel-hiding";
	const PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT = -1;
	const UPSTREAM_REPOSITORY = "JustOptimize/ShowHiddenChannels";
	const ROLLING_RELEASE_TAG = "Nightly-Fork";
	const isForkBuild = config.github_short !== UPSTREAM_REPOSITORY;
	const releaseApiUrl = isForkBuild
		? `https://api.github.com/repos/${config.github_short}/releases/tags/${ROLLING_RELEASE_TAG}`
		: `https://api.github.com/repos/${UPSTREAM_REPOSITORY}/releases/latest`;
	const UPDATE_FETCH_OPTIONS = {
		timeout: 15000,
		maxRedirects: 20,
		headers: {
			"User-Agent": `${config.info.name}/${config.info.version}`,
		},
	};
	const RELEASE_FETCH_OPTIONS = {
		...UPDATE_FETCH_OPTIONS,
		headers: {
			...UPDATE_FETCH_OPTIONS.headers,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	};
	const PLUGIN_VERSION_PATTERN = /^\d+(?:\.\d+)*$/;

	const parsePluginHeader = (content) => {
		if (typeof content !== "string" || !content) return null;

		const header = content.match(/^\s*\/\*\*[\s\S]*?\*\//)?.[0];
		const name = header?.match(
			/^\s*\*\s*@name\s+([^\r\n]+?)\s*$/m,
		)?.[1];
		const version = header?.match(
			/^\s*\*\s*@version\s+([^\r\n]+?)\s*$/m,
		)?.[1];

		if (
			name !== config.info.name ||
			!PLUGIN_VERSION_PATTERN.test(version ?? "")
		) {
			return null;
		}

		return { name, version };
	};

	const defaultSettings = {
		hiddenChannelIcon: "lock",
		sort: "native",
		showPerms: true,
		showAdmin: "channel",
		MarkUnread: false,

		checkForUpdates: true,

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
			this.privateChannelHidingHotfixWarnings = new Set();
			this.lockedVoicePatchWarnings = new Set();

			this.collapsed = {};
			this.processContextMenu = this?.processContextMenu?.bind(this);
			const savedSettings = { ...(this.api.Data.load("settings") ?? {}) };
			const hasLegacyPreRelease = Object.hasOwn(
				savedSettings,
				"usePreRelease",
			);
			delete savedSettings.usePreRelease;
			this.settings = Object.assign({}, defaultSettings, savedSettings);
			if (hasLegacyPreRelease) {
				try {
					this.api.Data.save("settings", this.settings);
				} catch (error) {
					console.warn("[ShowHiddenChannels] Failed to migrate legacy settings.", error);
				}
			}
		}

		semverGt(a, b) {
			const parse = (v) => {
				if (typeof v !== "string" || !/^\d+(?:\.\d+)*$/.test(v)) {
					return null;
				}

				return v.split(".").map(Number);
			};
			const av = parse(a);
			const bv = parse(b);
			if (!av || !bv) return false;

			for (let i = 0; i < Math.max(av.length, bv.length); i++) {
				const diff = (av[i] ?? 0) - (bv[i] ?? 0);
				if (diff !== 0) return diff > 0;
			}

			return false;
		}

		async checkForUpdates() {
			const { Logger } = require("./utils/modules");

			Logger.debug(
				`Checking for updates, current version: ${config.info.version}`,
			);

			const failedCheck = (source, detail) => {
				let reason = "Unknown error";
				if (typeof detail === "number") reason = `HTTP ${detail}`;
				else if (detail instanceof Error) reason = detail.message || detail.name;
				else if (typeof detail === "string" && detail) reason = detail;

				Logger.warn(`Failed to check for updates (${source}): ${reason}`);
				this.api.UI.showToast(
					"(ShowHiddenChannels) Failed to check for updates.",
					{
						type: "error",
					},
				);
			};

			let release;
			try {
				const releaseResponse = await this.api.Net.fetch(
					releaseApiUrl,
					RELEASE_FETCH_OPTIONS,
				);
				if (!releaseResponse?.ok) {
					return failedCheck("release API", releaseResponse?.status);
				}

				release = await releaseResponse.json();
			} catch (error) {
				return failedCheck("release API", error);
			}

			const pluginAsset = Array.isArray(release?.assets)
				? release.assets.find(
						(asset) =>
							asset?.name === config.main &&
							typeof asset.browser_download_url === "string" &&
							asset.browser_download_url.length > 0,
					)
				: undefined;

			if (
				release?.draft !== false ||
				release?.prerelease !== false ||
				(isForkBuild && release?.tag_name !== ROLLING_RELEASE_TAG) ||
				!pluginAsset
			) {
				this.api.UI.alert(
					config.info.name,
					"Failed to check for updates, version not found.",
				);

				return Logger.err("Failed to check for updates, version not found.");
			}

			let SHCContent;
			try {
				const pluginResponse = await this.api.Net.fetch(
					pluginAsset.browser_download_url,
					UPDATE_FETCH_OPTIONS,
				);
				if (!pluginResponse?.ok) {
					return failedCheck("plugin asset", pluginResponse?.status);
				}

				SHCContent = await pluginResponse.text();
			} catch (error) {
				return failedCheck("plugin asset", error);
			}

			const pluginMetadata = parsePluginHeader(SHCContent);
			if (!pluginMetadata) {
				this.api.UI.alert(
					config.info.name,
					"Failed to check for updates, plugin metadata not found.",
				);

				return Logger.err(
					"Failed to check for updates, plugin metadata not found.",
				);
			}

			const releaseVersion = pluginMetadata.version;
			Logger.debug(`Latest plugin version: ${releaseVersion}`);

			if (!this.semverGt(releaseVersion, config.info.version)) {
				return Logger.info("No updates found.");
			}

			const releaseTitle = isForkBuild
				? `v${releaseVersion} - ${ROLLING_RELEASE_TAG}`
				: `v${releaseVersion}`;
			this.api.UI.showConfirmationModal(
				"Update available",
				`ShowHiddenChannels has an update available. Would you like to update to ${releaseTitle}?`,
				{
					confirmText: "Update",
					cancelText: "Cancel",
					danger: false,

					onConfirm: async () => {
						await this.proceedWithUpdate(SHCContent, releaseVersion);
					},

					onCancel: () => {
						this.api.UI.showToast("Update cancelled.", {
							type: "info",
						});
					},
				},
			);
		}

		async proceedWithUpdate(SHCContent, version) {
			const { Logger } = require("./utils/modules");

			Logger.debug(
				`Update confirmed by the user, updating to version ${version}`,
			);

			const failed = () => {
				this.api.UI.showToast("(ShowHiddenChannels) Failed to update.", {
					type: "error",
				});
			};

			if (typeof SHCContent !== "string" || !SHCContent) return failed();

			const pluginMetadata = parsePluginHeader(SHCContent);

			if (!pluginMetadata || pluginMetadata.version !== version) {
				return failed();
			}

			try {
				const fs = RuntimeRequire("fs");
				const path = RuntimeRequire("path");

				await fs.promises.writeFile(
					path.join(this.api.Plugins.folder, config.main),
					SHCContent,
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
			const { Logger } = require("./utils/modules");

			Logger.info(`Starting plugin...`);
			Logger.isDebugging = this.settings.debugMode;

			await new Promise((resolve) => {
				const start = Date.now();
				const interval = setInterval(() => {
					const container = BdApi.Webpack.getByKeys(
						"container",
						"hubContainer",
					)?.container;
					if (container) {
						clearInterval(interval);
						resolve();
					} else if (Date.now() - start >= 10000) {
						clearInterval(interval);
						Logger.error("Timed out waiting for container module after 10s");
						resolve();
					}
				}, 500);
			});

			Logger.info(`Checking for updates...`);

			if (this.settings.checkForUpdates) {
				await this.checkForUpdates();
			}

			// First call to the modules loader
			const { ChannelPermissionStore } =
				require("./utils/modules").getModules();

			this.can =
				ChannelPermissionStore.can.__originalFunction ??
				ChannelPermissionStore.can;

			const { loaded_successfully } = require("./utils/modules");

			if (loaded_successfully) {
				this.doStart();
			} else {
				this.api.UI.showConfirmationModal(
					`(SHC v${config.info.version}) Broken Modules`,
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

			this.applyPrivateChannelHidingExperimentHotfix();
			DOMTools.addStyle(config.info.name, styles);
			this.Patch();
			this.rerenderChannels();
		}

		isHiddenChannel(channel) {
			const { DiscordConstants } = require("./utils/modules").getModules();
			const { DM, GROUP_DM } = DiscordConstants.ChannelTypes;

			if (!channel || [DM, GROUP_DM].includes(channel.type)) {
				return false;
			}

			return !this.can(DiscordConstants.Permissions.VIEW_CHANNEL, channel);
		}

		/**
		 * Temporary hotfix for Discord's 2026-02-private-channel-hiding experiment.
		 * Keep this isolated so it can be removed once SHC has a better long-term path.
		 */
		applyPrivateChannelHidingExperimentHotfix() {
			const { Logger } = require("./utils/modules");
			const experimentStore = this.getPrivateChannelHidingExperimentStore();
			const currentVariant = this.getPrivateChannelHidingVariant(experimentStore);

			if (!experimentStore || typeof currentVariant !== "number") {
				this.warnPrivateChannelHidingHotfixOnce(
					"experiment-not-found",
					`Experiment ${PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID} not found; private-channel-hiding hotfix was not applied.`,
				);
				return;
			}

			if (currentVariant === PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT) {
				Logger.info(
					`Private channel hiding experiment already reads Not Eligible (${PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT}); refreshing visible override.`,
				);
			}

			const dispatcher = this.getDiscordDispatcher();
			if (typeof dispatcher?.dispatch !== "function") {
				this.warnPrivateChannelHidingHotfixOnce(
					"dispatcher-not-found",
					"Discord dispatcher not found; private-channel-hiding hotfix was not applied.",
				);
				return;
			}

			const hasApexOverrideHandler = this.getDispatcherNodes().some(
				(node) =>
					node?.name === "ApexExperimentStore" &&
					typeof node?.actionHandler?.APEX_EXPERIMENT_OVERRIDE_CREATE ===
						"function",
			);

			if (!hasApexOverrideHandler) {
				this.warnPrivateChannelHidingHotfixOnce(
					"not-eligible-action-not-found",
					`Not Eligible override action for ${PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID} not found; private-channel-hiding hotfix was not applied.`,
				);
				return;
			}

			dispatcher.dispatch({
				type: "APEX_EXPERIMENT_OVERRIDE_CREATE",
				experimentName: PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID,
				variantId: PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT,
			});
			Logger.info(
				`Private channel hiding experiment override dispatched as Not Eligible (${PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT}).`,
			);

			window.setTimeout(() => {
				const nextVariant =
					this.getPrivateChannelHidingVariant(experimentStore);

				if (
					nextVariant !== PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT
				) {
					this.warnPrivateChannelHidingHotfixOnce(
						"not-eligible-not-applied",
						`Not Eligible option for ${PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID} did not apply; current variant is ${String(nextVariant)}.`,
					);
					return;
				}

				Logger.info(
					`Private channel hiding experiment forced to Not Eligible (${PRIVATE_CHANNEL_HIDING_NOT_ELIGIBLE_VARIANT}). Restart Discord and delete Cache and Code Cache if channel names were already cached as No Access.`,
				);
			}, 500);
		}

		getPrivateChannelHidingExperimentStore() {
			const Webpack = BdApi?.Webpack;
			const candidates = [
				Webpack?.getStore?.("ExperimentStore"),
				Webpack?.getByKeys?.(
					"getUserExperimentBucket",
					"getUserExperimentDescriptor",
				),
				...this.getDispatcherNodes()
					.filter((node) => node?.name === "ExperimentStore")
					.map((node) => node?.store ?? node),
			];

			return candidates.find(
				(candidate) =>
					candidate && typeof candidate.getUserExperimentBucket === "function",
			);
		}

		getPrivateChannelHidingVariant(experimentStore) {
			try {
				return experimentStore?.getUserExperimentBucket?.(
					PRIVATE_CHANNEL_HIDING_EXPERIMENT_ID,
				);
			} catch {
				return undefined;
			}
		}

		getDiscordDispatcher() {
			const Webpack = BdApi?.Webpack;
			return (
				Webpack?.getStore?.("UserStore")?._dispatcher ||
				Webpack?.getByKeys?.("dispatch", "subscribe", "unsubscribe", {
					searchExports: true,
				})
			);
		}

		getDispatcherNodes() {
			const nodes =
				this.getDiscordDispatcher()?._actionHandlers?._dependencyGraph?.nodes;

			if (!nodes) return [];
			return Array.isArray(nodes) ? nodes : Object.values(nodes);
		}

		warnPrivateChannelHidingHotfixOnce(key, message) {
			if (this.privateChannelHidingHotfixWarnings.has(key)) return;

			this.privateChannelHidingHotfixWarnings.add(key);
			require("./utils/modules").Logger.warn(message);
		}

		warnLockedVoicePatchOnce(key, message, details) {
			if (this.lockedVoicePatchWarnings.has(key)) return;

			this.lockedVoicePatchWarnings.add(key);
			require("./utils/modules").Logger.warn(message, details);
			this.api.UI.showToast(`(SHC) ${message}`, {
				type: "warning",
			});
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
				ChannelPermissionStore,
				// PermissionStoreActionHandler,
				// ChannelListStoreActionHandler,
				// container,
				createChannelRecord,
				ChannelListStore,
				iconItem,
				actionIcon,
				ReadStateStore,
				Voice,
				CategoryStore,
			} = require("./utils/modules").getModules();

			// Check for needed modules
			if (
				typeof createChannelRecord !== "function" ||
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

			if (!ReadStateStore) {
				this.api.UI.showToast(
					"(SHC) ReadStateStore module is missing, channels will be marked as unread.",
					{
						type: "warning",
					},
				);
			}

			Patcher.after(
				ReadStateStore,
				"getGuildChannelUnreadState",
				(_, args, res) => {
					if (this.settings.MarkUnread) return res;

					const [channel] = /** @type {[SHCChannel]} */ (args);
					return this.isHiddenChannel(channel)
						? {
								mentionCount: 0,
								unread: false,
							}
						: res;
				},
			);

			Patcher.after(ReadStateStore, "getMentionCount", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return this.isHiddenChannel(ChannelStore.getChannel(args[0])) ? 0 : res;
			});

			Patcher.after(ReadStateStore, "getUnreadCount", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return this.isHiddenChannel(ChannelStore.getChannel(args[0])) ? 0 : res;
			});

			Patcher.after(ReadStateStore, "hasTrackedUnread", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return res && !this.isHiddenChannel(ChannelStore.getChannel(args[0]));
			});

			Patcher.after(ReadStateStore, "hasUnread", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return res && !this.isHiddenChannel(ChannelStore.getChannel(args[0]));
			});

			Patcher.after(ReadStateStore, "hasUnreadPins", (_, args, res) => {
				if (this.settings.MarkUnread) return res;

				return res && !this.isHiddenChannel(ChannelStore.getChannel(args[0]));
			});

			//* Make hidden channel visible
			Patcher.after(ChannelPermissionStore, "can", (_, args, res) => {
				const [permission, channel] = /** @type {[bigint, SHCChannel]} */ (
					args
				);
				if (!this.isHiddenChannel(channel)) return res;

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
			}

			Patcher.after(Route, "A", (_, _args, res) => {
				if (!Voice || !Route) return res;

				const channelId = res.props?.computedMatch?.params?.channelId;
				const guildId = res.props?.computedMatch?.params?.guildId;
				const channel = ChannelStore?.getChannel(channelId);
				const isHiddenChannel = this.isHiddenChannel(channel);
				const isLockedVoiceChannel =
					channel?.isGuildVocal?.() &&
					!this.can(DiscordConstants.Permissions.CONNECT, channel);

				if (
					guildId &&
					(isHiddenChannel || isLockedVoiceChannel) &&
					channel?.id !== Voice.getChannelId()
				) {
					res.props.render = () =>
						React.createElement(Lockscreen, {
							chat,
							channel,
							settings: this.settings,
							isLockedVoiceChannel:
								isLockedVoiceChannel && !isHiddenChannel,
						});
				}

				return res;
			});

			if (this.settings.hiddenChannelIcon) {
				if (!ChannelItemRenderer) {
					this.api.UI.showToast(
						"(SHC) ChannelItemRenderer module is missing, channel lock icon won't be shown.",
						{
							type: "warning",
						},
					);
				}

				Patcher.after(ChannelItemRenderer, "render", (_, args, res) => {
					const [instance] =
						/** @type {[{channel: SHCChannel, connected: boolean}]} */ (args);
					if (!this.isHiddenChannel(instance?.channel)) {
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

					if (children.props?.children) {
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
							DiscordConstants.ChannelTypes.GUILD_VOICE && !instance.connected;
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

			//* Open SHC's channel information page for visible voice channels
			//* that Discord shows but the current user cannot connect to.
			if (ChannelItemRenderer) {
				Patcher.after(ChannelItemRenderer, "render", (_, args, res) => {
					const [instance] =
						/** @type {[{channel: SHCChannel}]} */ (args);
					const channel = instance?.channel;

					if (
						!channel?.isGuildVocal?.() ||
						this.isHiddenChannel(channel) ||
						this.can(DiscordConstants.Permissions.CONNECT, channel)
					) {
						return res;
					}

					const channelLink = Utilities.findInTree(
						res,
						(node) =>
							node?.props?.["data-list-item-id"] ===
							`channels___${channel.id}`,
						{
							walkable: ["props", "children", "child", "sibling"],
							maxRecursion: 100,
						},
					);

					if (!channelLink?.props) {
						this.warnLockedVoicePatchOnce(
							"locked-voice-channel-link-not-found",
							"Discord's locked voice channel row shape changed; locked voice channels cannot open SHC's channel information page.",
							{ channelId: channel.id, result: res },
						);
						return res;
					}

					channelLink.props.href = null;
					channelLink.props.onMouseDown = (event) => {
						event?.stopPropagation?.();
					};
					channelLink.props.onMouseUp = (event) => {
						event?.stopPropagation?.();
					};
					channelLink.props.onClick = (event) => {
						event?.preventDefault?.();
						event?.stopPropagation?.();
						NavigationUtils.transitionTo(
							`/channels/${channel.guild_id}/${channel.id}`,
						);
					};

					return res;
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

				const HiddenCategoryChannel = createChannelRecord({
					guild_id: guild_id,
					id: channelId,
					name: "Hidden Channels",
					type: DiscordConstants.ChannelTypes.GUILD_CATEGORY,
					permission_overwrites: [],
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
					const HiddenCategoryChannel = createChannelRecord({
						guild_id: guildId,
						id: hiddenCategoryId,
						name: "Hidden Channels",
						type: DiscordConstants.ChannelTypes.GUILD_CATEGORY,
						permission_overwrites: [],
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
					(this.isHiddenChannel(record) ? 10000 : 0)
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
					this.isHiddenChannel(m) &&
					m.type !== DiscordConstants.ChannelTypes.GUILD_CATEGORY,
			);

			const ChannelsAndCount = {
				channels: hiddenChannels,
				amount: hiddenChannels.length,
			};
			return ChannelsAndCount;
		}

		rerenderChannels() {
			const {
				container,
				PermissionStoreActionHandler,
				ChannelListStoreActionHandler,
			} = require("./utils/modules").getModules();

			PermissionStoreActionHandler?.CONNECTION_OPEN();
			ChannelListStoreActionHandler?.CONNECTION_OPEN();

			this.forceUpdate(document.querySelector(`.${container}`));
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
			const { Logger } = require("./utils/modules");

			this.api.Data.save("settings", this.settings);
			Logger.debug("Settings saved.", this.settings);
			this.rerenderChannels();
		}
	};
})();
