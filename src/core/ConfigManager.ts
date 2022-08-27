import fs from "fs"
import { join } from "path"

import dotenv from "dotenv"

import FileHelper from "./helpers/FileHelper"

dotenv.config()

export default class ConfigManager {
    private configFile = join(FileHelper.runtimeDir, "botConfig.json")
    private config: BotConfig
    public readonly botToken = process.env.BOT_TOKEN
    public readonly dev = process.env.DEV === "true"

    constructor() {
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

    /**
     * @deprecated
     */
    getProperty(property: string): any {
        const path = property.split(".")
        let prop: BotConfig = this.config
        path.forEach((el) => {
            prop = prop[el]
        })
        return prop
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

        if (this.dev) {
            this.config.prefix = "mm"
        }
    }

    private save(): void {
        fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 4))
    }
}

export interface BotConfig {
    prefix: string
    color: string
}
