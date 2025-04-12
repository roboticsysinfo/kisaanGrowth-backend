const FamilyFarmerRequest = require("../models/FamilyFarmerRequest");
const Farmer = require("../models/Farmer");
const Customer = require("../models/Customer");
const { sendNotification } = require("../helper/sendNotification");


// Send request (Customer → Farmer)
// Send request (Customer → Farmer)
const sendFamilyRequest = async (req, res) => {
  try {
    const { fromCustomer, toFarmer } = req.body;

    if (!fromCustomer || !toFarmer) {
      return res.status(400).json({ message: 'Customer and Farmer are required.' });
    }

    // Optional: Check if request already exists
    const existing = await FamilyFarmerRequest.findOne({ fromCustomer, toFarmer });
    if (existing) {
      return res.status(409).json({ message: 'Request already sent.' });
    }

    const newRequest = await FamilyFarmerRequest.create({ fromCustomer, toFarmer });

    // ✅ Send notification to the farmer
    const message = "Congratulations! You received a new Family Request.";
    await sendNotification(
      toFarmer,          // userId (farmer who should get notified)
      "farmer",          // userType
      "familyRequest",   // type of notification (family Request)
      message,           // message to display
      fromCustomer,      // actorId (customer who made the request)
      "customer"         // actorType
    );

    res.status(201).json({ message: 'Request sent successfully.', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};



// Get all requests for a farmer
const getRequestsForFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const requests = await FamilyFarmerRequest.find({ toFarmer: farmerId })
      .populate('fromCustomer', 'name email phoneNumber address profile_image message')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests.', error: error.message });
  }
};


// Get all requests for admin panel
const getAllFamilyRequests = async (req, res) => {
  try {
    const requests = await FamilyFarmerRequest.find()
      .populate('fromCustomer', 'name email phoneNumber message address')
      .populate('toFarmer', 'name email phoneNumber address')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
};


// Accept or Reject a request
const updateRequestStatus = async (req, res) => {

  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await FamilyFarmerRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    res.status(200).json({ message: `Request ${status}`, request: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

module.exports = {
  sendFamilyRequest,
  getRequestsForFarmer,
  getAllFamilyRequests,
  updateRequestStatus,
};