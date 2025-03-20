import express from "express";
import { verifyAccessToken } from "../middleware/verifyJWT";

const router = express.Router();

// Protected route
router.get("/home", verifyAccessToken, (req, res) => {
  const userId = (req as any).user?.userId;
  const currentAccessToken = req.headers["authorization"]?.split(" ")[1];
  
  let newAccessToken: string | null = res.getHeader("Authorization")
  ? res.getHeader("Authorization")?.toString().split(" ")[1] ?? null
  : null;

  if (!userId) {
    res.status(401).json({ message: "User ID not found in token" });
    return;
  }

  res.status(200).json({
    message: `Welcome to your home page ${userId}`,
    userId: userId,
    accessToken: currentAccessToken, // Original access token (if valid)
    newAccessToken: newAccessToken, // New access token (if expired and refreshed)
  });
});

router.get("/tasks", verifyAccessToken, (req, res) => {
  const userId = (req as any).user?.userId;
  const currentAccessToken = req.headers["authorization"]?.split(" ")[1];
  
  let newAccessToken: string | null = res.getHeader("Authorization")
  ? res.getHeader("Authorization")?.toString().split(" ")[1] ?? null
  : null;

  if (!userId) {
    res.status(401).json({ message: "User ID not found in token" });
    return;
  }

  res.status(200).json({
    message: `Welcome to your tasks page ${userId}`,
    userId: userId,
    accessToken: currentAccessToken, // Original access token (if valid)
    newAccessToken: newAccessToken, // New access token (if expired and refreshed)
  });
});

router.get("/messages", verifyAccessToken, (req, res) => {
  const userId = (req as any).user?.userId;
  const currentAccessToken = req.headers["authorization"]?.split(" ")[1];
  
  let newAccessToken: string | null = res.getHeader("Authorization")
  ? res.getHeader("Authorization")?.toString().split(" ")[1] ?? null
  : null;

  if (!userId) {
    res.status(401).json({ message: "User ID not found in token" });
    return;
  }

  res.status(200).json({
    message: `Welcome to your messages page ${userId}`,
    userId: userId,
    accessToken: currentAccessToken, // Original access token (if valid)
    newAccessToken: newAccessToken, // New access token (if expired and refreshed)
  });
});

export default router;
