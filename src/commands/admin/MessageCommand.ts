import { findMessage } from "../../core/Utils"
import { Message, MessageEmbed, TextChannel } from "discord.js"

import Bot from "../../index"
import { Command, CommandCategory } from "../Command"

export class MessageCommand implements Command {
    name = "message"
    category = CommandCategory.ADMIN
    description = "управление сообщениями"
    usage = ["get [message_id]", "send [текст сообщения]", "edit [message_id] [текст сообщения]"]
    aliases = ["m"]

    run(message: Message, [method, ...args]: string[]): any {
        if (method === undefined) return message.channel.send("**Ошибка при вводе команды!**")

        switch (method) {
            case "get":
                if (args[0] === undefined) return message.channel.send("**Ошибка!** Не указан `id` сообщения!")

                findMessage(message.channel as TextChannel, args[0])
                    .then((msg) => {
                        // TODO придумать что-то с Embed сообщениями
                        message.channel.send(
                            new MessageEmbed()
                                .setColor(Bot.config.getProperty("color"))
                                .setDescription(msg.content)
                                .setAuthor(msg.author.username, msg.author.avatarURL())
                                .setTitle("Содержание сообщения:")
                        )
                    })
                    .catch((e) => {
                        if (e.code === 10008) message.channel.send("Сообщение не найдено")
                        else {
                            message.channel.send("При выполнении команды произошла ошибка")
                            console.error(e)
                        }
                    })
                message.delete()
                break

            case "send":
                if (args[0] === undefined) return message.channel.send("**Ошибка!** Сообщение не может быть пустым!")

                message.channel.send(message.content.match(/send (.+)/s)[1])
                message.delete()
                break

            case "edit":
                if (args[0] === undefined) return message.channel.send("**Ошибка!** Не указан `id` сообщения!")
                if (args[1] === undefined) return message.channel.send("**Ошибка!** Не указан текст сообщения!")

                findMessage(message.channel as TextChannel, args[0])
                    .then((msg) => msg.edit(message.content.match(/message edit ([\d]+) (.+)/s)[2]))
                    .catch((e) => {
                        if (e.code === 50005)
                            message.channel.send("**Ошибка!** Нельзя редактировать сообщения других пользоветелей!")
                        else {
                            message.channel.send("При выполнении команды произошла ошибка")
                            console.error(e)
                        }
                    })
                message.delete()
                break

            default:
                message.channel.send(`**Ошибка!** Подкоманда \`${method}\` не найдена!`)
                message.delete()
                break
        }
    }
}
