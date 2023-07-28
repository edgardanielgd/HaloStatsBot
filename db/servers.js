const db = require("./");
const config = require("./../config");
const { validateIpFormat, validatePortFormat } = require("../utils/validateIpFormat");

const pkgPlayers = {
    setDefaultIpAddress: async (ip) => {
        if (!ip)
            return {
                error: "You must provide ip, name, servers and description"
            }

        if (!db.client)
            return {
                error: "Database client hasn't been initialized yet"
            }

        const validation = validateIpFormat(ip);
        if (validation.error)
            return {
                error: validation.error
            }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(config.SPECIALPORTSCOLLECTION);

        try {
            await dbCollection.updateOne(
                { _id: config.SPECIALPORTSDEFAULTIPID },
                { $set: { ip: ip } },
                { upsert: true }
            );

            return {
                message: "Success setting default ip address"
            }
        } catch (err) {
            console.log(err);

            return {
                error: "Unable to set default ip address"
            }
        }
    },

    getDefaultIpAddress: async () => {
        if (!db.client)
            return {
                error: "Database client hasn't been initialized yet"
            }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(config.SPECIALPORTSCOLLECTION);

        try {
            const result = await dbCollection.findOne(
                { _id: config.SPECIALPORTSDEFAULTIPID }
            );

            if (!result)
                return {
                    error: "Unable to find default ip address"
                }

            return {
                message: "Success finding default ip address",
                result: result.ip
            }
        } catch (err) {
            console.log(err);

            return {
                error: "Unable to find default ip address"
            }
        }
    },

    setDefaultIpListAddresses: async (ipList) => {
        if (!ipList)
            return {
                error: "You must provide ip list"
            }

        if (!db.client)
            return {
                error: "Database client hasn't been initialized yet"
            }

        // Check if data is valid
        for (let i = 0; i < ipList.length; i++) {
            const ipData = ipList[i];
            const ip = ipData.ip;

            const validation = validateIpFormat(ip);
            if (validation.error)
                return {
                    error: validation.error + ` at index ${i}`
                }

            const port = ipData.port;

            const portValidation = validatePortFormat(port);
            if (portValidation.error)
                return {
                    error: portValidation.error + ` at index ${i}`
                }
        }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(config.SPECIALPORTSCOLLECTION);

        try {
            await dbCollection.updateOne(
                { _id: config.SPECIALPORTSIPLISTID },
                { $set: { ipList: ipList } },
                { upsert: true }
            );

            return {
                message: "Success setting default ip list addresses"
            }
        } catch (err) {
            console.log(err);

            return {
                error: "Unable to set default ip list addresses"
            }
        }
    },

    getDefaultIpListAddresses: async () => {
        if (!db.client)
            return {
                error: "Database client hasn't been initialized yet"
            }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(config.SPECIALPORTSCOLLECTION);

        try {
            const result = await dbCollection.findOne(
                { _id: config.SPECIALPORTSDEFAULTIPLISTID }
            );

            if (!result)
                return {
                    error: "Unable to find default ip list addresses"
                }

            return {
                message: "Success finding default ip list addresses",
                result: result.ipList
            }
        } catch (err) {
            console.log(err);

            return {
                error: "Unable to find default ip list addresses"
            }
        }
    },

    // Static stats metadata
    updateStatsMessage: async (channel, message, ip, port, UDPQuery = true) => {
        if (!channel || !message || !ip || !port)
            return {
                error: "You must provide channel, message, ip and port"
            }

        if (!db.client)
            return {
                error: "Database client hasn't been initialized yet"
            }

        const validation = validateIpFormat(ip);
        if (validation.error)
            return {
                error: validation.error
            }

        const portValidation = validatePortFormat(port);
        if (portValidation.error)
            return {
                error: portValidation.error
            }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(
            UDPQuery ? config.STATSCHANNELSCOLLECTION : config.REMOTECONSOLESTATSCHANNELSCOLLECTION
        );

        try {

            await dbCollection.findOneAndUpdate(
                {
                    channel: channel.id,
                    message: message.id,
                },
                {
                    $setOnInsert: {
                        channel: channel.id,
                        message: message.id,
                        ip: ip,
                        port: port
                    }
                }, {
                upsert: true,
                returnOriginal: false
            }
            )

            return {
<<<<<<< HEAD
            } catch (err) {
                console.log(err);

=======
                message: "Success updating stats message"
            }
        } catch (err) {
            console.log(err);

            return {
>>>>>>> master
                error: "Unable to update stats message"
            }
        }
    },

    removeStatsMessage: async (channelId, messageId, UDPQuery = true) => {
        if (!channelId || !messageId)
            return {
                error: "You must provide channel and message"
            }

        if (!db.client)
            return {
                error: "Database client hasn't been initialized yet"
            }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(
            UDPQuery ? config.STATSCHANNELSCOLLECTION : config.REMOTECONSOLESTATSCHANNELSCOLLECTION
        );

        try {
            await dbCollection.deleteOne(
                {
                    channel: channelId,
                    message: messageId,
                }
            )

            return {
                message: "Success removing stats message"
            }
        } catch (err) {
            console.log(err);

            return {
                error: "Unable to remove stats message"
            }
        }
    },

    getStatsMessages: async (UDPQuery = true) => {
        if (!db.client)
            return {
                error: "Database client hasn't been initialized yet"
            }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(
            UDPQuery ? config.STATSCHANNELSCOLLECTION : config.REMOTECONSOLESTATSCHANNELSCOLLECTION
        );

        try {
            const result = await dbCollection.find({}).toArray();

            return {
                message: "Success finding stats messages",
                result: result
            }
        }
        catch (err) {
            console.log(err);

            return {
                error: "Unable to find stats messages"
            }
        }
    }
}

module.exports = pkgPlayers;