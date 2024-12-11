import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required!',
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    firstName: {
        notEmpty: { errorMessage: 'First Name is required' },
    },
    lastName: {
        notEmpty: { errorMessage: 'Last Name is required' },
    },
    password: {
        notEmpty: { errorMessage: 'Password is required' },
    },
});
