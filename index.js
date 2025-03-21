import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
app.enable("trust proxy"); // OR app.set("trust proxy", true);

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
    sameSite: "None",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });

  // Set Refresh Token Cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // true in production, false in development
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  res.json({ message: "Login successful" });
});

// **NEW: Refresh Token API**
app.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(403).json({ message: "No token found" });

  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.json({ message: "Token refreshed", accessToken: newAccessToken });
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
