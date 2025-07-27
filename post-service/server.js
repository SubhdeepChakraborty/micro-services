import dotenv from "dotenv"
import express from "express"
import logger from "./src/utils/logger.js"
import errorHandler from "./src/middleware/errorHandler.js"
import cors from "cors"
import helmet from "helmet"
import router from "./src/routes/post.routes.js"
import connectDB from "./src/config/db.js"
import rateLimit from "express-rate-limit"
import {RedisStore} from "rate-limit-redis"
import redisClient from "./src/config/redisClient.js"
import {RateLimiterRedis} from "rate-limiter-flexible"

dotenv.config()
const PORT = process.env.PORT

const app = express()
app.use(cors())
app.use(express.json())
app.use(helmet())

//Connect mongodb
connectDB()

//ratelimiter
const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,
    heyPrefix : 'rate_limiter',
    points : 20,
    duration : 1,
    blockDuration: 4
})

app.use((req,res,next) => {
    rateLimiter.consume(req.ip).then(() => {
        next()
    }).catch(() => logger.warn(`Rate limit exceeded for Ip: ${req.ip}`) || res.status(429).send({
        status : false,
        message : 'Too many requests'
    }))
})

//sensitive Ip based
const sensitiveRateLimiter = rateLimit({
    windowMs: 10*60*1000,
    max: 100,
    standardHeaders : true,
    legacyHeaders : false,
    message : 'Too many requests from this Ip, please try again later',
    handler : (req, res) => {
        logger.warn(`Sensitive endpoint rate limit execeeded for Ip : ${req.ip}`)
        res.status(429).send({
            message: 'To many request',
            status : false
        })
    },
    store : new RedisStore({
        sendCommand : (...args) => redisClient.call(...args)
    })
})

app.use('/api/posts', (req, res, next) => {
    req.redisClient = redisClient
    next()
}, router)

app.use(errorHandler)

//start server
app.listen(process.env.PORT || 5000, () => {
    logger.info(`Server is running on port ${process.env.PORT || 3002}`);
})

//unhandler promises rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at:${promise}, reason: ${reason}`)
    process.exit(1)
})