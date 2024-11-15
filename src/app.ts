import express, { Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import 'reflect-metadata';

const app = express();
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to auth service');
});
app.use('/auth', authRouter);

app.use((err: HttpError, req: Request, res: Response) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    });
});
export default app;
