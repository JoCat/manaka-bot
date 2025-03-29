import { EmbedBuilder } from "discord.js"

import { Message } from "commands/CommandManager"

import { Command, CommandCategory } from "../Command"

export class HelpCommand extends Command {
    name = "help"
    category = CommandCategory.GENERAL
    description =
        "выводит список всех команд или подробную информацию о команде"
    usage = ["", "[command name]"]
    aliases = ["h", "commands"]

    run(message: Message, args: string[]): any {
        const { prefix, color } = this.core.configManager.getConfig()

        if (!args.length) {
            const list = (category: CommandCategory, categoryName: string) => {
                const cmdList = this.core.commandsManager
                    .getCommands()
                    .filter((cmd) => cmd.category === category)
                    .map(
                        (cmd) =>
                            `\`${prefix} ${cmd.name}\` – ${cmd.description}`,
                    )
                    .join("\n")
                return `**${categoryName}:**\n${cmdList}\n`
            }

            const data = []

            data.push(list(CommandCategory.GENERAL, "Основные"))
            data.push(list(CommandCategory.MUSIC, "Музыкальные"))

            if (message.member.id === "199231799124164608") {
                data.push(list(CommandCategory.ADMIN, "Админские"))
            }

            data.push(
                `Напишите \`${prefix} help\` и \`[command name]\`, чтобы получить подробную информацию. **Например:** \`${prefix} help help\``,
            )

            const embed = new EmbedBuilder()
                .setColor(color)
                .setDescription(data.join("\n"))
                .setTimestamp()
                .setTitle("Список команд")
            message.channel.send({ embeds: [embed] })
            message.delete()
            return
        }

        const commandName = args.shift().toLowerCase()
        const command = this.core.commandsManager.getCommand(commandName)

        if (!command)
            return message.channel.send(
                `Команда не найдена, воспользуйтесь \`${prefix} help\` или проверьте корректность команды.`,
            )

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTimestamp()
            .setTitle("Команда: " + command.name)

        const addField = (name: string, value: string) =>
            embed.addFields({ name, value })

        if (command.aliases) addField("Псевдонимы", command.aliases.join(", "))
        if (command.description) addField("Описание", command.description)
        if (command.usage)
            addField(
                "Использование",
                command.usage
                    .map((usage) => `\`${prefix} ${command.name} ${usage}\``)
                    .join("\n"),
            )
        // addField("Временное ограничение", `${command.cooldown || 3} секунд`)

        message.channel.send({ embeds: [embed] })
        message.delete()
    }
}
