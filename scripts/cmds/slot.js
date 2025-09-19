const slotMemory = {}; // in-memory storage

module.exports = {
  config: {
    name: "slot",
    version: "1.3",
    author: "Saif",
    countDown: 10,
    shortDescription: { en: "slot game 🙂" },
    longDescription: { en: "" },
    category: "game"
  },

  langs: {
    en: {
      invalid_amount: "• 𝐏𝐥𝐞𝐚𝐬𝐞 𝐄𝐧𝐭𝐞𝐫 𝐕𝐚𝐥𝐢𝐝 𝐀𝐦𝐨𝐮𝐧𝐭 😿💅",
      not_enough_money: "• 𝐏𝐥𝐞𝐚𝐬𝐞 𝐂𝐡𝐞𝐜𝐤 𝐘𝐨𝐮𝐫 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 🤡",
      too_much_bet: "• 𝐁𝐚𝐛𝐲, 𝐌𝐚𝐱 𝐁𝐞𝐭 𝐈𝐬 𝟑𝟎𝐌 😿",
      cooldown: "• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐇𝐚𝐯𝐞 𝐑𝐞𝐚𝐜𝐡𝐞𝐝 𝟐𝟎 𝐏𝐥𝐚𝐲𝐬. 𝐓𝐫𝐲 𝐀𝐠𝐚𝐢𝐧 𝐀𝐟𝐭𝐞𝐫 %1 ⏳",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;

    // shorthand parser
    const amount = parseShorthand(args[0]);
    const userData = await usersData.get(senderID);

    const maxBet = 30_000_000; // 30M
    const maxPlays = 20;
    const cooldown = 10 * 60 * 60 * 1000; // 10 hours
    const now = Date.now();

    // in-memory usage tracking
    if (!slotMemory[senderID]) {
      slotMemory[senderID] = {
        count: 0,
        lastReset: now
      };
    }

    const userSlot = slotMemory[senderID];

    // reset after cooldown
    if (now - userSlot.lastReset >= cooldown) {
      userSlot.count = 0;
      userSlot.lastReset = now;
    }

    if (userSlot.count >= maxPlays) {
      const timeLeft = cooldown - (now - userSlot.lastReset);
      const formatted = formatTime(timeLeft);
      return message.reply(getLang("cooldown", formatted));
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > maxBet) {
      return message.reply(getLang("too_much_bet"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const slots = ["💚", "💛", "💙", "💜", "🤎"];
    const results = [
      slots[Math.floor(Math.random() * slots.length)],
      slots[Math.floor(Math.random() * slots.length)],
      slots[Math.floor(Math.random() * slots.length)]
    ];

    const winnings = calculateWinnings(results, amount);
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data
    });

    userSlot.count++;

    const messageText = formatResult(results, winnings);
    return message.reply(messageText);
  }
};

// parse shorthand like 1K, 2M, 3B
function parseShorthand(input) {
  if (!input) return NaN;
  const str = input.toUpperCase();
  let multiplier = 1;

  if (str.endsWith("K")) multiplier = 1e3;
  else if (str.endsWith("M")) multiplier = 1e6;
  else if (str.endsWith("B")) multiplier = 1e9;
  else if (str.endsWith("T")) multiplier = 1e12;

  const num = parseFloat(str.replace(/[KMBT]/, ""));
  return num * multiplier;
}

function calculateWinnings([a, b, c], bet) {
  if (a === b && b === c) return bet * 5;
  if (a === b || a === c || b === c) return bet * 2;
  return -bet;
}

function formatResult([a, b, c], winnings) {
  const slotDisplay = `• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: [ ${a} | ${b} | ${c} ]`;
  const formattedWinnings = formatMoney(Math.abs(winnings));

  let resultText = "";
  if (a === b && b === c) {
    resultText = `• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐇𝐢𝐭 𝐉𝐚𝐜𝐤𝐩𝐨𝐭 🎉\n• 𝐖𝐨𝐧: ${formattedWinnings}$`;
  } else if (winnings > 0) {
    resultText = `• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐖𝐨𝐧 ${formattedWinnings}$`;
  } else {
    resultText = `• 𝐎𝐨𝐩𝐬, 𝐘𝐨𝐮 𝐋𝐨𝐬𝐭 ${formattedWinnings}$`;
  }

  return `>🎀\n${resultText}\n${slotDisplay}`;
}

function formatMoney(amount) {
  if (amount >= 1e12) return (amount / 1e12).toFixed(2) + "𝐓";
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + "𝐁";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + "𝐌";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + "𝐊";
  return amount.toString();
}

function formatTime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬`;
}