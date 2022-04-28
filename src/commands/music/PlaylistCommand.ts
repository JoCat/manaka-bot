import Playlist from "core/music/Playlist"
import { Message, MessageEmbed } from "discord.js"

import Bot from "../../index"
import { Command, CommandCategory } from "../Command"

export class PlaylistCommand implements Command {
    name = "playlist"
    category = CommandCategory.MUSIC
    description = "показывает всю музыку, добавленную в очередь"
    usage = [""]
    aliases = ["pl", "plist", "list"]

    async run(message: Message): Promise<any> {
        if (!message.member.voice.channel)
            return message.channel.send("Вы не в голосовом канале!")
        if (!Bot.music.hasPlaylist(message.guild.id))
            return message.channel.send("Плейлист пуст!")

        const serverPlaylist = Bot.music.getPlaylist(message.guild.id)
        const playlist = getTracks(serverPlaylist)
        const msg = await message.channel.send(getEmbed(playlist))

        message.delete()
        await msg.react("⬅️")
        await msg.react("➡️")
        let page = 0

        const collector = msg.createReactionCollector((reaction, user) => {
            return (
                ["⬅️", "➡️"].includes(reaction.emoji.name) &&
                user.id === message.author.id
            )
        })
        collector.on("collect", async (reaction, user) => {
            await reaction.users.remove(user)
            const playlistCount = serverPlaylist.getSongs().length
            const pages = Math.floor(playlistCount / 10)
            const emoji = reaction.emoji.name

            if (emoji === "⬅️" && page !== 0) --page
            else if (emoji === "➡️" && page !== pages) ++page
            else return

            const playlist = getTracks(serverPlaylist, page)
            msg.edit(getEmbed(playlist, page))
        })
    }
}

function getTracks(serverPlaylist: Playlist, page = 0) {
    const songs = serverPlaylist.getSongs()
    const playlist = songs
        .slice(10 * page, (page + 1) * 10)
        .map(
            (song, i) =>
                `**${1 + i + 10 * page}. [${song.title}](${song.url})**`
        )
    return { songsCount: songs.length, playlist }
}

function getEmbed(
    { songsCount, playlist }: { songsCount: number; playlist: string[] },
    page = 0
) {
    return new MessageEmbed()
        .setColor(Bot.config.getConfig().color)
        .setDescription(playlist.join("\n"))
        .setTitle("Плейлист")
        .addField("Всего треков в плейлисте", songsCount, true)
        .addField("Текущая страница", ++page, true)
}
