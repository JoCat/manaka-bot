import {
    ActivityType,
    ChannelType,
    Client,
    GatewayIntentBits,
    VoiceChannel,
    VoiceState,
} from "discord.js"

import CommandManager from "./../commands/CommandManager"
import ConfigManager from "./ConfigManager"
import EventsManager from "./events/EventsManager"
import JsonDBManager from "./JsonDBManager"
import MusicManager from "./music/MusicManager"

export default class Core {
    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.MessageContent,
        ],
    })
    configManager = new ConfigManager()
    commandsManager = new CommandManager(this)
    jsonDBManager = new JsonDBManager()
    eventsManager = new EventsManager(this)
    musicManager = new MusicManager(this)

    constructor() {
        this.client.on("messageCreate", (message) => {
            this.commandsManager.executeCommand(message)
        })
        this.client.on("voiceStateUpdate", (_, after: VoiceState) =>
            this.voiceStateUpdate(after)
        )
        this.client.on("ready", () => {
            console.log("Bot started")
            if (!this.configManager.dev) {
                this.client.user.setActivity(
                    `${this.configManager.getConfig().prefix} help`,
                    { type: ActivityType.Watching }
                )
            }
        })
        this.client.login(this.configManager.botToken)
    }

    private async voiceStateUpdate(state: VoiceState): Promise<void> {
        const voiceChannels = ["741028100317642802"] // TODO вынести в бд + команда

        if (voiceChannels.includes(state.channelId)) {
            state.guild.channels
                .create({
                    name: `Комната ${state.member.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: state.channel.parent,
                })
                .then((channel) => {
                    channel.permissionOverwrites.edit(state.id, {
                        ViewChannel: true,
                        ManageChannels: true,
                        Connect: true,
                    })
                    state.setChannel(channel)
                })
        }

        // Некоторая магия
        this.client.channels.cache
            .filter((channel) => voiceChannels.includes(channel.id))
            .forEach((channel: VoiceChannel) =>
                channel.parent.children.cache
                    .filter(
                        (channel) =>
                            channel.type === ChannelType.GuildVoice &&
                            channel.members.size === 0 &&
                            !voiceChannels.includes(channel.id)
                    )
                    .forEach((channel) => channel.delete("Комната пуста"))
            )
    }
}
