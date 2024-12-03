import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: Request, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        this.logger.debug('Request for creating a tenant', req.body);
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
}
