const {
    OWNERID, STAFFIDS, ALLOWEDTIMEBETWEENMESSAGES,
    PUNISHMENTTIME, MAXMESSAGESPERUSER, LOGCHANNELID
} = require("../config");

const { sendMessage } = require("../utils/crudMessages");
const EmbedGenerator = require("../utils/generateEmbed");

class SecurityHandler {
    constructor() {
        this.mutes = {};
        this.users = {};
    }

    handleAction = (messageOrInteraction, bot, logAnyways = false, ...args) => {
        // Log actions which are performed in DMs
        if (messageOrInteraction.channel.isDMBased() || logAnyways) {
            this.logAction(messageOrInteraction, bot, args);
        }

        return this.allowIncomingAction(messageOrInteraction);
    }

    logAction = async (messageOrInteraction, bot, args = []) => {
        const generator = new EmbedGenerator();

        generator.updateAtomicData(
            "DM Action Performed",
            args.join(" - ")
        );

        const user = messageOrInteraction.author || messageOrInteraction.user;

        generator.updateAuthorData(
            user.username,
            user.avatarURL()
        );

        generator.updateFooterData(
            "DM Action",
            bot.user.avatarURL()
        );

        // Get log channel
        const logChannel = await bot.channels.fetch(LOGCHANNELID);

        if (!logChannel) return;

        sendMessage(logChannel, {
            embeds: [generator.getEmbed()],
        });
    }

    allowIncomingAction = (messageOrInteraction) => {
        const user = messageOrInteraction.author || messageOrInteraction.user;
        const id = user.id;

        if (id == OWNERID || id in STAFFIDS) return true;

        // User is already muted :)
        if (this.mutes[id]) return false;

        if (this.users[id]) {
            const nMessages = this.users[id][0];
            if (nMessages + 1 == MAXMESSAGESPERUSER) {

                // Mute user
                this.mutes[id] = true;
                setTimeout((ID) => {
                    this.mutes[ID] = null;
                    this.users[ID] = null
                }, PUNISHMENTTIME, id);

                this.sendMuteMessage(messageOrInteraction);
            }
            clearTimeout(this.users[id][1]);

            this.users[id][0] += 1;
            this.users[id][1] = setTimeout((ID) => {
                this.users[id] = null;
            }, ALLOWEDTIMEBETWEENMESSAGES, id);
        } else {
            this.users[id] = [1, setTimeout((ID) => {
                this.users[ID] = null;
            }, ALLOWEDTIMEBETWEENMESSAGES, id)];
        }
        return true;
    }

    sendMuteMessage = (messageOrInteraction) => {
        const generator = new EmbedGenerator();

        generator.updateAtomicData(
            "Mute",
            "You are muted for sending way too many messages in a short period of time",
        );

        sendMessage(messageOrInteraction.channel, {
            embeds: [generator.getEmbed()],
            ephemeral: true
        });
    }

}
module.exports = SecurityHandler;