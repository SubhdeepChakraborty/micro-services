import logger from "../utils/logger.js"
import searchModel from "../models/search.js"


const searchPostController = async(req, res) => {
    logger.info('Search post request received')
    try {
        const {content} = req.query;
        console.log(req.query, "query")
        const results = await searchModel.find({
            $text : {$search : content}
        }, {
            score : {$meta : 'textScore'}
        }).sort({
            score : {$meta : 'textScore'}
        }).limit(10)

        if(!results.length){
            logger.info('No search results found')
            return res.status(404).send({
                status : false,
                message : 'No search results found'
            })
        }

        res.status(200).send({
            status : true,
            message : 'Search results found',
            data : results
        })

    } catch (error) {
        logger.error(`Failed to search post: ${error.message}`)
        res.status(500).send({
            status : false,
            message : 'Internal Server Error'
        })
    }
}

export {
    searchPostController
}