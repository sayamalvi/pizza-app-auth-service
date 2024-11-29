import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
import loginValidator from '../validators/login-validator';
import { CredentialsService } from '../services/CredentialsService';
import authenticate from '../middlewares/authenticate';
import { AuthRequest } from '../types';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

// Dependency injections
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialsService = new CredentialsService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialsService,
);

router.post(
    '/register',
    registerValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        await authController.register(req, res, next);
    },
);
router.post(
    '/login',
    loginValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        await authController.login(req, res, next);
    },
);
router.get(
    '/self',
    authenticate as RequestHandler,
    (async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            await authController.self(req, res);
        } catch (error) {
            next(error);
        }
    }) as RequestHandler,
);
export default router;
