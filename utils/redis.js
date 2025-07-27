const Redis = require("ioredis");
const dotenv = require("dotenv");

dotenv.config();

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log("Redis connected");
        return process.env.REDIS_URL;
    }
    throw new Error("Redis not connected");
};

const redis = new Redis(redisClient());

module.exports = { redis };
