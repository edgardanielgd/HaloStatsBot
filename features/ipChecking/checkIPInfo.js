const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed");
const config = require("../../config");
const { sendMessage, replyInteraction, deferInteractionReply } = require("../../utils/crudMessages");
const { SlashCommandBuilder } = require("discord.js");
const countries = require("../../countries.json");
const { validateIpFormat } = require("../../utils/validateIpFormat");
const axios = require("axios");

class CheckIPInfoFeature extends Feature {
    constructor() {
        super("Get IP info", "Get info from a given IP address", "🛅");
        this.messageCommandAliases = [
            "getipinfo", "ipinfo", "checkip", "ip"
        ];
        this.slashCommandName = "checkip";
    }

    config = (_, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Get info from a given IP address")
            .addStringOption(option =>
                option.setName("ip")
                    .setDescription("The ip address to check")
                    .setRequired(true)
            )
            .addNumberOption(option =>
                option.setName("provider")
                    .setDescription("The provider for checking the IP address (1: ipqualityscore.com, 2: vpnapi.com)")
                    .setRequired(false)
            )

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);
    }

    async generateEmbedResponse(messageOrInteraction, ip, provider) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        const validation = validateIpFormat(ip);
        if (validation.error) {
            generator.updateAtomicData(
                "Error",
                "The given IP address is not valid: " + validation.error
            )
            return generator.getEmbed()
        }

        const isOption1 = !provider || provider == 1;

        const providerConnectionURL = isOption1 ?
            `${config.IPQUALITYURL}/${config.IPQUALITYAUTH}/${ip}?strictness=0&allow_public_access_points=true&fast=true&lighter_penalties=true&mobile=true`
            :
            `${config.VPNAPIURL}/${ip}?key=${config.VPNAPI}`

        try {
            const { data: response } = await axios({
                method: "get",
                url: providerConnectionURL,
                responseType: "json"
            });

            let description;

            if (isOption1) {
                if (response.success) {
                    description = `\`\`\`Country name: ${countries[response.country_code]}\n` +
                        `Region: ${response.region}\n` +
                        `City: ${response.city}\n` +
                        `Org: ${response.organization}\n` +
                        `Timezone: ${response.timezone}\n` +
                        `Host: ${response.host}\n` +
                        `Is proxy: ${response.proxy}\n` +
                        `Is VPN: ${response.vpn}\`\`\`\n\n` +

                        `Fraud Score: ${response.fraud_score}%
                    ${(
                            (score) => {
                                let scoreText = "";
                                for (let i = 0; i >= 0 && i <= score - 10 && i <= 90; i += 10) {
                                    if (i < 30) {
                                        scoreText += "🟩";
                                    } else if (i < 60) {
                                        scoreText += "🟧";
                                    } else if (i < 90) {
                                        scoreText += "🟥";
                                    } else {
                                        scoreText += "❌";
                                    }
                                }
                                return scoreText;
                            }
                        )(response.fraud_score)
                        }`;
                } else {
                    description = `\`${response.message}\``
                }
            } else {
                if (!response.message) {
                    description = `\`\`\`Country name: ${response.location.country}\n` +
                        `Timezone: ${response.location.time_zone} \n` +
                        `Is Tor: ${response.security.tor}\n` +
                        `Is Proxy: ${response.security.proxy} \n` +
                        `Is VPN: ${response.security.vpn} \n` +
                        `Is Relay: ${response.security.relay} \n` +
                        `Network: ${response.network.network} \n` +
                        `Organization: ${response.network.autonomous_system_organization}\`\`\` \n`;
                } else {
                    description = `\`${response.message}\``
                }
            }

            generator.updateAtomicData(
                "IP Address Info for " + ip,
                description
            );

        } catch (e) {
            console.log(e)
            generator.updateAtomicData(
                "Error",
                "There was an error while checking the IP address: " + e.message
            )
        }

        return generator.getEmbed();
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.IPREPUTATIONCHANNELS.includes(message.channel.id))
            return;

        const embed = await this.generateEmbedResponse(message, args[0], args[1]);

        sendMessage(message.channel, {
            embeds: [embed]
        })
    }

    async onInteractionCommand(interaction) {
        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        // Check if the command is allowed in this channel
        if (!config.IPREPUTATIONCHANNELS.includes(interaction.channel.id))
            return;

        const ip = interaction.options.getString("ip");
        const provider = interaction.options.getNumber("provider");

        await deferInteractionReply(interaction);

        const embed = await this.generateEmbedResponse(interaction, ip, provider);

        replyInteraction(interaction, {
            embeds: [embed]
        });
    }
}

// Singleton export
module.exports = new CheckIPInfoFeature();