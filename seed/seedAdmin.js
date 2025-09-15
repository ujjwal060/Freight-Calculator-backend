import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import admin from "../models/adminModel.js";
import { loadConfig } from '../config/loadConfig.js';

const config = await loadConfig();

const adminSeed = async () => {
    try {
        await mongoose.connect(config.DB_URI);

        const email = "admin.freight@yopmail.com";
        const password = "Admin@123";
        const hashed = await bcrypt.hash(password, 10);

        const existing = await admin.findOne({ email });
        if (!existing) {
            await admin.create({ email, password: hashed });
            console.log("✅ Admin seeded successfully");
        } else {
            console.log("⚡ Admin already exists");
        }
    } catch (err) {
        console.error("❌ Error in seeding admin:", err.message);
    } finally {
        mongoose.connection.close();
    }
}

adminSeed();