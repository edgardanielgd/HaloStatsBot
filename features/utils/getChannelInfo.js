const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed");
const { getString } = require("../../lang");
const { sendMessage, replyInteraction } = require("../../utils/crudMessages");
const { SlashCommandBuilder } = require("discord.js");

class GetChannelInfoFeature extends Feature {
    constructor() {
        super("Get Channel Info", "Get info of a channel", "📝");
        this.messageCommandAliases = [
            "mychannel", "getchannelinfo", "channelinfo", "channel"
        ];
        this.slashCommandName = "channelinfo";
    }

    config = (_, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Get info of the current channel");

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);
    }

    onMessageCommand(message, command, _) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        const options = this.generateChannelInfoEmbed(message);

        sendMessage(message.channel, options)
    }

    onInteractionCommand(interaction) {
        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        const options = this.generateChannelInfoEmbed(interaction);

        replyInteraction(interaction, options);
    }

    generateChannelInfoEmbed(interactionOrMessage) {
        const generator = new EmbedGenerator();
        const channel = interactionOrMessage.channel;

        generator.updateAtomicData(
            `${getString("en", "ChannelInfoName")} \`${channel.name ? channel.name : getString("en", "ChannelWithoutNameError")}\``,
            `${getString("en", "ChannelInfoName")}: ${channel.id}`
        )

        generator.configureMessageAuthor(
            interactionOrMessage,
            channel.isDMBased()
        )

        // Generate reply message
        const options = {
            embeds: [generator.getEmbed()]
        }

        return options;
    }

}

// Singleton export
module.exports = new GetChannelInfoFeature();