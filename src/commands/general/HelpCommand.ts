import {
    CacheType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js"

import { Command, CommandCategory } from "../Command"

export class HelpCommand extends Command {
    override name = "help"
    override category = CommandCategory.GENERAL
    override description =
        "Вывод списка всех команд или подробной информации о команде"

    override commandData = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option.setName("command").setDescription("название команды"),
        )

    override execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const { color, version, ownerID, creatorID } = this.core.configService

        const commandName = interaction.options.getString("command")
        if (!commandName) {
            const list = (category: CommandCategory, categoryName: string) => {
                const cmdList = this.core.commandsManager
                    .getCommands()
                    .filter((cmd) => cmd.category === category)
                    .map(
                        (cmd) =>
                            `${cmd.isDanger ? "⚠️" : "🔹"} \`/${cmd.name}\` – ${cmd.description}`,
                    )
                    .join("\n")
                return `**${categoryName}:**\n${cmdList}\n`
            }

            const data = []

            data.push(list(CommandCategory.GENERAL, "Основные"))

            if (interaction.memberPermissions.has("Administrator")) {
                data.push(list(CommandCategory.ADMIN, "Админские"))
            }

            data.push(
                "Напишите `/help` и `[название команды]`, чтобы получить подробную информацию о команде.",
                "Например: `/help help`",
                "### Внимание! Перед выполнением команд, помеченных символом ⚠️, ознакомьтесь с их описанием!",
                `-# **Создатель бота:** <@${creatorID}>`,
                `-# **Владелец бота:** <@${ownerID}>`,
                `-# **Версия: ${version}**`,
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

        if (command.description) addField("Описание", command.description)
        if (command.info) addField("Дополнительная информация", command.info)
        // addField("Временное ограничение", `${command.cooldown || 3} секунд`)

        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        })
    }
}
