import { NextFunction, Response } from 'express';
import { AuthRequest, RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { CredentialsService } from '../services/CredentialsService';

export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly tokenService: TokenService,
        private readonly credentialsService: CredentialsService,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { firstName, lastName, email, password, role, tenantId } =
            req.body;

        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '****',
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                tenantId,
                role,
            });
            this.logger.info('User has been registered', { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true,
            });

            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;

        this.logger.debug('New request to login a user', {
            email,
            password: '****',
        });

        try {
            const user = await this.userService.findByEmailWithPassword(email);
            if (!user) {
                const error = createHttpError(
                    400,
                    'Email or password does not match',
                );
                next(error);
                return;
            }

            const isPasswordMatched =
                await this.credentialsService.comparePassword(
                    password,
                    user?.password,
                );
            if (!isPasswordMatched) {
                const error = createHttpError(
                    400,
                    'Email or password does not match',
                );
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                tenant: user.tenant?.id ?? '',
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true,
            });

            this.logger.info('User has been logged in', { id: user.id });

            res.status(200).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));
        return res.json({ ...user, password: undefined });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
                tenant: req.auth.tenant ?? '',
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                const err = createHttpError(
                    401,
                    "Couldn't find user with token",
                );
                next(err);
                return;
            }
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true,
            });

            this.logger.info('New token generated', { id: user.id });

            res.status(200).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info('Refresh token has been deleted', {
                id: req.auth.id,
            });
            this.logger.info('User has been logged out', { id: req.auth.sub });

            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.json({});
        } catch (error) {
            next(error);
            return;
        }
    }
}
