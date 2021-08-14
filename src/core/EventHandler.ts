import Bot from "../index"

export default class EventHandler {
    messageID: string
    roleID: string
    emoji: any
    token: string
    handler: (data: any) => void

    constructor(messageID: string, roleID: string, emoji: any, token: string) {
        this.messageID = messageID
        this.roleID = roleID
        this.emoji = emoji
        this.token = token
        this.handler = this.eventHandler
    }

    async eventHandler(data: any): Promise<void> {
        let reactMember = await (await Bot.client.guilds.fetch(data.d.guild_id)).members.fetch(data.d.user_id)
        if (reactMember.user.bot) return

        // Обновляем инфу
        reactMember = await reactMember.fetch(true)

        if (data.t === "MESSAGE_REACTION_ADD" && !reactMember.roles.cache.has(this.roleID)) {
            reactMember.roles.add(this.roleID)
        }

        if (data.t === "MESSAGE_REACTION_REMOVE" && reactMember.roles.cache.has(this.roleID)) {
            reactMember.roles.remove(this.roleID)
        }
    }
}
