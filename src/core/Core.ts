import { Client, VoiceChannel, VoiceState } from "discord.js"

import CommandManager from "./../commands/CommandManager"
import ConfigManager from "./ConfigManager"
import EventsManager from "./EventsManager"
import JsonDBManager from "./JsonDBManager"
import MusicManager from "./music/MusicManager"

export default class Core {
    client = new Client()
    config = new ConfigManager()
    commands = new CommandManager()
    jsonDB = new JsonDBManager()
    events = new EventsManager()
    music = new MusicManager()

    constructor() {
        this.client.on("message", (m) => this.commands.executeCommand(m))
        this.client.on("voiceStateUpdate", (_, after) => this.voiceStateUpdate(after))
        this.client.on("ready", () => {
            this.events.init() // пофиксить
            console.log("Bot started")
            this.client.user.setActivity(`${this.config.getProperty("prefix")} help`, { type: "LISTENING" })
        })
        this.client.login(this.config.botToken)
    }

    async voiceStateUpdate(after: VoiceState): Promise<void> {
        const voiceChannels = ["741028100317642802"]

        if (voiceChannels.includes(after.channelID)) {
            after.guild.channels
                .create(`Комната ${after.member.user.username}`, {
                    type: "voice",
                    parent: ((await this.client.channels.fetch(after.channelID)) as VoiceChannel).parent,
                })
                .then((channel) => {
                    channel.createOverwrite(after.id, {
                        VIEW_CHANNEL: true,
                        MANAGE_CHANNELS: true,
                        CONNECT: true,
                    })
                    after.setChannel(channel)
                })
        }

        // Некоторая магия
        this.client.channels.cache
            .filter((el) => voiceChannels.includes(el.id))
            .forEach((el: VoiceChannel) =>
                el.parent.children
                    .filter((c) => c.type === "voice" && c.members.size === 0 && !voiceChannels.includes(c.id))
                    .forEach((c) => c.delete("В голосовой комнате 0 людей!"))
            )
    }
}
