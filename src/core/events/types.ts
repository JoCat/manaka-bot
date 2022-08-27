export interface DiscordEmoji {
    animated: boolean
    name: string | null
    id: string | null
}

// https://discord.com/developers/docs/topics/gateway#payloads

export interface RawDiscordEvent {
    t: string // Event type
    d: object // Event data
}

// https://discord.com/developers/docs/topics/gateway#message-reaction-add

export interface RawDiscordReactionEvent extends RawDiscordEvent {
    d: {
        guild_id: string
        user_id: string
        message_id: string
        emoji: DiscordEmoji
    }
}
