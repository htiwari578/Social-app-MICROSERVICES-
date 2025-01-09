const Media = require("../models/media")
const { uploadMediaToCloudinary } = require("../utils/cloudinary")
const logger = require("../utils/logger")





const uploadMedia = async(req,res)=> {
    logger.info('Starting media upload')

    try {
        
        if(!req.file){
            logger.error('No file found')
            return res.status(400).json({
                success:false,
                message:'No file found'
            })
        }

        const { originalname,  mimetype, buffer} = req.file
        const userId = req.user.userId;

        logger.info(`File details: name=${originalname} , type=${mimetype}`);
        logger.info('Uploading to cloudinary starting...')

        const cloudinaryUpload = await uploadMediaToCloudinary(req.file)
        logger.info(`Cloudinary upload successfully. Public Id: - ${cloudinaryUpload.public_id}`)

        const newlyCreatedMedia = new Media({
            publicId : cloudinaryUpload.public_id,
            originalName :originalname,
            mimeType : mimetype,
            url : cloudinaryUpload.secure_url,
            userId

        })
        await newlyCreatedMedia.save();
        res.status(201).json({
            success:true,
            mediaId : newlyCreatedMedia._id,
            url : newlyCreatedMedia.url,
            message:"Media upload is successfully"
        })
    } catch (error) {
        logger.error('Error while uploading media' , error)
        res.status(500).json({
            success:false,
            message:"Error while uploading media"
        })
    }
    
}

const getAllMedias = async(req,res)=> {
    try {
        const results = await Media.find({})
        res.json({results})
    } catch (error) {
        logger.error('Error while fetching all media' , error)
        res.status(500).json({
            success:false,
            message:'Error while fetching all media'
        })
    }
}

module.exports = { uploadMedia, getAllMedias};