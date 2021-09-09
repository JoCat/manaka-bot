import crypto from "crypto"

import Bot from "../../index"
import EventHandler from "./EventHandler"
import { DiscordEmoji, RawDiscordReactionEvent } from "./types"

export default class EventsManager {
    private events: Map<string, EventHandler> = new Map()

    // TODO вынести в конструктор?
    public init(): void {
        Bot.jsonDB.getAllData("events").forEach((event: EventHandler) => {
            const token = this.generateToken(event.messageID, event.emoji)
            this.events.set(
                token,
                new EventHandler(event.messageID, event.roleID, event.emoji)
            )
        })

        Bot.client.on("raw", (data: RawDiscordReactionEvent) => {
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

    public addEventListener(
        messageID: string,
        roleID: string,
        emoji: DiscordEmoji
    ): void {
        const handler = new EventHandler(messageID, roleID, emoji)
        Bot.jsonDB.addData("events", handler)
        this.events.set(this.generateToken(messageID, emoji), handler)
    }

    public removeEventListener(token: string): boolean {
        if (!this.events.has(token)) return false
        Bot.jsonDB.deleteData("events", "token", token)
        this.events.delete(token)
        return true
    }

    public generateToken(messageID: string, emoji: DiscordEmoji): string {
        return crypto
            .createHash("md5")
            .update(messageID + emoji.id + emoji.name)
            .digest("hex")
    }

    public getEvents(): Map<string, EventHandler> {
        return this.events
    }

    public hasEvent(token: string): boolean {
        return this.events.has(token)
    }
}
