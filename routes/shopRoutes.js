const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createShop, getAllShops, getShopById, deleteShop, updateShop } = require('../controllers/shopController');


// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };
  
  const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter,
  });


router.post('/create-shop', upload.single('shop_image'), protect(['farmer','admin', 'sub_admin']), createShop); 
router.get('/shops', protect, getAllShops); 
router.get('/shop/:id', protect, getShopById); 
router.put('/shop/:id', protect(['admin', 'farmer', 'sub_admin']), updateShop); 
router.delete('/shop/:id', protect(['admin', 'farmer', 'sub_admin']),  deleteShop); 




module.exports = router;
