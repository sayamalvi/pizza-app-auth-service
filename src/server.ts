import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info('Database Connected Successfully');
        app.listen(PORT, () =>
            logger.info('Listening on PORT ', { port: PORT }),
        );
    } catch (error) {
        logger.error(error);
        process.exit();
    }
};

void startServer();
