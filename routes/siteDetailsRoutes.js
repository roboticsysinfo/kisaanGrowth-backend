
const express = require('express');
const router = express.Router();
const SiteDetailsController = require('../controllers/SiteDetailsController')
const { authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');


router.post("/update-site-details", authorize(['admin']), SiteDetailsController.updateSiteDetails);

router.post("/site-details/logo", upload.single('siteLogo'), authorize(['admin']), SiteDetailsController.AddSiteLogo)

router.put("/site-details/contact", authorize(['admin']), SiteDetailsController.updateContactDetail);

router.post("/site-details/about", authorize(['admin']), SiteDetailsController.AddSiteAbout);

router.put("/site-details/update-social-media", authorize(['admin']), SiteDetailsController.updateSocialMedia);

router.get("/fetch-site-details", SiteDetailsController.getSiteDetails);


router.put("/site-details/update-about", authorize(['admin']), SiteDetailsController.updateSiteAbout);


router.get("/search-products-shops", SiteDetailsController.SearchProductsAndShops);


module.exports = router;