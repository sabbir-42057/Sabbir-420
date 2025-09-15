const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    author: 'Nyx x Ariyan',
    category: "love"
  },

  onStart: async function({ api, event, usersData }) {  
    try {
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData.name;
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      // ---------- BACKGROUND ARRAY (only 2) ----------
      const backgrounds = [
        "https://i.postimg.cc/tRFY2HBm/0602f6fd6933805cf417774fdfab157e.jpg",
        "https://i.imgur.com/L6l0pFv.jpeg",
        "https://i.imgur.com/lAWsxwT.jpeg",
        "https://i.imgur.com/dHhqHTg.jpeg",
        "https://i.imgur.com/5TFzyUw.jpeg"
      ];
      const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      let matchUser;

      // ---------- CHECK IF MENTION ----------
      if (Object.keys(event.mentions).length > 0) {
        const mentionID = Object.keys(event.mentions)[0];
        matchUser = users.find(user => user.id === mentionID);
      } else {
        const myData = users.find(user => user.id === event.senderID);
        if (!myData || !myData.gender) {
          return api.sendMessage("❌ Undefined gender, cannot find match.", event.threadID, event.messageID);
        }

        const myGender = myData.gender;
        let matchCandidates = [];

        if (myGender === "MALE") {
          matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== event.senderID);
        } else if (myGender === "FEMALE") {
          matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== event.senderID);
        } else {
          return api.sendMessage("❌ Undefined gender, cannot find match.", event.threadID, event.messageID);
        }

        if (matchCandidates.length === 0) {
          return api.sendMessage("error 🥲", event.threadID, event.messageID);
        }

        matchUser = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      }

      const matchName = matchUser.name;
      const lovePercentage = Math.floor(Math.random() * 100) + 1;

      // Canvas part
      const width = 800, height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const background = await loadImage(randomBg);
      const senderAvatar = await loadImage(await usersData.getAvatarUrl(event.senderID));
      const matchAvatar = await loadImage(await usersData.getAvatarUrl(matchUser.id));

      ctx.drawImage(background, 0, 0, width, height);
      ctx.drawImage(senderAvatar, 385, 40, 170, 170);
      ctx.drawImage(matchAvatar, width - 213, 190, 180, 170);

      const outputPath = path.join(__dirname, 'pair_output.png');
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', () => {
        const message = `𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐩𝐚𝐢𝐫𝐢𝐧𝐠\n` +
                        `• ${senderName} 🎀\n` +
                        `• ${matchName} 🎀\n` +
                        `🌌 𝐖𝐢𝐬𝐡 𝐲𝐨𝐮 𝐭𝐰𝐨 𝐡𝐮𝐧𝐝𝐫𝐞𝐝 𝐲𝐞𝐚𝐫𝐬 𝐨𝐟 𝐡𝐚𝐩𝐩𝐢𝐧𝐞𝐬𝐬 🪐\n\n` +
                        `𝐋𝐨𝐯𝐞 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞 ${lovePercentage}% 💙`;

        api.sendMessage({
          body: message,
          attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
      });

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ An error occurred: " + error.message, event.threadID, event.messageID);
    }
  }
};