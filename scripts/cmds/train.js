const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "train",
    version: "1.2",
    author: "milan-says",
    countDown: 5,
    role: 0,
    shortDescription: "Train image with tagged or replied user",
    longDescription: "Generate a Thomas train image with tagged or replied user's avatar.",
    category: "fun",
    guide: {
      en: "{pn} [@tag | reply to a user]"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    let uid;

    // Check for reply first
    if (event.type === "message_reply" && event.messageReply.senderID) {
      uid = event.messageReply.senderID;
    }
    // Fallback to mention
    else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    }
    else {
      return message.reply("⚠️ Please mention someone or reply.");
    }

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Thomas().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_Thomas.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));
      message.reply({
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to generate image.");
    }
  }
};
