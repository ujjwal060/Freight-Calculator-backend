import jwt from "jsonwebtoken";
import { loadConfig } from "../config/loadConfig.js";
import admin from "../models/adminModel.js";
const config = await loadConfig();


const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access.",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

        req.user = {
            id: decoded.id,
        };
        next();
    } catch (error) {
        return res.status(401).json({
            status: 401,
            message: "expired token. Please login again.",
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token=req.body.refreshToken;
        
        const decoded = jwt.verify(token,config.REFRESH_TOKEN_SECRET);

        const user = await admin.findOne({ _id: decoded.id});

        if (!user) {
            return res.status(403).json({
                status: 403,
                message: "Invalid refresh token.",
            });
        }

        const newAccessToken = jwt.sign(
            { id: user.id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            status: 200,
            message: "New access token generated.",
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(403).json({
            status: 403,
            message: "Expired refresh token. Please login again.",
        });
    }
}

export { 
    authenticateUser, 
    refreshToken
};