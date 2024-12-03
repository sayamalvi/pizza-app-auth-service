import express from 'express';
import { TenantController } from '../controllers/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import { Logger } from 'winston';

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const logger = new Logger();
const tenantController = new TenantController(tenantService, logger);

router.post('/', (req, res, next) => tenantController.create(req, res, next));
export default router;
