// utils/generateReferralCode.js
const generateReferralCode = (name, phoneNumber) => {
    return (
      name.toLowerCase().slice(0, 3) +
      phoneNumber.slice(-4) +
      Math.floor(Math.random() * 100)
    );
  };
  
  module.exports = generateReferralCode;