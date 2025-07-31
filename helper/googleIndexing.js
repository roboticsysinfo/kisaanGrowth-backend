const { google } = require("googleapis");
const path = require("path");

async function indexURL(url) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, "../kissan-growth-service-account.json"),
      scopes: ["https://www.googleapis.com/auth/indexing"]
    });

    const client = await auth.getClient();
    const indexing = google.indexing({
      version: "v3",
      auth: client
    });

    const res = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: "URL_UPDATED" // URL_DELETED agar delete karna ho
      }
    });

    console.log("✅ Google Indexing Response:", res.data);
  } catch (err) {
    console.error("❌ Indexing Error:", err.message);
  }
}

module.exports = { indexURL };
