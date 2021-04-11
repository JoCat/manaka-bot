import { Message } from "discord.js"

export interface Command {
    readonly name: string
    readonly category: CommandCategory
    readonly description: string
    readonly usage?: string[]
    readonly aliases?: string[]
    readonly cooldown?: number

    run(message: Message, args: string[]): any
}

export enum CommandCategory {
    ADMIN = "admin",
    EVENTS = "events",
    GENERAL = "general",
    MUSIC = "music",
}
