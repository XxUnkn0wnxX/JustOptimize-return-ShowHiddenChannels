// @ts-check

import { getModules } from "../utils/modules";

const {
	Components: { TextElement },
	RolePill,
	DiscordConstants,
	React,
} = getModules();

const AdminRolesElement = ({ guild, settings, roles }) => {
	if (!settings.showAdmin) return null;
	if (settings.showAdmin === "channel") return null;
	if (!guild?.id || !roles) return null;

	const adminRoles = [];
	for (const role of Object.values(roles)) {
		if (
			(role.permissions & BigInt(8)) === BigInt(8) &&
			(settings.showAdmin === "include" ||
				(settings.showAdmin === "exclude" && !role.tags?.bot_id))
		) {
			adminRoles.push(role);
		}
	}

	if (!adminRoles?.length) {
		return null;
	}

	return (
		<TextElement
			color={TextElement.Colors.STANDARD}
			style={{
				borderTop: "1px solid var(--background-tertiary)",
				padding: 5,
			}}
		>
			Admin roles:
			<div
				style={{
					paddingTop: 5,
				}}
			>
				{adminRoles.map((m) => (
					RolePill ? (
						<RolePill
							key={m.id}
							canRemove={false}
							className={"shc-rolePill"}
							disableBorderColor={true}
							guildId={guild.id}
							onRemove={DiscordConstants.NOOP}
							role={m}
						/>
					) : (
						// Keep admin role visibility even when Discord's pill component is late or renamed.
						<FallbackRolePill key={m.id} label={m.name} />
					)
				))}
			</div>
		</TextElement>
	);
};

export default React.memo(AdminRolesElement);

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
