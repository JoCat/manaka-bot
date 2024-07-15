import {
    CacheType,
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
} from "discord.js"

import { Command, CommandCategory } from "../Command"

export class VoiceRoomCommand extends Command {
    name = "voiceroom"
    category = CommandCategory.ADMIN
    description = "добавляет канал в список для создания голосовых комнат"
    usage = ["[тег/id канала]"]
    aliases = ["vr"]

    commandData = new SlashCommandBuilder()
        .setName("voiceroom")
        .setDescription(
            "добавляет канал в список для создания голосовых комнат",
        )
        .addStringOption((option) =>
            option
                .setName("channel")
                .setDescription("тег/id канала")
                .setRequired(true),
        )

    // TODO Temp
    run(message: Message) {
        message.channel.send("Используйте /voiceroom <тег/id канала>")
    }

    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        const channel = interaction.options.getString("channel")

        const voiceRooms = this.core.jsonDBManager
            .getData("voiceRooms")
            .map((voiceRoom) => voiceRoom.channel)

        if (voiceRooms.includes(channel)) {
            return interaction.reply({
                content: "Канал уже добавлен в список!",
                ephemeral: true,
            })
        }

        this.core.jsonDBManager.addData("voiceRooms", { channel })
        interaction.reply({
            content: "Канал добавлен в список!",
            ephemeral: true,
        })
    }
}
