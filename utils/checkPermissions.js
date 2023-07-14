const { PermissionFlagsBits } = require("discord.js");

const pkgPermission = {
    checkExistence: (msg) => {
        return new Promise(async (resolve, _) => {
            if (!msg) {
                resolve(false);
                return;
            }
            const id = msg.id;
            const got = await msg.channel.messages.fetch(id);
            if (got) resolve(true);
            resolve(false);
        });
    },

    checkScopesSendEdit: (channel) => {

        if (!channel) return false;
        if (!channel.isTextBased()) return false;
        if (!channel.guild) return true;
        if (!channel.viewable) return false;

        const permissions = channel.permissionsFor(channel.guild.me);
        if (!permissions) return true;

        if (!permissions.has(PermissionFlagsBits.SendMessages)) return false;

        const isThread = channel.isThread();
        if (!isThread) return true;

        return !permissions.has(PermissionFlagsBits.SendMessagesInThreads);
    },

    checkScopesReact: (channel) => {

        if (!channel) return false;
        if (!channel.isTextBased()) return false;
        if (!channel.guild) return true;
        if (!channel.viewable) return false;
        const permissions = channel.permissionsFor(channel.guild.me);
        if (!permissions) return false;

        return !permissions.has(PermissionFlagsBits.AddReactions);
    }
}
module.exports = pkgPermission;