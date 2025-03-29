import { Message } from "commands/CommandManager"

import { Command, CommandCategory } from "../Command"

export class PlayNextCommand extends Command {
    name = "playnext"
    category = CommandCategory.MUSIC
    description = "воспроизводит музыку или добавляет её в очередь следующей"
    usage = ["[ссылка на youtube видео/трансляцию]"]
    aliases = ["pn", "px"]

    async run(message: Message, [link]: string[]): Promise<any> {
        if (link === undefined)
            return message.channel.send("Вы не указали ссылку!")
        if (!message.member.voice.channel)
            return message.channel.send("Вы не в голосовом канале!")
        try {
            await this.core.musicManager
                .getPlaylist(message.guild.id)
                .addTrack(link, message, true)
        } catch (error) {
            return message.channel.send(error.message)
        }
        message.delete()
    }
}
