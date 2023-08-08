const sendMessageFeature = require("./sendMessage");
const welcomeMessageFeature = require("./welcomeMessage");
const Feature = require("./../Feature");

const utilsFeature = new Feature("Fun", "Fun commands to make peeople laugh i guess", "🖲️");

utilsFeature.addSubFeature(sendMessageFeature);
utilsFeature.addSubFeature(welcomeMessageFeature);

module.exports = utilsFeature;