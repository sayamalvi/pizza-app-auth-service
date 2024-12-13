import { checkSchema } from 'express-validator';
import { UpdateUserRequest } from '../types';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required!',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last name is required!',
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: 'Role is required!',
        notEmpty: true,
        trim: true,
    },
    email: {
        isEmail: {
            errorMessage: 'Invalid email!',
        },
        errorMessage: 'Email is required!',
        notEmpty: true,
        trim: true,
    },
    tenantId: {
        errorMessage: 'tenantId is required!',
        trim: true,
        custom: {
            options: (value: string, { req }) => {
                const role = (req as UpdateUserRequest).body.role;
                if (role === 'admin') return true;
                else return !!value;
            },
        },
    },
});
