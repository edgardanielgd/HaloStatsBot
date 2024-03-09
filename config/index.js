require("dotenv").config()

// Generate global config for given .env file
const config = {
    IPLOGGERADDRESS: process.env.IPLOGGERADDRESS,

    TOKEN: process.env.TOKEN,
    CLIENTID: process.env.CLIENTID,

    // Sometimes bots are hosted within runtime-bounded eevironments
    // Which require users to enter a certain web page to keep the bot alive
    // That is this URL
    URL: process.env.URL,

    // IP Checkings
    IPQUALITYAUTH: process.env.IPQUALITYAUTH,
    IPQUALITYURL: process.env.IPQUALITYURL,

    VPNAPI: process.env.VPNAPI,
    VPNAPIURL: process.env.VPNAPIURL,

    // Don't ask what is this, sometimes i can be a real simp
    NATYPASS: process.env.NATYPASS,

    // Owner ID, there would be a lot of commands that would be owner-only
    OWNERID: process.env.OWNERID,

    // Crush ID, this is the ID of the person you want to crush on
    // Now don't ask me why i have this, i'm just a simp
    CRUSHID: process.env.CRUSHID,

    // Recall we are user a DB to store some data (people data actually)
    // This is the DB User
    DBUSER: process.env.DBUSER,

    // This is the DB Password
    DBPASS: process.env.DBPASS,

    // This is the DB name
    DBNAME: process.env.DBNAME,

    SPECIALPORTSCOLLECTION: process.env.SPECIALPORTSCOLLECTION,
    LASTRESOURCEDEFAULTIPADDRESS: process.env.LASTRESOURCEDEFAULTIPADDRESS,

    DEFAULTIPLISTADDRESSES: JSON.parse(process.env.DEFAULTIPLISTADDRESSES),

    BKDISCORDSERVER: process.env.BKDISCORDSERVER,
    BKROLESTOSCAN: process.env.BKDISCORDSERVER.split(","),

    SPECIALPORTSDEFAULTIPID: process.env.SPECIALPORTSDEFAULTIPID,
    SPECIALPORTSIPLISTID: process.env.SPECIALPORTSIPLISTID,

    PLAYERSLIMITPERPAGE: parseInt(process.env.PLAYERSLIMITPERPAGE),

    HSINTERACTIONTIMEDELETE: process.env.HSINTERACTIONTIMEDELETE,
    HSINTERACTIONBUTTONINTERVAL: process.env.HSINTERACTIONBUTTONINTERVAL,

    HLSINTERACTIONTIMEDELETE: process.env.HLSINTERACTIONTIMEDELETE,
    HLSINTERACTIONBUTTONINTERVAL: process.env.HLSINTERACTIONBUTTONINTERVAL,
    HLSPRIVATEQUERYINTERVAL: process.env.HLSPRIVATEQUERYINTERVAL,

    // Staff Ids, there is a counted number of trusted staff members
    // They are the only ones who can use some commands
    STAFFIDS: process.env.STAFFIDS.split(","),

    // IPs reputation check allowed channels
    // This is a list of channels where the bot can check the reputation of an IP
    IPREPUTATIONCHANNELS: process.env.IPREPUTATIONCHANNELS.split(","),

    // This is the DB collection name (We are using MongoDB)
    PLAYERSDBCOLLECTION: process.env.PLAYERSDBCOLLECTION,

    STATSCHANNELSCOLLECTION: process.env.STATSCHANNELSCOLLECTION,
    REMOTECONSOLESTATSCHANNELSCOLLECTION: process.env.REMOTECONSOLESTATSCHANNELSCOLLECTION,
    STATSCHANNELSTIMEOUT: process.env.STATSCHANNELSTIMEOUT,

    // IPs database management allowed channels
    // This is a list of channels where the bot can manage the IPs database
    PLAYERSDATABASECHANNELS: process.env.PLAYERSDATABASECHANNELS.split(","),

    REMOTECONSOLECHANNELS: process.env.REMOTECONSOLECHANNELS.split(","),

    REMOTECONSOLEPLAYERNAME: process.env.REMOTECONSOLEPLAYERNAME,
    REMOTECONSOLEPASSWORD: process.env.REMOTECONSOLEPASSWORD,

    HALOSERVERSMAXAWAITTIME: process.env.HALOSERVERSMAXAWAITTIME,

    // Check if the bot should announce URL on each message (boolean)
    ANNOUNCEURL: process.env.ANNOUNCEURL,

    // Define the set of message prefixes this bot will reply to
    PREFIXES: process.env.PREFIXES.split(","),

    // Security stuff
    ALLOWEDTIMEBETWEENMESSAGES: process.env.ALLOWEDTIMEBETWEENMESSAGES,
    ALLOWEDTIMEBETWEENVIPMESSAGES: process.env.ALLOWEDTIMEBETWEENVIPMESSAGES,
    PUNISHMENTTIME: process.env.PUNISHMENTTIME,
    MAXMESSAGESPERUSER: process.env.MAXMESSAGESPERUSER,

    LOGCHANNELID: process.env.LOGCHANNELID,

    // Welcome messages stuff
    WELCOMEANNOUNCERCHANNELS: ((data) => {
        let channels = {};
        data.split(",").forEach((channel) => {
            const [serverId, channelId] = channel.split(":");
            if (!channels[serverId]) channels[serverId] = [];
            channels[serverId].push(channelId);
        })
        return channels;
    })(process.env.WELCOMEANNOUNCERCHANNELS)
}

module.exports = config;
