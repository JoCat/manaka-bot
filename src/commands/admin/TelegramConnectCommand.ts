import {
    ChannelType,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
} from "discord.js"

import { Command, CommandCategory } from "commands/Command"

export class TelegramConnectCommand extends Command {
    override name = "telegram"
    override category = CommandCategory.ADMIN
    override description = "Подключить интеграцию Telegram чата к каналу"

    override commandData = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("connect")
                .setDescription("Подключить чат")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("тег/id канала")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText),
                )
                .addNumberOption((option) =>
                    option
                        .setName("chat-id")
                        .setDescription("ID чата")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("disconnect")
                .setDescription("Отключить чат")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("тег/id канала")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("Список подключенных чатов"),
        )

    override async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const method = <"connect" | "disconnect" | "list">(
            interaction.options.getSubcommand(true)
        )
        this[method](interaction)
    }

    private async connect(interaction: ChatInputCommandInteraction<"cached">) {
        const channelId = interaction.options.getChannel("channel", true).id
        const chatId = interaction.options.getNumber("chat-id", true)

        try {
            await this.core.telegramManager.createBinding(
                interaction.guildId,
                channelId,
                chatId,
            )
        } catch (error) {
            return interaction.reply({
                content: error.message,
                flags: MessageFlags.Ephemeral,
            })
        }

        interaction.reply({
            content: "Чат подключен!",
            flags: MessageFlags.Ephemeral,
        })
    }

    private async disconnect(
        interaction: ChatInputCommandInteraction<"cached">,
    ) {
        const channelId = interaction.options.getChannel("channel", true).id

        try {
            this.core.telegramManager.removeBinding(
                interaction.guildId,
                channelId,
            )
        } catch (error) {
            return interaction.reply({
                content: error.message,
                flags: MessageFlags.Ephemeral,
            })
        }

        interaction.reply({
            content: "Чат отключен!",
            flags: MessageFlags.Ephemeral,
        })
    }

    private async list(interaction: ChatInputCommandInteraction<"cached">) {
        const bindings = this.core.telegramManager.listBindings(
            interaction.guildId,
        )

        if (bindings.length === 0) {
            return interaction.reply({
                content: "Нет подключенных чатов",
                flags: MessageFlags.Ephemeral,
            })
        }

        const list = bindings.map(
            (binding) =>
                `Канал: <#${binding.channelId}>, ID чата: \`${binding.chatId}\``,
        )

        interaction.reply({
            content: list.join("\n"),
            flags: MessageFlags.Ephemeral,
        })
    }
}
