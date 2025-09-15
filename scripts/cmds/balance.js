const fs = require("fs-extra");

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "1.3",
    author: "Saif",
    countDown: 5,
    role: 0,
    description: {
      vi: "xem số tiền hiện có hoặc chuyển tiền",
      en: "view your money or transfer to others"
    },
    category: "economy",
    guide: {
      en:
        "{pn} → view your money\n" +
        "{pn} @mention → view mentioned user money\n" +
        "{pn} transfer <amount> @mention → transfer money\n" +
        "{pn} transfer <amount> (reply) → transfer money to replied user"
    }
  },

  langs: {
    en: {
      money: "You have %1$",
      moneyOf: "%1 has %2$",
      notEnough: "❌ | You don't have enough balance.",
      transferSuccess: "✨ | Transferred %1$ to %2",
      invalidAmount: "Invalid amount.",
      noTarget: "❌ | Please mention or reply to a user to transfer."
    }
  },

  onStart: async function ({ message, usersData, event, args, getLang }) {
    const formatBoldSerif = (text) => {
      const boldSerifMap = {
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣",
        k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭",
        u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉",
        K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓",
        U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗",
        "$": "$", ".": ".", ",": ",", ":": ":", "-": "-", " ": " "
      };
      return text.split('').map(char => boldSerifMap[char] || char).join('');
    };

    const senderID = event.senderID;

    // ─── BALANCE TRANSFER FEATURE ───
    if (args[0] && args[0].toLowerCase() === "transfer") {
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) {
        return message.reply(getLang("invalidAmount"));
      }

      let targetID;

      // If mention
      if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }
      // If reply
      else if (event.messageReply) {
        targetID = event.messageReply.senderID;
      }

      if (!targetID) return message.reply(getLang("noTarget"));

      const senderData = await usersData.get(senderID);
      if (senderData.money < amount) {
        return message.reply(getLang("notEnough"));
      }

      // Update balances
      await usersData.set(senderID, { money: senderData.money - amount }, true);
      const targetData = await usersData.get(targetID);
      await usersData.set(targetID, { money: (targetData.money || 0) + amount }, true);

      const targetName = event.mentions[targetID]
        ? event.mentions[targetID].replace("@", "")
        : (await usersData.getName(targetID));

      return message.reply(formatBoldSerif(getLang("transferSuccess", amount, targetName)));
    }

    // ─── SHOW BALANCE ───
    if (Object.keys(event.mentions).length > 0) {
      const uids = Object.keys(event.mentions);
      let msg = "";
      for (const uid of uids) {
        const userMoney = await usersData.get(uid, "money");
        const name = event.mentions[uid].replace("@", "");
        msg += formatBoldSerif(getLang("moneyOf", name, userMoney)) + "\n";
      }
      return message.reply(msg.trim());
    }

    // If reply without transfer → show balance of replied user
    if (event.messageReply && event.messageReply.senderID) {
      const uid = event.messageReply.senderID;
      const userMoney = await usersData.get(uid, "money");
      const name = await usersData.getName(uid);
      return message.reply(formatBoldSerif(getLang("moneyOf", name, userMoney)));
    }

    // Show own balance
    const userData = await usersData.get(senderID);
    return message.reply(formatBoldSerif(getLang("money", userData.money)));
  }
};