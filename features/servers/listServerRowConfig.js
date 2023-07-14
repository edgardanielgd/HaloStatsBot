const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("@discordjs/builders")
const config = require("../../config");
const { checkExistence } = require("../../utils/checkPermissions");
const { editMessage } = require("../../utils/crudMessages");
const { getString } = require("../../lang");

const updateDisplay = "Update";

const pkgEmbedRow = {
    configureTimeout: (msg) => {

        if (!msg) return;

        setTimeout(async (msg) => {
            editMessage(msg, {
                //Deletes action row
                components: []
            });
        }, config.HLSINTERACTIONTIMEDELETE, msg);

        setTimeout(async (msg) => {
            const exists = await checkExistence(msg);
            if (exists) {
                const components = msg.components;
                if (components && components.length > 0) {
                    const rowComps = components[0].components;
                    if (rowComps && rowComps.length > 0) {

                        const oldButton = rowComps[0];
                        const button = new ButtonBuilder(oldButton.toJSON());
                        button.setLabel(updateDisplay);
                        button.setDisabled(false);

                        const newComponents = [];

                        const newRow = new ActionRowBuilder();
                        newRow.addComponents(button);

                        newComponents.push(newRow);

                        if (components.length > 1) {
                            const menuRowComps = components[1].components;
                            if (menuRowComps && menuRowComps.length > 0) {
                                // Adds again menu row
                                newComponents.push(components[1]);
                            }
                        }

                        editMessage(msg, {
                            //Deletes action row
                            components: newComponents
                        });
                    }
                }

            }
        }, config.HLSINTERACTIONBUTTONINTERVAL, msg);
    },

    update: (msg, menu, init) => {

        if (!init) {
            if (!msg) return;

            const diffTime = new Date() - msg.createdAt;

            if (diffTime >= config.HLSINTERACTIONTIMEDELETE - config.HLSINTERACTIONBUTTONINTERVAL) {
                editMessage(msg, {
                    //Deletes action rows
                    components: []
                });
                return;
            }
        }

        let row = new ActionRowBuilder();
        let button = new ButtonBuilder();

        button.setDisabled(true);
        button.setCustomId("UpdateList");
        button.setLabel(updateDisplay + " (" + (config.HLSINTERACTIONBUTTONINTERVAL / 1000) + " secs )");
        button.setStyle(Discord.ButtonStyle.Success);

        row.addComponents(button);
        const arrComponents = [row];

        if (menu) {
            let rowMenu = new ActionRowBuilder();
            rowMenu.addComponents(menu);

            arrComponents.push(rowMenu);
        } else {
            const components = msg.components;

            if (components && components.length > 0) {
                const menuRowComps = components[0].components;
                if (menuRowComps && menuRowComps.length > 0) {
                    // Adds again menu row
                    arrComponents.push(components[0]);
                }
            }
        }

        return arrComponents;

    },

    prepareUpdate: async (msg) => {
        const components = msg.components;

        if (components.length >= 2) {
            const rowsWithoutUpdateButton = components.slice(1);

            await editMessage(
                msg,
                {
                    components: rowsWithoutUpdateButton
                }
            );
        }
    },

    generateMenu: (servers) => {
        const select = new StringSelectMenuBuilder();
        select.addOptions(
            servers.map(
                (server) => {
                    const option = new StringSelectMenuOptionBuilder();
                    option.setLabel(server[0] + " - " + server[1]);
                    option.setValue(server[0] + " : " + server[1]);
                    option.setDescription(server[2]);
                    option.setEmoji({
                        name: server[3]
                    });

                    return option;
                }
            )
        )

        select.setCustomId("SelectServer");
        select.setPlaceholder("Select a server");

        return select
    }
}

module.exports = pkgEmbedRow;