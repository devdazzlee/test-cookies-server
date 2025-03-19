import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
app.set("trust proxy", true);

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://test-frontend-1-one.vercel.app"],
    credentials: true, // Allow sending cookies with cross-origin requests
    exposedHeaders: ["set-cookie"], // Expose set-cookie header to the client
  })
);

// Dummy user data (Replace with DB in production)
const users = [{ id: 1, email: "test@example.com", password: "password123" }];

const isProduction = process.env.NODE_ENV === "production";

// Secrets (Store securely in .env in production)
const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

// Function to generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, ACCESS_SECRET, {
    expiresIn: "15m",
  });
};

// Function to generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});
// Login Route: Sends Access & Refresh Tokens as HTTP-Only Cookies
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set Access Token Cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, // true in production, false in development
    sameSite: "none",
    // sameSite: isProduction ? "None" : "Lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    path: "/",
    // partitioned: true, // Add this attribute
    domain: ".test-cookies-server-production.up.railway.app", // Ensure it matches backend domain
    // domain: isProduction ? ".test-backend-1.vercel.app" : undefined, // Set backend domain
  });

  // Set Refresh Token Cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // true in production, false in development
    sameSite: "none",
    // sameSite: isProduction ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    path: "/",
    // partitioned: true, // Add this attribute
    domain: ".test-cookies-server-production.up.railway.app", // Ensure it matches backend domain
  });

  res.json({ message: "Login successful" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
