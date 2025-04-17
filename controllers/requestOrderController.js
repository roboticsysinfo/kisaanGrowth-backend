const { sendNotification } = require("../helper/sendNotification");
const RequestOrder = require("../models/RequestOrder");
const Shop = require("../models/Shop")


// Create a new request order
const createRequestOrder = async (req, res) => {
  try {
    const { farmer_id, product_id, quantity_requested, unit, notes, phoneNumber } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const customer_id = req.user._id;

    // Validate required fields
    if (!farmer_id || !product_id || !quantity_requested || !unit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new request order
    const newRequest = new RequestOrder({
      customer_id,
      farmer_id,
      product_id,
      quantity_requested,
      unit,
      notes,
      phoneNumber
    });

    await newRequest.save();

    // ✅ Send notification to the farmer
    const message = "You received a new order request.";
    await sendNotification(
      farmer_id,       // userId (farmer who should get notified)
      "farmer",        // userType
      "order",         // type of notification
      message,         // message to display
      customer_id,     // actorId (customer who made the request)
      "customer"       // actorType
    );

    res.status(201).json({
      message: "Request sent to farmer successfully",
      request: newRequest,
    });

  } catch (error) {
    console.error("Error creating request order:", error);
    res.status(500).json({ message: "Server error" });
  }

};


const getFarmerRequests = async (req, res) => {
  try {

    if (!req.user || (req.user.role !== "farmer" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    let requests;

    if (req.user.role === "admin") {
      // Admin can see all requests with additional details
      requests = await RequestOrder.find()
        .populate("customer_id", "name phoneNumber") // Fetch customer details
        .populate("farmer_id", "name phoneNumber") // Fetch farmer details
        .populate("product_id", "name price_per_unit unit") // Fetch product details
        .sort({ createdAt: -1 });

      // Format response to include total price and product name
      requests = requests.map((request) => ({
        request_order_id: request._id,
        customer_id: request.customer_id?._id,
        customer_name: request.customer_id?.name,
        customer_phone: request.customer_id?.phoneNumber,
        farmer_id: request.farmer_id?._id,
        farmer_name: request.farmer_id?.name,
        farmer_phone: request.farmer_id?.phoneNumber,
        product_name: request.product_id?.name, // ✅ Product Name
        unit: request.product_id?.unit,
        price_per_unit: request.product_id?.price_per_unit,
        quantity: request.quantity_requested, // ✅ Quantity from request
        total_price: request.quantity_requested * request.product_id?.price_per_unit, // ✅ Total Price Calculation
        status: request.status, // ✅ Status from request
      }));
    } else {
      // Farmers can see only their own requests
      requests = await RequestOrder.find({ farmer_id: req.user._id })
        .populate("customer_id", "name phoneNumber")
        .populate("product_id", "name price_per_unit unit")
        .sort({ createdAt: -1 });

      requests = requests.map((request) => ({
        request_order_id: request._id,
        customer_name: request.customer_id?.name,
        customer_phone: request.customer_id?.phoneNumber,
        product_name: request.product_id?.name, // ✅ Product Name
        unit: request.product_id?.unit,
        price_per_unit: request.product_id?.price_per_unit,
        quantity: request.quantity, // ✅ Quantity
        total_price: request.quantity * request.product_id?.price_per_unit, // ✅ Total Price Calculation
        status: request.status, // ✅ Status
      }));
    }

    res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const getFarmerOrderRequestbyId = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const orders = await RequestOrder.find({ farmer_id: farmerId })
      .populate({
        path: 'product_id',
        select: 'name price_per_unit unit', // Only fetch product name
      })
      .populate({
        path: 'customer_id',
        select: 'name address', // Only fetch customer name
      });
    res.json({ requests: orders });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


// Approve Request by Farmer
const approveRequest = async (req, res) => {

  try {

    const { requestId } = req.params;

    // Check if user is admin or farmer
    if (!req.user || (req.user.role !== "farmer" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find request order
    let requestOrder = await RequestOrder.findById(requestId)
      .populate("product_id")
      .populate("customer_id");

    if (!requestOrder) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update status to accepted
    requestOrder.status = "accepted";
    await requestOrder.save();

    // ✅ Send notification to customer
    await sendNotification(
      requestOrder.customer_id._id,       // userId: Customer who should get notification
      "customer",                         // userType
      "order",                            // type
      `Your request for ${requestOrder.product_id?.name} has been accepted by the farmer.`,  // message
      req.user._id,                       // actorId (farmer who approved)
      "farmer"                            // actorType
    );

    res.status(200).json({ message: "Request approved successfully", requestOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// const getCustomerOrders = async (req, res) => {
//   try {

//     if (!req.user || req.user.role !== "customer") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     let orders = await RequestOrder.find({ customer_id: req.user._id, status: { $in: ["pending", "accepted", "cancelled"] }, })
//       .populate("farmer_id", "name phoneNumber")
//       .populate("product_id", "name price_per_unit unit")
//       .sort({ createdAt: -1 });

//     // Format response
//     orders = orders.map((order) => ({
//       order_id: order._id,
//       product_name: order.product_id?.name,
//       product_quantity: order.quantity,
//       quantity_requested: order.quantity_requested, // Added this field
//       price_per_unit: order.product_id?.price_per_unit,
//       unit: order.product_id?.unit,
//       total_price: order.quantity_requested * order.product_id?.price_per_unit,
//       farmer_name: order.farmer_id?.name,
//       farmer_phone: order.farmer_id?.phoneNumber,
//       status: order.status,
//     }));

//     res.status(200).json({ orders });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }

// };


const getCustomerOrders = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find customer orders and populate farmer + product + shop
    let orders = await RequestOrder.find({
      customer_id: req.user._id,
      status: { $in: ["pending", "accepted", "cancelled"] },
    })
      .populate("farmer_id", "name phoneNumber")
      .populate({
        path: "product_id",
        select: "name price_per_unit unit product_image shop_id",
        populate: {
          path: "shop_id",
          select: "shop_name",
        },
      })
      .sort({ createdAt: -1 });

    // Format response
    orders = orders.map((order) => ({
      order_id: order._id,
      product_name: order.product_id?.name,
      product_quantity: order.quantity,
      quantity_requested: order.quantity_requested,
      price_per_unit: order.product_id?.price_per_unit,
      unit: order.product_id?.unit,
      total_price: order.quantity_requested * order.product_id?.price_per_unit,
      farmer_name: order.farmer_id?.name,
      farmer_phone: order.farmer_id?.phoneNumber,
      shop_name: order.product_id?.shop_id?.shop_name || "N/A",
      product_image: order.product_id?.product_image,
      status: order.status,
      created_at: order.createdAt,
    }));

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    console.log("order request id", requestId)

    if (!req.user || (req.user.role !== "farmer" && req.user.role !== "customer")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find request with necessary details for notification
    let requestOrder = await RequestOrder.findById(requestId)
      .populate("product_id")
      .populate("customer_id")
      .populate("farmer_id");

    console.log("request Order find", requestOrder)

    if (!requestOrder) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Authorization check
    if (
      (req.user.role === "farmer" && requestOrder.farmer_id._id.toString() !== req.user._id.toString()) ||
      (req.user.role === "customer" && requestOrder.customer_id._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: "You are not authorized to cancel this request" });
    }

    // Update status to cancelled
    requestOrder.status = "cancelled";
    await requestOrder.save();


    // ✅ Send Notification
    let recipientId, recipientType, actorType, message;
    

    if (req.user.role === "farmer") {
      recipientId = requestOrder.customer_id._id;
      recipientType = "customer";
      actorType = "farmer";
      message = `Your order request for ${requestOrder.product_id?.name} has been cancelled by the farmer.`;
    } else {
      recipientId = requestOrder.farmer_id._id;
      recipientType = "farmer";
      actorType = "customer";
      message = `The customer has cancelled the order request for ${requestOrder.product_id?.name}.`;
    }

    await sendNotification(
      recipientId,           // userId
      recipientType,         // userType
      "order",               // type
      message,               // message
      req.user._id,          // actorId
      actorType              // actorType
    );

    res.status(200).json({ message: "Request cancelled successfully", requestOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const getCustomerOrderByOrderId = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { orderId } = req.params;

    const order = await RequestOrder.findOne({
      _id: orderId,
      customer_id: req.user._id,
    })
      .populate("farmer_id", "name phoneNumber")
      .populate({
        path: "product_id",
        select: "name price_per_unit unit product_image shop_id",
        populate: {
          path: "shop_id",
          select: "shop_name",
        },
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const formattedOrder = {
      order_id: order._id,
      product_name: order.product_id?.name,
      product_quantity: order.quantity,
      quantity_requested: order.quantity_requested,
      price_per_unit: order.product_id?.price_per_unit,
      unit: order.product_id?.unit,
      total_price: order.quantity_requested * order.product_id?.price_per_unit,
      farmer_name: order.farmer_id?.name,
      farmer_phone: order.farmer_id?.phoneNumber,
      shop_name: order.product_id?.shop_id?.shop_name || "N/A",
      product_image: order.product_id?.product_image,
      status: order.status,
      created_at: order.createdAt,
    };

    res.status(200).json({ order: formattedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createRequestOrder,
  getFarmerRequests,
  getFarmerOrderRequestbyId,
  approveRequest,
  getCustomerOrders,
  cancelRequest,
  getCustomerOrderByOrderId
};
