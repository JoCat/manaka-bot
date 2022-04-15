import { EventEmitter } from "events"
import { basename } from "path"

import { Message, MessageEmbed, TextChannel, VoiceConnection } from "discord.js"
import { stream, validate, video_basic_info } from "play-dl"

import Bot from "../../index"

class Playlist extends EventEmitter {
    private connection: VoiceConnection
    private songs: Track[] = []

    public getSongs(): Track[] {
        return this.songs
    }

    public stop(): void {
        this.songs = []
        this.connection.dispatcher.end() // destroy()?
    }

    public skipTrack(): void {
        this.connection.dispatcher.end() // destroy()?
    }

    public async addTrack(link: string, message: Message): Promise<any> {
        const song = await this.getSongData(link)
        this.songs.push(song)
        if (this.connection)
            return message.channel.send(
                new MessageEmbed()
                    .setColor(Bot.config.getConfig().color)
                    .setTitle("Трек добавлен в очередь")
                    .setDescription(`[${song.title}](${song.url})`)
            )

        try {
            this.connection = await message.member.voice.channel.join()
            this.connection.once("disconnect", () => {
                this.emit("empty")
            })
            await this.playNext(<TextChannel>message.channel)
        } catch (err) {
            console.error(err)
            this.emit("empty")
        }
    }

    private async playNext(channel: TextChannel): Promise<void> {
        const song = this.songs[0]
        if (!song) return this.connection.disconnect()

        channel.send(
            new MessageEmbed()
                .setColor(Bot.config.getConfig().color)
                .setTitle("Сейчас играет")
                .setDescription(`[${song.title}](${song.url})`)
        )

        this.connection
            .play(await this.getInput(song), { volume: false })
            .once("finish", () => {
                this.songs.shift()
                this.playNext(channel)
            })
            .once("error", (error) => {
                console.error(error)
            })
    }

    private async getInput(song: Track) {
        switch (song.type) {
            case "youtube":
                return (
                    await stream(song.url, {
                        discordPlayerCompatibility: true,
                    })
                ).stream

            case "raw":
                return song.url
        }
    }

    private async getSongData(link: string): Promise<Track> {
        const linkType = await validate(link)
        switch (linkType) {
            case "yt_video":
                return await this.getYoutubeSongData(link)
            default:
                return this.getRawLinkSongData(link)
        }
    }

    private async getYoutubeSongData(link: string): Promise<Track> {
        const songInfo = await video_basic_info(link)

        return {
            type: "youtube",
            title: songInfo.video_details.title,
            url: songInfo.video_details.url,
        }
    }

    private getRawLinkSongData(link: string): Track {
        return {
            type: "raw",
            title: basename(link), // мб чё придумать (парсить мету ID3)
            url: link,
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
    type: "youtube" | "raw"
    title: string
    url: string
}

export default Playlist
