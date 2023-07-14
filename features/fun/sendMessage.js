const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed");
const { sendMessage, replyInteraction, deferInteractionReply } = require("../../utils/crudMessages");
const { SlashCommandBuilder } = require("discord.js");

class SendMessageFeature extends Feature {
    constructor() {
        super("Send a message to a channel", "Send a message to a channel", "📝");
        this.messageCommandAliases = [
            "sendmessage", "sendcustommessage", "sendmsg"
        ];
        this.slashCommandName = "send-message";
    }

    config = (bot, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Send a message to a channel")
            .addStringOption(option =>
                option.setName("channel")
                    .setDescription("The channel's ID where the message will be sent")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("message")
                    .setDescription("The message you want to send")
                    .setRequired(true)
            )

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);

        this.bot = bot;
    }

    async generateEmbedResponse(interactionOrMessage, targetChannel, message) {
        const generator = new EmbedGenerator();
        const channel = interactionOrMessage.channel;

        generator.configureMessageAuthor(
            interactionOrMessage,
            channel.isDMBased()
        )

        const tarChannel = await this.bot.channels.fetch(targetChannel);

        if (!tarChannel) {
            generator.updateAtomicData(
                "Error",
                "Channel not found"
            )
        } else {
            const msg = await sendMessage(tarChannel, {
                content: message
            });

            if (msg) {
                generator.updateAtomicData(
                    "Success",
                    `Message sent to channel ${tarChannel}`
                )
            } else {
                generator.updateAtomicData(
                    "Error",
                    "Unable to send message"
                )
            }
        }

        return generator.getEmbed();
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        const targetChannel = args[0];
        let targetMessage = args.slice(1).join(" ");

        if (!targetMessage) targetMessage = "This is a test message";

        const embed = await this.generateEmbedResponse(message, targetChannel, targetMessage);

        sendMessage(message.channel, {
            embeds: [embed]
        })
    }

    async onInteractionCommand(interaction) {
        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        const targetChannel = interaction.options.getString("channel");
        const message = interaction.options.getString("message");

        await deferInteractionReply(interaction);

        const embed = await this.generateEmbedResponse(interaction, targetChannel, message);

        replyInteraction(interaction, {
            embeds: [embed]
        });
    }

}

// Singleton export
module.exports = new SendMessageFeature();