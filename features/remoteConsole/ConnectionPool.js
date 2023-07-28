const RemoteConsoleConnection = require("./Connection.js");

class ConnectionPool {
    constructor() {
        this.connections = {};

        // Listenners for sockets events
        this.onDataLFeatures = [];
        this.onCloseLFeatures = [];
        this.onErrorLFeatures = [];
    }

    registerOnDataListener(feature) {
        this.onDataLFeatures.push(feature);
    }

    registerOnCloseListener(feature) {
        this.onCloseLFeatures.push(feature);
    }

    registerOnErrorListener(feature) {
        this.onErrorLFeatures.push(feature);
    }

    async addConnection(ip, port, target) {

        const user = target.author || target.user;
        const channel = target.channel;

        const key = user.id + ":" + channel.id;
        const conn = new RemoteConsoleConnection(ip, port);
        const result = await conn.connect();

        if (result.error) {
            return [null, result.error];
        }

        // Bind data handler
        conn.on("data", (data) => {
            this.onDataLFeatures.forEach((feature) => {
                feature.onRemoteConsoleData(conn, data, target);
            });
        });

        // Bind error handler
        conn.on("error", (err) => {
            this.onErrorLFeatures.forEach((feature) => {
                feature.onRemoteConsoleError(conn, err, target);
            });
        });

        // Bind close handler
        conn.on("close", () => {
            this.onCloseLFeatures.forEach((feature) => {
                feature.onRemoteConsoleClose(conn, target);
            });

            this.removeConnection(user, channel);
        });

        this.connections[key] = conn;
        return [conn, null];
    }

    removeConnection(target) {
        const user = target.author || target.user;
        const channel = target.channel;

        const key = user.id + ":" + channel.id;
        const conn = this.connections[key];
        if (!conn)
            return;

        conn.disconnect();
        delete this.connections[key];
    }

    getConnectionCount() {
        return Object.keys(this.connections).length;
    }

    getConnection(target) {
        const user = target.author || target.user;
        const channel = target.channel;

        const key = user.id + ":" + channel.id;
        return this.connections[key];
    }
}

module.exports = ConnectionPool;