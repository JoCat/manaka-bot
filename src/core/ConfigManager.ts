import "dotenv/config"
import { ColorResolvable } from "discord.js"

export default class ConfigManager {
    private config: BotConfig
    public readonly botToken = process.env.BOT_TOKEN
    public readonly dev = process.env.DEV === "true"

    constructor() {
        if (this.dev) {
            this.config = {
                prefix: "mm",
                color: "#ff0000",
            }
            return
        }

        this.config = {
            prefix: "m",
            color: "#00aaff",
        }
    }

    public getConfig(): BotConfig {
        return this.config
    }
}

export interface BotConfig {
    prefix: string
    color: ColorResolvable
}
