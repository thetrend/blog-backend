import { Redis } from 'ioredis';

const redisClient = new Redis(6379);

const connectRedis = async () => {
  try {
    console.log('Redis client connected successfully!');
    redisClient.set('try', 'Welcome to Express + Prisma + Redis');
  } catch (error) {
    console.log(error);
    setTimeout(connectRedis, 5000);
  }
};

connectRedis();

export default redisClient;
