const axios = require('axios');
require('dotenv').config();

const verifyCaptcha = async (req, res, next) => {

  const captchaValue = req.body.captchaValue;

  if (!captchaValue) {
    return res.status(400).json({ message: "Please Complete CAPTCHA" });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    console.log("secretKey middleware", secretKey)

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: captchaValue,
        },
      }
    );

    if (!response.data.success) {
      return res.status(403).json({ message: "CAPTCHA Verifcation Failed" });
    }

    // CAPTCHA success — Next
    next();
  } catch (error) {
    console.error("Captcha verification error:", error);
    return res.status(500).json({ message: "Server Error | Please Try again Later" });
  }
};

module.exports = verifyCaptcha;
