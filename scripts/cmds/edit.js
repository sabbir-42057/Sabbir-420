const axios = require('axios');
const dipto = "https://www.noobs-api.rf.gd/dipto";

module.exports.config = {
    name: "edit",
    version: "6.9",
    author: "dipto",
    countDown: 5,
    role: 0,
    category: "media",
    description: "Edit images using Edit AI",
    guide: {
        en: "Reply to an image with {pn} [prompt]"
    }
};

async function handleEdit(api, event, args, commandName) {
    const url = event.messageReply?.attachments[0]?.url;
    const prompt = args.join(" ") || "What is this";

    if (!url) {
        return api.sendMessage("❌ Please reply to an image to edit it.", event.threadID, event.messageID);
    }

    try {
        // Single API call with arraybuffer to handle both cases
        const response = await axios.get(`${dipto}/edit?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(prompt)}`, {
            responseType: 'arraybuffer',
            validateStatus: () => true
        });

        // Process response based on content-type
        const contentType = response.headers['content-type'] || '';

        // Handle image response
        if (contentType.startsWith('image/')) {
            return api.sendMessage(
                { attachment: Buffer.from(response.data) },
                event.threadID,
                (error, info) => {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: commandName,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID,
                    });
                },
                event.messageID
            );
        }

        // Handle JSON response
        try {
            const jsonData = JSON.parse(response.data.toString());
            if (jsonData?.response) {
                return api.sendMessage(
                    jsonData.response,
                    event.threadID,
                    (error, info) => {
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName: commandName,
                            type: "reply",
                            messageID: info.messageID,
                            author: event.senderID,
                        });
                    },
                    event.messageID
                );
            }
        } catch (e) {
            console.error("JSON parse error:", e);
        }

        return api.sendMessage(
            "❌ No valid response from the API",
            event.threadID,
            (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: commandName,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                });
            },
            event.messageID
        );

    } catch (error) {
        console.error("Edit command error:", error);
        return api.sendMessage(
            "❌ Failed to process your request. Please try again later.",
            event.threadID,
            (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: commandName,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                });
            },
            event.messageID
        );
    }
}

// Rest of the code remains the same...
module.exports.onStart = async ({ api, event, args }) => {
    if (!event.messageReply) {
        return api.sendMessage(
            "❌ Please reply to an image to edit it.",
            event.threadID,
            (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                });
            },
            event.messageID
        );
    }
    await handleEdit(api, event, args, this.config.name);
};

module.exports.onReply = async function ({ api, event, args }) {
    if (event.type === "message_reply") {
        await handleEdit(api, event, args, this.config.name);
    }
};
