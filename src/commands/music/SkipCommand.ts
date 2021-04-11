import { Message } from "discord.js"

import Bot from "../../index"
import { Command, CommandCategory } from "../Command"

export class SkipCommand implements Command {
    name = "skip"
    category = CommandCategory.MUSIC
    description = "переходит к следующему треку из списка"
    usage = [""]

    run(message: Message): any {
        if (!message.member.voice.channel) return message.channel.send("Вы не в голосовом канале!")
        try {
            Bot.music.getPlaylist(message.guild.id).skipTrack()
        } catch (error) {
            message.channel.send(error)
        }
        message.delete()
    }
}
