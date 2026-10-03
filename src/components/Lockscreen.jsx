// @ts-check

import { convertToHMS, getDateFromSnowflake } from "../utils/date";
import { getModules } from "../utils/modules";
import AdminRolesComponent from "./AdminRolesComponent";
import ChannelRolesComponent from "./ChannelRolesComponent";
import ForumComponent from "./ForumComponent";
import UserMentionsComponent from "./UserMentionsComponent";

const {
	Components: { TextElement },
	GuildStore,
	GuildRoleStore,
	React,
} = getModules();

const CHANNEL_TYPES = {
	0: "text",
	2: "voice",
	4: "category",
	5: "news",
	6: "store",
	13: "stage",
	15: "forum",
	16: "media",
};

export const Lockscreen = React.memo(
	(
		/** @type {{ chat: string, channel: import('../discord').SHCChannel, settings: Record<string, any>, isLockedVoiceChannel?: boolean, showTopic?: boolean }} */ {
			chat,
			channel,
			settings,
			isLockedVoiceChannel = false,
			showTopic = true,
		},
	) => {
		const guild = GuildStore.getGuild(channel.guild_id);
		const guildRoles = GuildRoleStore.getRolesSnapshot(guild?.id);
		const topic =
			showTopic && ![15, 16].includes(channel.type) ? channel.topic : null;

		return (
			<div
				className={["shc-hidden-chat-content", chat].filter(Boolean).join(" ")}
				style={{
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<div className="shc-hidden-notice">
					<img
						alt="Hidden Channel Icon"
						style={{
							// @ts-expect-error webkitUserDrag is not recognized by TypeScript but is valid in CSS
							webkitUserDrag: "none",
							maxHeight: 128,
							margin: "0 auto",
						}}
						src={
							settings.hiddenChannelIcon === "eye"
								? "https://raw.githubusercontent.com/XxUnkn0wnxX/JustOptimize-return-ShowHiddenChannels/main/assets/eye.png"
								: "/assets/755d4654e19c105c3cd108610b78d01c.svg"
						}
					/>
					<TextElement
						color={TextElement.Colors.HEADER_PRIMARY}
						size={TextElement.Sizes.SIZE_32}
						style={{
							marginTop: 20,
							fontWeight: "bold",
						}}
					>
						{`This is a ${isLockedVoiceChannel ? "locked" : "hidden"}${CHANNEL_TYPES[channel.type] ? ` ${CHANNEL_TYPES[channel.type]}` : ""} channel`}
					</TextElement>
					<TextElement
						color={TextElement.Colors.HEADER_SECONDARY}
						size={TextElement.Sizes.SIZE_16}
						style={{
							marginTop: 8,
						}}
					>
						{isLockedVoiceChannel
							? "You cannot connect to this channel."
							: "You cannot see the contents of this channel."}
					</TextElement>

					{/* Plain text is available even when native view capture fails. */}
					{topic && (
						<TextElement
							color={TextElement.Colors.STANDARD}
							size={TextElement.Sizes.SIZE_14}
							style={{
								marginTop: 16,
								whiteSpace: "pre-wrap",
								overflowWrap: "anywhere",
							}}
						>
							{topic}
						</TextElement>
					)}

					{/* Icon Emoji */}
					{channel?.iconEmoji && (
						<TextElement
							color={TextElement.Colors.STANDARD}
							size={TextElement.Sizes.SIZE_14}
							style={{
								marginTop: 16,
							}}
						>
							Icon emoji: {channel.iconEmoji.name ?? channel.iconEmoji.id}
						</TextElement>
					)}

					{/* Slowmode */}
					{channel.rateLimitPerUser > 0 && (
						<TextElement
							color={TextElement.Colors.STANDARD}
							size={TextElement.Sizes.SIZE_14}
						>
							Slowmode: {convertToHMS(Number(channel.rateLimitPerUser))}
						</TextElement>
					)}

					{/* NSFW */}
					{channel.nsfw && (
						<TextElement
							color={TextElement.Colors.STANDARD}
							size={TextElement.Sizes.SIZE_14}
						>
							Age-Restricted Channel (NSFW) 🔞
						</TextElement>
					)}

					{/* Spoiler */}
					{channel.isSpoilerChannel?.() && (
						<TextElement
							color={TextElement.Colors.STANDARD}
							size={TextElement.Sizes.SIZE_14}
						>
							Spoiler Channel 👁️
						</TextElement>
					)}

					{/* Bitrate */}
					{channel.bitrate && channel.type === 2 && (
						<TextElement
							color={TextElement.Colors.STANDARD}
							size={TextElement.Sizes.SIZE_14}
						>
							Bitrate: {channel.bitrate / 1000}kbps
						</TextElement>
					)}

					{/* Creation date */}
					<TextElement
						color={TextElement.Colors.STANDARD}
						size={TextElement.Sizes.SIZE_14}
						style={{
							marginTop: 8,
						}}
					>
						Created on: {getDateFromSnowflake(channel.id)}
					</TextElement>

					{/* Last message */}
					{channel.lastMessageId && (
						<TextElement
							color={TextElement.Colors.STANDARD}
							size={TextElement.Sizes.SIZE_14}
						>
							Last message sent: {getDateFromSnowflake(channel.lastMessageId)}
						</TextElement>
					)}

					{/* Permissions */}
					{settings.showPerms && channel.permissionOverwrites && (
						<div
							style={{
								margin: "16px auto 0 auto",
								backgroundColor: "var(--bg-surface-raised)",
								padding: 10,
								borderRadius: 5,
								color: "var(--text-default)",
							}}
						>
							{/* Users */}
							<UserMentionsComponent
								channel={channel}
								guild={guild}
								settings={settings}
							/>

							{/* Channel Roles */}
							<ChannelRolesComponent
								channel={channel}
								guild={guild}
								settings={settings}
								roles={guildRoles}
							/>

							{/* Admin Roles */}
							<AdminRolesComponent
								guild={guild}
								settings={settings}
								roles={guildRoles}
							/>
						</div>
					)}

					{/* Forums */}
					<ForumComponent channel={channel} />
				</div>
			</div>
		);
	},
);
