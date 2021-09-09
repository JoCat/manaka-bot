import { Message } from "discord.js"

import Bot from "../../index"
import { Command, CommandCategory } from "../Command"

export class PlayCommand implements Command {
    name = "play"
    category = CommandCategory.MUSIC
    description = "воспроизводит музыку или добавляет её в очередь"
    usage = ["[ссылка на youtube видео/трансляцию]"]
    aliases = ["p"]

    async run(message: Message, [link]: string[]): Promise<any> {
        if (link === undefined)
            return message.channel.send("Вы не указали ссылку!")
        if (!message.member.voice.channel)
            return message.channel.send("Вы не в голосовом канале!")
        try {
            await Bot.music
                .getPlaylist(message.guild.id)
                .addTrack(link, message)
        } catch (error) {
            return message.channel.send(error.message)
        }
        message.delete()
    }
}
