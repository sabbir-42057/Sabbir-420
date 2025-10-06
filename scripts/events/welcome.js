const { getTime, drive } = global.utils; const axios = require("axios"); const fs = require("fs-extra"); const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// 🔥 Default welcome image (you can replace with any direct link: .gif, .jpg, .png, etc.) const WELCOME_IMAGE = "https://i.imgur.com/vkOxD7T.jpeg";

module.exports = { config: { name: "welcome", version: "2.1", author: "Customized by ChatGPT (Eden Edition)", category: "events", description: "Fully customized welcome event with image, mentions, and time-based greetings" },

langs: { en: { session1: "morning", session2: "noon", session3: "afternoon", session4: "evening", botJoin: "✨ Thanks for adding me! Type %1help to see my commands.", singleJoin: "🌸 Welcome {userNameTag} to {boxName}! Have a lovely {session}! 💖", multiJoin: "🌼 Welcome {userNameTag} all to {boxName}! Enjoy your {session}! 🌈" }, bn: { session1: "সকাল", session2: "দুপুর", session3: "বিকেল", session4: "রাত", botJoin: "✨ আমাকে গ্রুপে অ্যাড করার জন্য ধন্যবাদ! সব কমান্ড দেখতে লিখুন %1help", singleJoin: "🌸 স্বাগতম {userNameTag} {boxName}-এ! শুভ {session}! 💖", multiJoin: "🌼 সবাইকে {boxName}-এ স্বাগতম! 🌈 সুন্দর {session} কাটুক! 💫" } },

onStart: async ({ threadsData, message, event, api, getLang }) => { if (event.logMessageType !== "log:subscribe") return;

const hours = getTime("HH");
const { threadID } = event;
const prefix = global.utils.getPrefix(threadID);
const dataAddedParticipants = event.logMessageData.addedParticipants;
const { nickNameBot } = global.GoatBot.config;

// BOT added to group
if (dataAddedParticipants.some(p => p.userFbId == api.getCurrentUserID())) {
  if (nickNameBot)
    api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
  return message.send(getLang("botJoin", prefix));
}

// Handle multiple joins
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

  const session = hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4");

  let welcomeMessage = userName.length > 1 ? getLang("multiJoin") : getLang("singleJoin");

  welcomeMessage = welcomeMessage
    .replace(/\{userName\}/g, userName.join(", "))
    .replace(/\{userNameTag\}/g, userName.map(n => `@${n}`).join(", "))
    .replace(/\{boxName\}/g, threadName)
    .replace(/\{session\}/g, session);

  const form = { body: welcomeMessage, mentions };

  // 🖼️ Attach default welcome image
  try {
    const tempPath = path.join(__dirname, "cache", "welcome_temp.jpeg");
    const img = (await axios.get(WELCOME_IMAGE, { responseType: "stream" })).data;
    img.pipe(fs.createWriteStream(tempPath));
    img.on("end", async () => {
      form.attachment = fs.createReadStream(tempPath);
      await message.send(form);
      fs.unlinkSync(tempPath);
    });
  } catch (err) {
    console.error("❌ Failed to send welcome image:", err);
    await message.send(form);
  }

  delete global.temp.welcomeEvent[threadID];
}, 1500);

} };
