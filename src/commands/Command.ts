import {
    CacheType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js"

import Core from "core/Core"

import { Message } from "./CommandManager"

export abstract class Command {
    readonly name: string
    readonly category: CommandCategory
    readonly description: string
    readonly usage?: string[]
    readonly aliases?: string[]
    readonly cooldown?: number

    constructor(protected core: Core) {}

    /**
     * @deprecated
     */
    abstract run(message: Message, args: string[]): any

    // New features

    readonly commandData:
        | SlashCommandBuilder
        | SlashCommandOptionsOnlyBuilder
        | SlashCommandSubcommandsOnlyBuilder

    //TODO Temp
    execute(interaction: ChatInputCommandInteraction<CacheType>): any {
        interaction.reply({
            content: `Команда \`${this.name}\` еще не перенесена`,
            ephemeral: true,
        })
    }
}

export enum CommandCategory {
    ADMIN = "admin",
    GENERAL = "general",
}
