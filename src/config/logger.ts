import winston from 'winston';
import { Config } from '.';

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
        serviceName: 'auth-service',
    },
    transports: [
        new winston.transports.File({
            level: 'info',
            dirname: 'logs',
            filename: 'info.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev',
        }),
        new winston.transports.File({
            level: 'error',
            dirname: 'logs',
            filename: 'error.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev',
        }),
        new winston.transports.File({
            level: 'debug',
            dirname: 'logs',
            filename: 'debug.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev',
        }),
    ],
});

export default logger;
