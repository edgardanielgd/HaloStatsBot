const dgram = require("dgram");
const queryMessage = "\\query";
const maxAwaitTime = 1500;

class HaloServersQuery {
    constructor(ip, port) {
        this.ip = ip;
        this.port = port;
        this.con = dgram.createSocket("udp4");
    }

    send = () => {
        let initial_time = new Date();
        return new Promise((resolve, _) => {
            this.con.on("error", (err) => {
                this.con.close();
                const awaited_time = new Date() - initial_time;
                resolve({
                    type: "Connection error",
                    error: err.message,
                    ip: this.ip,
                    port: this.port,
                    time: awaited_time
                })
            });

            this.con.on("message", (message, _) => {
                clearTimeout(this.timeOutId);
                this.con.close();
                const ping = new Date() - initial_time;
                resolve({
                    data: this.decode(message),
                    ip: this.ip,
                    port: this.port,
                    ping
                });
            });

            this.con.send(queryMessage, 0, queryMessage.length, this.port, this.ip);

            this.timeOutId = setTimeout(() => {
                resolve({
                    type: "Timeout error",
                    error: "Waited " + maxAwaitTime + " ms for a server reply",
                    ip: this.ip,
                    port: this.port,
                    time: maxAwaitTime
                })
            }, maxAwaitTime);
        });
    }

    // Decode query into a json object
    decode = (message) => {
        message = message.toString("latin1");

        // Split and convert given data
        let ignored_codes = [1, 2, 42, 95, 96, 126];
        let string_ret = "";
        let arr = [];
        for (let i = 0; i < message.length; i++) {
            let code = message.charCodeAt(i);
            if (code == 92) {
                arr.push(string_ret);
                string_ret = "";
                continue;
            }

            if (ignored_codes.includes(code)) continue;

            string_ret += message[i];
        }

        return this.generateServerInfo(arr);
    }

    generateServerInfo = (arr) => {
        let data = {
            name: arr[2],
            port: arr[6],
            maxPlayers: arr[8],
            password: arr[10] != "0",
            mapName: arr[12],
            currentPlayers: parseInt(arr[20]),
            gametype: arr[22],
            teamPlay: arr[24] != "0",
            gameVariant: arr[26]
        };


        if (data.teamPlay) {
            data = {
                ...data,
                redScore: arr[34 + data.currentPlayers * 8 + 4],
                blueScore: arr[34 + data.currentPlayers * 8 + 6],
                redPlayers: [],
                bluePlayers: []
            }
        } else {
            data = {
                ...data,
                players: []
            }
        }

        if (data.currentPlayers <= 0) {
            return data;
        }

        // Generate players info
        for (let i = 0; i < data.currentPlayers; i++) {
            const player_data = {
                name: arr[34 + i * 2],
                score: arr[34 + data.currentPlayers * 2 + i * 2],
                ping: arr[34 + data.currentPlayers * 4 + i * 2],
                team: (!data.teamPlay) ? null : (
                    arr[34 + data.currentPlayers * 6 + i * 2] == "0" ? "red" : "blue"
                )
            }

            if (data.teamPlay) {
                if (player_data.team == "red") {
                    data.redPlayers.push(player_data);
                } else {
                    data.bluePlayers.push(player_data);
                }
            } else {
                data.players.push(player_data);
            }
        }
        return data;
    }
}
module.exports = HaloServersQuery;