const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Farmer = require("../models/Farmer");
const Customer = require("../models/Customer");

const authorize = (allowedRoles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from the Authorization header

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ensure no redundant key addition
      let user = null;
      if (decoded.role === "admin" && allowedRoles.includes("admin")) {
        user = await Admin.findById(decoded.userId); // Use decoded.userId instead of adding userId again
      } else if (decoded.role === "farmer" && allowedRoles.includes("farmer")) {
        user = await Farmer.findById(decoded.userId);
      } else if (decoded.role === "customer" && allowedRoles.includes("customer")) {
        user = await Customer.findById(decoded.userId);
      }

      if (!user) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      // Attach user info to request object
      req.user = user;
      req.role = decoded.role;

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token", error: error.message });
    }
  };
};



module.exports = { authorize };
