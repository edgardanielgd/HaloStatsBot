const Feature = require("../Feature.js");
const { searchPlayer } = require("../../db/players");
const EmbedGenerator = require("../../utils/generateEmbed");
const config = require("../../config");
const { sendMessage, replyInteraction, deferInteractionReply } = require("../../utils/crudMessages");
const { SlashCommandBuilder } = require("discord.js");

class CheckIPInfoFeature extends Feature {
    constructor() {
        super("Search a player over the database", "Get player from database", "📒");
        this.messageCommandAliases = [
            "searchplayer", "search", "findplayer", "find"
        ];
        this.slashCommandName = "searchplayer";
    }

    config = (_, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Get player from database")
            .addSubcommand(subcommand =>
                subcommand
                    .setName("all")
                    .setDescription("Search all players")
                    .addNumberOption(option =>
                        option
                            .setName("page")
                            .setDescription("Page to search")
                            .setRequired(false)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("ip")
                    .setDescription("Search player by IP")
                    .addStringOption(option =>
                        option
                            .setName("ip")
                            .setDescription("IP address to search")
                            .setRequired(true)
                    )
                    .addNumberOption(option =>
                        option
                            .setName("page")
                            .setDescription("Page to search")
                            .setRequired(false)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("name")
                    .setDescription("Search player by name")
                    .addStringOption(option =>
                        option
                            .setName("name")
                            .setDescription("Name to search")
                            .setRequired(true)
                    )
                    .addNumberOption(option =>
                        option
                            .setName("page")
                            .setDescription("Page to search")
                            .setRequired(false)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("server")
                    .setDescription("Search player by server")
                    .addStringOption(option =>
                        option
                            .setName("server")
                            .setDescription("Server to search")
                            .setRequired(true)
                    )
                    .addNumberOption(option =>
                        option
                            .setName("page")
                            .setDescription("Page to search")
                            .setRequired(false)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName("description")
                    .setDescription("Search player by keyword in description")
                    .addStringOption(option =>
                        option
                            .setName("description")
                            .setDescription("Description to search")
                            .setRequired(true)
                    )
                    .addNumberOption(option =>
                        option
                            .setName("page")
                            .setDescription("Page to search")
                            .setRequired(false)
                    )
            )

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);
    }

    async generateEmbedResponse(messageOrInteraction, type, value, page) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        page = page > 0 ? page : 1;

        const result = await searchPlayer(type, value, page);

        if (result.error) {
            generator.updateAtomicData(
                "Error",
                result.error,
            )

            return generator.getEmbed();
        }

        const searchResult = result.result;

        if (searchResult.length === 0) {
            generator.updateAtomicData(
                "This is what i found",
                "\`No results found\`",
            )

            return generator.getEmbed();
        }

        let description = "";
        for (let i = 0; i < searchResult.length; i++) {
            const player = searchResult[i];
            description += `${i + 1 + (page - 1) * config.PLAYERSLIMITPERPAGE}. \`Name:\` ${player.name} `;
            description += `\`IP:\` ${player.ip} `;
            description += `\`Servers:\` ${player.servers.join(", ")} `;
            description += `\`Description:\` ${player.description}\n`;
        }

        generator.updateAtomicData(
            "This is what i found",
            description,
        )

        return generator.getEmbed();
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.PLAYERSDATABASECHANNELS.includes(message.channel.id))
            return;

        const type = args[0];
        const value = args[1];
        const page = args[2];

        const embed = await this.generateEmbedResponse(message, type, value, page);

        sendMessage(message.channel, {
            embeds: [embed]
        })
    }

    async onInteractionCommand(interaction) {
        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.PLAYERSDATABASECHANNELS.includes(interaction.channel.id))
            return;

        const type = interaction.options.getSubcommand();

        const ip = interaction.options.getString("ip");
        const name = interaction.options.getString("name");
        const server = interaction.options.getString("server");
        const description = interaction.options.getString("description");
        const page = interaction.options.getNumber("page");

        let value = "";

        switch (type) {
            case "ip": value = ip; break;
            case "name": value = name; break;
            case "server": value = server; break;
            case "description": value = description; break;
        }

        await deferInteractionReply(interaction);

        const embed = await this.generateEmbedResponse(interaction, type, value, page);

        replyInteraction(interaction, {
            embeds: [embed]
        });
    }
}

// Singleton export
module.exports = new CheckIPInfoFeature();