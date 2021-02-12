import { Collection, Message } from "discord.js"

import Bot from "../index"
import { MessageCommand } from "./admin/MessageCommand"
import { RoleReactionCommand } from "./admin/RoleReactionCommand"
import { Command, CommandCategory } from "./Command"
import { HelpCommand } from "./general/HelpCommand"

export default class CommandManager {
    commands: Collection<string, Command> = new Collection()
    commandAliases: Map<string, string> = new Map()

    constructor() {
        this.commandsInit()
    }

    commandsInit(): void {
        this.registerCommand(new HelpCommand())
        this.registerCommand(new MessageCommand())
        this.registerCommand(new RoleReactionCommand())
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
        if (this.commands.has(commandName)) return this.commands.get(commandName)
        else if (this.commandAliases.has(commandName)) return this.commands.get(this.commandAliases.get(commandName))
        else return undefined
    }

    checkPermissions(command: Command, userID: string) {
        if (command.category === CommandCategory.ADMIN || command.category === CommandCategory.EVENTS) {
            let allowed = false

            if (command.category === CommandCategory.ADMIN) {
                if (userID === "199231799124164608") allowed = true
                // if (checkPermission('admin', message.member)) {
                //     allowed = true;
                // }
            }

            // if (command.category === CommandCategory.EVENTS) {
            //     if (checkPermission('event_manager', message.member)) {
            //         allowed = true;
            //     }
            // }

            return allowed
        } else return true
    }

    executeCommand(message: Message): any {
        if (message.content.toLowerCase().includes('модератор')) { // Speecial for Darari#8165
            message.channel.send('https://youtu.be/WHf6d27l08I')
        }
        if (message.content.toLowerCase().includes('<:kekw:773085584671244299>')) { // Speecial for Will0376#5780
            message.channel.send('https://youtu.be/vMG98vfhU08')
        }

        const prefix = Bot.config.getProperty("prefix")

        if (message.author.bot) return
        if (message.channel.type != "text") return
        if (!message.content.startsWith(`${prefix} `)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()
        const command = this.getCommand(commandName)

        if (command) {
            if (!this.checkPermissions(command, message.member.id))
                return message.channel.send("У вас нет прав для выполнения этой команды!")
            command.run(message, args)
        } else message.channel.send("Команда не найдена!")
    }
}
