import * as crypto from "crypto"

import Bot from "../index"
import EventHandler from "./EventHandler"

export default class EventsManager {
    events: Map<string, EventHandler> = new Map()

    init() {
        Bot.jsonDB.getAllData("events").forEach((result) => {
            const token = this.generateToken(result.messageID, result.emoji)
            this.events.set(token, new EventHandler(result.messageID, result.roleID, result.emoji, token))
        })

        Bot.client.on("raw", (data) => {
            if (!["MESSAGE_REACTION_REMOVE", "MESSAGE_REACTION_ADD"].includes(data.t)) return
            const event = this.events.get(this.generateToken(data.d.message_id, data.d.emoji))
            if (event === undefined) return
            event.handler(data)
        })
    }

    addEventListener(messageID: string, roleID: string, emoji: any) {
        const token = this.generateToken(messageID, emoji)
        const handler = new EventHandler(messageID, roleID, emoji, token)
        Bot.jsonDB.addData("events", handler)
        this.events.set(token, handler)
    }

    removeEventListener(token: string) {
        if (!this.events.has(token)) return false
        Bot.jsonDB.deleteData("events", "token", token)
        this.events.delete(token)
        return true
    }

    generateToken(messageID: string, emoji: any) {
        return crypto
            .createHash("md5")
            .update(messageID + emoji.id + emoji.name)
            .digest("hex")
    }
}
