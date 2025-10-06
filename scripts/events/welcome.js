module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "1.0.3",
  credits: "MUNTASIR MAHMUD",
  description: "Welcome message with optional image/video",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.onLoad = function () {
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { join } = global.nodemodule["path"];
  const paths = [
    join(__dirname, "cache", "joinGif"),
    join(__dirname, "cache", "randomgif")
  ];
  for (const path of paths) {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
  }
};

module.exports.run = async function({ api, event }) {
  const fs = require("fs");
  const path = require("path");
  const { threadID } = event;

  const botPrefix = global.config.PREFIX || "/";
  const botName = global.config.BOTNAME || "YOUR মুরগীর বাচ্চা 😘";

  // Bot nijeke add hole nickname change ar welcome message
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID() || i.id == api.getCurrentUserID())) {
    await api.changeNickname(`[ ${botPrefix} ] • ${botName}`, threadID, api.getCurrentUserID());

    api.sendMessage("চ্ঁলে্ঁ এ্ঁসে্ঁছি্ঁ YOUR মুরগীর বাচ্চা 😘 এঁখঁনঁ তোঁমাঁদেঁরঁ সাঁথেঁ আঁড্ডাঁ দিঁবঁ..!", threadID, () => {
      const randomGifPath = path.join(__dirname, "cache", "randomgif");
      const allFiles = fs.readdirSync(randomGifPath).filter(file =>
        [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
      );

      const selected = allFiles.length > 0 
        ? fs.createReadStream(path.join(randomGifPath, allFiles[Math.floor(Math.random() * allFiles.length)])) 
        : null;

      const messageBody = `╭•┄┅═══❁🌺❁═══┅┄•╮
আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ💚আ্ঁলা্ঁই্ঁকু্ঁম্ঁ
╰•┄┅═══❁🌺❁═══┅┄•╯

𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐬𝐨 𝐦𝐮𝐜𝐡 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐞 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐢-𝐠𝐫𝐨𝐮𝐩-🖤🤗
𝐈 𝐰𝐢𝐥𝐥 𝐚𝐥𝐰𝐚𝐲𝐬 𝐬𝐞𝐫𝐯𝐞 𝐲𝐨𝐮 𝐢𝐧𝐚𝐡𝐚𝐥𝐥𝐚𝐡 🌺❤️

𝐓𝐨 𝐯𝐢𝐞𝐰 𝐚𝐧𝐲 𝐜𝐨𝐦𝐦𝐚𝐧𝐝:
${botPrefix}Help
${botPrefix}Info
${botPrefix}Admin

★ যেকোনো অভিযোগ অথবা হেল্প এর জন্য এডমিন 𝐄𝐝𝐞𝐧 愛 কে নক করতে পারেন ★
➤𝐌𝐞𝐬𝐬𝐞𝐧𝐠𝐞𝐫: https://m.me/ibonex.eden

❖⋆═══════════════════════⋆❖
          𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫 ➢ 𝐄𝐝𝐞𝐧 愛`;

      if (selected) {
        api.sendMessage({ body: messageBody, attachment: selected }, threadID);
      } else {
        api.sendMessage(messageBody, threadID);
      }
    });

    return;
  }

  // Not bot add hole, normal welcome message
  try {
    const { createReadStream, readdirSync } = global.nodemodule["fs-extra"];
    let { threadName, participantIDs } = await api.getThreadInfo(threadID);
    const threadData = global.data.threadData.get(parseInt(threadID)) || {};
    let mentions = [], nameArray = [], memNumber = participantIDs.length;

    for (let i = 0; i < event.logMessageData.addedParticipants.length; i++) {
      const user = event.logMessageData.addedParticipants[i];
      nameArray.push(user.fullName);
      mentions.push({ tag: user.fullName, id: user.userFbId || user.id });
    }

    let msg = (typeof threadData.customJoin === "undefined") ? `╭•┄┅═══❁🌺❁═══┅┄•╮
আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ💚আ্ঁলা্ঁই্ঁকু্ঁম্ঁ
╰•┄┅═══❁🌺❁═══┅┄•╯
হাসি, মজা, ঠাট্টায় গড়ে উঠুক  
চিরস্থায়ী বন্ধুত্বের বন্ধন।🥰
ভালোবাসা ও সম্পর্ক থাকুক আজীবন।💝

➤ আশা করি আপনি এখানে হাসি-মজা করে 
আড্ডা দিতে ভালোবাসবেন।😍
➤ সবার সাথে মিলেমিশে থাকবেন।😉
➤ উস্কানিমূলক কথা বা খারাপ ব্যবহার করবেন না।🚫
➤ গ্রুপ এডমিনের কথা শুনবেন ও রুলস মেনে চলবেন।✅

›› প্রিয় {name},  
আপনি এই গ্রুপের {soThanhVien} নম্বর মেম্বার!

›› গ্রুপ: {threadName}

💌 🌺 𝐖 𝐄 𝐋 𝐂 𝐎 𝐌 𝐄 🌺 💌
╭─╼╾─╼🌸╾─╼╾───╮
FROM YOUR মুরগীর বাচ্চা 😘 🌺
╰───╼╾─╼🌸╾─╼╾─╯

❖⋆══════════════════════════⋆❖` : threadData.customJoin;

    msg = msg
      .replace(/\{name}/g, nameArray.join(', '))
      .replace(/\{soThanhVien}/g, memNumber)
      .replace(/\{threadName}/g, threadName);

    const joinGifPath = path.join(__dirname, "cache", "joinGif");
    const files = readdirSync(joinGifPath).filter(file =>
      [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
    );
    const randomFile = files.length > 0 
      ? createReadStream(path.join(joinGifPath, files[Math.floor(Math.random() * files.length)])) 
      : null;

    return api.sendMessage(
      randomFile ? { body: msg, attachment: randomFile, mentions } : { body: msg, mentions },
      threadID
    );
  } catch (e) {
    console.error("JoinNoti Error:", e);
  }
}; YOUR মুরগীর বাচ্চা 😘 🌺
╰───╼╾─╼🌸╾─╼╾─╯

❖⋆══════════════════════════⋆❖` : threadData.customJoin;

    msg = msg
      .replace(/\{name}/g, nameArray.join(', '))
      .replace(/\{soThanhVien}/g, memNumber)
      .replace(/\{threadName}/g, threadName);

    const joinGifPath = path.join(__dirname, "cache", "joinGif");
    const files = readdirSync(joinGifPath).filter(file =>
      [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
    );
    const randomFile = files.length > 0 
      ? createReadStream(path.join(joinGifPath, files[Math.floor(Math.random() * files.length)])) 
      : null;

    return api.sendMessage(
      randomFile ? { body: msg, attachment: randomFile, mentions } : { body: msg, mentions },
      threadID
    );
  } catch (e) {
    console.error("JoinNoti Error:", e);
  }
};
