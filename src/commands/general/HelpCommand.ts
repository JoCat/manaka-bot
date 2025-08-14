import {
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js"

import { Command, CommandCategory } from "../Command"

export class HelpCommand extends Command {
    name = "help"
    category = CommandCategory.GENERAL
    description =
        "выводит список всех команд или подробную информацию о команде"
    usage = ["", "[command name]"]
    aliases = ["h", "commands"]

    commandData = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option.setName("command").setDescription("название команды"),
        )

    execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const commandName = interaction.options.getString("command")
        const { color } = this.core.configManager.getConfig()

        if (!commandName) {
            const list = (category: CommandCategory, categoryName: string) => {
                const cmdList = this.core.commandsManager
                    .getCommands()
                    .filter((cmd) => cmd.category === category)
                    .map((cmd) => `\`/${cmd.name}\` – ${cmd.description}`)
                    .join("\n")
                return `**${categoryName}:**\n${cmdList}\n`
            }

            const data = []

            data.push(list(CommandCategory.GENERAL, "Основные"))

            if (interaction.memberPermissions.has("Administrator")) {
                data.push(list(CommandCategory.ADMIN, "Админские"))
            }

            data.push(
                `Напишите \`/help\` и \`[command name]\`, чтобы получить подробную информацию. **Например:** \`/help help\``,
            )

            const embed = new EmbedBuilder()
                .setColor(color)
                .setDescription(data.join("\n"))
                .setTimestamp()
                .setTitle("Список команд")
            return interaction.reply({
                embeds: [embed],
                ephemeral: true,
            })
        }

        const command = this.core.commandsManager.getCommand(commandName)

        if (!command)
            return interaction.reply({
                content: `Команда не найдена, воспользуйтесь \`/help\` или проверьте корректность команды.`,
                ephemeral: true,
            })

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
                    .map((usage) => `\`/${command.name} ${usage}\``)
                    .join("\n"),
            )
        // addField("Временное ограничение", `${command.cooldown || 3} секунд`)

        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        })
    }
}
