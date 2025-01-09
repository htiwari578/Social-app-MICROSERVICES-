const Media = require("../models/media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");



const handlePostDeleted = async(event) => {
    console.log(event, "eventeventevent");
    const { postId ,  mediaIds} = event
    try {
        const mediaToDelete = await Media.find({_id : {$in: mediaIds}})

        for(const media of mediaToDelete){
            await deleteMediaFromCloudinary(media.publicId)
            await Media.findByIdAndDelete(media._id)
            logger.info(`Deleted media ${media._id} associated with this deleted ${postId}`)
        }
        logger.info(`Processd deletion of media for post id ${postId} `)
    } catch (error) {
        logger.error(error, 'Error occured during media deleteion')
    }
}
module.exports={handlePostDeleted};