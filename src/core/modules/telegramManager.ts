import { Events } from "discord.js"
import { Telegraf } from "telegraf"
import { ChatFromGetChat } from "telegraf/typings/core/types/typegram"

import { Message } from "commands/CommandManager"
import Core from "core/Core"

export class TelegramManager {
    private botInstance: Telegraf
    private channelsMappingDiscordToTelegram: Map<string, number> = new Map()
    private channelsMappingTelegramToDiscord: Map<number, string> = new Map()

    constructor(private core: Core) {
        this.botInstance = new Telegraf(core.configService.tgBotToken)
        this.init()
        this.botInstance.launch()

        // Enable graceful stop
        process.once("SIGINT", () => this.botInstance.stop("SIGINT"))
        process.once("SIGTERM", () => this.botInstance.stop("SIGTERM"))
    }

    init() {
        this.core.jsonDBManager
            .getData("telegramChannels")
            .forEach((binding) => {
                this.createConnection(binding.channelId, binding.chatId)
            })

        this.botInstance.on("message", (ctx) => {
            const channelId = this.channelsMappingTelegramToDiscord.get(
                ctx.chat.id,
            )
            if (!channelId) return

            this.core.client.channels.fetch(channelId).then((channel) => {
                if (channel.isSendable()) {
                    channel.send(
                        `*${ctx.from.first_name} ${ctx.from.last_name} (${ctx.from.username}):* ${ctx.text}`,
                    )
                }
            })
        })

        this.core.client.on(Events.MessageCreate, (message: Message) => {
            if (!message.inGuild() || message.author.bot) return

            const channelId = message.channelId
            const chatId = this.channelsMappingDiscordToTelegram.get(channelId)
            if (!chatId) return

            this.botInstance.telegram.sendMessage(
                chatId,
                `${message.author.displayName} (${message.author.username}): ${message.content}`,
            )
        })
    }

    private createConnection(channelId: string, chatId: number) {
        this.channelsMappingDiscordToTelegram.set(channelId, chatId)
        this.channelsMappingTelegramToDiscord.set(chatId, channelId)
    }

    async createBinding(guildId: string, channelId: string, chatId: number) {
        if (this.channelsMappingDiscordToTelegram.has(channelId)) {
            throw new Error("Канал уже подключен к чату")
        }

        let chat: ChatFromGetChat
        try {
            chat = await this.botInstance.telegram.getChat(chatId)
        } catch {
            throw new Error(
                "Чат не найден! Проверьте ID чата или наличие бота в нём.",
            )
        }

        if (chat.type !== "group" && chat.type !== "supergroup") {
            throw new Error("Чат должен быть группой или супергруппой")
        }

        this.core.jsonDBManager.addData("telegramChannels", {
            guildId: guildId,
            channelId: channelId,
            chatId,
        })

        this.createConnection(channelId, chatId)
    }

    removeBinding(guildId: string, channelId: string) {
        const channelRecord = this.core.jsonDBManager
            .getData("telegramChannels")
            .find((e) => e.channelId === channelId)

        if (!channelRecord) {
            throw new Error("Канал не подключен к чату")
        }

        if (channelRecord.guildId !== guildId) {
            throw new Error("У вас нет прав на удаление этого канала")
        }

        this.core.jsonDBManager.deleteData(
            "telegramChannels",
            "channelId",
            channelId,
        )

        this.channelsMappingDiscordToTelegram.delete(channelId)
        this.channelsMappingTelegramToDiscord.delete(channelRecord.chatId)
    }

    listBindings(guildId: string) {
        return this.core.jsonDBManager
            .getData("telegramChannels")
            .filter((e) => e.guildId === guildId)
    }
}
