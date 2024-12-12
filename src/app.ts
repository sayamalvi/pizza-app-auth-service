import express from 'express';
import authRouter from './routes/auth';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import tenantRouter from './routes/tenant';
import userRouter from './routes/user';
import cors from 'cors';
import { Config } from './config';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

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

app.use(globalErrorHandler);

export default app;
