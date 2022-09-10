import fs from "fs"
import { join } from "path"

import { ColorResolvable } from "discord.js"
import dotenv from "dotenv"

import FileHelper from "./helpers/FileHelper"

dotenv.config()

export default class ConfigManager {
    private configFile = join(FileHelper.runtimeDir, "botConfig.json")
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

        if (fs.existsSync(this.configFile)) {
            console.log("Loading configuration")
            this.load()
        } else {
            console.log("Configuration not found! Create default config")
            this.config = this.getDefaults()
            this.save()
        }
    }

    public getConfig(): BotConfig {
        return this.config
    }

    private getDefaults(): BotConfig {
        return {
            prefix: "m",
            color: "#00aaff",
        }
    }

    private load(): void {
        try {
            this.config = JSON.parse(
                fs.readFileSync(this.configFile).toString()
            )
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.error(
                    "Json syntax broken. Try fix or delete botConfig.json"
                )
            }
            console.error(e)
        }
    }

    private save(): void {
        fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 4))
    }
}

export interface BotConfig {
    prefix: string
    color: ColorResolvable
}
