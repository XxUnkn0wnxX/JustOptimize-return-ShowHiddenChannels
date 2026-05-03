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
}) {
	if (!channel?.permissionOverwrites || !guild?.id || !roles) {
		return null;
	}

	const channelRoles = Object.values(channel.permissionOverwrites).filter(
		(role) =>
			role !== undefined &&
			role?.type === 0 &&
			//* 1024n = VIEW_CHANNEL permission
			//* 8n = ADMINISTRATOR permission
			//* If role is ADMINISTRATOR it can view channel even if overwrites deny VIEW_CHANNEL
			((settings.showAdmin &&
				(roles[role.id]?.permissions & BigInt(8)) === BigInt(8)) ||
				//* If overwrites allow VIEW_CHANNEL (it will override the default role permissions)
				(role.allow & BigInt(1024)) === BigInt(1024) ||
				//* If role can view channel by default and overwrites don't deny VIEW_CHANNEL
				(roles[role.id]?.permissions & BigInt(1024) &&
					(role.deny & BigInt(1024)) === BigInt(0))),
	);

	return (
		<TextElement
			color={TextElement.Colors.STANDARD}
			style={{
				borderTop: "1px solid var(--background-tertiary)",
				padding: 8,
			}}
		>
			Channel-specific roles:
			<div
				style={{
					paddingTop: 8,
				}}
			>
				{!channelRoles?.length && <span>None</span>}
				{channelRoles?.length > 0 &&
					channelRoles.map((m) =>
						RolePill ? (
							<RolePill
								key={m.id}
								canRemove={false}
								className={"shc-rolePill"}
								disableBorderColor={true}
								guildId={guild.id}
								onRemove={DiscordConstants.NOOP}
								role={roles[m.id]}
							/>
						) : (
							// Keep the permissions panel usable when Discord renames the pill component.
							<FallbackRolePill key={m.id} label={roles[m.id]?.name ?? m.id} />
						),
					)}
			</div>
		</TextElement>
	);
}

function FallbackRolePill({ label }) {
	return (
		<span
			style={{
				display: "inline-block",
				marginRight: 6,
				marginBottom: 6,
				padding: "4px 8px",
				borderRadius: 12,
				backgroundColor: "var(--background-secondary-alt)",
			}}
		>
			{label}
		</span>
	);
}
