import { Message } from "commands/CommandManager"
import { Command, CommandCategory } from "../Command"

export class StopCommand extends Command {
    name = "stop"
    category = CommandCategory.MUSIC
    description = "отключает бота от вашего голосового канала и очищает очередь"
    usage = [""]

    run(message: Message): any {
        if (!message.member.voice.channel)
            return message.channel.send("Вы не в голосовом канале!")

        const playlist = this.core.musicManager.getPlaylist(message.guild.id)
        if (playlist.getSongs().length === 0)
            return message.channel.send("Музыка не играет, глупый! :cry:")

        playlist.stop()
    }
}
