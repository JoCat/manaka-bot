import { Message } from "discord.js"

import { Command, CommandCategory } from "../Command"

export class SkipCommand extends Command {
    name = "skip"
    category = CommandCategory.MUSIC
    description = "переходит к следующему треку из списка"
    usage = [""]

    run(message: Message): any {
        if (!message.member.voice.channel)
            return message.channel.send("Вы не в голосовом канале!")

        const playlist = this.core.musicManager.getPlaylist(message.guild.id)
        if (playlist.getSongs().length === 0)
            return message.channel.send("Список пуст, пропускать нечего! :cry:")

        playlist.skipTrack()
    }
}
