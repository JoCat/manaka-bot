import { APIPartialEmoji } from "discord.js"

export type DiscordEmoji = APIPartialEmoji

// https://discord.com/developers/docs/topics/gateway#payloads
export interface RawDiscordEvent {
    t: string // Event type
    d: object // Event data
}

// https://discord.com/developers/docs/topics/gateway#message-reaction-add
export interface RawDiscordReactionEvent extends RawDiscordEvent {
    d: {
        user_id: string
        guild_id: string
        channel_id: string
        message_id: string
        emoji: DiscordEmoji
    }
}
