const { getStore } = require("@netlify/blobs");

async function sendTelegramMessage(botToken, chatId, text) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
    const update = JSON.parse(event.body || "{}");
    const message = update.message;
    if (!message || !message.text) return { statusCode: 200, body: "ok" };

    const chatId = message.chat.id;
    const text = message.text.trim();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const store = getStore("meal-app");

    if (text.startsWith("/start")) {
      const token = text.split(" ")[1];
      if (token) {
        const pending = await store.get(`pending:${token}`, { type: "json" });
        if (pending) {
          await store.setJSON(`subscriber:${chatId}`, { name: pending.name, chatId, registeredAt: Date.now() });
          await store.delete(`pending:${token}`);
          await sendTelegramMessage(botToken, chatId, `أهلاً ${pending.name} 👋\nتم تفعيل التذكير اليومي بنجاح.\nسنرسل لك رسالة كل يوم لتسجيل اختيارك.`);
        } else {
          await sendTelegramMessage(botToken, chatId, "رابط التفعيل غير صالح. الرجاء التسجيل من التطبيق.");
        }
      } else {
        await sendTelegramMessage(botToken, chatId, "مرحباً 👋\nالرجاء التسجيل أولاً من التطبيق.");
      }
    }
    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error(e);
    return { statusCode: 200, body: "ok" };
  }
};
