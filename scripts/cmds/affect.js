const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "affect",
    version: "1.1",
    author: "NIB",
    countDown: 5,
    role: 0,
    shortDescription: "Affect image",
    longDescription: "Affect image",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | hoặc reply tin nhắn]",
      en: "{pn} [@tag | or reply to a message]"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    let uid;

    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else {
      uid = Object.keys(event.mentions)[0];
    }

    if (!uid) return message.reply("mention or reply to someone to use this!");

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Affect().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_affect.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));
      message.reply({
        body: "",
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));

    } catch (err) {
      message.reply("❌ 𝐄𝐫𝐫𝐨𝐫 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞.");
    }
  }
};
