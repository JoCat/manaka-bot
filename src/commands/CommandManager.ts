import {
    CacheType,
    Collection,
    GuildMember,
    Interaction,
    Message as DiscordMessage,
    OmitPartialGroupDMChannel,
    PermissionsBitField,
    REST,
    Routes,
    MessageFlags,
} from "discord.js"

import Core from "core/Core"
import { detectAsciiArt } from "core/helpers/antiASCIIArt"

import { Command, CommandCategory } from "./Command"
import { RoleReactionCommand } from "./admin/RoleReactionCommand"
import { TelegramConnectCommand } from "./admin/TelegramConnectCommand"
import { VoiceRoomCommand } from "./admin/VoiceRoomCommand"
import { HelpCommand } from "./general/HelpCommand"

export type Message = OmitPartialGroupDMChannel<DiscordMessage<boolean>>

export default class CommandManager {
    private commands: Collection<string, Command> = new Collection()
    private commandAliases: Map<string, string> = new Map()

    constructor(private core: Core) {
        this.commandsInit()
        this.registerCommands()
    }

    async registerCommands() {
        const rest = new REST({ version: "10" }).setToken(
            this.core.configService.botToken,
        )

        try {
            console.log("Started refreshing application commands")

            const data = await rest.put(
                Routes.applicationCommands(this.core.configService.clientID),
                {
                    body: this.commands.map((command) =>
                        command.commandData.toJSON(),
                    ),
                },
            )

            console.log(
                `Successfully reloaded ${
                    (<any[]>data).length
                } application commands`,
            )
        } catch (error) {
            console.error(error)
        }
    }

    getCommands() {
        return this.commands
    }

    commandsInit(): void {
        this.registerCommand(new HelpCommand(this.core))
        this.registerCommand(new RoleReactionCommand(this.core))
        this.registerCommand(new VoiceRoomCommand(this.core))
        this.registerCommand(new TelegramConnectCommand(this.core))

        // this.core.client.on("messageCreate", (message) => {
        //     asciiArtFilter(message)
        // })

        this.core.client.on("interactionCreate", this.executeCommand.bind(this))
    }

    registerCommand(command: Command): void {
        this.commands.set(command.name, command)
    }

    getCommand(commandName: string): Command | undefined {
        if (this.commands.has(commandName))
            return this.commands.get(commandName)
        if (this.commandAliases.has(commandName))
            return this.commands.get(this.commandAliases.get(commandName))
    }

    checkPermissions(command: Command, user: GuildMember): boolean {
        if (command.category !== CommandCategory.ADMIN) {
            return true
        }

        if (
            user.id === user.guild.ownerId ||
            user.permissions.has(PermissionsBitField.Flags.Administrator)
        ) {
            return true
        }

        return false
    }

    async executeCommand(interaction: Interaction<CacheType>) {
        if (!interaction.isChatInputCommand()) return

        const command = this.getCommand(interaction.commandName)

        if (!command) {
            return await interaction.reply({
                content: "Команда не найдена!",
                flags: MessageFlags.Ephemeral,
            })
        }

        if (!this.checkPermissions(command, <GuildMember>interaction.member)) {
            return await interaction.reply({
                content: "У вас нет прав для выполнения этой команды!",
                flags: MessageFlags.Ephemeral,
            })
        }

        command.execute(interaction)
    }

    asciiArtFilter(message: Message) {
        if (!["742023613896589312"].includes(message.channelId)) return false
        const isAsciiArt = detectAsciiArt(message.content)
        if (isAsciiArt) message.delete()
        return isAsciiArt
    }
}
