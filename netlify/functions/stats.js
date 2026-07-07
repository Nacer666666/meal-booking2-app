const { getStore } = require("@netlify/blobs");

function todayKey() {
  const algeriaOffsetMs = 60 * 60 * 1000;
  return new Date(Date.now() + algeriaOffsetMs).toISOString().slice(0, 10);
}

exports.handler = async (event) => {
  try {
    const date = (event.queryStringParameters && event.queryStringParameters.date) || todayKey();
    const store = getStore("meal-app");
    const responses = (await store.get(`responses:${date}`, { type: "json" })) || [];

    const counts = { lunch: 0, dinner: 0, both: 0, none: 0 };
    responses.forEach((r) => counts[r.choice] = (counts[r.choice] || 0) + 1);

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, counts, responses }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: "خطأ في الخادم" }) };
  }
};
