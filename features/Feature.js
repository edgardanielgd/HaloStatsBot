// Each feature which uses or depends on an event
// will have a method called each time that event happens

// Each feature will have a method to be executed when the feature should be called

// All of this in order to reduce a little bit the amount of spam and reduce the number
// of checks that the bot has to do (also this results healthy for Discord's API :) )

// In other side each feature must have a name, description and detailed usage, things
// that will be handled by another section of the bot

class Feature {
    constructor(_name, _description, _emoji) {
        // Name of the feature
        this.name = _name;

        // Description of the feature
        this.description = _description;

        // Emoji which identifies this feature :)
        this.emoji = _emoji;

        // Info of the feature
        // Each subfeature is a feature itself
        this.subfeatures = [];
    }

    addSubFeature(feature) {
        this.subfeatures.push(feature);
    }

    // Config method of the feature and subscribe to events
    // Also returs the info of the feature
    config(bot, subscriber) {
        for (const subfeature of this.subfeatures) {
            subfeature.config(bot, subscriber);
        }
    }

    // Event triggers of each type

    // Custom command event (called when we write (prefix)command messages, actually useful for most of features)
    onMessageCommand(message, command, args) { }

    onMessageCreate(message) { }
    onMessageDelete(message) { }
    onMessageReactionAdd(messageReaction, user) { }
    onMessageReactionRemove(messageReaction, user) { }
    onMessageUpdate(oldMessage, newMessage) { }

    onInteractionCommand(interaction) { }
    onInteractionMenu(interaction) { }
    onInteractionModalSubmit(interaction) { }
    onInteractionButton(interaction) { }

    onReady() { }

    onGuildMemberAdd(member) { }
}

module.exports = Feature;