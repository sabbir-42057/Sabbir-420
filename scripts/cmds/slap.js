const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "batslap",
        version: "1.1",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        shortDescription: "slap image",
        longDescription: "slap image",
        category: "fun",
        guide: {
            en: "   {pn} @tag or reply someone's message"
        }
    },

    langs: {
        vi: {
            noTarget: "Bạn phải tag hoặc reply người bạn muốn tát"
        },
        en: {
            noTarget: "You must tag or reply to the person you want to slap"
        }
    },

    onStart: async function ({ event, message, usersData, args, getLang }) {
        const senderID = event.senderID;
        let targetID;

        // Check if user replied to a message
        if (event.type === "message_reply") {
            targetID = event.messageReply.senderID;
        }
        // Otherwise, check if tagged someone
        else if (Object.keys(event.mentions).length > 0) {
            targetID = Object.keys(event.mentions)[0];
        }

        if (!targetID)
            return message.reply(getLang("noTarget"));

        const avatar1 = await usersData.getAvatarUrl(senderID);
        const avatar2 = await usersData.getAvatarUrl(targetID);

        const img = await new DIG.Batslap().getImage(avatar1, avatar2);
        const imgPath = `${__dirname}/tmp/${senderID}_${targetID}_Batslap.png`;

        fs.writeFileSync(imgPath, Buffer.from(img));

        const content = args.join(" ").replace(/@.+?\s/, "");
        message.reply({
            body: content || "Bópppp 😵‍💫😵",
            attachment: fs.createReadStream(imgPath)
        }, () => fs.unlinkSync(imgPath));
    }
};
