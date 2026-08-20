import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

// Initialize and PING Redis
async function redisPinger() {
    const redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));

    try {
        await redisClient.connect();
        const pong = await redisClient.ping();
        console.log(`[Redis] Connected successfully. PING response: ${pong}`);
    } catch (err) {
        console.error('[Redis] Failed to connect and PING Redis on startup:', err);
    }
}

export { redisPinger };