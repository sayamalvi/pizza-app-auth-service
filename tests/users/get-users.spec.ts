import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { ROLES } from '../../src/enums/index';
import createJWKSMock from 'mock-jwks';
import { DataSource } from 'typeorm';

describe('GET /users', () => {
    let connection: DataSource;
    let jwks: { start: any; stop: any; token: any; kid?: () => string };

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(async () => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    it('should return filtered and paginated users', async () => {
        const adminToken = jwks.token({
            sub: '1',
            role: ROLES.ADMIN,
        });

        const userRepository = connection.getRepository(User);

        const usersData = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@admin.com',
                password: 'password',
                role: ROLES.ADMIN,
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@manager.com',
                password: 'password',
                role: ROLES.MANAGER,
            },
            {
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice.johnson@manager.com',
                password: 'password',
                role: ROLES.MANAGER,
            },
        ];

        await userRepository.save(usersData);

        const response = await request(app)
            .get('/users')
            .set('Cookie', [`accessToken=${adminToken}`])
            .query({
                searchTerm: 'John',
                role: ROLES.ADMIN,
                currentPage: 1,
                perPage: 2,
            });

        expect(response.status).toBe(200);
        expect(response.body.data[0].email).toBe('john.doe@admin.com');
    });
});
