import fs from "fs"
import path from "path"

import dotenv from "dotenv"

dotenv.config()

export default class ConfigManager {
    private configFile = path.resolve(__dirname, "../../runtime/botConfig.json")
    private config: BotConfig
    botToken: string = process.env.BOT_TOKEN

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

    getProperty(property: string): any {
        const path = property.split(".")
        let prop: BotConfig = this.config
        path.forEach((el) => {
            prop = prop[el]
        })
        return prop
    }

    private getDefaults(): BotConfig {
        const config = new BotConfig()
        config.prefix = "m"
        config.color = "#00aaff"
        return config
    }

    private load(): void {
        const config = fs.readFileSync(this.configFile)
        try {
            this.config = JSON.parse(config.toString())
        } catch (e) {
            if (e instanceof SyntaxError) {
                console.error("Json syntax broken. Try fix or delete botConfig.json")
                console.error(e)
            }
        }
    }

    private save(): void {
        fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 4))
    }
}

export class BotConfig {
    prefix: string
    color: string
}
