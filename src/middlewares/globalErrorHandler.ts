import { HttpError } from 'http-errors';
import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {};
