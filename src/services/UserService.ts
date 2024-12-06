import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { LimitedUserData, UserData } from '../types';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password, role }: UserData) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            const err = createHttpError(400, 'Email already exists');
            throw err;
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            });
            return user;
        } catch {
            const err = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw err;
        }
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'role',
                'password',
            ],
        });
    }

    async findById(id: number) {
        return await this.userRepository.findOne({ where: { id } });
    }

    async getAll() {
        return await this.userRepository.find();
    }

    async update(
        userId: number,
        { firstName, lastName, role }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
            });
        } catch {
            const error = createHttpError(
                500,
                'Failed to update the user in the database',
            );
            throw error;
        }
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
