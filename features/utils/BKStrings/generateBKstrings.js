const Feature = require("../../Feature.js");
const config = require("../../../config/index.js");
const genereateBlackshaloStrings = require("./generateBlackshaloStrings.js");
const EmbedGenerator = require("../../../utils/generateEmbed.js");
const { sendMessage, replyInteraction } = require("../../../utils/crudMessages.js");
const { SlashCommandBuilder } = require("discord.js");

class GenerateBKStringsFeature extends Feature {
    constructor() {
        super("Generate BK Strings", "Generate admins lists for discord and blackshalo", "👥");
        this.messageCommandAliases = [
            "generate"
        ];
        this.slashCommandName = "generate";
    }

    config = (bot, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Generate admins lists for discord and blackshalo");

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);

        this.bot = bot;
    }

    async onMessageCommand(message, command, _) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        const options = await this.generateFilesMessage(message);

        sendMessage(message.channel, options)
    }

    async onInteractionCommand(interaction) {
        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        const options = await this.generateFilesMessage(interaction);

        replyInteraction(interaction, options);
    }

    async generateFilesMessage() {
        const BKServerID = config.BKDISCORDSERVER;
        const BKRoles = config.BKROLESTOSCAN;

        let roles;

        try {
            const guild = await this.bot.guilds.fetch(BKServerID);
            roles = await guild.roles.fetch().filter(
                role => BKRoles.includes(role.id)
            );
        } catch (e) {
            return {
                content: "I couldn't fetch the roles from BK's discord server"
            }
        }


        const concatenated = genereateBlackshaloStrings(roles);


        return { content: concatenated };
    }

}

// Singleton export
module.exports = new GenerateBKStringsFeature();