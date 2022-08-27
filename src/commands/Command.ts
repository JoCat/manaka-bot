import Core from "core/Core"
import { Message } from "discord.js"

export abstract class Command {
    readonly name: string
    readonly category: CommandCategory
    readonly description: string
    readonly usage?: string[]
    readonly aliases?: string[]
    readonly cooldown?: number

    constructor(protected core: Core) {}

    abstract run(message: Message, args: string[]): any
}

export enum CommandCategory {
    ADMIN = "admin",
    GENERAL = "general",
    MUSIC = "music",
}
