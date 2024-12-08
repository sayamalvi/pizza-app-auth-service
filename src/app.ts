import express, { Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import tenantRouter from './routes/tenant';
import userRouter from './routes/user';
import cors from 'cors';
import { Config } from './config';

const app = express();
const ALLOWED_DOMAINS = [
    Config.ADMIN_FRONTEND_DOMAIN,
    Config.CLIENT_FRONTEND_DOMAIN,
];
app.use(
    cors({
        origin: ALLOWED_DOMAINS as string[],
        credentials: true,
    }),
);
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to auth service');
});

app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);
app.use('/users', userRouter);

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
