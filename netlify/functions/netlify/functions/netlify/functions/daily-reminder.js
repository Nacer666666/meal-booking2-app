const { schedule } = require("@netlify/functions");
const { getStore } = require("@netlify/blobs");

const runReminders = async () => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.APP_URL || "";
    const store = getStore("meal-app");
    const { blobs } = await store.list({ prefix: "subscriber:" });

    for (const b of blobs) {
      const sub = await store.get(b.key, { type: "json" });
      if (sub && sub.chatId) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: sub.chatId, text: `🔔 تذكير يومي\nمرحباً ${sub.name}، سجل اختيارك لوجبات اليوم من هنا:\n${appUrl}` }),
        });
      }
    }
    return { statusCode: 200, body: "done" };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "error" };
  }
};

// الإرسال يومياً الساعة 10 صباحاً بتوقيت الجزائر
exports.handler = schedule("0 9 * * *", runReminders);
