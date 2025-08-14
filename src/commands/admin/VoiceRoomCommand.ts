import {
    CacheType,
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js"

import { Command, CommandCategory } from "../Command"

export class VoiceRoomCommand extends Command {
    override name = "voiceroom"
    override category = CommandCategory.ADMIN
    override description =
        "Привязка к голосовому каналу функционала автоматического создания голосовых комнат"
    override isDanger = true
    override info =
        "Канал должен быть в отдельной категории не содержащей других голосовых каналов, иначе они будут удалены."

    override commandData = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("тег/id канала")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice),
        )

    override async execute(
        interaction: ChatInputCommandInteraction<CacheType>,
    ) {
        const channel = interaction.options.getChannel("channel", true, [
            ChannelType.GuildVoice,
        ])

        if (!channel.parent) {
            return interaction.reply({
                content: `У канала отсутствует родительская категория!`,
                ephemeral: true,
            })
        }

        const voiceRooms = this.core.jsonDBManager
            .getData("voiceRooms")
            .map((voiceRoom) => voiceRoom.channel)

        if (voiceRooms.includes(channel.id)) {
            return interaction.reply({
                content: "Канал уже добавлен в список!",
                ephemeral: true,
            })
        }

        this.core.jsonDBManager.addData("voiceRooms", { channel: channel.id })
        interaction.reply({
            content: "Канал добавлен в список!",
            ephemeral: true,
        })
    }
}
