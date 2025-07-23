import Redis from "ioredis";
import dotenv from "dotenv"

dotenv.config()

const redisClient = new Redis(process.env.REDIS_URL);

// Log when connected
redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

// Handle errors
redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
  process.exit(1); // Optional: shut down if Redis is critical
});

export default redisClient;
