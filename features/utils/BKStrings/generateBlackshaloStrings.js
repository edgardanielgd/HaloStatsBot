const genereateBlackshaloStrings = (roles) => {
    let concatenated = "";

    if (roles) {
        roles.forEach(role => {
            concatenated += `${role.name}:\n`;

            if (role.members) {
                role.members.forEach(member => {
                    concatenated += `${member.user.username}\n`;
                });
            }

            concatenated += "\n";
        });
    }

    return concatenated;
}

module.exports = genereateBlackshaloStrings;