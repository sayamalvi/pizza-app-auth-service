import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { ROLES } from '../../src/enums';
import { isJwt } from '../utils';
import { RefreshToken } from '../../src/entity/RefreshToken';

describe('POST /auth/register', () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // database truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            // AAA-> Arrange, Act, Assert

            // Arrange
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert

            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            // Arrange
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert

            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should persist the user in the database', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it('should return id of the new created user', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.body).toHaveProperty('id');
        });

        it('should assign a customer role', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe('customer');
        });

        it('should store the hashed password in the database', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find({ select: ['password'] });
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });

        it('should return 400 status code if email already exists', async () => {
            // Arrange
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: ROLES.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const users = await userRepository.find();
            // Assert

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        it('should return access token and refresh token inside a cookie', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            interface Headers {
                ['set-cookie']?: string[];
            }
            let accessToken: string | null = null;
            let refreshToken: string | null = null;
            const cookies = (response.headers as Headers)['set-cookie'] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            expect(accessToken).not.toBe(null);
            expect(refreshToken).not.toBe(null);
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it('should return the refresh token in the database', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            const refreshTokenRepo = connection.getRepository(RefreshToken);
            // const refreshTokens = await refreshTokenRepo.find();
            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();
            expect(tokens).toHaveLength(1);
        });
    });

    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: '',
                password: 'secret',
                role: 'customer',
            };

            connection.getRepository(User);
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if firstname is missing', async () => {
            const userData = {
                firstName: '',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            connection.getRepository(User);
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if lastname is missing', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi07@gmail.com',
                password: '',
                role: 'customer',
            };

            connection.getRepository(User);
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if password is missing', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: '',
                email: 'sayamalvi07@gmail.com',
                password: 'secret',
                role: 'customer',
            };

            connection.getRepository(User);
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: '   sayamalvi07@gmail.com   ',
                password: 'secret',
                role: 'customer',
            };

            connection.getRepository(User);
            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe('sayamalvi07@gmail.com');
        });

        it('should return 400 if email is not a valid email', async () => {
            const userData = {
                firstName: 'Sayam',
                lastName: 'Alvi',
                email: 'sayamalvi',
                password: 'secret',
                role: 'customer',
            };

            connection.getRepository(User);
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
        });
    });
});
