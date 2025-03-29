import { ChannelType, VoiceChannel, VoiceState } from "discord.js"

import Core from "core/Core"

export class VoiceRooms {
    constructor(private core: Core) {
        core.client.on("voiceStateUpdate", (_, after: VoiceState) =>
            this.voiceStateUpdate(after),
        )
    }

    private async voiceStateUpdate(state: VoiceState): Promise<void> {
        const voiceChannels = this.core.jsonDBManager
            .getData("voiceRooms")
            .map((voiceRoom) => voiceRoom.channel)

        if (voiceChannels.includes(state.channelId)) {
            state.guild.channels
                .create({
                    name: `Комната ${state.member.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: state.channel.parent,
                })
                .then((channel) => {
                    channel.permissionOverwrites.edit(state.id, {
                        ViewChannel: true,
                        ManageChannels: true,
                        Connect: true,
                    })
                    state.setChannel(channel)
                })
        }

        // Некоторая магия
        this.core.client.channels.cache
            .filter((channel) => voiceChannels.includes(channel.id))
            .forEach((channel: VoiceChannel) =>
                channel.parent.children.cache
                    .filter(
                        (channel) =>
                            channel.type === ChannelType.GuildVoice &&
                            channel.members.size === 0 &&
                            !voiceChannels.includes(channel.id),
                    )
                    .forEach((channel) => channel.delete("Комната пуста")),
            )
    }
}
