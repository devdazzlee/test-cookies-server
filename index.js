import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { login } from "./controllers/authController.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin: "https://frontenf-deployment.vercel.app", // Adjust for your frontend
        credentials: true, // Allow sending cookies
    })
);

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.post("/login", login);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
