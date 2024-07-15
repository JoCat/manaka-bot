import { ActivityType, Client, GatewayIntentBits } from "discord.js"

import CommandManager from "./../commands/CommandManager"
import ConfigManager from "./ConfigManager"
import EventsManager from "./modules/reactRoles/EventsManager"
import JsonDBManager from "./JsonDBManager"
import MusicManager from "./music/MusicManager"
import { VoiceRooms } from "./modules/voiceRooms"

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
    musicManager = new MusicManager(this)
    eventsManager: EventsManager

    constructor() {
        new VoiceRooms(this)

        this.client.on("ready", () => {
            this.eventsManager = new EventsManager(this)

            this.client.user.setActivity(
                "/help | " + this.client.guilds.cache.size + " Servers",
                { type: ActivityType.Watching },
            )
            console.log("Bot started")
        })
        this.client.login(this.configManager.botToken)
    }
}
