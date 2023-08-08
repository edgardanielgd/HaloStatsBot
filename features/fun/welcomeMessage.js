const Feature = require("../Feature.js");
const Discord = require("discord.js");
const { sendMessage } = require("../../utils/crudMessages");
const config = require("../../config");
const path = require("path");
const Canvas = require("canvas");

class SendMessageFeature extends Feature {
    constructor() {
        super("Send a welcome message", "Send a welcome message each time a new member joins", "🖲️");
    }

    config = (bot, subscriber) => {

        subscriber.registerOnGuildMemberAdd(this);

        this.bot = bot;
    }

    async generateEmbedResponse(channel, member) {
        const canvas = Canvas.createCanvas(600, 200);
        const ctx = canvas.getContext('2d');

        const baseImage = await Canvas.loadImage(
            path.join(__dirname, '../../images/BKWelcomeMessage.png')
        );

        ctx.drawImage(
            baseImage,
            0, 30, 500, 180,
            0, 0, canvas.width, canvas.height
        );

        // Slightly smaller text placed above the member's display name
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
            member.user.username,
            380, 105, 200
        );

        // Draw the user's avatar
        const avatar = await Canvas.loadImage(
            member.user.displayAvatarURL({
                extension: 'png'
            })
        );

        // Make the avatar image a circle

        const cx = 280 + 80 / 2;
        const cy = 60 + 80 / 2;
        const radius = 80 / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Draw the avatar
        ctx.drawImage(
            avatar, 280, 60, 80, 80
        );

        ctx.restore();

        ctx.fillStyle = '#ffffff';
        ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2, true);

        const attachment = new Discord.AttachmentBuilder(
            canvas.toBuffer(), {
            name: 'welcome-image.png'
        });

        return attachment;
    }

    async onGuildMemberAdd(member) {
        const serversData = config.WELCOMEANNOUNCERCHANNELS;

        if (!serversData) return;

        const channels = serversData[member.guild.id];

        if (!channels) return;

        for (const channelId of channels) {

            let channel = null;

            try {
                channel = member.guild.channels.cache.get(channelId);
                if (!channel) continue;
            } catch (e) {
                continue;
            }

            const attachment = await this.generateEmbedResponse(channel, member);

            sendMessage(channel, {
                content: ``,
                files: [attachment]
            });
        }
    }

}

// Singleton export
module.exports = new SendMessageFeature();