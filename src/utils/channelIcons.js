// @ts-check

/**
 * Replace Discord's generic locked icon for voice and stage rows with the
 * matching native voice/stage icon that includes a lock badge.
 *
 * @param {{
 *  Webpack: any,
 *  Patcher: any,
 *  ChannelTypes: any,
 *  shouldShowInformation: (channel: any) => boolean,
 *  warn?: (message: string, error?: unknown) => void,
 * }} options
 * @returns {boolean}
 */
export function installLockedChannelIcons({
	Webpack,
	Patcher,
	ChannelTypes,
	shouldShowInformation,
	warn,
}) {
	let hasWarned = false;
	const warnOnce = (message, error) => {
		if (hasWarned) return;
		hasWarned = true;
		try {
			warn?.(message, error);
		} catch {}
	};
	const unavailable = (error) => {
		warnOnce("Native voice/stage lock badges could not be installed.", error);
		return false;
	};

	try {
		const byStrings = Webpack?.Filters?.byStrings;
		if (
			typeof Webpack?.getWithKey !== "function" ||
			typeof Webpack?.getByKeys !== "function" ||
			typeof Webpack?.getModule !== "function" ||
			typeof byStrings !== "function" ||
			typeof Patcher?.after !== "function" ||
			typeof shouldShowInformation !== "function" ||
			typeof ChannelTypes?.GUILD_VOICE !== "number" ||
			typeof ChannelTypes?.GUILD_STAGE_VOICE !== "number"
		) {
			return unavailable();
		}

		const selectorMatch = Webpack.getWithKey(
			byStrings(
				"hasActiveThreads",
				"textFocused",
				".GUILD_STAGE_VOICE",
				".LockIcon",
			),
		);
		const [selectorModule, selectorKey] = selectorMatch ?? [];
		const LockIcon = Webpack.getByKeys("LockIcon")?.LockIcon;
		const voiceBadge = Webpack.getModule(
			byStrings("M16 4h.5v-.5", "M20.5 12c-.28 0-.5.22"),
			{ searchExports: true },
		);
		const stageBadge = Webpack.getModule(
			byStrings("M21.92 14.08c.32.27.86.15", "M16.5 18H16"),
			{ searchExports: true },
		);

		if (
			!selectorModule ||
			typeof selectorKey !== "string" ||
			typeof selectorModule[selectorKey] !== "function" ||
			typeof LockIcon !== "function" ||
			typeof voiceBadge !== "function" ||
			typeof stageBadge !== "function"
		) {
			return unavailable();
		}

		const unpatch = Patcher.after(
			selectorModule,
			selectorKey,
			(_thisObject, args, result) => {
				if (result !== LockIcon) return result;

				const channel = args?.[0];
				const settings = args?.[2];
				if (settings?.locked !== true || channel?.guild_id == null) {
					return result;
				}

				let badge;
				if (channel.type === ChannelTypes.GUILD_VOICE) badge = voiceBadge;
				else if (channel.type === ChannelTypes.GUILD_STAGE_VOICE)
					badge = stageBadge;
				else return result;

				try {
					return shouldShowInformation(channel) ? badge : result;
				} catch (error) {
					warnOnce(
						"Could not check whether a locked channel should show its badge.",
						error,
					);
					return result;
				}
			},
		);
		if (typeof unpatch !== "function") {
			return unavailable(
				new Error("Patcher.after did not return an unpatch function."),
			);
		}

		return true;
	} catch (error) {
		return unavailable(error);
	}
}
