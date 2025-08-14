import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js"

import Core from "core/Core"

export abstract class Command {
    abstract readonly name: string
    abstract readonly category: CommandCategory
    abstract readonly description: string
    readonly info?: string
    readonly isDanger: boolean = false
    // abstract readonly cooldown?: number

    constructor(protected core: Core) {}

    abstract readonly commandData:
        | SlashCommandBuilder
        | SlashCommandOptionsOnlyBuilder
        | SlashCommandSubcommandsOnlyBuilder

    abstract execute(interaction: ChatInputCommandInteraction<CacheType>): any
}

export enum CommandCategory {
    ADMIN = "admin",
    GENERAL = "general",
}
