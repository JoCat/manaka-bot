export interface DiscordEmoji {
    animated: boolean
    name: string
    id: string | null
}

export interface RawDiscordEvent {
    t: string // Event type
    d: object // Event data
}

export interface RawDiscordReactionEvent extends RawDiscordEvent {
    d: {
        guild_id: string
        user_id: string
        message_id: string
        emoji: DiscordEmoji
    }
}
