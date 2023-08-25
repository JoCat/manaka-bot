import { GuildManager } from "discord.js"

import { DiscordEmoji, RawDiscordReactionEvent } from "../../../types"

export default class EventHandler {
    constructor(
        private guilds: GuildManager,
        public messageID: string,
        public roleID: string,
        public emoji: DiscordEmoji,
    ) {}

    async handler(data: RawDiscordReactionEvent): Promise<void> {
        let reactMember = await (
            await this.guilds.fetch(data.d.guild_id)
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
