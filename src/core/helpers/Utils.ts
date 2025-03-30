import {
    ChannelType,
    GuildTextBasedChannel,
    Message,
    TextBasedChannel,
} from "discord.js"

export const availableChannelTypes = [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
]

export async function findMessage(
    textChannel: GuildTextBasedChannel,
    id: string,
): Promise<Message> {
    try {
        return await textChannel.messages.fetch({
            message: id,
            cache: true,
            force: true,
        })
    } catch {
        /* ignore */
    }

    const channels = textChannel.guild.channels.cache.filter(({ type }) =>
        availableChannelTypes.includes(type),
    )

    for (const [, channel] of channels) {
        try {
            const target = await (<TextBasedChannel>channel).messages.fetch({
                message: id,
                cache: true,
                force: true,
            })
            if (target) return target
        } catch {
            /* ignore */
        }
    }
}
