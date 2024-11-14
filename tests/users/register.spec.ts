import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
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
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });
    });
    describe('Fields are missing', () => {});
});
