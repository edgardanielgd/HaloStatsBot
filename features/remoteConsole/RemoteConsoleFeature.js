const Feature = require("../Feature.js");

class RemoteConsoleFeature extends Feature {
    constructor() {
        super("Remote console", "Connect to a Halo Server and have fun!", "🏠");
    }

    config = (bot, subscriber, remoteConsolePool) => { }

    onRemoteConsoleData(conn, data, user, channel) { }

    onRemoteConsoleError(conn, error, user, channel) { }

    onRemoteConsoleClose(conn, user, channel) { }
}

module.exports = RemoteConsoleFeature;