const Customer = require('../models/Customer');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const generateToken = require('../utils/jwtGenerator');
const CustomerPointsTransactions = require('../models/customerPointsTransactions');


// 🔐 Helper to generate referral code like "KGC123456"
const generateReferralCode = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // ensures a 6-digit number
  return `KGC${randomNumber}`;
};


const registerCustomer = async (req, res) => {

  const { name, email, password, phoneNumber, address, referralCode, agreedToPrivacyPolicyAndTermsAndConditions, agreementTimestamp } = req.body;


  try {
    
    // Check existing
    const existingCustomer = await Customer.findOne({
      $or: [
        { email },
        { phoneNumber }
      ]
    });


    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    // Check referralCode validity
    let referringCustomer = null;
    if (referralCode) {
      referringCustomer = await Customer.findOne({ referralCode });
      if (!referringCustomer) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
    }

    // Create new customer
    const newCustomer = new Customer({
      name,
      email,
      password,
      phoneNumber,
      address,
      referralCode: generateReferralCode(),
      referredBy: referringCustomer ? referringCustomer._id : null,
      points: 0,
      agreedToPrivacyPolicyAndTermsAndConditions, 
      agreementTimestamp
    });

    await newCustomer.save();

    if (referringCustomer) {
      // Both get 10 points
      const referralPoints = 10;
      referringCustomer.points += referralPoints;
      await referringCustomer.save();

      newCustomer.points += referralPoints;
      await newCustomer.save();

      // Optional: log in PointTransaction
      await CustomerPointsTransactions.create({
        customer: referringCustomer._id,
        points: referralPoints,
        type: "referral",
        description: `Referral bonus for referring ${newCustomer.name}`,
      });

      await CustomerPointsTransactions.create({
        customer: newCustomer._id,
        points: referralPoints,
        type: "referral",
        description: `Register bonus for using referral code`,
      });

    } else {
      // Self registration reward
      const selfRegisterPoints = 10;
      newCustomer.points += selfRegisterPoints;
      await newCustomer.save();

      await CustomerPointsTransactions.create({
        customer: newCustomer._id,
        points: selfRegisterPoints,
        type: "self_register",
        description: "Points awarded for signing up without referral",
      });
    }

    res.status(201).json({ message: 'Customer registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }

};


// Login Customer
const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(customer._id, "customer");

    res.status(200).json({
      message: "Login successful",
      token,
      userRole: "customer", // **Ensure role is sent**
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Get Customer Details by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Update Customer Details
const updateCustomer = async (req, res) => {
  try {
    const { name, email, phoneNumber, address, profile_image } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, address, profile_image },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer updated successfully", customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Send OTP (mocked as 1234)
const sendOtptoCustomer = async (req, res) => {

  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  // ✅ Just check if user exists, don't register
  const existingUser = await Customer.findOne({ phoneNumber });
  if (!existingUser) {
    return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
  }

  // ✅ Send static OTP (1234)
  res.json({
    success: true,
    message: 'OTP sent successfully (use 1234 for testing)',
    otp: '1234' // You can remove this in production
  });

};


// Verify OTP
const verifyCustomerOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
  }

  if (otp !== '1234') {
    return res.status(401).json({ success: false, message: 'Invalid OTP' });
  }

  try {
    const user = await Customer.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    // ✅ Daily Login Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyGiven = await CustomerPointsTransactions.findOne({
      customer: user._id, // 👈 change here
      type: "daily_login",
      createdAt: { $gte: today },
    });


    if (!alreadyGiven) {
      const points = 1;
      user.points += points;        // 👈 change here
      await user.save();

      await CustomerPointsTransactions.create({
        customer: user._id,         // 👈 change here
        points,
        type: "daily_login",
        description: "Daily login reward",
      });
    }

    const token = generateToken(user._id, 'customer');

    res.json({
      success: true,
      message: 'OTP verified successfully. Logged in!',
      token,
      user
    });


  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



// Search Api - fined shop, farmers, products based on city
const searchByNameAndCity = async (req, res) => {
  const { query, filter, city } = req.query;
  const regex = new RegExp(query, 'i');
  try {
    let results = [];

    if (filter === 'shops') {
      results = await Shop.find({ shop_name: regex, city_district: city });
    } else if (filter === 'farmers') {
      results = await Farmer.find({ name: regex, city_district: city });
    } else if (filter === 'products') {
      const shops = await Shop.find({ city_district: city });
      const shopIds = shops.map(s => s._id);
      results = await Product.find({ name: regex, shop_id: { $in: shopIds } });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
};


// Daily 5 min stay reward points function
const rewardDailyPointsCustomer = async (req, res) => {
  const customerId = req.user.id; // assuming auth middleware adds user info

  try {
    const customer = await Customer.findById(customerId);
    const today = new Date().toDateString();

    if (customer.lastRewardDate?.toDateString() === today) {
      return res.status(400).json({ message: "Already rewarded today" });
    }

    const rewardPoints = 5;

    customer.points += rewardPoints;
    customer.lastRewardDate = new Date();

    await customer.save();

    // ✅ Create points transaction
    await CustomerPointsTransactions.create({
      customer: customer._id,
      points: rewardPoints,
      type: "daily_stay",
      description: "Daily login reward",
    });

    res.json({ message: "5 points rewarded", points: customer.points });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Customer Refer Share Detail Count ( How Many Share Farmer did )
const incrementReferralShareCustomer = async (req, res) => {
  try {
    const { customerId } = req.body;
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "customer not found" });

    const today = new Date().toDateString(); // only date part
    const lastShareDate = customer.lastReferralShareDate ? new Date(customer.lastReferralShareDate).toDateString() : null;

    if (lastShareDate === today) {
      // Same day
      if (customer.todayReferralShareCount >= 3) {
        return res.status(200).json({ message: "Daily share limit reached. Try again tomorrow." });
      }
      customer.todayReferralShareCount += 1;
    } else {
      // New day
      customer.todayReferralShareCount = 1;
      customer.lastReferralShareDate = new Date();
    }

    customer.referralShares += 1;
    customer.points += 5;

    await customer.save();

    // ✅ Add transaction history
    await CustomerPointsTransactions.create({
      customer: customer._id,
      points: 5,
      type: "daily_share",
      description: "Points awarded for sharing referral code"
    });

    res.status(200).json({
      message: "Referral share counted & points added",
      points: customer.points,
      todayShareCount: customer.todayReferralShareCount
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get Referral Details of Single Customer
const getCustomerReferralDetails = async (req, res) => {
  try {

    const customerId = req.params.id;

    // 1. Find the main Customer
    const customer = await Customer.findById(customerId)
      .lean();
    if (!customer) return res.status(404).json({ message: "Farmer not found" });

    // 2. Find all referred farmers
    const referredCustomer = await Customer.find({ referredBy: customerId })
      .select("name referralCode")
      .lean();
   
    // 3. Prepare response
    res.status(200).json({
      referralCode: customer.referralCode,
      referralShares: customer.referralShares,
      referralDownloads: customer.referralDownloads,
      referredCustomer: referredCustomer,
    });
  } catch (error) {
    console.error("Error fetching referral details:", error);
    res.status(500).json({ message: "Server error" });
  }

}

// Customer points transactions
const getCustomerPointsTransactions = async (req, res) => {

  try {
    const { customerId } = req.params;


    const transactions = await CustomerPointsTransactions.find({ customer: customerId }).sort({ createdAt: -1 });


    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch point transactions", error });
  }

};


// ✅ Get All Customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select("-password");
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    // check if customer exist
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // delete customer
    await Customer.findByIdAndDelete(customerId);

    // delete customer points transaction also
    await CustomerPointsTransactions.deleteMany({ customer: customerId });

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerById,
  updateCustomer,
  sendOtptoCustomer,
  verifyCustomerOtp,
  searchByNameAndCity,
  getCustomerPointsTransactions,
  getCustomerReferralDetails,
  rewardDailyPointsCustomer,
  incrementReferralShareCustomer,
  getAllCustomers,
  deleteCustomer
};
