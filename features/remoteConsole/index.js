const LoginFeature = require('./login');
const LogoutFeature = require('./logout');
const SendCommandFeautre = require('./sendCommand');
const QueryStatsFeature = require('./queryStats');
<<<<<<< HEAD
=======
const serverStatsFeature = require('./handleServersStats');
>>>>>>> master
const ConnectionPool = require('./ConnectionPool');
const Feature = require("./../Feature");

// Create a new pool of connections to be handled by the bot
const pool = new ConnectionPool();

class RemoteConsoleMainFeature extends Feature {
    constructor() {
        super("Remote console", "Connect to a Halo Server and have fun!", "🏠");
    }

    config = (bot, subscriber) => {
        for (const subFeature of this.subfeatures) {
            subFeature.config(bot, subscriber, pool);
        }
    }
}

const remoteConsoleFeature = new RemoteConsoleMainFeature();

const loginFeature = new LoginFeature();
const logoutFeature = new LogoutFeature();
const sendCommandFeature = new SendCommandFeautre();
const queryStatsFeature = new QueryStatsFeature();
remoteConsoleFeature.addSubFeature(loginFeature);
remoteConsoleFeature.addSubFeature(logoutFeature);
remoteConsoleFeature.addSubFeature(sendCommandFeature);
remoteConsoleFeature.addSubFeature(queryStatsFeature);
<<<<<<< HEAD
=======
remoteConsoleFeature.addSubFeature(serverStatsFeature);
>>>>>>> master

module.exports = remoteConsoleFeature;