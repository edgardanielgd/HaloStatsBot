const { align, glow, size, textColor, newLine, concatenate, url, img, b } = require('./forumMarkdown');

const genereateBlackshaloStrings = (fileContents) => {
    let stringResponse = "";

    const ranks = fileContents.ranks;

    if (!ranks || ranks.length === 0)
        return {
            data: null,
            error: "No ranks found"
        }

    for (const rank of ranks) {
        const rankColor = rank.color ? `#${rank.color.toString(16).padStart(6, "0")}` : "black";
        stringResponse += concatenate(
            newLine(""),
            newLine(
                align(
                    "center",
                    concatenate(
                        glow(
                            rankColor,
                            textColor(
                                rankColor,
                                size(200, b(rank.name))
                            )
                        ),
                        newLine(""),
                        // img(
                        //     rank.logo
                        // )
                    )
                )
            ), newLine("")
        )

        const members = rank.members;

        if (!members || members.length === 0) continue;

        for (let i = 0; i < members.length; i++) {
            const member = members[i];

            stringResponse += newLine(
                align(
                    "left",
                    size(
                        120,
                        concatenate(
                            textColor(
                                "white",
                                `${i + 1}. `
                            ),
                            url(
                                `https://www.blackshalo.com/phpBB3/memberlist.php?mode=viewprofile&u=${member.blackshaloUserID}`,
                                glow(
                                    rankColor,
                                    textColor(
                                        rankColor,
                                        `${member.name}`
                                    )
                                )
                            ),
                            member.servers ? "   " : "",
                            textColor(
                                "white",
                                member.servers ? ` ${member.servers.join(" + ")}` : " "
                            ),
                            member.country ? "   " : "",
                            member.country ? img(
                                `https://flagcdn.com/32x24/${member.country.toLowerCase()}.png`
                            ) : ""
                        )
                    )
                )
            )
        }

        stringResponse += newLine(newLine(""));
    }

    return { data: stringResponse, error: null };
}

module.exports = genereateBlackshaloStrings;