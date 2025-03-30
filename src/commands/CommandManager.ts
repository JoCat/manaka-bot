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
} from "discord.js"

import Core from "core/Core"
import { availableChannelTypes } from "core/helpers/Utils"
import { detectAsciiArt } from "core/helpers/antiASCIIArt"

import { Command, CommandCategory } from "./Command"
import { RoleReactionCommand } from "./admin/RoleReactionCommand"
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
        const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN)

        try {
            console.log("Started refreshing application (/) commands.")

            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                {
                    body: this.commands
                        .filter((command) => command.commandData)
                        .map((command) => command.commandData.toJSON()),
                },
            )

            console.log(
                `Successfully reloaded ${
                    (<any[]>data).length
                } application (/) commands.`,
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

        // Deprecated
        this.core.client.on("messageCreate", (message) => {
            this.executeCommand(message)
        })

        // New
        this.core.client.on("interactionCreate", async (interaction) => {
            this.newExecuteCommand(interaction)
        })
    }

    registerCommand(command: Command): void {
        this.commands.set(command.name, command)
        if (command.aliases) {
            command.aliases.forEach((alias) => {
                this.commandAliases.set(alias, command.name)
            })
        }
    }

    getCommand(commandName: string): Command | undefined {
        if (this.commands.has(commandName))
            return this.commands.get(commandName)
        else if (this.commandAliases.has(commandName))
            return this.commands.get(this.commandAliases.get(commandName))
    }

    checkPermissions(command: Command, user: GuildMember): boolean {
        if (command.category === CommandCategory.ADMIN) {
            let allowed = false

            if (
                user.id === user.guild.ownerId ||
                user.permissions.has(PermissionsBitField.Flags.Administrator)
            )
                allowed = true

            return allowed
        } else return true
    }

    executeCommand(message: Message) {
        if (this.asciiArtFilter(message)) return

        const prefix = this.core.configManager.getConfig().prefix

        if (message.author.bot) return
        if (!availableChannelTypes.includes(message.channel.type)) return
        if (!message.content.startsWith(`${prefix} `)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/)
        const command = this.getCommand(args.shift().toLowerCase())

        if (command) {
            if (!this.checkPermissions(command, message.member))
                return message.channel.send(
                    "У вас нет прав для выполнения этой команды!",
                )
            command.run(message, args)
        } else message.channel.send("Команда не найдена!")
    }

    async newExecuteCommand(interaction: Interaction<CacheType>) {
        if (!interaction.isChatInputCommand()) return

        const command = this.getCommand(interaction.commandName)

        if (!command) {
            return await interaction.reply({
                content: "Команда не найдена!",
                ephemeral: true,
            })
        }

        if (!this.checkPermissions(command, <GuildMember>interaction.member)) {
            return await interaction.reply({
                content: "У вас нет прав для выполнения этой команды!",
                ephemeral: true,
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
