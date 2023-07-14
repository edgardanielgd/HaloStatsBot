const RemoteConsoleFeature = require("./RemoteConsoleFeature");
const EmbedGenerator = require("../../utils/generateEmbed.js");
const config = require("../../config/index.js");
const { sendMessage, replyInteraction, deferInteractionReply } = require("../../utils/crudMessages.js");
const { SlashCommandBuilder } = require("discord.js");
const { getMap } = require("./../servers/getMapImageURL");
const { generateRichServerDescription, generatePlayersLocationsDescription } = require("./utils");

class RemoteConsoleQueryStatsFeature extends RemoteConsoleFeature {
    constructor() {
        super("Query players stats", "Query server specific data and players data (even locations)", "🏠");
        this.messageCommandAliases = [
            "remote_con_query", "rcon_query"
        ];
        this.slashCommandName = "remote-console-query";
    }

    config = (_, subscriber, remoteConsolePool) => {

        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Query status of server and players list")
            .addStringOption(
                (option) => option
                    .setName("type")
                    .setDescription("The type of query to be sent (coords or stats)")
                    .setRequired(true)
                    .addChoices(
                        { name: "Coordinates", value: "coords" },
                        { name: "Stats", value: "stats" }
                    )
            )

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);

        remoteConsolePool.registerOnDataListener(this);

        this.pool = remoteConsolePool;
    }

    async generateEmbedResponse(messageOrInteraction, type) {
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

        const query = {
            opcode: type === "coords" ? 4 : 2
        }

        conn.sendCommand(query);

        generator.updateAtomicData(
            "Querying server..."
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

        const type = args[0];

        const embed = await this.generateEmbedResponse(message, type);

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

        const type = interaction.options.getString("type");

        await deferInteractionReply(interaction, true);

        // Send data to database and get response
        const embed = await this.generateEmbedResponse(interaction, type);

        replyInteraction(interaction, {
            embeds: [embed]
        })
    }

    onRemoteConsoleData(conn, data, target) {

        if (data.opcode !== 2 && data.opcode !== 4)
            return;

        const generator = new EmbedGenerator();

        generator.configureMessageAuthor(
            target,
            target.channel.isDMBased()
        )

        const baseTitle = "Server query for " + conn.ip + ":" + conn.port;
        let description;

        if (data.opcode === 2) {
            description = generateRichServerDescription(conn, data);
        } else {
            description = generatePlayersLocationsDescription(data);
        }

        generator.updateAtomicData(
            baseTitle,
            description, null, null, null, data.map ? getMap(data.map) : null
        )

        sendMessage(target.channel, {
            embeds: [
                generator.getEmbed()
            ]
        });
    }
}

// Singleton export
module.exports = RemoteConsoleQueryStatsFeature;