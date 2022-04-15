import { Message } from "discord.js"

import Bot from "../../index"
import { Command, CommandCategory } from "../Command"

export class StopCommand implements Command {
    name = "stop"
    category = CommandCategory.MUSIC
    description = "отключает бота от вашего голосового канала и очищает очередь"
    usage = [""]

    run(message: Message): any {
        if (!message.member.voice.channel)
            return message.channel.send("Вы не в голосовом канале!")

        const playlist = Bot.music.getPlaylist(message.guild.id)
        if (playlist.getSongs().length === 0)
            return message.channel.send("Музыка не играет, глупый! :cry:")

        playlist.stop()
    }
}
