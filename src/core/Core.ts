import { Client, VoiceChannel, VoiceState } from "discord.js"

import CommandManager from "./../commands/CommandManager"
import ConfigManager from "./ConfigManager"
import EventsManager from "./events/EventsManager"
import JsonDBManager from "./JsonDBManager"
import MusicManager from "./music/MusicManager"

export default class Core {
    client = new Client()
    configManager = new ConfigManager()
    commandsManager = new CommandManager(this)
    jsonDBManager = new JsonDBManager()
    eventsManager = new EventsManager(this)
    musicManager = new MusicManager(this)

    constructor() {
        this.client.on("message", (message) =>
            this.commandsManager.executeCommand(message)
        )
        this.client.on("voiceStateUpdate", (_, after: VoiceState) =>
            this.voiceStateUpdate(after)
        )
        this.client.on("ready", () => {
            console.log("Bot started")

            if (!this.configManager.dev) {
                this.client.user.setActivity(
                    `${this.configManager.getConfig().prefix} help`,
                    { type: "WATCHING" }
                )
            }
        })
        this.client.login(this.configManager.botToken)
    }

    private async voiceStateUpdate(after: VoiceState): Promise<void> {
        const voiceChannels = ["741028100317642802"] // TODO вынести в бд + команда

        if (voiceChannels.includes(after.channelID)) {
            after.guild.channels
                .create(`Комната ${after.member.user.username}`, {
                    type: "voice",
                    parent: (
                        (await this.client.channels.fetch(
                            after.channelID
                        )) as VoiceChannel
                    ).parent,
                })
                .then((channel) => {
                    // channel.permissionOverwrites.edit(after.id, {
                    //     VIEW_CHANNEL: true,
                    //     MANAGE_CHANNELS: true,
                    //     CONNECT: true,
                    // })
                    after.setChannel(channel)
                })
        }

        // Некоторая магия
        this.client.channels.cache
            .filter((el) => voiceChannels.includes(el.id))
            .forEach((el: VoiceChannel) =>
                el.parent.children
                    .filter(
                        (c) =>
                            c.type === "voice" &&
                            c.members.size === 0 &&
                            !voiceChannels.includes(c.id)
                    )
                    .forEach((c) => c.delete("В голосовой комнате 0 людей!"))
            )
    }
}
