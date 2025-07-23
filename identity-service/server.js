import express from "express";
import connectDB from "./src/config/db.js";
import helmet from "helmet"
import cors from "cors"
import logger from "./src/utils/logger.js";
import {RateLimiterRedis} from "rate-limiter-flexible"
import redisClient from "./src/config/redisClient.js";
import rateLimit from "express-rate-limit";
import {RedisStore} from "rate-limit-redis"
import router from "./src/routes/identity-service.js";
import errorHandler from "./src/middleware/errorHandler.js";
import dotenv from "dotenv"

dotenv.config()
const app = express();

//Connect to the database
connectDB();

//middleware
app.use(helmet()); //uses for security headers
app.use(cors()); //we can configure cors later
app.use(express.json()); //to parse json data

app.use((req,res,next) => {
    logger.info(`Request received: ${req.method} ${req.url}`);
    logger.info(`Request body: ${JSON.stringify(req.body)}`);
    next();
})

//rate limiter
const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix: 'rate_limiter',
    points: 10, 
    duration: 1,
    blockDuration: 10,
})

app.use((req,res,next) => {
    rateLimiter.consume(req.ip).then(() => {
        next();
    }).catch(() => logger.warn(`Rate limit exceeded for IP: ${req.ip}`) || res.status(429).send('Too Many Requests'))
})


//Ip based rate limiter for sensitive endpoints
const sensitiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res) => {
    logger.warn(`Sensitive endppoint rate Limit exceeded for IP: ${req.ip}`);
    res.status(429).send("Too Many Requests");
  },
  store: new RedisStore({
    sendCommand : (...args) => redisClient.call(...args) 
  }),
});


//Apply sensitive rate limiter to specific routes
app.use('/api/auth/register', sensitiveRateLimiter)


//Routes
app.use('/api/auth', router)

//error handling middleware
app.use(errorHandler)

//start server
app.listen(process.env.PORT || 5000, () => {
    logger.info(`Server is running on port ${process.env.PORT || 5000}`)
})

//unhandler promises rejection
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at:${promise}, reason: ${reason}`)
    process.exit(1)
})