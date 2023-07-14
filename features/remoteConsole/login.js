const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("@discordjs/builders")
const Discord = require("discord.js");
const RemoteConsoleFeature = require("./RemoteConsoleFeature");
const EmbedGenerator = require("../../utils/generateEmbed.js");
const config = require("../../config/index.js");
const { sendMessage, replyInteraction, deferInteractionReply } = require("../../utils/crudMessages.js");
const { SlashCommandBuilder } = require("discord.js");
const { validateIpFormat, validatePortFormat } = require("./../../utils/validateIpFormat");
const md5 = require("blueimp-md5");

class RemoteConsoleConnectFeature extends RemoteConsoleFeature {
    constructor() {
        super("Connect to remote console", "Connect to a Halo Server through remote console", "🏠");
        this.messageCommandAliases = [
            "connect", "remote_console"
        ];
        this.slashCommandName = "remote-console-connect";
    }

    config = (_, subscriber, remoteConsolePool) => {

        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Connect to remote console")

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);
        subscriber.registerOnInteractionModalSubmit(this);

        remoteConsolePool.registerOnDataListener(this);

        this.pool = remoteConsolePool;
    }

    async generateEmbedResponse(messageOrInteraction, ip, port, username, password) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        if (!ip || !port || !username || !password) {
            generator.updateAtomicData(
                "Error",
                "You must provide all the parameters: IP, Port, Username and Password"
            )
        }

        const ipValidation = validateIpFormat(ip);
        if (ipValidation.error) {
            generator.updateAtomicData(
                "Error",
                ipValidation.error
            )

            return generator.getEmbed();
        }

        const portValidation = validatePortFormat(port);
        if (portValidation.error) {
            generator.updateAtomicData(
                "Error",
                portValidation.error
            )

            return generator.getEmbed();
        }

        // Check if user has a connection already
        const user = messageOrInteraction.author || messageOrInteraction.user;

        const currentConnection = this.pool.getConnection(
            messageOrInteraction
        );

        if (currentConnection) {
            generator.updateAtomicData(
                "Error",
                "You already have a connection to a remote console"
            );

            return generator.getEmbed();
        }

        const [conn, error] = await this.pool.addConnection(
            ip, port, messageOrInteraction
        )

        if (error) {
            generator.updateAtomicData(
                "Error",
                error,
            )
        } else {

            // Attempt to login
            const credentials = {
                opcode: 1,
                username: username,
                password: md5(password)
            }

            conn.sendCommand(credentials);

            generator.updateAtomicData(
                "Success",
                "Logging in into remote console..."
            );
        }
        return generator.getEmbed();
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.REMOTECONSOLECHANNELS.includes(message.channel.id))
            return;

        const ip = args[0];
        const port = args[1];
        const username = args[2];
        const password = args[3];

        const embed = await this.generateEmbedResponse(message, ip, port, username, password);

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

        const modal = new ModalBuilder()
            .setTitle("Login into remote console")
            .setCustomId("remotecon-login-modal")

        const ipInputRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("remotecon-login-ip")
                    .setLabel("Type the server's IP")
                    .setPlaceholder("IP")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(7)
                    .setMaxLength(15)
            )

        const portInputRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("remotecon-login-port")
                    .setLabel("Type the server's PORT")
                    .setPlaceholder("PORT")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(5)
            )

        const usernameInputRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("remotecon-login-username")
                    .setLabel("Type your admin name")
                    .setPlaceholder("Name")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(15)
            )

        const passwordInputRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("remotecon-login-password")
                    .setLabel("Type your admin password")
                    .setPlaceholder("Password")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(25)
            )

        modal.addComponents(ipInputRow, portInputRow, usernameInputRow, passwordInputRow)

        await interaction.showModal(modal)
    }

    async onInteractionModalSubmit(interaction) {

        if (interaction.customId !== "remotecon-login-modal")
            return;

        // Check if the command is allowed in this channel
        if (!config.REMOTECONSOLECHANNELS.includes(interaction.channel.id))
            return;

        // Get parameters from fields
        const ip = interaction.fields.getTextInputValue("remotecon-login-ip");
        const port = interaction.fields.getTextInputValue("remotecon-login-port");
        const username = interaction.fields.getTextInputValue("remotecon-login-username");
        const password = interaction.fields.getTextInputValue("remotecon-login-password");

        await deferInteractionReply(interaction, true);

        // Send data to database and get response
        const embed = await this.generateEmbedResponse(interaction, ip, port, username, password);

        replyInteraction(interaction, {
            embeds: [embed]
        })
    }

    onRemoteConsoleData(conn, data, target) {
        if (data.opcode !== 1)
            return;

        const generator = new EmbedGenerator();

        generator.configureMessageAuthor(
            target,
            target.channel.isDMBased()
        )

        const level = data.level;

        if (level < 0) {
            generator.updateAtomicData(
                "Error",
                "Invalid credentials"
            )
        } else {
            generator.updateAtomicData(
                "Success",
                "Logged in successfully into remote console - " + conn.ip + ":" + conn.port + " - Level: " + level
            )
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
module.exports = RemoteConsoleConnectFeature;