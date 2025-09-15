const axios = require("axios");

module.exports = {
  config: {
    name: 'css',
    version: '1.0',
    author: 'Vex_Kshitiz',
    role: 0,
    shortDescription: 'Store of commands',
    longDescription: 'Browse and search stored commands made by Kshitiz',
    category: 'utility',
    guide: {
      en: 'View commands: {p}css\nPaginate: {p}css {page}\nSearch: {p}css search {name}'
    }
  },

  onStart: async function ({ event, args, message }) {
    try {
      let page = 1;
      let searchQuery = "";

      if (args.length === 1 && !isNaN(parseInt(args[0]))) {
        page = parseInt(args[0]);
      } else if (args.length === 1) {
        searchQuery = args[0];
      } else if (args.length === 2 && args[0].toLowerCase() === "search") {
        searchQuery = args[1];
      }

      const response = await axios.get("https://cmd-store.vercel.app/kshitiz");
      const commands = response.data;

      let filteredCommands = commands;
      if (searchQuery) {
        filteredCommands = commands.filter(cmd =>
          cmd.cmdName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      const startIndex = (page - 1) * 10;
      const endIndex = page * 10;
      const paginatedCommands = filteredCommands.slice(startIndex, endIndex);

      let replyMessage = "";
      paginatedCommands.forEach(cmd => {
        replyMessage += `
━━━━━━━━━━━━━━━━━━━
 ID: ${cmd.id}
 Name: ${cmd.cmdName}
 Code: ${cmd.codeLink}
 Description: ${cmd.description}
`;
      });

      if (replyMessage === "") {
        replyMessage = "❌ No commands found.";
      }

      message.reply(replyMessage, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "css",
          messageID: info.messageID,
          author: event.senderID,
          commands,
        });
      });
    } catch (error) {
      console.error(error);
      message.reply("⚠️ An error occurred while fetching commands.");
    }
  },

  onReply: async function ({ event, Reply, args, message }) {
    const { author, commands } = Reply;

    if (event.senderID !== author || !commands) return;

    const commandID = parseInt(args[0], 10);

    if (isNaN(commandID) || !commands.some(cmd => cmd.id === commandID)) {
      message.reply("❌ Invalid input.\nPlease provide a valid command ID.");
      return;
    }

    const selectedCommand = commands.find(cmd => cmd.id === commandID);

    let replyMessage = `
━━━━━━━━━━━━━━━━━━━
 ID: ${selectedCommand.id}
 Name: ${selectedCommand.cmdName}
 Code: ${selectedCommand.codeLink}
 Description: ${selectedCommand.description}
`;

    message.reply(replyMessage);
    global.GoatBot.onReply.delete(event.messageID);
  },
};