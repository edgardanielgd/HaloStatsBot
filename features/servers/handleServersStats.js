const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed");
const { updateStatsMessage, removeStatsMessage, getStatsMessages } = require("../../db/servers");
const config = require("../../config");
const { SlashCommandBuilder } = require("discord.js")
const HaloServersQuery = require("./Query");
const { sendMessage, replyInteraction, editMessage, deferInteractionReply } = require("../../utils/crudMessages");

class GetServersStaticStatsFeature extends Feature {
    constructor() {
        super("Manage stats channels info", "Show constant stats of servers", "💻");
        this.messageCommandAliases = [
            "addserverstat", "addstat"
        ];
        this.messageCommandAliasesDropStat = [
            "dropserverstat", "dropstat"
        ]

        this.slashCommandName = "addstat";
        this.slashCommandNameDropStat = "dropstat";

        this.statsMessages = [];
    }

    config = async (bot, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Add a stat channel and message for a given IP and Port")
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
            .setDescription("Remove a stat channel and message")
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

            const query = new HaloServersQuery(statServer.ip, statServer.port);
<<<<<<< HEAD
            const result = await query.queryServer();

            if (result.error) {
                generator.updateAtomicData(
                    "Error",
                    result.error
                );
            } else {
                generator.updateAtomicData(
                    "Stats",
                    "Server is online"
=======
            const result = await query.send();

            if (result.error) {
                generator.updateAtomicData(
                    `[${statServer.ip}:${statServer.port}]}] Error:`,
                    result.error
                );
            } else {

                const data = result.data;

                const title = `${data.name}`;

                let description = `\`Map:\` ${data.mapName}\n`;
                description += `\`Gametype:\` ${data.gametype}\n`;
                description += `\`Variant:\` ${data.gameVariant}\n`;
                description += `\`Players:\` ${data.currentPlayers}/${data.maxPlayers}\n`;
                description += `\`Teamplay:\` ${data.teamPlay ? "Yes" : "No"}\n`;
                if (data.teamPlay) {
                    description += `\`Red Team:\` #${data.redPlayers.length} \`Score:\` ${data.redScore}\n`;
                    description += `\`Blue Team:\` #${data.bluePlayers.length} \`Score:\` ${data.blueScore}\n`;
                }
                description += "\n";
                const players = data.teamPlay ? data.redPlayers.concat(data.bluePlayers) : data.players;
                for (let i = 0; i < players.length; i++) {
                    const player = players[i];
                    const teamLogo = data.teamPlay ? (player.team === "red" ? "🔴" : "🔵") : "⚪";

                    description += `\`${teamLogo} ${i + 1}. \`${player.name} \`Score:\` ${player.score} \`Ping:\` ${player.ping} ms\n`;
                }

                generator.updateAtomicData(
                    title,
                    description
>>>>>>> master
                );
            }

            await editMessage(message, {
<<<<<<< HEAD
=======
                content: null,
>>>>>>> master
                embeds: [generator.getEmbed()]
            });
        }
    }

    async updateStatsMessages() {
        const result = await getStatsMessages();

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
            tarChannel, tarMessage, ip, port
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

<<<<<<< HEAD
    async generateEmbedResponseDrop(messageOrInteraction, targetChannel, targetMessage) {
=======
    async generateEmbedResponseDrop(messageOrInteraction, targetChannelId, targetMessageId) {
>>>>>>> master
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        const result = await removeStatsMessage(
<<<<<<< HEAD
            targetChannel, targetMessage
=======
            targetChannelId, targetMessageId
>>>>>>> master
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

<<<<<<< HEAD
        let options = {};
=======
        let embed = null;
>>>>>>> master
        if (this.messageCommandAliases.includes(command)) {
            const targetChannelId = args[0];
            const targetMessageId = args[1];
            const ip = args[2];
            const port = args[3];

<<<<<<< HEAD
            options = await this.generateEmbedResponse(
                targetChannelId, targetMessageId, ip, port
=======
            embed = await this.generateEmbedResponse(
                message, targetChannelId, targetMessageId, ip, port
>>>>>>> master
            );
        } else if (this.messageCommandAliasesDropStat.includes(command)) {
            const targetChannelId = args[0];
            const targetMessageId = args[1];

<<<<<<< HEAD
            options = await this.generateEmbedResponseDrop(
                targetChannelId, targetMessageId
=======
            embed = await this.generateEmbedResponseDrop(
                message, targetChannelId, targetMessageId
>>>>>>> master
            );

        } else {
            return;
        }

<<<<<<< HEAD
        sendMessage(message.channel, options);
=======
        sendMessage(message.channel, {
            embeds: [embed]
        });
>>>>>>> master
    }

    async onInteractionCommand(interaction) {

        if (interaction.user.id !== config.OWNERID)
            return;

        const command = interaction.commandName;
<<<<<<< HEAD
        let options = {};
=======
        let embed = null;
>>>>>>> master

        if (command === this.slashCommandName) {
            const targetChannel = interaction.options.getString("channel");
            const targetMessage = interaction.options.getString("message");
            const ip = interaction.options.getString("ip");
            const port = interaction.options.getNumber("port");

            await deferInteractionReply(interaction);

<<<<<<< HEAD
            options = await this.generateEmbedResponse(
=======
            embed = await this.generateEmbedResponse(
>>>>>>> master
                interaction, targetChannel, targetMessage, ip, port
            );
        } else if (command === this.slashCommandNameDropStat) {
            const targetChannel = interaction.options.getString("channel");
            const targetMessage = interaction.options.getString("message");

            await deferInteractionReply(interaction);

<<<<<<< HEAD
            options = await this.generateEmbedResponseDrop(
=======
            embed = await this.generateEmbedResponseDrop(
>>>>>>> master
                interaction, targetChannel, targetMessage
            );
        } else {
            return;
        }

<<<<<<< HEAD
        replyInteraction(interaction, options);
=======
        replyInteraction(interaction, {
            embeds: [embed]
        });
>>>>>>> master
    }
}

// Singleton export
module.exports = new GetServersStaticStatsFeature();