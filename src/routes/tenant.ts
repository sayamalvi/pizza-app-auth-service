import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { TenantController } from '../controllers/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { ROLES } from '../enums';
import tenantValidator from '../validators/tenant-validator';
import { CreateTenantRequest } from '../types';

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    '/',
    authenticate as RequestHandler,
    canAccess([ROLES.ADMIN]) as RequestHandler,
    tenantValidator,
    async (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        await tenantController.create(req, res, next);
    },
);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    await tenantController.getAllTenants(req, res, next);
});

router.get(
    '/:id',
    authenticate as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        await tenantController.getTenantById(req, res, next);
    },
);

router.patch(
    '/:id',
    authenticate as RequestHandler,
    canAccess([ROLES.ADMIN]) as RequestHandler,
    tenantValidator,
    async (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        await tenantController.updateTenant(req, res, next);
    },
);

router.delete(
    '/:id',
    authenticate as RequestHandler,
    canAccess([ROLES.ADMIN]) as RequestHandler,
    async (req: Request, res: Response, next: NextFunction) => {
        await tenantController.deleteTenant(req, res, next);
    },
);
export default router;
