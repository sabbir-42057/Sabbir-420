const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "jail",
    version: "1.2",
    author: "404",
    countDown: 5,
    role: 0,
    shortDescription: "Jail image",
    longDescription: "Put someone in jail (fun)",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply"
    }
  },

  langs: {
    vi: {
      noTarget: "Bạn phải tag hoặc reply người bạn muốn bỏ tù"
    },
    en: {
      noTarget: "Please tag or reply!"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    const { senderID, mentions, messageReply } = event;
    let targetID;

    // Priority: tag > reply > none
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    if (!targetID) return message.reply(getLang("noTarget"));

    const avatarURL = await usersData.getAvatarUrl(targetID);
    const img = await new DIG.Jail().getImage(avatarURL);

    const pathSave = `${__dirname}/tmp/${targetID}_jail.png`;
    fs.writeFileSync(pathSave, Buffer.from(img));

    const content = args.join(" ").replace(/@\[.+?\]/g, "").trim();

    message.reply({
      body: `${content || "Welcome to jail 😈🚔"}`,
      attachment: fs.createReadStream(pathSave)
    }, () => fs.unlinkSync(pathSave));
  }
};