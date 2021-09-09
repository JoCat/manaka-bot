import Bot from "../../index"
import { DiscordEmoji, RawDiscordReactionEvent } from "./types"

export default class EventHandler {
    messageID: string
    roleID: string
    emoji: DiscordEmoji
    handler: (data: any) => void

    constructor(messageID: string, roleID: string, emoji: DiscordEmoji) {
        this.messageID = messageID
        this.roleID = roleID
        this.emoji = emoji
        this.handler = this.eventHandler
    }

    async eventHandler(data: RawDiscordReactionEvent): Promise<void> {
        let reactMember = await (
            await Bot.client.guilds.fetch(data.d.guild_id)
        ).members.fetch(data.d.user_id)
        if (reactMember.user.bot) return

        // Обновляем инфу о юзере (дабы не объебаться на кэше)
        reactMember = await reactMember.fetch(true)

        if (
            data.t === "MESSAGE_REACTION_ADD" &&
            !reactMember.roles.cache.has(this.roleID)
        ) {
            reactMember.roles.add(this.roleID)
        }

        if (
            data.t === "MESSAGE_REACTION_REMOVE" &&
            reactMember.roles.cache.has(this.roleID)
        ) {
            reactMember.roles.remove(this.roleID)
        }
    }
}
