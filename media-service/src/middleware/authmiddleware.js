import logger from "../utils/logger.js"

const authenticationReq = (res, req, next) => {
    let userId = req.headers["x-user-Id"]
    if(!userId) userId = req.user.userId
    if(!userId){
        logger.warn(`Acess attemped without userId`)
        return res.status(401).send({
            status : false,
            message : "Authentication required! please login to continue"
        })
    }
    req.user = {userId}
    next()
}

export default authenticationReq