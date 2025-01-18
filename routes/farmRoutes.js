const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/authMiddleware');
const { createFarm, getAllFarms, getFarmById, updateFarm, deletedFarm } = require('../controllers/farmController');


// Create Farm Route 
router.post('/create-farm', authorize(['admin', 'farmer', 'sub_admin']), createFarm); 
// Get All Farms
router.get('/farms', authorize, getAllFarms);  
// Get Farm by Id
router.get('/farm/:id', authorize(['admin', 'farmer', 'sub_admin']), getFarmById);
// Update Farm 
router.put('/farm/:id', authorize(['admin', 'farmer', 'sub_admin']), updateFarm); 
// Delete Farm
router.delete('/farm/:id', authorize(['admin', 'farmer', 'sub_admin']),  deletedFarm); 

module.exports = router;
