const os = require("os");
const pidusage = require("pidusage");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "rtm",
    version: "1.3",
    author: "SAIF ",
    countDown: 10,
    role: 0,
    shortDescription: { en: "" },
    longDescription: { en: "" },
    category: "system"
  },

  onStart: async function ({ message, api, event, threadsData, usersData, commands }) {
    let sent;
    try {
      sent = await message.reply(">🎀 𝐋𝐨𝐚𝐝𝐢𝐧𝐠..\n█▒▒▒▒▒▒▒▒");
      const bar = ["██▒▒▒▒▒▒▒", "██████▒▒▒", "██████████"];

      for (let i = 0; i < bar.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        await api.editMessage(`✨ 𝐋𝐨𝐚𝐝𝐢𝐧𝐠...\n${bar[i]}`, sent.messageID);
      }

      const { cpu } = await pidusage(process.pid);
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      const usedMB = (usedMem / 1024 / 1024).toFixed(2);
      const freeMB = (freeMem / 1024 / 1024).toFixed(2);
      const totalMB = (totalMem / 1024 / 1024).toFixed(2);

      const botUptime = formatTime(process.uptime() * 1000);
      const sysUptime = formatTime(os.uptime() * 1000);

      const cpuModel = os.cpus()[0].model;
      const cpuUsage = cpu.toFixed(2);
      const nodeVersion = process.version;
      const osVersion = os.version?.() || os.type();
      const platform = os.platform();
      const hostname = os.hostname();

      const totalUsers = Object.keys(await usersData.getAll()).length;
      const totalGroups = Object.keys(await threadsData.getAll()).length;
      const totalCommands = commands?.size || 0;
      const botName = "𝐌𝐢𝐤𝐚 𝐒𝐚 ";

      const ping = ((Date.now() - event.timestamp) / 1000).toFixed(2);

      const info = `
      >🎀
𝐔𝐒𝐄𝐑𝐒 & 𝐆𝐑𝐎𝐔𝐏𝐒
• Total Users   : ${totalUsers}
• Total Groups  : ${totalGroups}
• Commands      : ${totalCommands}

𝐑𝐀𝐌 𝐈𝐍𝐅𝐎
• Total RAM     : ${totalMB} MB
• Free RAM      : ${freeMB} MB
• Used RAM      : ${usedMB} MB

𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒
• Bot Uptime    : ${botUptime}
• Server Uptime : ${sysUptime}
• Ping          : ${ping}s
• Bot Name      : ${botName}
• Hostname      : ${hostname}

𝐂𝐏𝐔 & 𝐒𝐘𝐒𝐓𝐄𝐌
• CPU Model     : ${cpuModel}
• CPU Usage     : ${cpuUsage}%
• Platform      : ${platform}
• OS Version    : ${osVersion}
• Node.js       : ${nodeVersion}

`.trim();

      await new Promise(r => setTimeout(r, 800));
      await api.editMessage(info, sent.messageID);

    } catch (err) {
      if (sent?.messageID) {
        api.editMessage("𝐅𝐚𝐢𝐥𝐞𝐝: " + err.message, sent.messageID);
      } else {
        message.reply("𝐅𝐚𝐢𝐥𝐞𝐝: " + err.message);
      }
    }
  }
};

function formatTime(ms) {
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  return `${d}d ${h}h ${m}m`;
}
