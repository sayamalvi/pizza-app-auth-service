import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { ROLES } from '../../src/enums/index';
import createJWKSMock from 'mock-jwks';
import { DataSource } from 'typeorm';

describe('PATCH /users', () => {
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

    it('should update the user in database', async () => {
        const adminToken = jwks.token({
            sub: '1',
            role: ROLES.ADMIN,
        });

        const userRepository = connection.getRepository(User);

        const usersData = [
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@manager.com',
                password: 'password',
                role: ROLES.MANAGER,
            },
        ];

        await userRepository.save(usersData);

        const updatedUser = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@manager.com',
            password: 'password',
            role: ROLES.MANAGER,
        };
        const response = await request(app)
            .patch(`/users/1`)
            .set('Cookie', [`accessToken=${adminToken}`])
            .send(updatedUser);

        const users = await userRepository.find();
        expect(users[0].email).toBe(updatedUser.email);
    });
});
