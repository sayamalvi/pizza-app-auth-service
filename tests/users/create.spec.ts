import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { ROLES } from '../../src/enums/index';
import createJWKSMock from 'mock-jwks';

describe('POST /users', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

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

    describe('Given all fields', () => {
        it('should persist the user in the database', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: ROLES.ADMIN,
            });
            const userRepository = connection.getRepository(User);
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi@gmail.com',
                password: 'secret',
                tenantId: 1,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it('should create a manager user', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: ROLES.ADMIN,
            });
            const userRepository = connection.getRepository(User);
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi@gmail.com',
                password: 'secret',
                tenantId: 1,
            };

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const users = await userRepository.find();
            // expect(users).toHaveLength(1);
            expect(users[0].role).toBe(ROLES.MANAGER);
        });
        it.todo('should return 403 if non admin tries to create a user');
    });
});
