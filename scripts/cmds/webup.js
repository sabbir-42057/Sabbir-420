const axios = require("axios");

module.exports = {
  config: {
    name: "webup",
    version: "1.0",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "upload audio video and image to media uploader created by ♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    countDown: 5,
    role: 0,
    guide: "{pn} reply to an image",
    category: "media"
  },
  onStart: async ({ event, message }) => {
    try{
    const url = event.messageReply.attachments[0].url;
    const { data } = await axios.get(`https://store.noobx-api.rf.gd/upload/url?url=${encodeURIComponent(url)}`);
    const link = data.url;
    message.reply(link)
    } catch (e) {
      message.reply(e.message);
    }
  }
}
