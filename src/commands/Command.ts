import { Message } from "discord.js"

export interface Command {
    name: string
    category: CommandCategory
    description: string
    usage?: string[]
    aliases?: string[]
    cooldown?: number

    run(message: Message, args: string[]): any
}

export enum CommandCategory {
    ADMIN = 'admin',
    EVENTS = 'events',
    GENERAL = 'general',
    MUSIC = 'music'
}
