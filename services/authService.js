import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

// Dummy user data (Replace with DB in production)
const users = [
    { id: 1, email: "test@example.com", password: "password123" },
];

// Generate Access Token
export const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, ACCESS_SECRET, {
        expiresIn: "15m",
    });
};

// Generate Refresh Token
export const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

// Validate user credentials
export const authenticateUser = (email, password) => {
    return users.find((u) => u.email === email && u.password === password);
};
