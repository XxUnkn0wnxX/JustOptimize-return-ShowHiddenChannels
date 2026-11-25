// @ts-check

import { getModules } from "../utils/modules";

const {
	Components: { TextElement },
	RolePill,
	DiscordConstants,
} = getModules();

export default function ChannelRolesComponent({
	channel,
	guild,
	settings,
	roles,
	permission = DiscordConstants.Permissions.VIEW_CHANNEL,
}) {
	const { CONNECT } = DiscordConstants.Permissions;
	const permissionBits = BigInt(permission);
	const channelRoles = Object.values(channel.permissionOverwrites).filter(
		(overwrite) => {
			if (overwrite?.type !== 0) return false;
			const role = roles[overwrite.id];
			if (!role) return false;

			const showAdmin =
				settings.showAdmin === "channel" ||
				settings.showAdmin === "include" ||
				(settings.showAdmin === "exclude" && !role.tags?.bot_id);
			return (
				(showAdmin && (role.permissions & 8n) === 8n) ||
				(overwrite.allow & permissionBits) === permissionBits ||
				((role.permissions & permissionBits) === permissionBits &&
					(overwrite.deny & permissionBits) === 0n)
			);
		},
	);

	return (
		<TextElement
			color={TextElement.Colors.STANDARD}
			style={{
				borderTop: "1px solid var(--border-subtle)",
				padding: 8,
			}}
		>
			{permission === CONNECT
				? "Channel-specific roles with Connect:"
				: "Channel-specific roles:"}
			<div
				style={{
					paddingTop: 8,
				}}
			>
				{!channelRoles?.length && <span>None</span>}
				{channelRoles?.length > 0 &&
					channelRoles.map((m) => (
						<RolePill
							key={m.id}
							canRemove={false}
							className={"shc-rolePill"}
							disableBorderColor={true}
							guildId={guild.id}
							onRemove={DiscordConstants.NOOP}
							role={roles[m.id]}
						/>
					))}
			</div>
		</TextElement>
	);
}
