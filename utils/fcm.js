const admin = require("firebase-admin");
const serviceAccount = require("../firebase.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendPushNotification = async (token, title, body) => {
  const message = {
    notification: { title, body },
    token,
  };

  try {
    await admin.messaging().send(message);
    console.log("Push sent to:", token);
  } catch (error) {
    console.error("Push error:", error);
  }
};
