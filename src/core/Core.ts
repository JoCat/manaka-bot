import { Client } from 'discord.js'
import { ConfigManager } from './ConfigManager'
import { CommandManager } from './../commands/CommandManager'

export default class Core {
    client = new Client
    config = new ConfigManager
    commands = new CommandManager

    constructor() {
        this.client.on('message', (m) => this.commands.executeCommand(m))
        this.client.on('ready', () => console.log('Bot started'))
        this.client.login(this.config.botToken)
    }
}
