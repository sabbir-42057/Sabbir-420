module.exports = {
  config: {
    name: "ping",
    author: "404",
    version: "1.1",
    cooldowns: 10,
    role: 0,
    category: "system",
    guide: {
      en: "{pn}"
    },
  },
  onStart: async function ({ message, api, event }) {
    let pingResults = [];

    const msg = await message.reply("𝐂𝐡𝐞𝐜𝐤𝐢𝐧𝐠 𝐛𝐨𝐭 𝐩𝐢𝐧𝐠..");

    for (let i = 1; i <= 5; i++) {
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 200) + 50)); 
      const ping = Date.now() - start;

      let status;
      if (ping < 100) status = "𝐄𝐱𝐜𝐞𝐥𝐥𝐞𝐧𝐭";
      else if (ping < 200) status = "𝐆𝐨𝐨𝐝";
      else if (ping < 300) status = "𝐀𝐯𝐞𝐫𝐚𝐠𝐞";
      else status = "𝐒𝐥𝐨𝐰";

      pingResults.push(` 𝐏𝐢𝐧𝐠 ${i}: ${ping}𝐦𝐬 - ${status}`);

      await api.editMessage(`𝐂𝐡𝐞𝐜𝐤𝐢𝐧𝐠 𝐛𝐨𝐭 𝐩𝐢𝐧𝐠..!!✨\n\n${pingResults.join("\n")}`, msg.messageID);
    }

    api.editMessage(`${pingResults.join("\n")}`, msg.messageID);
  }
};
