import { Message, TextChannel } from "discord.js"

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
    ID: string
): Promise<Message> {
    try {
        return await textChannel.messages.fetch(ID, true, true)
    } catch {
        /* ignore */
    }

    const channels = textChannel.guild.channels.cache
        .filter((c) => c.type === "text")
        .array() as TextChannel[]
    for (const channel of channels) {
        try {
            const target = await channel.messages.fetch(ID, true, true)
            if (target) return target
        } catch {
            /* ignore */
        }
    }
}
