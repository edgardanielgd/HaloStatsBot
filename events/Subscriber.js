
// Singleton subscriber, will be passed through each feature
// and will be 

const config = require('../config');
const { REST, Routes } = require('discord.js');
const SecurityHandler = require('./securityHandler');

class Subscriber {
    constructor(bot) {
        this.mutesManager = new SecurityHandler();
        this.bot = bot;

        this.onMessagCommandFeatures = [];
        this.onMessageCreateFeatures = [];
        this.onMessageDeleteFeatures = [];
        this.onMessageReactionAddFeatures = [];
        this.onMessageReactionRemoveFeatures = [];
        this.onMessageUpdateFeatures = [];

        this.onInteractionCommandFeatures = [];
        this.onInteractionMenuFeatures = [];
        this.onInteractionModalSubmitFeatures = [];
        this.onInteractionButtonFeatures = [];

        this.onGuildMemberAddFeatures = [];

        this.onReadyFeatures = [];

        // Slash commands must be registered across discord API
        // subscriber can also take this task since it will get
        // passed through each feature
        this.slashCommands = [];
    }

    subscribeEvents() {
        this.subscribeOnMessageCommand();
        this.subscribeOnMessageCreate();
        this.subscribeOnMessageDelete();
        this.subscribeOnMessageReactionAdd();
        this.subscribeOnMessageReactionRemove();
        this.subscribeOnMessageUpdate();

        this.subscribeOnInteraction();

        this.subscribeOnReady();

        this.subscribeOnGuildMemberAdd();
    }

    // Actual Subscribers
    subscribeOnMessageCommand() {
        this.bot.on('messageCreate', message => {
            if (message.author.bot)
                return;

            // Check if the message starts with any of the given prefixes
            let startsWithPrefix = null;
            for (const prefix of config.PREFIXES) {
                if (message.content.startsWith(prefix)) {
                    startsWithPrefix = prefix;
                    break;
                }
            }

            if (startsWithPrefix) {
                const args = message.content.slice(startsWithPrefix.length).trim().split(/ +/);
                const command = args.shift().toLowerCase();

                const allowed = this.mutesManager.handleAction(message, this.bot, false,
                    "Message Command created by an user", message.author.id, command
                );
                if (!allowed) return;

                for (const feature of this.onMessagCommandFeatures) {
                    feature.onMessageCommand(message, command, args, this.bot);
                }
            }
        });
    }

    subscribeOnMessageCreate() { }

    subscribeOnMessageDelete() { }

    subscribeOnMessageReactionAdd() { }

    subscribeOnMessageReactionRemove() { }

    subscribeOnMessageUpdate() { }

    subscribeOnInteraction() {
        this.bot.on('interactionCreate', interaction => {

            // Check if interaction was created by this bot
            if (interaction.applicationId !== this.bot.user.id)
                return;

            const allowed = this.mutesManager.handleAction(interaction, this.bot, true,
                "Interaction created by this bot",
                interaction.isCommand() ? interaction.commandName : interaction.customId
            );
            if (!allowed) return;

            if (interaction.isCommand()) {
                for (const feature of this.onInteractionCommandFeatures) {
                    feature.onInteractionCommand(interaction, this.bot);
                }
            } else if (interaction.isButton()) {
                for (const feature of this.onInteractionButtonFeatures) {
                    feature.onInteractionButton(interaction, this.bot);
                }
            } else if (interaction.isStringSelectMenu()) {
                for (const feature of this.onInteractionMenuFeatures) {
                    feature.onInteractionMenu(interaction, this.bot);
                }
            } else if (interaction.isModalSubmit()) {
                for (const feature of this.onInteractionModalSubmitFeatures) {
                    feature.onInteractionModalSubmit(interaction, this.bot);
                }
            }
        });
    }

    subscribeOnReady() {
        this.bot.on('ready', () => {
            for (const feature of this.onReadyFeatures) {
                feature.onReady(this.bot);
            }
        });
    }

    subscribeOnGuildMemberAdd() {
        this.bot.on('guildMemberAdd', member => {
            for (const feature of this.onGuildMemberAddFeatures) {
                feature.onGuildMemberAdd(member, this.bot);
            }
        });
    }

    // Event Registerers

    registerOnMessageCommand(feature) {
        this.onMessagCommandFeatures.push(feature);
    }

    registerOnMessageCreate(feature) {
        this.onMessageCreateFeatures.push(feature);
    }

    registerOnMessageDelete(feature) {
        this.onMessageDeleteFeatures.push(feature);
    }

    registerOnMessageReactionAdd(feature) {
        this.onMessageReactionAddFeatures.push(feature);
    }

    registerOnMessageReactionRemove(feature) {
        this.onMessageReactionRemoveFeatures.push(feature);
    }

    registerOnMessageUpdate(feature) {
        this.onMessageUpdateFeatures.push(feature);
    }

    registerOnInteractionCommand(feature, commandsBody) {
        this.slashCommands.push(...commandsBody);
        this.onInteractionCommandFeatures.push(feature);
    }

    registerOnInteractionMenu(feature) {
        this.onInteractionMenuFeatures.push(feature);
    }

    registerOnInteractionModalSubmit(feature) {
        this.onInteractionModalSubmitFeatures.push(feature);
    }

    registerOnInteractionButton(feature) {
        this.onInteractionButtonFeatures.push(feature);
    }

    registerOnReady(feature) {
        this.onReadyFeatures.push(feature);
    }

    registerOnGuildMemberAdd(feature) {
        this.onGuildMemberAddFeatures.push(feature);
    }

    // Slash command registerer
    registerSlashCommands() {
        const rest = new REST({ version: '9' }).setToken(config.TOKEN);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands. (' + this.slashCommands.length + ') commands');

                rest.put(
                    Routes.applicationCommands(config.CLIENTID),
                    { body: this.slashCommands },
                );

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error);
            }
        })();
    }

}

module.exports = Subscriber;