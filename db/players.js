const db = require("./");
const config = require("./../config");
const { validateIpFormat } = require("../utils/validateIpFormat");

const pkgPlayers = {
    addPlayer: async (ip, name, servers, description) => {
        if (!ip || !name || !servers || !description)
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

        const serversArray = servers.split(",");

        if (serversArray.length < 1)
            return {
                error: "You must provide at least one server"
            }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(config.PLAYERSDBCOLLECTION);

        // Get existent user, if any
        let shouldUpdateExistent = false;
        let existentUser = null;

        try {
            existentUser = await dbCollection.findOne({
                ip: ip,
                name: name
            });
            shouldUpdateExistent = existentUser !== null;
        } catch (err) {
            console.log(err)
        }

        // If the same IP and name already exists, update servers data abd description
        if (shouldUpdateExistent) {
            const serversData = existentUser.servers;
            const descriptionData = existentUser.description;
            const newServers = serversData.concat(serversArray);
            const newDescription = descriptionData + " - " + description;

            try {
                const updateResult = await dbCollection.updateOne({
                    ip: ip,
                    name: name
                }, {
                    $set: {
                        servers: newServers,
                        description: newDescription
                    }
                });

                return {
                    message: "Success updating player",
                    result: updateResult
                }
            }
            catch (err) {
                console.log(err);

                return {
                    error: "Unable to update player"
                }
            }
        }

        // If the same IP and name doesn't exist, create a new user
        try {
            const insertResult = await dbCollection.insertOne({
                ip: ip,
                name: name,
                servers: serversArray,
                description: description
            });

            return {
                message: "Success inserting player",
                result: insertResult
            }
        } catch (err) {
            console.log(err);

            return {
                error: "Unable to insert player"
            }
        }
    },

    searchPlayer: async (parameter, value, page = 1) => {
        parameter = !parameter ? "all" : parameter.toLowerCase();
        if (parameter != "all" && !value)
            return {
                error: "You must provide valid parameters and values"
            }

        if (!(["ip", "name", "server", "description", "all"].includes(parameter)))
            return {
                error: "Invalid parameter"
            }


        if (!db.client)
            return {
                error: "Database client hasn't been initialized yet"
            }

        const dbClient = db.client;
        const dbDatabase = dbClient.db(config.DBNAME);
        const dbCollection = dbDatabase.collection(config.PLAYERSDBCOLLECTION);

        let query = {};

        switch (parameter) {
            case "ip":
                query.ip = {
                    $regex: "^" + value + ".*",
                    $options: "i"
                };
                break;
            case "name":
                query.name = {
                    $regex: ".*" + value + ".*",
                    $options: "i"
                };
                break;
            case "server":
                query = {
                    $exp: {
                        $in: [
                            value, "$servers"
                        ]
                    }
                }
                break;
            case "description":
                query.description = {
                    $regex: ".*" + value + ".*",
                    $options: "i"
                }
                break;
            // In default case (like an all argument we won't filter at all)
        }

        const limit = config.PLAYERSLIMITPERPAGE;
        const skip = limit * (page - 1);

        try {
            const searchResult = await dbCollection.find(query).skip(skip).limit(limit).toArray();

            return {
                message: "Success searching player",
                result: searchResult
            }
        } catch (err) {
            console.log(err);

            return {
                error: "Unable to search player"
            }
        }
    }
}

module.exports = pkgPlayers;