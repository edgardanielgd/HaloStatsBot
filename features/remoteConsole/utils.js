pkgUtils = {
    generateRichServerDescription: (conn, data) => {
        // Lets create a beautiful embed body
        // we will save the info within embed description
        let description = `\`Server Name: \` ${data.servername}\n` +
            `\`IP: \` ${conn.ip}\n` +
            `\`Port: \` ${conn.port}\n` +
            `\`Anticheat: \` ${data.anticheat ? "Yes" : "No"}\n` +
            `\`No Lead: \` ${data["no-lead"] ? "Yes" : "No"}\n` +
            `\`Running: \` ${data.running ? "Yes" : "No"}\n` +
            `\`Sapp Version: \` ${data.sapp_version}\n` +
            `\`Server Version: \` ${data.version}\n`;

        if (data.running) {
            description += `\`Map: \` ${data.map}\n` +
                `\`Online Players: \` ${data.players ? data.players.length : 0}\n` +
                `\`Gametype: \` ${data.gametype}\n` +
                `\`Teamplay: \` ${data.teams ? "Yes" : "No"}\n` +
                `\`Mode: \` ${data.mode}\n\n`;

            const generatePlayerString = (i, player) => {
                return `${!data.teams ? "⚪" : (player.team === 0 ? "🔴" : "🔵")
                    } \t ${player.index
                    }.\t ${player.name
                    } \t Score: ${player.score
                    } \t Assists: ${player.assists
                    } \t Betrays: ${player.betrays
                    } \t Deaths: ${player.deaths
                    } \t Kills: ${player.kills
                    } \t Suicides: ${player.suicides
                    }`
            }

            // Lets say redPlayers is equal to all players when teamplay is disabled
            let bluePlayers = [], redPlayers = [];
            const playersCount = data.players ? data.players.length : 0;
            for (let i = 0; i < playersCount; i++) {
                const player = data.players[i];
                const playerString = generatePlayerString(i, player);
                if (player.team === 0) {
                    // Red team
                    redPlayers.push(playerString);
                }
                else {
                    bluePlayers.push(playerString);
                }
            }

            const playersData = redPlayers.concat(bluePlayers);

            if (playersCount > 0) {

                description += `\`${playersData.join("\n")}\``;

                if (data.teams)
                    // Get teams scores
                    description += `\n\n🔴 | \`Red Score: \` ${data.red_score}\n` +
                        `🔵 | \`Blue Score: \` ${data.blue_score}\n`;

            } else {
                description += "\`No players online... (Maybe seed them?)\`";
            }
        }

        return description;
    },
<<<<<<< HEAD
=======

    generateBasicServerDescription: (conn, data) => {
        // Lets create a beautiful embed body
        // we will save the info within embed description
        let description = `\`Server Name: \` ${data.servername}\n` +
            `\`IP: \` ${conn.ip}\n` +
            `\`Port: \` ${conn.port}\n` +
            `\`Anticheat: \` ${data.anticheat ? "Yes" : "No"}\n` +
            `\`No Lead: \` ${data["no-lead"] ? "Yes" : "No"}\n` +
            `\`Running: \` ${data.running ? "Yes" : "No"}\n` +
            `\`Sapp Version: \` ${data.sapp_version}\n` +
            `\`Server Version: \` ${data.version}\n`;

        if (data.running) {
            description += `\`Map: \` ${data.map}\n` +
                `\`Online Players: \` ${data.players ? data.players.length : 0}\n` +
                `\`Gametype: \` ${data.gametype}\n` +
                `\`Teamplay: \` ${data.teams ? "Yes" : "No"}\n` +
                `\`Mode: \` ${data.mode}\n\n`;

            const generatePlayerString = (i, player) => {
                return `${!data.teams ? "⚪" : (player.team === 0 ? "🔴" : "🔵")
                    } \t ${player.index
                    }.\t ${player.name
                    } \t Score: ${player.score
                    } \t Assists: ${player.assists
                    } \t Betrays: ${player.betrays
                    } \t Deaths: ${player.deaths
                    } \t Kills: ${player.kills
                    } \t Suicides: ${player.suicides
                    }`
            }

            // Lets say redPlayers is equal to all players when teamplay is disabled
            let bluePlayers = [], redPlayers = [];
            const playersCount = data.players ? data.players.length : 0;
            for (let i = 0; i < playersCount; i++) {
                const player = data.players[i];
                const playerString = generatePlayerString(i, player);
                if (player.team === 0) {
                    // Red team
                    redPlayers.push(playerString);
                }
                else {
                    bluePlayers.push(playerString);
                }
            }

            const playersData = redPlayers.concat(bluePlayers);

            if (playersCount > 0) {

                description += `\`${playersData.join("\n")}\``;

                if (data.teams)
                    // Get teams scores
                    description += `\n\n🔴 | \`Red Score: \` ${data.red_score}\n` +
                        `🔵 | \`Blue Score: \` ${data.blue_score}\n`;

            } else {
                description += "\`No players online... (Maybe seed them?)\`";
            }
        }

        return description;
    },
>>>>>>> master
    generatePlayersLocationsDescription: data => {
        // This has a simplier body than the server full description

        if (!data.players) {
            const description = "\`No players online\`";
            return description;
        }

        let description = "\`";
        const playersCount = data.players ? data.players.length : 0;
        for (let i = 0; i < playersCount; i++) {
            const player = data.players[i];
            description += `${player.index
                } \t X: ${player.x
                } \t Y: ${player.y
                } \t Z: ${player.z
                }\n`;
        }
        description += "\`";
        return description;
    }
}

module.exports = pkgUtils;