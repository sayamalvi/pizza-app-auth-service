import { checkSchema } from 'express-validator';

export default checkSchema(
    {
        searchTerm: {
            in: ['query'],
            trim: true,
            customSanitizer: {
                options: (value: unknown) => value ?? '',
            },
        },
        role: {
            in: ['query'],
            customSanitizer: {
                options: (value: unknown) => value ?? '',
            },
        },
        currentPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return isNaN(parsedValue) ? 1 : parsedValue;
                },
            },
        },
        perPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return isNaN(parsedValue) ? 5 : parsedValue;
                },
            },
        },
    },
    ['query'],
);
