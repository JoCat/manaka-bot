import { Message, MessageEmbed, TextChannel, Util } from "discord.js"

import { findMessage } from "../../core/Utils"
import Bot from "../../index"
import { Command, CommandCategory } from "../Command"

export class RoleReactionCommand implements Command {
    name = "role-reaction"
    category = CommandCategory.ADMIN
    description = "управление выдачей ролей по реакии"
    usage = ["add [id-сообщения] [id-роли] [emoji]", "remove [token]", "list"]
    aliases = ["rr"]

    async run(message: Message, [method, ...args]: string[]) {
        if (method === undefined) return message.channel.send("**Ошибка при вводе команды!**")

        switch (method) {
            case "add":
                const [messageID, roleID, emoji] = args
                if (messageID === undefined) return message.channel.send("**Ошибка!** Не указан `id` сообщения!")
                if (roleID === undefined) return message.channel.send("**Ошибка!** Не указан `id` роли!")
                if (emoji === undefined) return message.channel.send("**Ошибка!** Не указан Emoji!")

                let parsedEmoji = Util.parseEmoji(emoji)
                if (parsedEmoji === null) return message.channel.send("**Ошибка!** Указан некорректный Emoji!")

                const token = Bot.events.generateToken(messageID, parsedEmoji)
                if (Bot.events.events.has(token))
                    return message.channel.send(
                        "**Ошибка!** Событие на данном сообщении с таким же эмодзи уже существует!"
                    )

                /* Долгая хрень */
                message.channel.send("Поиск сообщения...")
                const msg = await findMessage(message.channel as TextChannel, messageID)
                if (!msg) return message.channel.send("**Ошибка!** Сообщение в данном гилде не найдено!")
                try {
                    await msg.react(parsedEmoji.id == null ? parsedEmoji.name : parsedEmoji.id)
                } catch {
                    return message.channel.send("Ошибка при установке реакции на сообщение")
                }
                Bot.events.addEventListener(messageID, roleID, parsedEmoji)
                message.channel.send(`Уникальный токен события: \`${token}\``)
                break

            case "remove":
                if (args[0] === undefined) return message.channel.send("**Ошибка!** Не указан `token` события!")
                if (Bot.events.removeEventListener(args[0])) message.channel.send("Событие удалёно")
                else message.channel.send("**Ошибка!** Событие не найдено!")
                break

            case "list":
                const list = []
                Bot.events.events.forEach((event, token) => {
                    let emoji = event.emoji.id == null ? event.emoji.name : Bot.client.emojis.cache.get(event.emoji.id)
                    list.push(
                        `Событие: \`${token}\`, Сообщение: \`${event.messageID}\`, Роль: <@&${event.roleID}>, Эмодзи: ${emoji}`
                    )
                })
                if (list.length === 0) list.push("*Список пуст*")
                message.channel.send(
                    new MessageEmbed()
                        .setColor(Bot.config.getProperty("color"))
                        .setDescription(list.join("\n"))
                        .setTitle("Список событий")
                        .setTimestamp()
                        .setFooter("Запросил " + message.author.tag, message.author.avatarURL())
                )
                break

            default:
                message.channel.send(`**Ошибка!** Подкоманда \`${method}\` не найдена!`)
                break
        }
    }
}
