const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed");
const { updateStatsMessage, removeStatsMessage, getStatsMessages } = require("../../db/servers");
const config = require("../../config");
const { SlashCommandBuilder } = require("discord.js")
const RemoteConsoleConnection = require("./Connection");
const { sendMessage, replyInteraction, editMessage, deferInteractionReply } = require("../../utils/crudMessages");
const { generateBasicServerDescription } = require("./utils");
const md5 = require("blueimp-md5");

class RemoteConsoleGetServersStaticStatsFeature extends Feature {
    constructor() {
        super("Manage stats channels info", "Show constant stats of servers", "💻");
        this.messageCommandAliases = [
            "rconaddserverstat", "rconaddstat"
        ];
        this.messageCommandAliasesDropStat = [
            "rcondropserverstat", "rcondropstat"
        ]

        this.slashCommandName = "rconaddstat";
        this.slashCommandNameDropStat = "rcondropstat";

        this.statsMessages = [];
    }

    config = async (bot, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Add a stat channel and message for a given IP and Port (Rcon query)")
            .addStringOption(option =>
                option.setName("channel")
                    .setDescription("The channel's ID where the message will be sent")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("message")
                    .setDescription("The message's ID you want to use")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("ip")
                    .setDescription("The ip address you want to query")
                    .setRequired(true)
            )
            .addNumberOption(option =>
                option.setName("port")
                    .setDescription("The port you want to query")
                    .setRequired(true)
            )

        const deleteSlashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandNameDropStat)
            .setDescription("Remove a stat channel and message (Rcon query)")
            .addStringOption(option =>
                option.setName("channel")
                    .setDescription("The channel's ID where the message will be sent")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("message")
                    .setDescription("The message's ID you want to use")
                    .setRequired(true)
            )

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON(), deleteSlashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);

        this.bot = bot;

        await this.updateStatsMessages();

        // Start the interval
        this.interval = setInterval(() => {
            this.updateStats();
        }, config.STATSCHANNELSTIMEOUT);
    }

    async updateStats() {
        for (const statServer of this.statsMessages) {
            const channel = await this.bot.channels.fetch(statServer.channel);
            if (!channel) {
                continue;
            }

            const message = await channel.messages.fetch(statServer.message);
            if (!message) {
                continue;
            }

            const generator = new EmbedGenerator();
            generator.configureMessageAuthor(
                message, channel.isDMBased()
            );

            const query = new RemoteConsoleConnection(statServer.ip, statServer.port);
            const result = await query.connect();

            if (result.error) {
                generator.updateAtomicData(
                    `[${statServer.ip}:${statServer.port}] Error:`,
                    result.error
                );

                editMessage(message, {
                    content: null,
                    embeds: [generator.getEmbed()]
                });
            } else {

                const handleError = (err) => {
                    query.removeAllListeners();

                    query.disconnect();

                    generator.updateAtomicData(
                        `[${statServer.ip}:${statServer.port}] Error:`,
                        err.message
                    );

                    editMessage(message, {
                        content: null,
                        embeds: [generator.getEmbed()]
                    });
                }

                const handleClose = () => {
                    query.removeAllListeners();

                    generator.updateAtomicData(
                        `[${statServer.ip}:${statServer.port}] Error:`,
                        "Connection closed"
                    );

                    editMessage(message, {
                        content: null,
                        embeds: [generator.getEmbed()]
                    });
                }

                // Try to login first
                const credentials = {
                    opcode: 1,
                    username: config.REMOTECONSOLEPLAYERNAME,
                    password: md5(config.REMOTECONSOLEPASSWORD)
                }

                query.sendCommand(credentials);

                // Schedule async wait for response / error
                query.on("data", (data) => {
                    const opcode = data.opcode;

                    if (opcode === 1) {
                        query.removeAllListeners();

                        const level = data.level;

                        if (level < 0) {
                            generator.updateAtomicData(
                                `[${statServer.ip}:${statServer.port}] Error:`,
                                "Invalid credentials"
                            );

                            editMessage(message, {
                                content: null,
                                embeds: [generator.getEmbed()]
                            });

                            return;
                        }

                        // Success login in, lets send a query message
                        const queryMessage = {
                            opcode: 2,
                        }

                        query.sendCommand(queryMessage);

                        query.on("data", (data) => {

                            if (data.opcode === 2) {

                                query.removeAllListeners();

                                query.disconnect();

                                // This is the actual query response
                                const title = `${data.name}`;

                                generator.updateAtomicData(
                                    title,
                                    generateBasicServerDescription(query, data)
                                );

                                editMessage(message, {
                                    content: null,
                                    embeds: [generator.getEmbed()]
                                });
                            }
                        });

                        query.on("error", (err) => {
                            handleError(err);
                        });

                        query.on("close", () => {
                            handleClose();
                        });

                    }
                });

                query.on("error", (err) => {
                    handleError(err);
                });

                query.on("close", () => {
                    handleClose();
                });

            }
        }
    }

    async updateStatsMessages() {
        const result = await getStatsMessages(false);

        if (!result.error) {
            this.statsMessages = result.result;
        } else {
            console.log(result.error);

            this.statsMessages = [];
        }
    }

    async generateEmbedResponse(messageOrInteraction, targetChannel, targetMessage, ip, port) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        const tarChannel = await this.bot.channels.fetch(targetChannel);
        if (!tarChannel) {
            generator.updateAtomicData(
                "Error",
                "Channel not found"
            );

            return generator.getEmbed();
        }

        const tarMessage = await tarChannel.messages.fetch(targetMessage);
        if (!tarMessage) {
            generator.updateAtomicData(
                "Error",
                "Message not found"
            );

            return generator.getEmbed();
        }

        const result = await updateStatsMessage(
            tarChannel, tarMessage, ip, port, false
        );

        if (result.error) {
            generator.updateAtomicData(
                "Error",
                result.error
            );

            return generator.getEmbed();
        }

        generator.updateAtomicData(
            "Success",
            "Stats message updated"
        );

        // Also update local stats messages
        await this.updateStatsMessages();

        return generator.getEmbed();
    }

    async generateEmbedResponseDrop(messageOrInteraction, targetChannelId, targetMessageId) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        const result = await removeStatsMessage(
            targetChannelId, targetMessageId, false
        );

        if (result.error) {
            generator.updateAtomicData(
                "Error",
                result.error
            );

            return generator.getEmbed();
        }

        generator.updateAtomicData(
            "Success",
            "Stats message removed"
        );

        // Also update local stats messages
        await this.updateStatsMessages();

        return generator.getEmbed();
    }

    async onMessageCommand(message, command, args) {

        if (message.author.id !== config.OWNERID)
            return;

        let embed = null;
        if (this.messageCommandAliases.includes(command)) {
            const targetChannelId = args[0];
            const targetMessageId = args[1];
            const ip = args[2];
            const port = args[3];

            embed = await this.generateEmbedResponse(
                message, targetChannelId, targetMessageId, ip, port
            );
        } else if (this.messageCommandAliasesDropStat.includes(command)) {
            const targetChannelId = args[0];
            const targetMessageId = args[1];

            embed = await this.generateEmbedResponseDrop(
                message, targetChannelId, targetMessageId
            );

        } else {
            return;
        }

        sendMessage(message.channel, {
            embeds: [embed]
        });
    }

    async onInteractionCommand(interaction) {

        if (interaction.user.id !== config.OWNERID)
            return;

        const command = interaction.commandName;
        let embed = null;

        if (command === this.slashCommandName) {
            const targetChannel = interaction.options.getString("channel");
            const targetMessage = interaction.options.getString("message");
            const ip = interaction.options.getString("ip");
            const port = interaction.options.getNumber("port");

            await deferInteractionReply(interaction);

            embed = await this.generateEmbedResponse(
                interaction, targetChannel, targetMessage, ip, port
            );
        } else if (command === this.slashCommandNameDropStat) {
            const targetChannel = interaction.options.getString("channel");
            const targetMessage = interaction.options.getString("message");

            await deferInteractionReply(interaction);

            embed = await this.generateEmbedResponseDrop(
                interaction, targetChannel, targetMessage
            );
        } else {
            return;
        }

        replyInteraction(interaction, {
            embeds: [embed]
        });
    }
}

// Singleton export
module.exports = new RemoteConsoleGetServersStaticStatsFeature();