import crypto from "crypto"

import { Emoji } from "discord.js"

import Bot from "../../index"
import EventHandler from "./EventHandler"

export default class EventsManager {
    // TODO private
    events: Map<string, EventHandler> = new Map()

    // TODO вынести в конструктор?
    init(): void {
        Bot.jsonDB.getAllData("events").forEach((event: EventHandler) => {
            const token = this.generateToken(event.messageID, event.emoji)
            this.events.set(
                token,
                new EventHandler(event.messageID, event.roleID, event.emoji)
            )
        })

        Bot.client.on("raw", (data: RawDiscordEvent) => {
            if (
                !["MESSAGE_REACTION_REMOVE", "MESSAGE_REACTION_ADD"].includes(
                    data.t
                )
            )
                return
            const event = this.events.get(
                this.generateToken(data.d.message_id, data.d.emoji)
            )
            if (event === undefined) return
            event.handler(data)
        })
    }

    /* TODO Отрефакторить команды, убрать any */
    addEventListener(
        messageID: string,
        roleID: string,
        emoji: Emoji | any
    ): void {
        const handler = new EventHandler(messageID, roleID, emoji)
        Bot.jsonDB.addData("events", handler)
        this.events.set(this.generateToken(messageID, emoji), handler)
    }

    removeEventListener(token: string): boolean {
        if (!this.events.has(token)) return false
        Bot.jsonDB.deleteData("events", "token", token)
        this.events.delete(token)
        return true
    }

    /* TODO Отрефакторить команды, убрать any */
    generateToken(messageID: string, emoji: Emoji | any): string {
        return crypto
            .createHash("md5")
            .update(messageID + emoji.id + emoji.name)
            .digest("hex")
    }
}

interface RawDiscordEvent {
    t: string // Event type
    d: any // Event data
}
