const RemoteConsoleFeature = require("./RemoteConsoleFeature");
const EmbedGenerator = require("../../utils/generateEmbed.js");
const config = require("../../config/index.js");
const { sendMessage, replyInteraction, deferInteractionReply } = require("../../utils/crudMessages.js");
const { SlashCommandBuilder } = require("discord.js");

class RemoteConsoleDisConnectFeature extends RemoteConsoleFeature {
    constructor() {
        super("Disconnect from remote console", "Disconnect from a Halo Server through remote console", "🏠");
        this.messageCommandAliases = [
            "disconnect", "remote_console_off"
        ];
        this.slashCommandName = "remote-console-disconnect";
    }

    config = (_, subscriber, remoteConsolePool) => {

        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Disconnect from remote console")

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);

        remoteConsolePool.registerOnCloseListener(this);

        this.pool = remoteConsolePool;
    }

    async generateEmbedResponse(messageOrInteraction) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        // Check if user has a connection already
        const conn = this.pool.getConnection(
            messageOrInteraction
        );

        if (!conn) {
            generator.updateAtomicData(
                "Error",
                "You are not connected to any server"
            );

            return generator.getEmbed();
        }

        conn.disconnect();

        generator.updateAtomicData(
            "Disconnecting from remote console..."
        )

        return generator.getEmbed();
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.REMOTECONSOLECHANNELS.includes(message.channel.id))
            return;

        const embed = await this.generateEmbedResponse(message);

        sendMessage(message.channel, {
            embeds: [
                embed
            ]
        })
    }

    async onInteractionCommand(interaction) {

        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.REMOTECONSOLECHANNELS.includes(interaction.channel.id))
            return;

        await deferInteractionReply(interaction, true);

        // Send data to database and get response
        const embed = await this.generateEmbedResponse(interaction);

        replyInteraction(interaction, {
            embeds: [embed]
        })
    }

    onRemoteConsoleClose(conn, target) {
        const generator = new EmbedGenerator();

        generator.configureMessageAuthor(
            target,
            target.channel.isDMBased()
        )

        generator.updateAtomicData(
            "Disconnected",
            "Disconnected successfully from remote console - " + conn.ip + ":" + conn.port
        )

        sendMessage(target.channel, {
            embeds: [
                generator.getEmbed()
            ],
            ephemeral: true
        })
    }
}

// Singleton export
module.exports = RemoteConsoleDisConnectFeature;