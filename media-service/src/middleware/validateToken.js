import jwt from "jsonwebtoken"

const validateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]
    if(!token){
        return res.status(401).send({
            status : false,
            message : "No token provided"
        })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).send({
                status : false,
                message : 'Invalid token provided'
            })
        }
        req.user = {userId : decoded.userId}
        next()
    })
}

export default validateToken