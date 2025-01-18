import { GuildManager } from "discord.js"

import { DiscordEmoji, RawDiscordReactionEvent } from "../../../types"

export default class EventHandler {
    constructor(
        public messageID: string,
        public roleID: string,
        public emoji: DiscordEmoji,
    ) {}

    async handler(guildManager: GuildManager, data: RawDiscordReactionEvent) {
        let reactMember = await (
            await guildManager.fetch(data.d.guild_id)
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
