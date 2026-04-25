import type DiscordChannel from "discord-types/general/Channel";

/** Discord Channel extended with the `isHidden` method added by the SHC patcher */
export interface SHCChannel extends DiscordChannel {
	isHidden(): boolean;
	isGuildVocal(): boolean;
	iconEmoji?: { name?: string; id?: string };
}

export interface ChannelRendererInstance {
	channel: SHCChannel;
	connected: boolean;
}
