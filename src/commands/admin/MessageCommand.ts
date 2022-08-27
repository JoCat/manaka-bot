import { Message, MessageEmbed, TextChannel } from "discord.js"

import { findMessage } from "../../core/helpers/Utils"
import { Command, CommandCategory } from "../Command"

export class MessageCommand extends Command {
    name = "message"
    category = CommandCategory.ADMIN
    description = "управление сообщениями"
    usage = [
        "get [message_id]",
        "send [текст сообщения]",
        "edit [message_id] [текст сообщения]",
    ]
    aliases = ["m"]

    async run(message: Message, [method, ...args]: string[]): Promise<any> {
        if (method === undefined)
            return message.channel.send("**Ошибка при вводе команды!**")

        switch (method) {
            case "get":
                if (args[0] === undefined)
                    return message.channel.send(
                        "**Ошибка!** Не указан `id` сообщения!"
                    )
                try {
                    const msg = await findMessage(
                        message.channel as TextChannel,
                        args[0]
                    )
                    // TODO придумать что-то с Embed сообщениями
                    message.channel.send({
                        embeds: [
                            new MessageEmbed()
                                .setColor(
                                    this.core.configManager.getConfig().color
                                )
                                .setDescription(msg.content)
                                .setAuthor({
                                    name: msg.author.username,
                                    iconURL: msg.author.avatarURL(),
                                })
                                .setTitle("Содержание сообщения:"),
                        ],
                    })
                } catch (error) {
                    if (error.code === 10008)
                        return message.channel.send("Сообщение не найдено")
                    message.channel.send(
                        "При выполнении команды произошла ошибка"
                    )
                    console.error(error)
                }
                message.delete()
                break

            case "send":
                if (args[0] === undefined)
                    return message.channel.send(
                        "**Ошибка!** Сообщение не может быть пустым!"
                    )
                message.channel.send(message.content.match(/send (.+)/s)[1])
                message.delete()
                break

            case "edit":
                if (args[0] === undefined)
                    return message.channel.send(
                        "**Ошибка!** Не указан `id` сообщения!"
                    )
                if (args[1] === undefined)
                    return message.channel.send(
                        "**Ошибка!** Не указан текст сообщения!"
                    )
                try {
                    const msg = await findMessage(
                        message.channel as TextChannel,
                        args[0]
                    )
                    msg.edit(message.content.match(/edit ([\d]+) (.+)/s)[2])
                } catch (error) {
                    if (error.code === 50005)
                        return message.channel.send(
                            "**Ошибка!** Нельзя редактировать сообщения других пользоветелей!"
                        )
                    message.channel.send(
                        "При выполнении команды произошла ошибка"
                    )
                    console.error(error)
                }
                message.delete()
                break

            default:
                message.channel.send(
                    `**Ошибка!** Подкоманда \`${method}\` не найдена!`
                )
                message.delete()
                break
        }
    }
}
