const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createShop, deleteShop, updateShop, searchShops, upload, getShopsByLocation, getShopsByCategory, getAllShops, getShopByFarmerId, getShopById, getShopByProductId, getProductsByShopId } = require('../controllers/shopController');


// Routes
router.post(
    '/create-shop',
    authorize(['farmer']),
    upload.fields([
      { name: 'shop_image', maxCount: 5 },
      { name: 'shop_cover_image', maxCount: 1 },
      { name: 'shop_profile_image', maxCount: 1 },
    ]),
    createShop
  );
  
  router.get('/farmer-shops', getAllShops);

  // get farmer shop by id  
  router.get('/farmer-shop/:id', authorize(['farmer']), getShopByFarmerId);

  // GET Shop by ID
  router.get("/shop/:id" , getShopById); 

  router.get('/shop-products/:shopId', getProductsByShopId);

  router.put(
    '/shop/:id',
    authorize(['farmer', 'admin', 'sub_admin']),
    upload.fields([
      { name: 'shop_image', maxCount: 5 },
      { name: 'shop_cover_image', maxCount: 1 },
      { name: 'shop_profile_image', maxCount: 1 },
    ]),
    updateShop
  );

  router.delete('/shop/:id', authorize(['farmer', 'admin', 'sub_admin']), deleteShop);


router.get('/shop-by-location', getShopsByLocation); // Get shops by location

router.get('/shop/category', authorize, getShopsByCategory); // Get shops by category

router.get('/search/bynamecity/shop', searchShops);



module.exports = router;
