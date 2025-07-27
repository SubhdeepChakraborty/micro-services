import logger from "../utils/logger.js"

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack)
    res.status(err.status || 500).send({
        status : false,
        message : 'Internal server error: ', err
    })
}

export default errorHandler