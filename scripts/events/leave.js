const { getTime, drive } = global.utils;

module.exports = {
        config: {
                name: "leave",
                version: "1.8",
                author: "NTKhang & Modified by ♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
                category: "events"
        },

        onStart: async ({ threadsData, message, event, api, usersData }) => {
                if (event.logMessageType !== "log:unsubscribe") return;

                const { threadID } = event;
                const threadData = await threadsData.get(threadID);
                if (!threadData.settings.sendLeaveMessage) return;

                const { leftParticipantFbId } = event.logMessageData;
                if (leftParticipantFbId == api.getCurrentUserID()) return;

                const hours = parseInt(getTime("HH"));
                const userName = await usersData.getName(leftParticipantFbId);


                const session =
                        hours < 10 ? "𝑀𝑜𝑟𝑛𝑖𝑛𝑔" :
                        hours < 13 ? "𝐴𝑓𝑡𝑒𝑟𝑛𝑜𝑜𝑛" :
                        hours < 18 ? "𝐸𝑣𝑒𝑛𝑖𝑛𝑔" :
                        "𝑁𝑖𝑔ℎ𝑡";


                const leaveMessages = [
                                "🛫 ${userName} উড়ে গেলো অন্য কোনো গ্রহে!",
                                "🤭 ${userName} ভাইয়ের আত্মসম্মান জেগে উঠছে, তাই নিজেই চলে গেলো!",
					            " ${userName} nigga left the group"
                ];

                const kickMessages = [
                                "🚨 ${userName} কে বাহির করে শান্তি ফিরানো হলো! ✌️",
                                "🥾 ${userName} কে ফাইনালি লাথি মারা হলো গ্রুপ থেকে!",
                                "🧹 পরিষ্কার অভিযান সফল: ${userName} বিদায় নিলো!",
                                "🥵 ${userName} ভাইয়া, এই গ্রুপ আপনার লেভেলের না! বাহিরে যাইতে হইছে!"
                ];

                const isKick = leftParticipantFbId !== event.author;
                const messages = isKick ? kickMessages : leaveMessages;
                const selected = messages[Math.floor(Math.random() * messages.length)];

                const body = eval('`' + selected + '`');

                const form = {
                        body,
                        mentions: [{
                                id: leftParticipantFbId,
                                tag: userName
                        }]
                };

                if (threadData.data.leaveAttachment) {
                        const files = threadData.data.leaveAttachment;
                        const attachments = files.map(file => drive.getFile(file, "stream"));
                        const results = await Promise.allSettled(attachments);
                        form.attachment = results
                                .filter(r => r.status === "fulfilled")
                                .map(r => r.value);
                }

                message.send(form);
        }
};
