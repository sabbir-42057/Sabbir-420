const Jimp = require("jimp");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "kiss",
        aliases: ["kiss"],
        version: "1.0",
        author: "SaiF",
        countDown: 5,
        role: 0,
        shortDescription: "KISS",
        longDescription: "Send a kiss image with 2 people.",
        category: "love",
        guide: "{pn} @tag or reply"
    },

    onStart: async function ({ api, message, event, usersData }) {
        const uid = event.senderID;
        const mention = Object.keys(event.mentions);
        const uid1 = Object.keys(event.mentions)[0];
        const uid2 = event.messageReply ? event.messageReply.senderID : null;
        const uids = uid1 || uid2;

        if (!uids) return message.reply(" Tag or reply to someone you want to kiss.");

        let two = uid, one = uids;
        if (mention.length === 2) {
            one = mention[1];
            two = mention[0];
        }

        try {
            const avatarURL1 = await usersData.getAvatarUrl(one);
            const avatarURL2 = await usersData.getAvatarUrl(two);

            if (!avatarURL1 || !avatarURL2) {
                return message.reply("Couldn't fetch user avatars.");
            }

            // Download avatars
            const avatar1 = await Jimp.read((await axios({ url: avatarURL1, responseType: "arraybuffer" })).data);
            const avatar2 = await Jimp.read((await axios({ url: avatarURL2, responseType: "arraybuffer" })).data);

            // Background (your uploaded romantic pic)
            const background = await Jimp.read("https://i.imgur.com/7531Hrd.jpeg");

            // Resize background (keep original ratio, or set fixed size)
            background.resize(600, Jimp.AUTO);

            // Round avatars
            avatar1.resize(140, 140).circle();
            avatar2.resize(140, 140).circle();

            // Composite avatars (adjust position to match background scene)
            background.composite(avatar1, 80, 200);   // Left side (girl/boy hand)
            background.composite(avatar2, 360, 220);  // Right side (other one)

            // Ensure tmp folder exists
            const tmpPath = path.join(__dirname, "tmp");
            if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);

            // Save final image
            const imagePath = path.join(tmpPath, `${one}_${two}_kiss.png`);
            await background.writeAsync(imagePath);

            // Send reply
            message.reply({
                body: "mwah 💗💋",
                attachment: fs.createReadStream(imagePath)
            }, () => fs.unlinkSync(imagePath));

        } catch (error) {
            console.error(error);
            message.reply("❌ Something went wrong while generating the image.");
        }
    }
};