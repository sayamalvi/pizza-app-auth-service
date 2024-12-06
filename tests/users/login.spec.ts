import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { isJwt } from '../utils';
import { User } from '../../src/entity/User';
import { ROLES } from '../../src/enums/index';

describe('POST /auth/login', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return the access token and refresh token inside a cookie', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi@gmail.com',
                password: 'secret',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: ROLES.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            interface Headers {
                ['set-cookie']?: string[];
            }
            let accessToken = null;
            let refreshToken = null;
            const cookies = (response.headers as Headers)['set-cookie'] || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it('should return the 400 if email or password is wrong', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi@gmail.com',
                password: 'secret',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: ROLES.CUSTOMER,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: 'wrongPassword' });

            expect(response.statusCode).toBe(400);
        });
    });
});
