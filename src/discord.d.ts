import type DiscordChannel from "discord-types/general/Channel";

/** Discord Channel extended with SHC-specific methods and properties */
export interface SHCChannel extends DiscordChannel {
	isGuildVocal(): boolean;
	iconEmoji?: { name?: string; id?: string };
}

export interface ChannelRendererInstance {
	channel: SHCChannel;
	connected: boolean;
}
