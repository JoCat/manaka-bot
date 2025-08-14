import {
    CacheType,
    ChannelType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js"

import { Command, CommandCategory } from "../Command"

export class VoiceRoomCommand extends Command {
    name = "voiceroom"
    category = CommandCategory.ADMIN
    description = "добавляет канал в список для создания голосовых комнат"

    commandData = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("тег/id канала")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice),
        )

    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
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
