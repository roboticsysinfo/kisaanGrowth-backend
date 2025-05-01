const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

router.get('/sitemap.xml', sitemapController.mainSitemap);
router.get('/sitemap/farmers', sitemapController.farmerSitemap);
router.get('/sitemap/shops', sitemapController.shopSitemap);
router.get('/sitemap/products', sitemapController.productSitemap);
router.get('/sitemap/blogs', sitemapController.blogSitemap);
router.get('/sitemap/pages', sitemapController.staticSitemap);

module.exports = router;
