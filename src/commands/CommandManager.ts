import Core from "core/Core"
import { Collection, Message, REST, Routes } from "discord.js"

import { MessageCommand } from "./admin/MessageCommand"
import { RoleReactionCommand } from "./admin/RoleReactionCommand"
import { Command, CommandCategory } from "./Command"
import { HelpCommand } from "./general/HelpCommand"
import { PlayCommand } from "./music/PlayCommand"
import { PlaylistCommand } from "./music/PlaylistCommand"
import { PlayNextCommand } from "./music/PlayNextCommand"
import { SkipCommand } from "./music/SkipCommand"
import { StopCommand } from "./music/StopCommand"
import { availableChannelTypes } from "core/helpers/Utils"

export default class CommandManager {
    private commands: Collection<string, Command> = new Collection()
    private commandAliases: Map<string, string> = new Map()

    constructor(private core: Core) {
        this.commandsInit()
        // this.newCommandsInit()
    }

    async newCommandsInit() {
        const rest = new REST({ version: "10" }).setToken(
            this.core.configManager.botToken,
        )

        try {
            console.log("Started refreshing application (/) commands.")

            await rest.put(Routes.applicationCommands("667447976301428757"), {
                body: this.commands.map(({ name, description }) => ({
                    name,
                    description,
                })),
            })

            console.log("Successfully reloaded application (/) commands.")
        } catch (error) {
            console.error(error)
        }

        this.core.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) return

            if (interaction.commandName === "ping") {
                await interaction.reply("Pong!")
            }

            const command = this.getCommand(interaction.commandName)

            if (command) {
                // if (!this.checkPermissions(command, interaction.user.id))
                //     return await interaction.reply(
                //         "У вас нет прав для выполнения этой команды!",
                //     )
                // command.run(interaction, args)

                await interaction.reply("Pong!")
            } else await interaction.reply("Команда не найдена!")
        })
    }

    getCommands() {
        return this.commands
    }

    commandsInit(): void {
        this.core.client.on("messageCreate", (message) => {
            this.executeCommand(message)
        })

        this.registerCommand(new HelpCommand(this.core))
        this.registerCommand(new MessageCommand(this.core))
        this.registerCommand(new RoleReactionCommand(this.core))
        this.registerCommand(new PlayCommand(this.core))
        this.registerCommand(new SkipCommand(this.core))
        this.registerCommand(new StopCommand(this.core))
        this.registerCommand(new PlaylistCommand(this.core))
        this.registerCommand(new PlayNextCommand(this.core))
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

    // TODO Rework
    checkPermissions(command: Command, userID: string): boolean {
        if (command.category === CommandCategory.ADMIN) {
            let allowed = false

            if (userID === "199231799124164608") allowed = true
            // if (checkPermission('admin', message.member)) {
            //     allowed = true;
            // }

            return allowed
        } else return true
    }

    executeCommand(message: Message): any {
        const prefix = this.core.configManager.getConfig().prefix

        if (message.author.bot) return
        if (!availableChannelTypes.includes(message.channel.type)) return
        if (!message.content.startsWith(`${prefix} `)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/)
        const command = this.getCommand(args.shift().toLowerCase())

        if (command) {
            if (!this.checkPermissions(command, message.member.id))
                return message.channel.send(
                    "У вас нет прав для выполнения этой команды!",
                )
            command.run(message, args)
        } else message.channel.send("Команда не найдена!")
    }
}
