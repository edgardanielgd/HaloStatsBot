const genereateBlackshaloStrings = (fileContents) => {
    let stringResponse = "";

    const ranks = fileContents.ranks;

    if (!ranks || ranks.length === 0)
        return {
            data: null,
            error: "No ranks found"
        }

    const embedsData = [];

    for (const rank of ranks) {
        const embed = {
            title: rank.name,
            color: rank.color,
            footer: {
                text: "Last Updated"
            },
            timestamp: new Date().toISOString(),
            image: {
                url: rank.bottomImg
            },
            thumbnail: {
                url: rank.logo
            },
            description: (
                () => {
                    let description = "";
                    const members = rank.members;

                    if (!members || members.length === 0) return description;

                    for (const member of members) {
                        description += `● ${member.name} - \`\`${(member.servers && member.servers.length > 0) ?
                            member.servers.join("+") :
                            "sin inicio de sesión / no login"
                            }\`\` ${member.country ? `:flag_${member.country.toLowerCase()}:` : ""}\n`;
                    }

                    return description;
                }
            )()
        };

        embedsData.push(embed);
    }

    const data = {
        version: 7,
        backups: [
            {
                name: "Admins List",
                messages: [
                    {
                        data: {
                            content: null,
                            embeds: embedsData
                        },
                        reference: "",
                        username: "BK Servers",
                        avatar_url: "https://i.imgur.com/br4woN1.png",
                        attachments: []
                    }
                ],
                targets: [
                    {
                        url: "<FILL HERE WEBHOOK URL>"
                    },
                ]
            }
        ]
    }

    stringResponse = JSON.stringify(data, null, 4);

    return { data: stringResponse, error: null };
}

module.exports = genereateBlackshaloStrings;