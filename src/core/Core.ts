import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js"

import CommandManager from "./../commands/CommandManager"
import ConfigService from "./ConfigService"
import JsonDBManager from "./JsonDBManager"
import EventsManager from "./modules/reactRoles/EventsManager"
import { TelegramManager } from "./modules/telegramManager"
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
    configService = new ConfigService()
    commandsManager = new CommandManager(this)
    jsonDBManager = new JsonDBManager()
    eventsManager = new EventsManager(this)
    telegramManager = new TelegramManager(this)

    constructor() {
        new VoiceRooms(this)

        this.client.on(Events.ClientReady, () => {
            this.eventsManager.handle()

            this.client.user.setActivity(
                "Use /help | " + this.client.guilds.cache.size + " Servers",
                { type: ActivityType.Custom },
            )

            console.log("Bot started")
        })

        this.client.login(this.configService.botToken)
    }
}
