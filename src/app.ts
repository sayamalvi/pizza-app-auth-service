import express, { Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import tenantRouter from './routes/tenant';
const app = express();
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to auth service');
});
app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);

app.use((err: HttpError, req: Request, res: Response) => {
    logger.error(err.message);
    const statusCode = err.status || err.statusCode || 500;
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
