import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
// import { UserData } from '../../src/controllers/AuthController';

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
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe('customer');
        });
    });
    describe('Fields are missing', () => {});
});
