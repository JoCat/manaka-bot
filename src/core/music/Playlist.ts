import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnection,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} from "@discordjs/voice"
import { EmbedBuilder, TextChannel } from "discord.js"
import { EventEmitter } from "events"
import { createReadStream } from "fs"
import { basename } from "path"
import { playlist_info, stream, validate, video_basic_info } from "play-dl"

import { Message } from "commands/CommandManager"
import Core from "core/Core"

// Я начал переписывать и чёт заебался XD

class Playlist extends EventEmitter implements IPlaylist {
    private connection: VoiceConnection
    private player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Stop,
        },
    })
    private songs: Track[] = []

    constructor(private core: Core) {
        super()
    }

    public getSongs(): Track[] {
        return this.songs
    }

    public stop(): void {
        this.songs = []
        this.player.stop()
    }

    public skipTrack(): void {
        this.player.stop()
    }

    public async addTrack(
        link: string,
        message: Message,
        next = false,
    ): Promise<any> {
        const songs = await this.getSongsData(link)

        if (next) this.songs.splice(1, 0, ...songs)
        else this.songs.push(...songs)

        if (this.connection) {
            if (songs.length > 1) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.core.configManager.getConfig().color)
                            .setTitle("Плейлист добавлен в очередь"),
                    ],
                })
            }
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(this.core.configManager.getConfig().color)
                        .setTitle("Трек добавлен в очередь")
                        .setDescription(`[${songs[0].title}](${songs[0].url})`),
                ],
            })
        }

        try {
            this.connection = joinVoiceChannel({
                channelId: message.member.voice.channelId,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            })
            this.connection.subscribe(this.player)
            this.connection.once(VoiceConnectionStatus.Destroyed, () => {
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
        if (!song) {
            this.connection.destroy()
            return
        }

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(this.core.configManager.getConfig().color)
                    .setTitle("Сейчас играет")
                    .setDescription(`[${song.title}](${song.url})`),
            ],
        })

        this.player.play(await this.getInput(song))
        this.player
            .once(AudioPlayerStatus.Idle, () => {
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
                return createAudioResource(
                    (
                        await stream(song.url, {
                            discordPlayerCompatibility: true,
                        })
                    ).stream,
                )

            case "raw":
                return createAudioResource(createReadStream(song.url))
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

declare interface IPlaylist {
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
