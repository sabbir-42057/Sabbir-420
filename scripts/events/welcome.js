const { getTime } = global.utils;
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// 🎉 Default welcome image (change to any direct link)
const WELCOME_IMAGE = "https://i.imgur.com/vkOxD7T8.jpeg";

module.exports = {
  config: {
    name: "welcome",
    version: "3.0",
    author: "Eden GPT (Final Cool Version)",
    category: "events",
    description: "Funny & Cool Welcome Message with Image, Mentions, Bangla & English"
  },

  langs: {
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      botJoin: "✨ Thanks for adding me! Type %1help to see my commands.",
      singleJoin: "😎 Yo {userNameTag}! Welcome to {boxName}! Have a lovely {session}! 💖",
      multiJoin: "🌟 Yo {userNameTag} all! Welcome to {boxName}! Enjoy your {session}! 🌈"
    },
    bn: {
      session1: "সকাল",
      session2: "দুপুর",
      session3: "বিকেল",
      session4: "রাত",
      botJoin: "✨ আমাকে গ্রুপে অ্যাড করার জন্য ধন্যবাদ! সব কমান্ড দেখতে লিখুন %1help",
      singleJoin: "😎 স্বাগতম {userNameTag} {boxName}-এ! সুন্দর {session}! 💖",
      multiJoin: "🌟 সবাইকে {boxName}-এ স্বাগতম! সুন্দর {session} কাটুক! 🌈"
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const hours = getTime("HH");
    const { threadID } = event;
    const dataAddedParticipants = event.logMessageData.addedParticipants;

    // Bot joined group
    if (dataAddedParticipants.some(p => p.userFbId == api.getCurrentUserID())) {
      return message.send(getLang("botJoin", global.utils.getPrefix(threadID)));
    }

    // Initialize temp storage
    if (!global.temp.welcomeEvent[threadID])
      global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    // Delay to handle multiple joins
    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
      const threadData = await threadsData.get(threadID);
      if (threadData.settings.sendWelcomeMessage === false) return;

      const added = global.temp.welcomeEvent[threadID].dataAddedParticipants;
      const threadName = threadData.threadName || "this group";
      const userName = [], mentions = [];

      for (const user of added) {
        userName.push(user.fullName);
        mentions.push({ tag: user.fullName, id: user.userFbId });
      }

      if (userName.length === 0) return;

      const multiple = userName.length > 1;
      const session = hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") :
                      hours <= 18 ? getLang("session3") : getLang("session4");

      let welcomeMessage = multiple ? getLang("multiJoin") : getLang("singleJoin");
      welcomeMessage = welcomeMessage
        .replace(/\{userNameTag\}/g, userName.map(n => `@${n}`).join(", "))
        .replace(/\{boxName\}/g, threadName)
        .replace(/\{session\}/g, session);

      const form = { body: welcomeMessage, mentions };

      try {
        // Download image to temp file
        const tempPath = path.join(__dirname, "cache", `welcome_${threadID}.jpeg`);
        const response = await axios.get(WELCOME_IMAGE, { responseType: "arraybuffer" });
        await fs.outputFile(tempPath, response.data);

        form.attachment = [fs.createReadStream(tempPath)];
        await message.send(form);

        // Clean up
        fs.unlinkSync(tempPath);
      } catch (err) {
        console.error("❌ Failed to send welcome image:", err);
        await message.send(form); // fallback text only
      }

      delete global.temp.welcomeEvent[threadID];
    }, 1000);
  }
};
