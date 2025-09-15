const slotMemory = {}; // in-memory storage

module.exports = {
  config: {
    name: "slot",
    version: "1.1",
    author: "null",
    countDown: 10,
    shortDescription: { en: "slot game 🙂" },
    longDescription: { en: "" },
    category: "game"
  },

  langs: {
    en: {
      invalid_amount: "𝗽𝗹𝗲𝗮𝘀𝗲 𝗶𝗻𝘁𝗲𝗿 𝘃𝗮𝗹𝗶𝗱 𝗮𝗺𝗼𝘂𝗻𝘁 😿💅",
      not_enough_money: "𝗽𝗹𝗲𝗮𝘀𝗲 𝗰𝗵𝗲𝗰𝗸 𝘆𝗼𝘂𝗿 𝗯𝗮𝗹𝗮𝗻𝗰𝗲🤡",
      too_much_bet: "𝗯𝗮𝗯𝘆 𝗺𝗮𝘅 𝗯𝗲𝘁 𝗶𝘀 𝟭𝟬𝗠 😿",
      cooldown: "𝗕𝗮𝗯𝘆 𝘆𝗼𝘂 𝗵𝗮𝘃𝗲 𝗿𝗲𝗮𝗰𝗵𝗲𝗱 𝟮𝟬 𝗽𝗹𝗮𝘆𝘀. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗮𝗳𝘁𝗲𝗿 %1 ⏳",
      win_message: "•𝗯𝗮𝗯𝘆 𝘆𝗼𝘂 𝘄𝗼𝗻  $%1",
      lose_message: "•𝗯𝗮𝗯𝘆 𝘆𝗼𝘂 𝗹𝗼𝘀𝘁 $%1",
      jackpot_message: "»𝘆𝗼𝘂 𝘄𝗼𝗻 𝗝𝗮𝗰𝗸𝗽𝗼𝘁 $%1 𝘄𝗶𝘁𝗵 𝘁𝗵𝗿𝗲𝗲 %2",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const amount = parseInt(args[0]);
    const userData = await usersData.get(senderID);

    const maxBet = 10_000_000;
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

    const messageText = formatResult(results, winnings, getLang);
    return message.reply(messageText);
  }
};

function calculateWinnings([a, b, c], bet) {
  if (a === b && b === c) return bet * 5;
  if (a === b || a === c || b === c) return bet * 2;
  return -bet;
}

function formatResult([a, b, c], winnings, getLang) {
  const slotDisplay = `🪶\n•𝗴𝗮𝗺𝗲 𝗿𝗲𝘀𝘂𝗹𝘁 [ ${a} | ${b} | ${c} ]`;
  const formattedWinnings = formatMoney(Math.abs(winnings));
  if (a === b && b === c) {
    return `${getLang("jackpot_message", formattedWinnings, a)}\n${slotDisplay}`;
  }
  return `${winnings > 0
    ? getLang("win_message", formattedWinnings)
    : getLang("lose_message", formattedWinnings)}\n${slotDisplay}`;
}

function formatMoney(amount) {
  if (amount >= 1e12) return (amount / 1e12).toFixed(2) + "𝗧";
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + "𝗕";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + "𝗠";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + "𝗞";
  return amount.toString();
}

function formatTime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}