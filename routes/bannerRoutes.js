const express = require("express");
const { getBanners, addBanner, updateBanner, deleteBanner } = require("../controllers/BannerController");
const upload = require("../middlewares/upload");
const { authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/site-details/banners", getBanners);

router.post("/site-details/add-banner", upload.single("banner_image"), authorize(['admin']), addBanner);

router.put("/site-details/update-banner/:bannerId", upload.single("banner_image"), authorize(['admin']), updateBanner);

router.delete("/site-details/delete-banner/:bannerId", authorize(['admin']), deleteBanner);


module.exports = router;
