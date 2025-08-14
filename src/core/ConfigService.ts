import "dotenv/config"

import { version } from "../../package.json"

export default class ConfigService {
    public readonly dev = process.env.DEV === "true"

    public readonly botToken = process.env.BOT_TOKEN
    public readonly clientID = process.env.CLIENT_ID

    public readonly creatorID = "199231799124164608"
    public readonly ownerID = process.env.OWNER_ID
    public readonly version = version

    public readonly color = this.dev ? "#ff0000" : "#00aaff"
}
