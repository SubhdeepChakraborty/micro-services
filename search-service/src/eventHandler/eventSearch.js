import searchModel from "../models/search.js"
import logger from "../utils/logger.js"

const handleSearchEvent = async(event) => {
    logger.info('Handling search event', event)
    try {
        const {postId, userId, content, createdAt} = event
        const searchResult = await searchModel.create({
            postId,
            userId,
            content,
            createdAt
        })
        if(!searchResult){
            logger.error('Failed to create search post')
        }
        logger.info('Search post have been generated.')
    } catch (error) {
        logger.error(`Failed to handle search event: ${error}`)
        throw error
    }
}

const handleDeleteEvent = async(event) => {
    logger.info('Handling delete event', event)
    try {
        const {postId} = event
        await searchModel.findByIdAndDelete({
            postId
        })
        logger.info(`Search post with ID ${postId} have been deleted`)
    } catch (error) {
        logger.error(`Failed to handle delete event: ${error}`)
        throw error
    }
}


export {handleSearchEvent, handleDeleteEvent}