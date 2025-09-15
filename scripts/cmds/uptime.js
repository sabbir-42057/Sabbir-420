const os = require("os");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    version: "1.3",
    author: "SaiF",
    role: 0,
    shortDescription: "",
    longDescription: "",
    category: "system"
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      // Bot uptime
      let uptimeSeconds = process.uptime();
      let days = Math.floor(uptimeSeconds / (3600 * 24));
      let hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
      let minutes = Math.floor((uptimeSeconds % 3600) / 60);
      let seconds = Math.floor(uptimeSeconds % 60);
      let botUptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // System uptime
      let sysSeconds = os.uptime();
      let sysDays = Math.floor(sysSeconds / (3600 * 24));
      let sysHours = Math.floor((sysSeconds % (3600 * 24)) / 3600);
      let sysMinutes = Math.floor((sysSeconds % 3600) / 60);
      let sysUptime = `${sysDays}d ${sysHours}h ${sysMinutes}m`;

      // BD time
      let bdTime = moment().tz("Asia/Dhaka");
      let timeNow = bdTime.format("hh:mm A");
      let dayNow = bdTime.format("dddd");
      let dateNow = bdTime.format("DD MMMM YYYY");

      // System info
      let totalMem = Math.floor(os.totalmem() / 1024 / 1024 / 1024);
      let freeMem = Math.floor(os.freemem() / 1024 / 1024 / 1024);
      let cpuModel = os.cpus()?.[0]?.model || "Unknown CPU";
      let platform = os.platform();

      // Bot stats
      let totalUsers = (usersData && usersData.getAll) ? (await usersData.getAll()).length : "N/A";
      let totalGroups = (threadsData && threadsData.getAll) ? (await threadsData.getAll()).length : "N/A";

      // Final message design (exactly previous box style)
      let msg =
`
>𝗧𝗶𝗺𝗲
╭─────────◊
├‣ ${timeNow}
├‣ ${dayNow}
├‣ ${dateNow}
╰────────────◊

>𝗨𝗽𝘁𝗶𝗺𝗲 
╭─────────◊
├‣ Bot: ${botUptime}
├‣ System: ${sysUptime}
├‣ CPU: ${cpuModel}
╰────────────◊

>𝗦𝘁𝗮𝘁𝘀
╭─────────◊
├‣ Users: ${totalUsers}
├‣ Groups: ${totalGroups}
├‣ Free RAM: ${freeMem} GB
├‣ Total RAM: ${totalMem} GB
├‣ OS: ${platform}
╰────────────◊

𝐀𝐤'𝐚 𝐙'𝐚 >🎀`;

      api.sendMessage({ body: msg }, event.threadID, event.messageID);

    } catch (e) {
      api.sendMessage("❌ Error while fetching uptime info.\n" + e.message, event.threadID, event.messageID);
    }
  }
};