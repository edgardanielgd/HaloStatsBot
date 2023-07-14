const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("@discordjs/builders")
const Discord = require("discord.js");
const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed.js");
const config = require("../../config/index.js");
const { sendMessage, replyInteraction, deferInteractionReply } = require("../../utils/crudMessages.js");
const { SlashCommandBuilder } = require("discord.js");
const RemoteConsoleFeature = require("./RemoteConsoleFeature");

class RemoteConsoleCommandFeature extends RemoteConsoleFeature {
    constructor() {
        super("Send a command through remote console", "Send a command (based on your admin level) through remote console to server", "🏠");
        this.messageCommandAliases = [
            "command", "remote_console_command"
        ];
        this.slashCommandName = "remote-console-command";
    }

    config = (_, subscriber, remoteConsolePool) => {

        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Send a command through remote console")
            .addStringOption(
                (option) => option
                    .setName("command")
                    .setDescription("The command to be sent (use it all in one line, don't worry about spaces)")
                    .setRequired(true)
            )

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);

        remoteConsolePool.registerOnDataListener(this);

        this.pool = remoteConsolePool;
    }

    async generateEmbedResponse(messageOrInteraction, command) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        if (!command) {
            generator.updateAtomicData(
                "Error",
                "You must provide a command to execute"
            )
        }

        // Check if user has a connection already
        const conn = this.pool.getConnection(
            messageOrInteraction
        );

        if (!conn) {
            generator.updateAtomicData(
                "Error",
                "You don't have an active connection to any server"
            );

            return generator.getEmbed();
        }

        // Attempt to login
        const query = {
            opcode: 5,
            command: command
        }

        conn.sendCommand(query);

        generator.updateAtomicData(
            "Executing command through remote console",
            `Command: \`${command}\``
        );

        return generator.getEmbed();
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.REMOTECONSOLECHANNELS.includes(message.channel.id))
            return;

        const commandValue = args.join(" ");

        const embed = await this.generateEmbedResponse(message, commandValue);

        sendMessage(message.channel, {
            embeds: [
                embed
            ],
            ephemeral: true
        })
    }

    async onInteractionCommand(interaction) {

        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.REMOTECONSOLECHANNELS.includes(interaction.channel.id))
            return;

        // Get parameters from fields
        const command = interaction.options.getString("command");

        await deferInteractionReply(interaction, true);

        const embed = await this.generateEmbedResponse(interaction, command);

        replyInteraction(interaction, {
            embeds: [
                embed
            ],
            ephemeral: true
        })
    }

    onRemoteConsoleData(conn, data, target) {
        if (data.opcode !== 5)
            return;

        const generator = new EmbedGenerator();

        generator.configureMessageAuthor(
            target,
            target.channel.isDMBased()
        )

        const baseTitle = "Reply from " + conn.ip + ":" + conn.port;

        // This is a command status response
        switch (data.ret) {
            case -1:
                generator.updateAtomicData(
                    baseTitle,
                    "You don't have permission to execute this command\n" +
                    `Command: \`${data.command}\``
                );
                break;
            case 1:
                generator.updateAtomicData(
                    baseTitle + "\nCommand executed successfully, response:",
                    data.data
                );
                break;

            default:
                generator.updateAtomicData(
                    baseTitle,
                    `Command failed to execute`
                );
        }

        sendMessage(target.channel, {
            embeds: [
                generator.getEmbed()
            ],
            ephemeral: true
        })
    }
}

// Singleton export
module.exports = RemoteConsoleCommandFeature;