import { Collection, Message } from "discord.js"
import { Command } from "./Command"
import { HelpCommand } from "./general/HelpCommand"
import { Bot } from "../index"

export class CommandManager {
    commands: Collection<string, Command> = new Collection
    commandAliases: Map<string, string> = new Map

    constructor () {
        this.commandsInit()
    }

    commandsInit(): void {
        this.registerCommand(new HelpCommand)
    }

    registerCommand(command: Command): void {
        this.commands.set(command.name, command)
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.commandAliases.set(alias, command.name)
            })
        }
    }

    getCommand(commandName: string): Command | undefined {
        if (this.commands.has(commandName))
            return this.commands.get(commandName)
        else if (this.commandAliases.has(commandName))
            return this.commands.get(this.commandAliases.get(commandName))
        else
            return undefined
    }

    executeCommand(message: Message): any {
        const prefix = Bot.config.getProperty('prefix')

        if (message.author.bot) return
        if (message.channel.type != 'text') return
        if (!message.content.startsWith(prefix)) return

        const args = message.content.slice(prefix.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()
        const command = this.getCommand(commandName)

        if (command) command.run(message, args)
        else message.channel.send('Команда не найдена!')
    }
}