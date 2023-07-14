const sendMessageFeature = require("./sendMessage");
const Feature = require("./../Feature");

const utilsFeature = new Feature("Fun", "Fun commands to make peeople laugh i guess", "🖲️");

utilsFeature.addSubFeature(sendMessageFeature);

module.exports = utilsFeature;