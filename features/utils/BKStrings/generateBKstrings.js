const Feature = require("../../Feature.js");
const config = require("../../../config/index.js");
const genereateBlackshaloStrings = require("./generateBlackshaloStrings.js");
const generateDiscordStrings = require("./generateDiscordStrings.js");
const EmbedGenerator = require("../../../utils/generateEmbed.js");
const { sendMessage, replyInteraction } = require("../../../utils/crudMessages.js");
const axios = require("axios");
const { SlashCommandBuilder } = require("discord.js");

class GenerateBKStringsFeature extends Feature {
    constructor() {
        super("Generate BK Strings", "Generate admins lists for discord and blackshalo", "👥");
        this.messageCommandAliases = [
            "generate"
        ];
        this.slashCommandName = "generate";
    }

    config = (_, subscriber) => {
        subscriber.registerOnMessageCommand(this);
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        const options = await this.generateFilesMessage(message);

        sendMessage(message.channel, options)
    }

    async generateFilesMessage(interactionOrMessage) {
        const attachments = interactionOrMessage.attachments;

        if (attachments.size === 0)
            return {
                content: "You need to attach a file to generate the strings"
            }

        // Read the file
        const file = attachments.first()?.url;

        if (!file)
            return {
                content: "You need to attach a file to generate the strings"
            }

        // Fetch the given file
        let json;
        try {
            const response = await axios.get(file);
            json = response.data;
        } catch (error) {
            console.log(error)
            return {
                content: "Error fetching the file"
            }
        }

        if (!json)
            return {
                content: "Error parsing the file"
            }

        // Generate the strings
        const { data: blackshaloString, error: blackshaloError } = genereateBlackshaloStrings(json);

        if (blackshaloError)
            return {
                content: blackshaloError
            }

        // Check if discord strings can be generated
        const { data: discordString, error: discordError } = generateDiscordStrings(json);

        if (discordError)
            return {
                content: discordError
            }


        return {
            content: "Don't forget to replace webhook URL in discord.json!!",
            files: [
                {
                    attachment: Buffer.from(blackshaloString, "utf-8"),
                    name: "blackshalo.txt"
                },
                {
                    attachment: Buffer.from(discordString, "utf-8"),
                    name: "discord.json"
                }
            ]
        }

    }

}

// Singleton export
module.exports = new GenerateBKStringsFeature();