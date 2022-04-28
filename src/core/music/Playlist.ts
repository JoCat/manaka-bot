import { EventEmitter } from "events"
import { basename } from "path"

import { Message, MessageEmbed, TextChannel, VoiceConnection } from "discord.js"
import { playlist_info, stream, validate, video_basic_info } from "play-dl"

import Bot from "../../index"

class Playlist extends EventEmitter {
    private connection: VoiceConnection
    private songs: Track[] = []

    public getSongs(): Track[] {
        return this.songs
    }

    public stop(): void {
        this.songs = []
        this.connection.dispatcher.end()
    }

    public skipTrack(): void {
        this.connection.dispatcher.end()
    }

    public async addTrack(
        link: string,
        message: Message,
        next = false
    ): Promise<any> {
        const songs = await this.getSongsData(link)

        if (next) this.songs.splice(1, 0, ...songs)
        else this.songs.push(...songs)

        if (this.connection) {
            if (songs.length > 1) {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(Bot.config.getConfig().color)
                        .setTitle("Плейлист добавлен в очередь")
                )
            }
            return message.channel.send(
                new MessageEmbed()
                    .setColor(Bot.config.getConfig().color)
                    .setTitle("Трек добавлен в очередь")
                    .setDescription(`[${songs[0].title}](${songs[0].url})`)
            )
        }

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

    private async getSongsData(link: string): Promise<Track[]> {
        const linkType = await validate(link)
        switch (linkType) {
            case "yt_video":
                return [await this.getYoutubeSongData(link)]
            case "yt_playlist":
                return this.getYoutubePlaylistData(link)
            default:
                return [this.getRawLinkSongData(link)]
        }
    }

    private async getYoutubePlaylistData(link: string): Promise<Track[]> {
        const playlist = await playlist_info(link, { incomplete: true })
        const videos = await playlist.all_videos()

        return videos.map((video) => ({
            type: "youtube",
            title: video.title,
            url: video.url,
        }))
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
