import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { ROLES } from '../../src/enums/index';
import createJWKSMock from 'mock-jwks';

describe('GET /auth/self', () => {
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
        it('should return the 200 status code', async () => {
            const accessToken = jwks.token({
                sub: '1',
                role: 'customer',
            });
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it('should return the user data', async () => {
            // Register user
            const userRepository = connection.getRepository(User);
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi@gmail.com',
                password: 'secret',
            };
            const data = await userRepository.save({
                ...userData,
                role: ROLES.CUSTOMER,
            });
            // Generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            // Add token to cookie
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            // Check if user id matches with registered user
            expect((response.body as Record<string, string>).id).toBe(data.id);
        });

        it('should not return the password', async () => {
            // Register user
            const userRepository = connection.getRepository(User);
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi@gmail.com',
                password: 'secret',
            };
            const data = await userRepository.save({
                ...userData,
                role: ROLES.CUSTOMER,
            });
            // Generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            // Add token to cookie
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            // Check if user id matches with registered user
            expect(response.body as Record<string, string>).not.toHaveProperty(
                'password',
            );
        });

        it('should return 401 if token does not exist', async () => {
            // Register user
            const userRepository = connection.getRepository(User);
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi@gmail.com',
                password: 'secret',
            };

            await userRepository.save({
                ...userData,
                role: ROLES.CUSTOMER,
            });

            // Add token to cookie
            const response = await request(app).get('/auth/self').send();

            // Check if user id matches with registered user
            expect(response.statusCode).toBe(401);
        });
    });
});
