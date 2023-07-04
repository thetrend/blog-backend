import express, { Express, NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import redisClient from './utils/redis';

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();

const bootstrap = async () => {
  app.use(express.json());
  
  const port = process.env.PORT || 8000;

  app.get('/api/health', async (_, res: Response) => {
    const message = await redisClient.get('try');
    res.status(200).json({
      message,
    });
  });

  app.get('/api/hello-world', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      message: 'Hello World'
    });
  });
  
  app.listen(port, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
  });
};

bootstrap()
  .catch((error) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });