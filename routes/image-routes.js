const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth-middleware');
const isAdminUser = require('../middleware/admin-middleware');
const uploadMiddleware = require('../middleware/upload-middleware');
const {uploadImageController,fetchImagesController,deleteImageController} = require('../controller/image-controller');

router.post('/upload', authMiddleware,isAdminUser,uploadMiddleware.single('image'),uploadImageController);
router.get('/get', authMiddleware, fetchImagesController);
router.delete('/:id', authMiddleware,isAdminUser, deleteImageController);

module.exports = router;



// 681f5038746882b2230b4ef1 uploaded by 