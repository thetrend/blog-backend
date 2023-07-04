import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/api/hello-world', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: 'Hello World'
  });
});

app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
});
