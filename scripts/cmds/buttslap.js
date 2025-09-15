const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "buttslap",
    version: "1.1",
    author: "KSHITIZ",
    countDown: 5,
    role: 0,
    shortDescription: "Buttslap image",
    longDescription: "Buttslap image",
    category: "fun",
    guide: {
      en: "   {pn} @tag or reply someone's message"
    }
  },

  langs: {
    vi: {
      noTarget: "Bạn phải tag hoặc reply người bạn muốn vỗ mông"
    },
    en: {
      noTarget: "You must tag or reply to the person you want to slap"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const senderID = event.senderID;
    let targetID;

    // If the user replied to someone's message
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }
    // If the user tagged someone
    else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (!targetID)
      return message.reply(getLang("noTarget"));

    const avatar1 = await usersData.getAvatarUrl(senderID);
    const avatar2 = await usersData.getAvatarUrl(targetID);
    const img = await new DIG.Spank().getImage(avatar1, avatar2);
    const imgPath = `${__dirname}/tmp/${senderID}_${targetID}_spank.png`;

    fs.writeFileSync(imgPath, Buffer.from(img));

    const content = args.join(" ").replace(/@.+?\s/, "");
    message.reply({
      body: content || "Hehe boii 🍑",
      attachment: fs.createReadStream(imgPath)
    }, () => fs.unlinkSync(imgPath));
  }
};
