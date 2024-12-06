import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';

import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { ROLES } from '../enums';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import createUserValidator from '../validators/create-user-validator';
import updateUserValidator from '../validators/update-user-validator';
import { CreateUserRequest, UpdateUserRequest } from '../types';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    '/',
    authenticate as RequestHandler,
    canAccess([ROLES.ADMIN]) as RequestHandler,
    createUserValidator,
    async (req: CreateUserRequest, res: Response, next: NextFunction) => {
        await userController.create(req, res, next);
    },
);

router.get(
    '/',
    authenticate as RequestHandler,
    canAccess([ROLES.ADMIN]) as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next),
);

router.get(
    '/:id',
    authenticate as RequestHandler,
    canAccess([ROLES.ADMIN]) as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOne(req, res, next),
);

router.patch(
    '/:id',
    authenticate as RequestHandler,
    updateUserValidator,
    canAccess([ROLES.ADMIN]) as RequestHandler,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
);

router.delete(
    '/:id',
    authenticate as RequestHandler,
    canAccess([ROLES.ADMIN]) as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        userController.destroy(req, res, next),
);

export default router;
