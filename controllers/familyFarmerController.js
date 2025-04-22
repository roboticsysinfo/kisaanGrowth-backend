const FamilyFarmerRequest = require("../models/FamilyFarmerRequest");
const Farmer = require("../models/Farmer");
const Customer = require("../models/Customer");
const CustomerPointsTransactions = require("../models/customerPointsTransactions")
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
// const updateRequestStatus = async (req, res) => {
//   try {
//     const { requestId } = req.params;
//     const { status } = req.body;

//     if (!['accepted', 'rejected'].includes(status)) {
//       return res.status(400).json({ message: 'Invalid status' });
//     }

//     // Update the status of the request
//     const updated = await FamilyFarmerRequest.findByIdAndUpdate(
//       requestId,
//       { status },
//       { new: true }
//     ).populate('fromCustomer toFarmer'); // populate to access customer and farmer info

//     if (!updated) {
//       return res.status(404).json({ message: 'Request not found' });
//     }

//     // ✅ Send notification to the customer
//     let message = "";
//     if (status === 'accepted') {
//       message = `Good news! Your family farmer request to ${updated.toFarmer.name} has been accepted. 👨‍🌾`;
//     } else if (status === 'rejected') {
//       message = `Oops! Your family farmer request to ${updated.toFarmer.name} has been rejected. 😔`;
//     }

//     await sendNotification(
//       updated.fromCustomer._id,   // userId (customer who should be notified)
//       "customer",                 // userType
//       "familyRequestResponse",    // type of notification
//       message,                    // notification message
//       updated.toFarmer._id,       // actorId (farmer who responded)
//       "farmer"                    // actorType
//     );

//     res.status(200).json({ message: `Request ${status}`, request: updated });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating status', error: error.message });
//   }
// };


// Accept or Reject a request
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update the status of the request
    const updated = await FamilyFarmerRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate('fromCustomer toFarmer'); // populate to access customer and farmer info

    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // ✅ If request is accepted, give 20 points to the customer
    if (status === 'accepted') {
      // Create a points transaction record for the customer
      const pointsTransaction = new CustomerPointsTransactions({
        customer: updated.fromCustomer._id,
        points: 20,
        type: "family_farmer",
        description: `Received 20 points for family farmer request accepted by ${updated.toFarmer.name}`,
      });

      await pointsTransaction.save();

      // Update the customer's total points
      const customer = await Customer.findById(updated.fromCustomer._id);
      customer.points += 20; // Add 20 points to the customer's total
      await customer.save(); // Save the updated customer document
    }

    // ✅ Send notification to the customer
    let message = "";
    if (status === 'accepted') {
      message = `Good news! Your family farmer request to ${updated.toFarmer.name} has been accepted. 👨‍🌾`;
    } else if (status === 'rejected') {
      message = `Oops! Your family farmer request to ${updated.toFarmer.name} has been rejected. 😔`;
    }

    await sendNotification(
      updated.fromCustomer._id,   // userId (customer who should be notified)
      "customer",                 // userType
      "familyRequestResponse",    // type of notification
      message,                    // notification message
      updated.toFarmer._id,       // actorId (farmer who responded)
      "farmer"                    // actorType
    );

    res.status(200).json({ message: `Request ${status}`, request: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};


// Get all requests for a Customer
const getRequestsForCustomer = async (req, res) => {

  try {

    const { customerId } = req.params;

    const requests = await FamilyFarmerRequest.find({ fromCustomer: customerId })
      .populate('toFarmer', 'name email phoneNumber address profileImg state city_district village')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);

  } catch (error) {

    res.status(500).json({ message: 'Failed to fetch requests.', error: error.message });
    
  }

};


// Remove Family Farmer Request (Customer -> Farmer)
const removeFamilyRequest = async (req, res) => {
  try {
    const { fromCustomer, toFarmer } = req.body;

    if (!fromCustomer || !toFarmer) {
      return res.status(400).json({ message: 'Customer and Farmer are required.' });
    }

    const deleted = await FamilyFarmerRequest.findOneAndDelete({ fromCustomer, toFarmer });

    if (!deleted) {
      return res.status(404).json({ message: 'No existing request found to remove.' });
    }

    res.status(200).json({ message: 'Request removed successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to remove request.', error: error.message });
  }
};



module.exports = {
  sendFamilyRequest,
  getRequestsForFarmer,
  getAllFamilyRequests,
  updateRequestStatus,
  getRequestsForCustomer,
  removeFamilyRequest
};