import crypto from "crypto"

import Core from "core/Core"

import EventHandler from "./EventHandler"
import { DiscordEmoji, RawDiscordReactionEvent } from "../../../types"

export default class EventsManager {
    private events: Map<string, EventHandler> = new Map()

    constructor(private core: Core) {
        core.jsonDBManager
            .getData("events")
            .forEach(({ messageID, roleID, emoji }: EventHandler) => {
                this.loadEvent(messageID, roleID, emoji)
            })

        // TODO New react logic
        // this.core.client.channels
        //     .fetch("741047839320178852")
        //     .then((channel) => {
        //         if (channel.isTextBased()) {
        //             channel.messages
        //                 .fetch("742740017457397819")
        //                 .then((msg) => console.log(msg))
        //         }
        //     })

        // core.client.on("messageReactionAdd", (msg, user) => {
        //     console.log(msg, user)
        // })
        // core.client.on("messageReactionRemove", (msg, user) => {
        //     console.log(msg, user)
        // })
        core.client.on("raw", (data: RawDiscordReactionEvent) => {
            if (
                !["MESSAGE_REACTION_REMOVE", "MESSAGE_REACTION_ADD"].includes(
                    data.t,
                )
            ) {
                return
            }

            const event = this.events.get(
                this.generateToken(data.d.message_id, data.d.emoji),
            )
            if (event === undefined) return
            event.handler(core.client.guilds, data)
        })
    }

    private loadEvent(messageID: string, roleID: string, emoji: DiscordEmoji) {
        const token = this.generateToken(messageID, emoji)
        const handler = new EventHandler(messageID, roleID, emoji)
        this.events.set(token, handler)
        return handler
    }

    public addEventListener(
        messageID: string,
        roleID: string,
        emoji: DiscordEmoji,
    ): void {
        const handler = this.loadEvent(messageID, roleID, emoji)
        this.core.jsonDBManager.addData("events", handler)
    }

    public removeEventListener(token: string): boolean {
        if (!this.events.has(token)) return false
        this.core.jsonDBManager.deleteData("events", "token", token)
        this.events.delete(token)
        return true
    }

    public generateToken(messageID: string, emoji: DiscordEmoji): string {
        return crypto
            .createHash("md5")
            .update(messageID + (emoji.id || "") + (emoji.name || ""))
            .digest("hex")
    }

    public getEvents(): Map<string, EventHandler> {
        return this.events
    }

    public hasEvent(token: string): boolean {
        return this.events.has(token)
    }
}
