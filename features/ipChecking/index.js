const checkIpInfoFeature = require('./checkIPInfo');
const Feature = require("./../Feature");

const ipCheckingFeature = new Feature("IP checking", "IP address checking", "🖲️");

ipCheckingFeature.addSubFeature(checkIpInfoFeature);

module.exports = ipCheckingFeature;