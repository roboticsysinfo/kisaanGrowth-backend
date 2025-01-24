const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createShop, deleteShop, updateShop, searchShops, getShopsByLocation, getShopsByCategory, getFarmerShops } = require('../controllers/shopController');
const upload = require('../middlewares/upload')

// Routes
router.post(
    '/create-shop',
    authorize(['farmer']),
    upload.fields([
      { name: 'shop_image', maxCount: 10 },
      { name: 'shop_cover_image', maxCount: 1 },
      { name: 'shop_profile_image', maxCount: 1 },
    ]),
    createShop
  );
  
  router.get('/farmer-shops', authorize(['admin']), getFarmerShops);
  router.put(
    '/shop/:id',
    authorize(['farmer', 'admin', 'sub_admin']),
    upload.fields([
      { name: 'shop_image', maxCount: 10 },
      { name: 'shop_cover_image', maxCount: 1 },
      { name: 'shop_profile_image', maxCount: 1 },
    ]),
    updateShop
  );
  router.delete('/shop/:id', authorize(['farmer', 'admin', 'sub_admin']), deleteShop);

router.get('/shop/location', authorize, getShopsByLocation); // Get shops by location
router.get('/shop/category', authorize, getShopsByCategory); // Get shops by category
router.get('/shop/search', authorize, searchShops);



module.exports = router;
