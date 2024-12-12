import { HttpError } from 'http-errors';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    const errorId = uuidv4();
    const statusCode = err.status || err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message;

    logger.error(err.message, {
        id: errorId,
        err: err.stack,
        path: req.path,
        method: req.method,
        statusCode,
    });
    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                message,
                path: req.path,
                method: req.method,
                location: 'server',
                stack: process.env.NODE_ENV === 'production' ? null : err.stack,
            },
        ],
    });
};
