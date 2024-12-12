import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { CreateTenantRequest } from '../types';

export class TenantController {
    constructor(
        private readonly tenantService: TenantService,
        private readonly logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, address } = req.body;
        // this.logger.debug('Request for creating a tenant', req.body);
        try {
            const newTenant = await this.tenantService.create({
                name,
                address,
            });
            this.logger.info('Tenant has been created', { id: newTenant.id });
        } catch (error) {
            next(error);
        }

        res.status(201).json({});
    }

    async getAllTenants(req: Request, res: Response, next: NextFunction) {
        try {
            const allTenants = await this.tenantService.getAll();
            res.status(200).json(allTenants);
        } catch (error) {
            next(error);
        }
    }

    async getTenantById(req: Request, res: Response, next: NextFunction) {
        const { id: tenantId } = req.params;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));

            if (!tenant) {
                next(createHttpError(400, 'Tenant does not exist.'));
                return;
            }

            this.logger.info('Tenant has been fetched');
            res.json(tenant);
        } catch (err) {
            next(err);
        }
    }

    async updateTenant(
        req: CreateTenantRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        this.logger.debug('Request for updating a tenant', req.body);
        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });

            this.logger.info('Tenant has been updated', { id: tenantId });

            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
        }
    }

    async deleteTenant(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info('Tenant has been deleted', {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        } catch (err) {
            next(err);
        }
    }
}
