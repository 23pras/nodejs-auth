const Image = require('../models/Image');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelper');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const uploadImageController = async(req,res)=>{
    try {
       
        if(!req.file){
            res.status(400).json({
                success:false,
                message: 'file is requiree, please upload an image !'
            })
        }

        const {url, publicId} = await uploadToCloudinary(req.file.path);

        const newUploadedImage = new Image({
            url,
            publicId,
            uploadedBy: req.userInfo.userId
        });

        await newUploadedImage.save();

        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success:true,
            message: 'Image uploaded successfully',
            image:newUploadedImage
        });

         
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message: 'Something went wrong, please try again !'
        })
    }
};

const fetchImagesController = async(req,res)=>{ 
    try {
    
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 2;
      const skip = (page-1)*limit; 

      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const totalImages = await Image.countDocuments();
      const totalPages = Math.ceil(totalImages/limit);

      const sortObj = {};
      sortObj[sortBy]= sortOrder;

      const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

      if(images){
        res.status(200).json({
            success:true,
            currentPage : page,
            totalPages: totalPages,
            totalImages: totalImages,
            data:images
        })
      }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message: 'Something went wrong, please try again !'
        })
    }
};

const deleteImageController = async(req,res)=>{
    try {
        const getDeletedImageId = req.params.id;
        const userId = req.userInfo.userId;

        const image = await Image.findById(getDeletedImageId);
        if(!image){
            return res.status(404).json({
                success:false,
                message:'Image not found !'
            });
        }

        if(image.uploadedBy.toString()!==userId){
            return res.status(403).json({
                success:false,
                message:'you are not authorized to delete this image'
            });
        }

        await cloudinary.uploader.destroy(image.publicId);

        await Image.findByIdAndUpdate(getDeletedImageId);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message: 'Something went wrong, please try again !'
        })
    }
};

module.exports={uploadImageController,fetchImagesController,deleteImageController}