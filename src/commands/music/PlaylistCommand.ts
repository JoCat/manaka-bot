import { Message, MessageEmbed } from "discord.js"

import Bot from "../../index"
import { Command, CommandCategory } from "../Command"

export class PlaylistCommand implements Command {
    name = "playlist"
    category = CommandCategory.MUSIC
    description = "показывает всю музыку, добавленную в очередь"
    usage = [""]
    aliases = ["pl", "plist"]

    async run(message: Message): Promise<any> {
        if (!message.member.voice.channel) return message.channel.send("Вы не в голосовом канале!")
        if (!Bot.music.hasPlaylist(message.guild.id)) return message.channel.send("Плейлист пуст!")

        const serverPlaylist = Bot.music.getPlaylist(message.guild.id).getSongs()
        const playlist = serverPlaylist.map((song, i) => `**${i + 1}. [${song.title}](${song.url})**`)

        message.channel.send(
            new MessageEmbed()
                .setColor(Bot.config.getProperty("color"))
                .setDescription(playlist.join("\n"))
                .setTitle("Плейлист")
        )
        message.delete()
    }
}
