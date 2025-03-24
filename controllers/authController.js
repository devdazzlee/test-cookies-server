import {
    generateAccessToken,
    generateRefreshToken,
    authenticateUser,
} from "../services/authService.js";

export const login = (req, res) => {
    const { email, password } = req.body;
    const user = authenticateUser(email, password);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set Refresh Token Cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Set Access Token Cookie (15 minutes)
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 15 * 60 * 1000,
    });

    res.json({ accessToken, refreshToken });
};
