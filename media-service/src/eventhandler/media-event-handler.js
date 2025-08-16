import Media from "../models/media.js"
import { deletemediafromCloudinary } from "../utils/couldinary.js"
import logger from "../utils/logger.js"

const handlePostDeleted = async(event) =>{
    console.log(event, "event event" )
    const {postId, userId, media} = event
    try {
        const mediaToDelete = await Media.find({
            _id : {$in : media}
        })
        for(let med of mediaToDelete){
            await deletemediafromCloudinary(med?.publicId);
            await Media.findByIdAndDelete(med?._id)
            logger.info(`Deleted media ${med?._id} associated with deleted post ${postId} with this user : ${userId}`)
        }
        logger.info(`Processed deletion of media for post id : ${postId}`)
    } catch (error) {
        logger.error(`Something went wrong while deleting the file`)
    }
}

export {handlePostDeleted}