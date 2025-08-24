import redis from "ioredis"
import logger from "../utils/logger.js";

const redisClient = new redis(process.env.REDIS_URL);

//Log when connected
redisClient.on("connect", () => {
    logger.info(`✅ Redis connected`)
})

redisClient.on('error', (error) => {
    logger.error(`❌ Redis error ${error.message}`)
    process.exit(1)
})

export default redisClient