import { Message } from "discord.js"

import Bot from "../../index"
import { Command, CommandCategory } from "../Command"

export class SkipCommand implements Command {
    name = "skip"
    category = CommandCategory.MUSIC
    description = "переходит к следующему треку из списка"
    usage = [""]

    run(message: Message): any {
        if (!message.member.voice.channel)
            return message.channel.send("Вы не в голосовом канале!")

        const playlist = Bot.music.getPlaylist(message.guild.id)
        if (playlist.getSongs().length === 0)
            return message.channel.send("Список пуст, пропускать нечего! :cry:")

        playlist.skipTrack()
    }
}
