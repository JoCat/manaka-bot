import { availableChannelTypes } from "commands/CommandManager"
import { Message, NewsChannel, TextChannel, ThreadChannel } from "discord.js"

// export function checkPermission (permission, member) {
//     if (permission === 'admin') {
//         return admin_list.indexOf(member.id) !== -1;
//     } else if (permission === 'event_manager') {
//         return event_manager_list.indexOf(member.id) !== -1;
//     }
// }

// export function parseDiscordUserTag(user_tag) {
//     return user_tag.replace(/[<>@!]/g,'');
// }

export async function findMessage(
    textChannel: TextChannel,
    id: string
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
        availableChannelTypes.includes(type)
    ) as unknown as (NewsChannel | TextChannel | ThreadChannel)[]

    for (const channel of channels) {
        try {
            const target = await channel.messages.fetch({
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
