const Feature = require("../Feature.js");
const EmbedGenerator = require("../../utils/generateEmbed");
const config = require("../../config");
const { SlashCommandBuilder } = require("discord.js")
const { update, configureTimeout, prepareUpdate, generateMenu } = require("./listServerRowConfig");
const HaloServersQuery = require("./Query");
const { sendMessage, replyInteraction, editMessage, deferInteractionReply } = require("../../utils/crudMessages");

class GetHaloServersListInfoFeature extends Feature {
    constructor(singleServerFeature) {
        super("Get Halo Servers List Info", "Get general stats for the most common BK server", "💻");
        this.messageCommandAliases = [
            "list", "query_list", "querylist"
        ];
        this.slashCommandName = "list";
        this.singleServerFeature = singleServerFeature;
    }

    config = (_, subscriber) => {
        // Generate slash command info
        const slashCommandInfo = new SlashCommandBuilder()
            .setName(this.slashCommandName)
            .setDescription("Query a list of servers and get general stats")

        subscriber.registerOnInteractionCommand(this, [
            slashCommandInfo.toJSON()
        ]);
        subscriber.registerOnMessageCommand(this);
        subscriber.registerOnInteractionButton(this);
        subscriber.registerOnInteractionMenu(this);
    }

    async generateEmbedResponse(messageOrInteraction) {
        const generator = new EmbedGenerator();
        const channel = messageOrInteraction.channel;

        generator.configureMessageAuthor(
            messageOrInteraction,
            channel.isDMBased()
        )

        // TODO: Get servers from database
        const servers = config.DEFAULTIPLISTADDRESSES;

        const queries = servers.map(([ip, port]) => {
            return new Promise(async (resolve, _) => {
                const query = new HaloServersQuery(ip, port);
                resolve(await query.send());
            })
        });

        const serversData = await Promise.all(queries);

        let description = "";

        for (const server of serversData) {
            if (server.error) {
                description += `* \`${server.ip}:${server.port}\` \t ${server.error}\n`;
                continue;
            }
            const data = server.data;
            description += `* \`${data.name}\`\t ${data.currentPlayers}/${data.maxPlayers} \t Ping: ${server.ping} ms\n`;
        }

        generator.updateAtomicData(
            "Servers stats list",
            description
        );

        return generator.getEmbed();
    }


    async configureMessage(messageOrInteraction, init = false) {

        const embed = await this.generateEmbedResponse(messageOrInteraction);

        let _components;

        if (init) {

            const servers = config.DEFAULTIPLISTADDRESSES;

            // Create menu row with all servers
            const menu = generateMenu(servers);

            // Configure message menu row
            _components = update(messageOrInteraction, menu, true);
        } else {
            _components = update(messageOrInteraction, null, false)
        }

        return {
            embeds: [embed],
            components: _components ? _components : []
        }
    }

    async onMessageCommand(message, command, args) {
        if (!this.messageCommandAliases.includes(command)) {
            return;
        }

        const options = await this.configureMessage(message, true);

        const msg = await sendMessage(message.channel, options);

        configureTimeout(msg);
    }

    async onInteractionCommand(interaction) {
        if (interaction.commandName !== this.slashCommandName) {
            return;
        }

        await deferInteractionReply(interaction);

        const options = await this.configureMessage(interaction, true);

        const msg = await replyInteraction(interaction, options);

        configureTimeout(msg);
    }

    async onInteractionButton(interaction) {
        const id = interaction.customId;

        if (id !== "UpdateList") {
            return;
        }

        // The most reliable way for now is to get strings from the embed
        // in future maybe we can save the ip and port in a database

        const message = interaction.message;

        interaction.deferUpdate();

        // Remove update button temporaly
        await prepareUpdate(message);

        let options = await this.configureMessage(
            message, false
        );

        const embed = options.embeds[0];

        // Overwrite the messages footer setting the correct author
        const fixedEmbed = new EmbedGenerator(embed);
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

    async onInteractionMenu(interaction) {
        const id = interaction.customId;

        if (id !== "SelectServer") {
            return;
        }

        // We will reply to this interaction like if
        // the user did query that server at first place
        const ip_port = interaction.values[0].split(" : ");
        const ip = ip_port[0];
        const port = ip_port[1];

        const options = await this.singleServerFeature.configureMessage(interaction, ip, port, true, false);

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

        replyInteraction(interaction, {
            ...options,
            ephemeral: true
        });
    }
}

// Since this feature requires another feature to work, its singleton will be created by parent feature
module.exports = GetHaloServersListInfoFeature;