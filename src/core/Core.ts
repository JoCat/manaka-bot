import { ActivityType, Client, GatewayIntentBits } from "discord.js"

import CommandManager from "./../commands/CommandManager"
import ConfigManager from "./ConfigManager"
import JsonDBManager from "./JsonDBManager"
import EventsManager from "./modules/reactRoles/EventsManager"
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
    eventsManager = new EventsManager(this)

    constructor() {
        new VoiceRooms(this)

        this.client.on("ready", () => {
            this.eventsManager.handle()

            this.client.user.setActivity(
                "Use /help | " + this.client.guilds.cache.size + " Servers",
                { type: ActivityType.Custom },
            )

            console.log("Bot started")
        })

        this.client.login(this.configManager.botToken)
    }
}
