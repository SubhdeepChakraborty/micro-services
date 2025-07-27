import logger from "../utils/logger.js";

const authenticateReq = (req, res, next) => {
    console.log(req)
    let userId = req.headers["x-user-id"];
    if(!userId) userId = req.user.userId
    console.log(userId, "here is the id")
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