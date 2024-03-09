const channelInfoFeature = require('./getChannelInfo');
const BKstringsFeature = require('./BKStrings/generateBKstrings');
const Feature = require("./../Feature");

const utilsFeature = new Feature("Utils", "Utilities for the bot", "🔧");

utilsFeature.addSubFeature(channelInfoFeature);
utilsFeature.addSubFeature(BKstringsFeature);

module.exports = utilsFeature;