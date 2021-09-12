import { EventEmitter } from "events"

import { Message, MessageEmbed, TextChannel, VoiceConnection } from "discord.js"
import ytdl, { getInfo } from "ytdl-core-discord"

import Bot from "../../index"

type ReturnPromiseType<T extends (...args: any) => Promise<any>> = T extends (
    ...args: any
) => Promise<infer R>
    ? R
    : any

class Playlist extends EventEmitter {
    private connection: VoiceConnection
    private songs: Track[] = []
    // private volume = 100

    getSongs(): Track[] {
        return this.songs
    }

    stop(): void {
        // TODO Вынести в команду
        if (this.songs.length === 0)
            throw new Error("Музыка не играет, глупый! :cry:")
        this.songs = []
        this.connection.dispatcher.end() // destroy()?
    }

    skipTrack(): void {
        // TODO Вынести в команду
        if (this.songs.length === 0)
            throw new Error("Список пуст, пропускать нечего! :cry:")
        this.connection.dispatcher.end() // destroy()?
    }

    async addTrack(link: string, message: Message): Promise<any> {
        const song = await this.getSongData(link)
        this.songs.push(song)
        if (this.connection)
            return message.channel.send(`${song.title} добавлена в очередь!`)

        try {
            this.connection = await message.member.voice.channel.join()
            this.connection.on("disconnect", () => {
                this.emit("empty")
            })
            await this.playNext(message.channel as TextChannel)
        } catch (err) {
            console.error(err)
            this.emit("empty")
        }
    }

    private async playNext(channel: TextChannel): Promise<boolean> {
        const song = this.songs[0]

        if (!song) {
            this.connection.disconnect()
            return this.emit("empty")
        }

        channel.send(
            new MessageEmbed()
                .setColor(Bot.config.getConfig().color)
                .setTitle("Сейчас играет:")
                .setDescription(`:musical_note: ${song.title}`)
        )

        // https://v12.discordjs.guide/voice/optimisation-and-troubleshooting.html#disabling-inline-volume
        this.connection
            .play(await ytdl(song.url), { type: "opus", volume: false })
            .once("finish", () => {
                this.songs.shift()
                this.playNext(channel)
            })
            .once("error", (error) => {
                console.error(error)
            })
        // dispatcher.setVolumeLogarithmic(this.volume / 100)
    }

    private async getSongData(link: string): Promise<Track> {
        let songInfo: ReturnPromiseType<typeof getInfo>
        try {
            songInfo = await getInfo(link)
        } catch (error) {
            throw new Error("Некорректная ссылка!")
        }

        return {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        }
    }
}

declare interface Playlist {
    on(event: "empty", listener: () => void): this
    once(event: "empty", listener: () => void): this
    addListener(event: "empty", listener: () => void): this
    removeListener(event: "empty", listener: () => void): this
    emit(event: "empty"): boolean
}

interface Track {
    title: string
    url: string
}

export default Playlist
