import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { ROLES } from '../enums';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
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
                role: ROLES.CUSTOMER,
            });
            return user;
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw err;
        }
    }
}
