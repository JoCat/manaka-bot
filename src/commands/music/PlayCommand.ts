import { Message } from "commands/CommandManager"
import { Command, CommandCategory } from "../Command"

export class PlayCommand extends Command {
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
            await this.core.musicManager
                .getPlaylist(message.guild.id)
                .addTrack(link, message)
        } catch (error) {
            return message.channel.send(error.message)
        }
        message.delete()
    }
}
