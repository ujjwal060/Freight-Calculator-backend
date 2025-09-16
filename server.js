import express from 'express';
import cors from 'cors';
import connectToDatabase from './config/db.js';
import {loadConfig} from './config/loadConfig.js';
import userRoutes from './routes/userRoutes/indexRoutes.js';
import adminRoutes from './routes/adminRoutes/indexRoutes.js';

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

        app.use('/api/users', userRoutes);
        app.use('/api/admin', adminRoutes);

        const PORT = config.PORT || 8888;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log(`Server failed to start: ${error.message}`);
        process.exit(1);
    }

};

startServer();