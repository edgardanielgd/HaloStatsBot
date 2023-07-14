const { checkExistence, checkScopesSendEdit, checkScopesReact } = require("./checkPermissions");

const pkgCrudMessages = {
    sendMessage: (channel, options) => {
        return new Promise(
            async (resolve, _) => {
                const enabled = checkScopesSendEdit(channel);
                if (!enabled) { resolve(null); return; };

                channel.send(options)
                    .then(msg => {
                        resolve(msg);
                    })
                    .catch(err => {
                        console.log(err)
                        resolve(null);
                    });
            }
        )
    },
    followUpInteraction: (interaction, options) => {
        return new Promise(
            async (resolve, _) => {
                const enabled = checkScopesSendEdit(interaction.channel);
                if (!enabled) { resolve(null); return; };

                interaction.followUp(options)
                    .then(msg => {
                        resolve(msg);
                    })
                    .catch(err => {
                        console.log(err)
                        resolve(null);
                    });
            }
        )
    },
    replyInteraction: (interaction, options) => {
        return new Promise(
            async (resolve, _) => {
                const enabled = checkScopesSendEdit(interaction.channel);
                if (!enabled) { resolve(null); return; };

                interaction.editReply(options)
                    .then(msg => {
                        resolve(msg);
                    })
                    .catch(err => {
                        console.log(err)
                        resolve(null);
                    });
            }
        )
    },
    deferInteractionReply: async (interaction, ephemeral = false) => {
        try {
            await interaction.deferReply({ ephemeral: ephemeral })
        } catch (err) {
            console.log(err)

            resolve(null);
            return;
        }
    },
    replyMessage: async (message, options) => {
        return new Promise(
            async (resolve, _) => {

                const exists = await checkExistence(message);
                if (!exists) { resolve(null); return; };

                const enabled = checkScopesSendEdit(message.channel);
                if (!enabled) { resolve(null); return; };

                message.reply(options)
                    .then(msg => {
                        resolve(msg);
                    })
                    .catch(err => {
                        console.log(err)
                        resolve(null);
                    });
            }
        )
    },
    editMessage: async (message, options) => {
        return new Promise(
            async (resolve, _) => {

                const exists = await checkExistence(message);
                if (!exists) { resolve(null); return; };

                const enabled = checkScopesSendEdit(message.channel);
                if (!enabled) { resolve(null); return; };

                message.edit(options)
                    .then(msg => {
                        resolve(msg);
                    })
                    .catch(err => {
                        console.log(err)
                        resolve(null);
                    });
            }
        )
    }
}

module.exports = pkgCrudMessages;