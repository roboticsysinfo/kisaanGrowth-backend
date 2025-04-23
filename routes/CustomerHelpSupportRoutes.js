const express = require("express");
const {
  createHelpSupport,
  getAllHelpSupport,
  updateHelpSupport,
  deleteHelpSupport
} = require("../controllers/customerHelpSupportController");
const { authorize } = require("../middlewares/authMiddleware")

const router = express.Router();

// POST - Customer submits help request
router.post("/create/help-support", authorize(["customer"]), createHelpSupport);

// GET - Admin sees all help requests
router.get("/get/help-support", authorize(["admin"]), getAllHelpSupport);

// PUT - Admin updates a request
router.put("/update/help-support/:id", authorize(["admin"]), updateHelpSupport);

// DELETE - Admin deletes a request
router.delete("/delete/help-support/:id", authorize(["admin"]), deleteHelpSupport);

module.exports = router;
