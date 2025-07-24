import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import redisClient from './src/config/redisClient.js'
import logger from './src/utils/logger.js'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import {RedisStore} from "rate-limit-redis"
import proxy from 'express-http-proxy'
import errorHandler from './src/middleware/errorHandler.js'

const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(helmet())

//rate limiting
const ratelimit = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders : false,
    message : "Too many requests from this Ip, please try again later.",
    handler : (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for Ip: ${req.ip}`),
        res.status(429).send('Too Many requests')
    },
    store : new RedisStore({
        sendCommand : (...args) => redisClient.call(...args)
    })
})

app.use(ratelimit)

app.use((req, res, next) => {
    logger.info(`Request received : ${req.method} ${req.url}`)
    // logger.info(`Request body : ${JSON.stringify(req.body)}`) //This can log sensitive data, so be careful
    next()
})

//Now the imp part
//we gonna hit another service for ex
//link will be like: localhost:3000/v1/auth/register -> localhost:3001/api/auth/register

//Creating a proxy
const proxyOptions = {
    proxyReqPathResolver: (req) => {
       return req.originalUrl.replace(/^\/v1/, '/api')
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error:, ${err}`);
        res.status(500).send({
            error: 'Internal Server Error',
            message: `An error occurred while processing your request: ${err}`
        });
    }
}


//setting up proxy for identity service
app.use("/v1/auth", proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator : (proxyReqOps, srcReq)=>{
        proxyReqOps.headers['content-type'] = 'application/json';
        return proxyReqOps;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Proxying request to Identity Service : ${proxyRes.statusCode}`)
        return proxyResData;
    }
}));

app.use(errorHandler)

app.listen(process.env.PORT || 3000, () => {
    logger.info(`Api Gateway is running on port ${process.env.PORT}`)
    logger.info(`Identity Service URL : ${process.env.IDENTITY_SERVICE_URL}`)
    logger.info(`Redis URL : ${process.env.REDIS_URL}`);
})