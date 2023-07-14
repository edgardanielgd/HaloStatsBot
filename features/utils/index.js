const channelInfoFeature = require('./getChannelInfo');
const Feature = require("./../Feature");

const utilsFeature = new Feature("Utils", "Utilities for the bot", "🔧");

utilsFeature.addSubFeature(channelInfoFeature);

module.exports = utilsFeature;