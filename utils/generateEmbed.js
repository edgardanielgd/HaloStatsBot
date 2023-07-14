class EmbedGenerator {
    constructor(_embed = null) {
        if (_embed == null) {
            this.embed = {}
        } else {
            this.embed = _embed;
        }
    }

    updateAtomicData(
        _title = null, _description = null, _url = null,
        _color = null, _timestamp = null, _thumbnailUrl = null,
        _image = null
    ) {
        this.embed = {
            ...this.embed,
            title: _title || this.embed.title,
            description: _description || this.embed.description,
            url: _url || this.embed.url,
            color: _color || this.embed.color,
            timestamp: _timestamp || this.embed.timestamp,
            thumbnail: {
                url: _thumbnailUrl || this.embed.thumbnail?.url
            },
            image: {
                url: _image || this.embed.image?.url
            }
        }
    }

    updateAuthorData(
        _name = null, _iconURL = null, _url = null
    ) {
        const author = {};
        author.name = _name;
        author.iconURL = _iconURL;
        author.url = _url;

        this.embed = {
            ...this.embed,
            author: author
        }
    }

    updateFooterData(
        _text = null, _iconURL = null
    ) {
        const footer = {};
        footer.text = _text;
        footer.iconURL = _iconURL;

        this.embed = {
            ...this.embed,
            footer: footer
        }
    }

    setFields(
        _fields = []
    ) {
        this.embed = {
            ...this.embed,
            fields: _fields
        }
    }

    configureMessageAuthor(
        target, isDm = false
    ) {
        if (isDm) {
            this.embed.color = 0xfffdfc;
        } else {
            // DM Channels do not include members color
            if (target.member) {
                this.embed.color = target.member.displayColor;
            } else {
                this.embed.color = 0xfffdfc;
            }
        }

        const user = target.user ? target.user : target.author;

        this.embed.footer = {
            text: "Requested by: " + user.username,
            iconURL: user.avatarURL()
        }

        const date = new Date();
        this.embed.timestamp = date.toISOString();
    }

    getEmbed() {
        return this.embed;
    }
}

module.exports = EmbedGenerator;