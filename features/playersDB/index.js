const searchPlayerFeature = require('./searchPlayer');
const addPlayerFeature = require('./addPlayer');
const Feature = require("./../Feature");

const playersDatabaseFeature = new Feature("Players database", "Perform CRUD operations over a database of players", "🎮");

playersDatabaseFeature.addSubFeature(searchPlayerFeature);
playersDatabaseFeature.addSubFeature(addPlayerFeature);

module.exports = playersDatabaseFeature;