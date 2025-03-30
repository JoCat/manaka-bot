import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    parseEmoji,
} from "discord.js"

import { Message } from "commands/CommandManager"

import { findMessage } from "../../core/helpers/Utils"
import { Command, CommandCategory } from "../Command"

export class RoleReactionCommand extends Command {
    name = "role-reaction"
    category = CommandCategory.ADMIN
    description = "управление выдачей ролей по реакии"
    usage = ["add [id-сообщения] [id-роли] [emoji]", "remove [token]", "list"]
    aliases = ["rr"]

    commandData = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Добавить реакцию")
                .addStringOption((option) =>
                    option
                        .setName("message-id")
                        .setDescription("ID сообщения")
                        .setRequired(true),
                )
                .addRoleOption((option) =>
                    option
                        .setName("role")
                        .setDescription("Роль")
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName("emoji")
                        .setDescription("Эмодзи")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Удалить реакцию")
                .addStringOption((option) =>
                    option
                        .setName("token")
                        .setDescription("Токен реакции")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("list").setDescription("Вывести список реакций"),
        )

    async run(message: Message, [method]: string[]) {
        if (method === undefined) {
            return message.channel.send("**Ошибка при вводе команды!**")
        }

        if (["add", "remove", "list"].includes(method)) {
            return message.channel.send("Используйте /role-reaction " + method)
        }

        message.channel.send(`**Ошибка!** Подкоманда \`${method}\` не найдена!`)
    }

    execute(interaction: ChatInputCommandInteraction<"cached">) {
        const method = interaction.options.getSubcommand()
        this[method](interaction)
    }

    async add(interaction: ChatInputCommandInteraction<"cached">) {
        const messageID = interaction.options.getString("message-id", true)
        const roleID = interaction.options.getRole("role", true).id
        const emoji = interaction.options.getString("emoji", true)

        const parsedEmoji = parseEmoji(emoji)
        if (parsedEmoji === null) {
            return interaction.reply({
                content: "**Ошибка!** Указан некорректный Emoji!",
                ephemeral: true,
            })
        }

        const token = this.core.eventsManager.generateToken(
            messageID,
            parsedEmoji,
        )
        if (this.core.eventsManager.hasEvent(token)) {
            return interaction.reply({
                content:
                    "**Ошибка!** Событие на данном сообщении с таким же эмодзи уже существует!",
                ephemeral: true,
            })
        }

        interaction.reply({
            content: "Поиск сообщения...",
            ephemeral: true,
        })

        /* Долгая хрень */
        const message = await findMessage(interaction.channel, messageID)
        if (!message) {
            return interaction.editReply(
                "**Ошибка!** Сообщение в данном гилде не найдено!",
            )
        }

        try {
            await message.react(
                parsedEmoji.id == null ? parsedEmoji.name : parsedEmoji.id,
            )
        } catch {
            return interaction.editReply(
                "Ошибка при установке реакции на сообщение",
            )
        }
        this.core.eventsManager.addEventListener(messageID, roleID, parsedEmoji)
        interaction.editReply(`Уникальный токен события: \`${token}\``)
    }

    remove(interaction: ChatInputCommandInteraction<"cached">) {
        const token = interaction.options.getString("token", true)
        if (this.core.eventsManager.removeEventListener(token)) {
            interaction.reply({
                content: "Событие удалено",
                ephemeral: true,
            })
        } else {
            interaction.reply({
                content: "Событие не найдено",
                ephemeral: true,
            })
        }
    }

    list(interaction: ChatInputCommandInteraction<"cached">) {
        const list = []
        this.core.eventsManager.getEvents().forEach((event, token) => {
            const emoji =
                event.emoji.id == null
                    ? event.emoji.name
                    : this.core.client.emojis.cache.get(event.emoji.id)
            list.push(
                `Событие: \`${token}\`, Сообщение: \`${event.messageID}\`, Роль: <@&${event.roleID}>, Эмодзи: ${emoji}`,
            )
        })
        if (list.length === 0) list.push("*Список пуст*")
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(this.core.configManager.getConfig().color)
                    .setDescription(list.join("\n"))
                    .setTitle("Список событий"),
            ],
        })
    }
}
