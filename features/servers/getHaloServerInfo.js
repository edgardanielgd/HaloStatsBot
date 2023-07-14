const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed");
const { setDefaultIpAddress, getDefaultIpAddress } = require("../../db/servers");
const config = require("../../config");
const { SlashCommandBuilder } = require("discord.js")
const { update, configureTimeout } = require("./singleServerRowConfig");
const HaloServersQuery = require("./Query");
const { getString } = require("../../lang");
const { sendMessage, replyInteraction, editMessage, deferInteractionReply } = require("../../utils/crudMessages");
const { validateIpFormat, validatePortFormat } = require("../../utils/validateIpFormat");
const { getMap } = require("./getMapImageURL.js");

class GetHaloServerInfoFeature extends Feature {
    constructor() {
        super("Get Halo Server Info", "Get general stats from a server", "💻");
        this.messageCommandAliases = [
            "on", "sv", "query", "server", "info"
        ];
        this.slashCommandName = "on";

        this.configureDefaultIpCommandAlias = "setdefaultip";
        this.configureDefaultIpCommandName = "set_default_ip";
    }

    config = (_, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Query a server game state")
            .addStringOption(option =>
                option.setName("server")
                    .setDescription("The server port (or ip:port or ip) you want to query")
                    .setRequired(true)
            )
            .addNumberOption(option =>
                option.setName("port")
                    .setDescription("The server port if you user ip port separated format")
                    .setRequired(false)
            )

        const configureSlashCommandInfo = new SlashCommandBuilder()
            .setName(this.configureDefaultIpCommandName)
            .setDescription("Configure the default ip address to query")
            .addStringOption(option =>
                option.setName("ip")
                    .setDescription("The ip address you want to set as default")
                    .setRequired(true)
            )

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON(), configureSlashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);
        subscriber.registerOnInteractionButton(this);
    }

    resolveAddress = (arg1, arg2) => {
        let ip = null, port = null;
        if (arg2) {
            // A port was passed, so the first arg should be the ip
            ip = arg1;
            port = arg2;
        } else if (arg1) {
            let ip_port = arg1.split(":"); // Maybe the user passed ip:port

            if (ip_port && ip_port.length == 2) {
                ip = ip_port[0];
                port = ip_port[1];
            } else {
                // Maybe the user passed only the port
                port = arg1;

                // TODO: Get default ip from db
                ip = config.LASTRESOURCEDEFAULTIPADDRESS;
            }

        } else {
            return [null, null, "You must provide ip, port or ip:port"];
        }

        const validation = validateIpFormat(ip);
        if (validation.error) {
            // Generate error message
            return [null, null, validation.error];
        }

        const validationPort = validatePortFormat(port);
        if (validationPort.error) {
            // Generate error message
            return [null, null, validationPort.error];
        }

        return [ip, port, null];
    }

    async generateEmbedResponse(messageOrInteraction, ipResolved, portResolved, error) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        if (error) {
            generator.updateAtomicData(
                getString("en", "Error"),
                error
            )
            return {
                status: 1, // Error
                embed: generator.getEmbed()
            }
        }

        const query = new HaloServersQuery(ipResolved, portResolved);
        const queryResponse = await query.send();

        if (queryResponse.error) {
            generator.updateAtomicData(
                getString("en", "Error"),
                queryResponse.error + "\n" +
                "Awaited time: " + queryResponse.time + " ms" + "\n" +
                "Ip: " + queryResponse.ip + "\n" +
                "Port: " + queryResponse.port
            )
            return {
                status: 1, // Error
                embed: generator.getEmbed()
            }
        }

        const data = queryResponse.data;

        // Lets create a beautiful embed body
        // we will save the info within embed description
        let description = `\`Server Name: \` ${data.name}\n` +
            `\`Port: \` ${data.port}\n` +
            `\`Max. Players: \` ${data.maxPlayers}\n` +
            `\`Password: \` ${data.password ? "Yes" : "No"}\n` +
            `\`Map: \` ${data.mapName}\n` +
            `\`Online Players: \` ${data.currentPlayers}\n` +
            `\`Gametype: \` ${data.gametype}\n` +
            `\`Teamplay: \` ${data.teamPlay ? "Yes" : "No"}\n` +
            `\`Variant: \` ${data.gameVariant}\n\n`;

        const generatePlayerString = (i, player) => {
            return `${!player.team ? "⚪" : (player.team == "blue" ? "🔵" : "🔴")
                } ${i + 1}.\t ${player.name} \t Score: ${player.score} \t Ping: ${player.ping} ms`
        }
        if (data.currentPlayers == 0) {
            description += "\`No players online... (Maybe seed them?)\`";
        } else {
            if (!data.teamPlay) {
                description += "\`";
                for (let i = 0; i < data.currentPlayers; i++) {
                    const player = data.players[i];
                    description += generatePlayerString(i, player) + "\n";
                }

                description += "\`";

            } else {
                description += "\`";
                let i;
                for (i = 0; i < data.redPlayers.length; i++) {
                    const player = data.redPlayers[i];
                    description += generatePlayerString(i, player) + "\n";
                }
                for (let j = 0; j < data.bluePlayers.length; j++) {
                    const player = data.bluePlayers[j];
                    description += generatePlayerString(i + j, player) + "\n";
                }

                // Add general info to description
                description += "\`\n";

                description += `🟥 | \`Reds Count: \` ${data.redPlayers.length} | \`Red Score: \` ${data.redScore}\n`
                description += `🟦 | \`Blues Count: \` ${data.bluePlayers.length} | \`Blue Score: \` ${data.blueScore}`

            }
        }

        generator.updateAtomicData(
            `Checking stats of ${query.ip}:${query.port}`,
            description, null, null, null, getMap(data.mapName)
        )

        return {
            status: 0, // Success
            embed: generator.getEmbed()
        }
    }

    getDataFromEmbed(embed, retrying) {
        if (embed == null) {
            return [null, null, "Embed is null"];
        }

        const title = embed.title;
        const description = embed.description;

        if (retrying) {
            // We have got an error before
            const parts = description.split("\n");

            if (parts.length < 4) {
                return [null, null, "Embed description has less than 4 lines"];
            }

            const ip_section = parts[2].split(" ");
            const port_section = parts[3].split(" ");

            if (ip_section.length < 2) {
                return [null, null, "Embed description has less than 2 parts in ip section"];
            }

            if (port_section.length < 2) {
                return [null, null, "Embed description has less than 2 parts in port section"];
            }

            const ip = ip_section[1];
            const port = port_section[1];

            return [ip, port, null];
        } else {

            // A successful case which is being updated
            const parts = title.split(" ");

            if (parts.length < 4) {
                return [null, null, "Embed title has less than 4 parts"];
            }

            const ip_port = parts[3].split(":");
            const ip = ip_port[0];
            const port = ip_port[1];

            return [ip, port, null];
        }
    }

    async configureMessage(messageOrInteraction, arg1, arg2, init = false, includeRow = true) {
        const [ipResolved, portResolved, error] = this.resolveAddress(arg1, arg2);

        const { status, embed } = await this.generateEmbedResponse(messageOrInteraction, ipResolved, portResolved, error);

        // Configure message menu row
        let row = null;

        if (includeRow)
            row = update(messageOrInteraction, status == 1, init);

        return {
            embeds: [embed],
            components: (row && includeRow) ? [row] : []
        }
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        const options = await this.configureMessage(message, args[0], args[1], true);

        const msg = await sendMessage(message.channel, options);

        configureTimeout(msg);
    }

    async onInteractionCommand(interaction) {
        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        const ip = interaction.options.getString("server");
        const port = interaction.options.getNumber("port");

        await deferInteractionReply(interaction);

        const options = await this.configureMessage(interaction, ip, port, true);

        const msg = await replyInteraction(interaction, options);

        configureTimeout(msg);
    }

    async onInteractionButton(interaction) {
        const id = interaction.customId;

        if (id !== "Update" && id !== "Retry") {
            return;
        }

        // The most reliable way for now is to get strings from the embed
        // in future maybe we can save the ip and port in a database

        const message = interaction.message;
        const embed = message.embeds[0];

        const trying = id == "Retry";

        const [ip, port, error] = this.getDataFromEmbed(embed, trying);

        if (error) return;

        interaction.deferUpdate();

        let options = await this.configureMessage(
            message, ip, port, false
        );

        // Overwrite the messages footer setting the correct author
        const fixedEmbed = new EmbedGenerator(options.embeds[0]);
        fixedEmbed.configureMessageAuthor(
            {
                member: interaction.member,
                user: interaction.user,
                channel: interaction.channel

            }, interaction.channel.isDMBased()
        );

        options.embeds = [fixedEmbed.getEmbed()];

        const msg = await editMessage(message, options);

        configureTimeout(msg);
    }
}

// Singleton export
module.exports = new GetHaloServerInfoFeature();