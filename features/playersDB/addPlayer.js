const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("@discordjs/builders")
const { addPlayer } = require("./../../db/players");
const Discord = require("discord.js");
const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed");
const config = require("../../config");
const { sendMessage, replyInteraction, deferInteractionReply } = require("../../utils/crudMessages");
const { SlashCommandBuilder } = require("discord.js");
const { validateIpFormat } = require("./../../utils/validateIpFormat");
const { dmOwner } = require("../../logs/dmOwner");

class CheckIPInfoFeature extends Feature {
    constructor() {
        super("Add a player to database", "Add player to database providing ip, name, server and description", "🖋️");
        this.messageCommandAliases = [
            "addplayer", "add", "insert", "insertplayer"
        ];
        this.slashCommandName = "addplayer";
    }

    config = (bot, subscriber) => {

        this.bot = bot;

        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Add player to database")

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);
        subscriber.registerOnInteractionModalSubmit(this);
    }

    async generateEmbedResponse(messageOrInteraction, ip, name, servers, description) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        const ipValidation = validateIpFormat(ip);
        if (ipValidation.error) {
            generator.updateAtomicData(
                "Error",
                ipValidation.error
            )

            return generator.getEmbed();
        }

        const result = await addPlayer(ip, name, servers, description);

        if (result.error) {
            generator.updateAtomicData(
                "Error",
                result.error,
            )
        } else {
            generator.updateAtomicData(
                "Success",
                result.message,
            )

            const user = messageOrInteraction.author || messageOrInteraction.user;

            // Send message to owner
            dmOwner(this.bot,
                `New player added to database:\nIP: ${ip}\nName: ${name}\nServer: ${servers}\nDescription: ${description}\n` +
                `Added by: ${user.tag}`
            )
        }

        return generator.getEmbed();
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.PLAYERSDATABASECHANNELS.includes(message.channel.id))
            return;

        // Get parameters from args
        const ip = args[0];
        const name = args[1];
        const servers = args[2];
        const description = args[3];

        // Send data to database and get response
        const embed = await this.generateEmbedResponse(message, ip, name, servers, description);

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

        const modal = new ModalBuilder()
            .setTitle("Add player to database")
            .setCustomId("addplayer-modal")

        const ipInputRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("addplayer-ip")
                    .setLabel("Type the player's IP")
                    .setPlaceholder("IP")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(7)
                    .setMaxLength(15)
            )

        const nameInputRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("addplayer-name")
                    .setLabel("Type the player's name")
                    .setPlaceholder("Name")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(15)
            )

        const serversInputRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("addplayer-servers")
                    .setLabel("Type the player's servers separated by comma")
                    .setPlaceholder("Servers")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(100)
            )

        const descriptionInputRow = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId("addplayer-description")
                    .setLabel("Type the player's description")
                    .setPlaceholder("Description")
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(400)
            )

        modal.addComponents(ipInputRow, nameInputRow, serversInputRow, descriptionInputRow)

        await interaction.showModal(modal)
    }

    async onInteractionModalSubmit(interaction) {

        if (interaction.customId !== "addplayer-modal")
            return;

        // Check if the command is allowed in this channel
        if (!config.PLAYERSDATABASECHANNELS.includes(interaction.channel.id))
            return;

        // Get parameters from fields
        const ip = interaction.fields.getTextInputValue("addplayer-ip");
        const name = interaction.fields.getTextInputValue("addplayer-name");
        const servers = interaction.fields.getTextInputValue("addplayer-servers");
        const description = interaction.fields.getTextInputValue("addplayer-description");

        await deferInteractionReply(interaction);

        // Send data to database and get response
        const embed = await this.generateEmbedResponse(interaction, ip, name, servers, description);

        replyInteraction(interaction, {
            embeds: [embed]
        })
    }
}

// Singleton export
module.exports = new CheckIPInfoFeature();