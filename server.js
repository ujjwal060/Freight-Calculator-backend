import express from 'express';
import cors from 'cors';
import connectToDatabase from './config/db.js';
import {loadConfig} from './config/loadConfig.js';
const startServer = async () => {
    try {
        const config = await loadConfig();
        const app = express();

        const corsOptions = {
            // origin: ['*'],
            origin: '*',
            credentials: true
        }

        app.use(cors(corsOptions));
        app.use(express.json());

        await connectToDatabase(config.DB_URI);


        const PORT = config.PORT || 1010;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log(`Server failed to start: ${error.message}`);
        process.exit(1);
    }

};

startServer();