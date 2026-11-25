// @ts-check

import { getModules } from "../utils/modules";

const {
	React,
	UserMentions,
	ProfileActions,
	GuildMemberStore,
	UserStore,
	DiscordConstants,
	PermissionUtils,
	Components: { TextElement },
} = getModules();

export default function UserMentionsComponent({
	channel,
	guild,
	settings,
	permission = DiscordConstants.Permissions.VIEW_CHANNEL,
}) {
	const [userMentionComponents, setUserMentionComponents] = React.useState([
		"Loading...",
	]);

	const fetchMemberAndMap = async () => {
		setUserMentionComponents(["Loading..."]);

		if (!settings.showPerms) {
			return setUserMentionComponents(["None"]);
		}

		const allUserOverwrites = Object.values(
			channel.permissionOverwrites,
		).filter((user) => Boolean(user && user?.type === 1));

		for (const user of allUserOverwrites) {
			if (UserStore.getUser(user.id)) continue;

			await ProfileActions.fetchProfile(user.id, {
				guildId: guild.id,
				withMutualGuilds: false,
			});

			if (allUserOverwrites.indexOf(user) !== allUserOverwrites.length - 1) {
				// Wait between 500ms and 2000ms
				await new Promise((resolve) =>
					setTimeout(resolve, Math.floor(Math.random() * 1500) + 500),
				);
			}
		}

		const { CONNECT, VIEW_CHANNEL } = DiscordConstants.Permissions;
		const filteredUserOverwrites = allUserOverwrites.filter((overwrite) => {
			const user = UserStore.getUser(overwrite.id);
			if (!user || !GuildMemberStore.isMember(guild.id, user.id)) return false;

			return (
				PermissionUtils.can({
					permission: VIEW_CHANNEL,
					user,
					context: channel,
				}) &&
				(permission !== CONNECT ||
					PermissionUtils.can({ permission: CONNECT, user, context: channel }))
			);
		});

		if (!filteredUserOverwrites?.length) {
			return setUserMentionComponents(["None"]);
		}

		const mentionArray = filteredUserOverwrites.map((m) =>
			UserMentions.react(
				{
					userId: m.id,
					channelId: channel.id,
				},
				() => null,
				{
					noStyleAndInteraction: false,
				},
			),
		);

		return setUserMentionComponents(mentionArray);
	};

	React.useEffect(() => {
		fetchMemberAndMap();
	}, [
		channel.id,
		guild.id,
		settings.showPerms,
		channel.permissionOverwrites,
		permission,
	]);

	return (
		<TextElement
			color={TextElement.Colors.STANDARD}
			size={TextElement.Sizes.SIZE_14}
		>
			{permission === DiscordConstants.Permissions.CONNECT
				? "Users with channel-specific permissions who can join:"
				: "Users with channel-specific permissions who can view:"}
			<div
				style={{
					marginTop: 8,
					marginBottom: 8,
					display: "flex",
					flexDirection: "column",
					flexWrap: "wrap",
					gap: 8,
					padding: 8,
					paddingTop: 0,
				}}
			>
				{userMentionComponents}
			</div>
		</TextElement>
	);
}
