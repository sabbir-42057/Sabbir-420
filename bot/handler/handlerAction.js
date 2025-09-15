const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (
  api,
  threadModel,
  userModel,
  dashBoardModel,
  globalModel,
  usersData,
  threadsData,
  dashBoardData,
  globalData
) => {
  const handlerEvents = require(
    process.env.NODE_ENV == "development"
      ? "./handlerEvents.dev.js"
      : "./handlerEvents.js"
  )(
    api,
    threadModel,
    userModel,
    dashBoardModel,
    globalModel,
    usersData,
    threadsData,
    dashBoardData,
    globalData
  );

  return async function (event) {
    // ❌ Anti-inbox protection
    if (
      global.GoatBot.config.antiInbox === true &&
      !event.isGroup &&
      (event.senderID === event.threadID || event.userID === event.senderID)
    ) {
      return;
    }

    // ✅ Create message object
    const message = createFuncMessage(api, event);

    // ✅ Check DB entries for thread & user
    await handlerCheckDB(usersData, threadsData, event);

    // ✅ Handle all event logic
    const handlerChat = await handlerEvents(event, message);
    if (!handlerChat) return;

    const {
      onAnyEvent,
      onFirstChat,
      onStart,
      onChat,
      onReply,
      onEvent,
      handlerEvent,
      onReaction,
      typ,
      presence,
      read_receipt
    } = handlerChat;

    // ✅ General hook for all events
    onAnyEvent();

    // ✅ Handle based on event type
    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        onFirstChat();
        onChat();
        onStart();
        onReply();
        break;

      case "event":
        handlerEvent();
        onEvent();
        break;

      case "message_reaction":
        onReaction();

        // 👎 Kick a specific user if reacted
        if (event.reaction === "👎") {
          if (event.userID === "61579613335244") {
            api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
              if (err) return console.log(err);
            });
          }
        }

        // 😾 or 💢 Unsend bot's message if reacted by specific users
        if (
          (event.reaction === "😠" || event.reaction === "💢") &&
          event.senderID === api.getCurrentUserID()
        ) {
          const allowedIDs = [
            "100071429830541",
            "61579237688880",
            "61579613335244",
            "100014097943658"
          ];
          if (allowedIDs.includes(event.userID)) {
            api.unsendMessage(event.messageID, (err) => {
              if (err) return console.log(err);
            });
          }
        }
        break;

      case "typ":
        typ();
        break;

      case "presence":
        presence();
        break;

      case "read_receipt":
        read_receipt();
        break;

      default:
        break;
    }
  };
};