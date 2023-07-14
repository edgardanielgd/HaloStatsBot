const pkgValidator = {
    validateIpFormat: (ip) => {
        if (!ip) return {
            error: "Ip is not defined",
            code: 1
        };

        const ipSections = ip.split(".");

        if (ipSections.length != 4) return {
            error: "Ip has less than 4 sections",
            code: 2
        }

        for (const section of ipSections) {
            if (!section || section.length == 0) return {
                error: "Ip has empty sections",
                code: 3
            }

            // Check if the section is a number
            const sectionNumber = parseInt(section);
            if (isNaN(sectionNumber)) return {
                error: "Ip has non-numeric sections",
                code: 4
            }

            // Check if the section is between 0 and 255
            if (sectionNumber < 0 || sectionNumber > 255) return {
                error: "Ip has sections out of range",
                code: 5
            }

            return {}
        }
    },

    validatePortFormat: (port) => {
        if (!port) return {
            error: "Port is not defined",
            code: 1
        };

        const portNumber = parseInt(port);
        if (isNaN(portNumber)) return {
            error: "Port is not a number",
            code: 2
        }

        if (portNumber <= 0 || portNumber >= 65536) return {
            error: "Port must be greater than 0 and less than 65536",
            code: 3
        }

        return {}
    }
}

module.exports = pkgValidator;