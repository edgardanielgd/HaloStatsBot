const config = require('../config');

const pkgDmOwner = {
    dmOwner: async (bot, message) => {
        const ownerId = config.OWNERID;
        const owner = await bot.users.fetch(ownerId);
        if (!owner) return;

        try {
            await owner.send(message);
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = pkgDmOwner;