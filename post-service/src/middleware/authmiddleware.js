import logger from "../utils/logger.js";

const authenticateReq = (req, res, next) => {
    let userId = req.headers["x-user-id"];
    if(!userId) userId = req.user.userId
    if(!userId){
        logger.warn(`Acess attemped without user Id`)
        return res.status(401).send({
            status : false,
            message : 'Authentication required! Please login to continue'
        })
    }
    req.user = {userId}
    next()
}

export {authenticateReq}