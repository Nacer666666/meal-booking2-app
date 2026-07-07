const { getStore } = require("@netlify/blobs");

function todayKey() {
  const algeriaOffsetMs = 60 * 60 * 1000; // توقيت الجزائر UTC+1
  return new Date(Date.now() + algeriaOffsetMs).toISOString().slice(0, 10);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
    const { name, choice, notes } = JSON.parse(event.body || "{}");
    const validChoices = ["lunch", "dinner", "both", "none"];

    if (!name || !name.trim() || !validChoices.includes(choice)) {
      return { statusCode: 400, body: JSON.stringify({ error: "الاسم والاختيار مطلوبان" }) };
    }

    const store = getStore("meal-app");
    const date = todayKey();
    const key = `responses:${date}`;

    let responses = (await store.get(key, { type: "json" })) || [];
    responses = responses.filter((r) => r.name !== name.trim()); // تحديث الاختيار إن وجد
    
    responses.push({ name: name.trim(), choice, notes: (notes || "").trim(), time: Date.now() });
    await store.setJSON(key, responses);

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, date }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: "خطأ في الخادم" }) };
  }
};
