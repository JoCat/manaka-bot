import { Client, VoiceChannel, VoiceState } from "discord.js"

import CommandManager from "./../commands/CommandManager"
import ConfigManager from "./ConfigManager"
import EventsManager from "./EventsManager"
import JsonDBManager from "./JsonDBManager"

export default class Core {
    client = new Client()
    config = new ConfigManager()
    commands = new CommandManager()
    jsonDB = new JsonDBManager()
    events = new EventsManager()

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

    async voiceStateUpdate(after: VoiceState) {
        const voiceChannels = ["741028100317642802"]
        // TODO Временные костыли, придумать как сделать лучше
        const excludeVoiceChannels = ["741028052103987213", "741029633369178112", "741029687773626429"]

        if (voiceChannels.includes(after.channelID)) {
            after.guild.channels
                .create(`Комната ${after.member.user.username}`, {
                    type: "voice",
                    parent: ((await this.client.channels.fetch(after.channelID)) as VoiceChannel).parent,
                })
                .then((channel) => {
                    channel.overwritePermissions([
                        {
                            id: after.id,
                            allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS", "CONNECT"],
                        },
                    ])
                    after.setChannel(channel)
                })
        }

        // Некоторая магия
        this.client.channels.cache
            .filter((el) => voiceChannels.includes(el.id))
            .forEach((el: VoiceChannel) =>
                el.parent.children
                    .filter(
                        (el) =>
                            !voiceChannels.includes(el.id) &&
                            !excludeVoiceChannels.includes(el.id) &&
                            el.members.size === 0
                    )
                    .forEach((el) => el.delete("В голосовой комнате 0 людей!"))
            )
    }
}
