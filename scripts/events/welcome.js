const { getTime, getStreamFromURL } = global.utils;
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// Default welcome image
const WELCOME_IMAGE = "https://i.imgur.com/vkOxD7T8.jpeg";

module.exports = {
  config: { name: "welcome", version: "2.3", author: "Eden & GPT-5", category: "events" },

  langs: {
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      botJoin: "✨ Thanks for adding me! Type %1help to see my commands.",
      singleJoin: "😎 Yo {userNameTag}! Welcome to {boxName}! Have a lovely {session}! 💖",
      multiJoin: "🌟 Yo {userNameTag} all! Welcome to {boxName}! Enjoy your {session}! 🌈"
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const hours = getTime("HH");
    const { threadID } = event;
    const dataAddedParticipants = event.logMessageData.addedParticipants;

    // Bot join
    if (dataAddedParticipants.some(p => p.userFbId == api.getCurrentUserID()))
      return message.send(getLang("botJoin", global.utils.getPrefix(threadID)));

    if (!global.temp.welcomeEvent[threadID])
      global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

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
      const session = hours <= 10 ? "morning" : hours <= 12 ? "noon" : hours <= 18 ? "afternoon" : "evening";

      let welcomeMessage = multiple ? getLang("multiJoin") : getLang("singleJoin");
      welcomeMessage = welcomeMessage
        .replace(/\{userNameTag\}/g, userName.map(n => `@${n}`).join(", "))
        .replace(/\{boxName\}/g, threadName)
        .replace(/\{session\}/g, session);

      const form = {
        body: welcomeMessage,
        mentions
      };

      // ✅ Use getStreamFromURL for reliable attachment
      try {
        const stream = await getStreamFromURL(WELCOME_IMAGE);
        form.attachment = [stream];
      } catch (err) {
        console.error("❌ Failed to fetch welcome image:", err);
      }

      await message.send(form);
      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
