import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        default:"admin.freight@yopmail.com",
        unique: true,
    },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Date },
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;