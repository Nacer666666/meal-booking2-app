const { getStore } = require("@netlify/blobs");
const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
    const { name } = JSON.parse(event.body || "{}");
    if (!name || !name.trim()) return { statusCode: 400, body: JSON.stringify({ error: "الاسم مطلوب" }) };

    const token = crypto.randomBytes(12).toString("hex");
    const store = getStore("meal-app");
    
    await store.setJSON(`pending:${token}`, { name: name.trim(), createdAt: Date.now() });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "";
    const deepLink = `https://t.me/${botUsername}?start=${token}`;

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, deepLink }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: "خطأ في الخادم" }) };
  }
};
