const haloServerInfoFeature = require('./getHaloServerInfo');
const haloServersListInfoFeature = require('./getHaloServersListInfo');
const getHaloServersStats = require('./handleServersStats');
const Feature = require("./../Feature");

const haloServersFeature = new Feature("Halo Servers", "Halo Servers Status", "🌐");

const haloServersListInfoFeatureObj = new haloServersListInfoFeature(haloServerInfoFeature);

haloServersFeature.addSubFeature(haloServerInfoFeature);
haloServersFeature.addSubFeature(haloServersListInfoFeatureObj);
haloServersFeature.addSubFeature(getHaloServersStats);

module.exports = haloServersFeature;