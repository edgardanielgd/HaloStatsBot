const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders")
const config = require("../../config");
const { checkExistence } = require("../../utils/checkPermissions");
const { editMessage } = require("../../utils/crudMessages");
const { getString } = require("../../lang");

const updateDisplay = getString("en", "Update");
const retryDisplay = getString("en", "Retry");

const pkgEmbedRow = {
    configureTimeout: (msg) => {

        if (!msg) return;

        setTimeout(async (msg) => {
            editMessage(msg, {
                //Deletes action row
                components: []
            });
        }, config.HSINTERACTIONTIMEDELETE, msg);

        setTimeout(async (msg) => {
            const exists = await checkExistence(msg);
            if (exists) {
                const components = msg.components;
                if (components && components.length > 0) {
                    const rowComps = components[0].components;
                    if (rowComps && rowComps.length > 0) {

                        const oldButton = rowComps[0];
                        const button = new ButtonBuilder(oldButton.toJSON());
                        button.setLabel(oldButton.customId == "Update" ? updateDisplay : retryDisplay);
                        button.setDisabled(false);

                        const newRow = new ActionRowBuilder();
                        newRow.addComponents(button);
                        editMessage(msg, {
                            //Deletes action row
                            components: [newRow]
                        });
                    }
                }

            }
        }, config.HSINTERACTIONBUTTONINTERVAL, msg);
    },
    update: (msg, retrying, init) => {

        if (!init) {

            if (!msg) return;

            const diffTime = new Date() - msg.createdAt;

            if (diffTime >= config.HSINTERACTIONTIMEDELETE - config.HSINTERACTIONBUTTONINTERVAL)
                return;
            //No more updates
        }

        let row = new ActionRowBuilder();
        let button = new ButtonBuilder();
        button.setDisabled(true);
        if (!retrying) {
            button.setCustomId("Update");
            button.setLabel(updateDisplay + " (" + (config.HSINTERACTIONBUTTONINTERVAL / 1000) + " secs )");
            button.setStyle(Discord.ButtonStyle.Success);
        } else {
            button.setCustomId("Retry");
            button.setLabel(retryDisplay + " (" + (config.HSINTERACTIONBUTTONINTERVAL / 1000) + " secs )");
            button.setStyle(Discord.ButtonStyle.Danger);
        }
        row.addComponents(button);

        return row;
    }
}

module.exports = pkgEmbedRow;