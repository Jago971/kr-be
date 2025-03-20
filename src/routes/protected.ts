import express from "express";
import { verifyAccessToken } from "../middleware/validateJWT";

const router = express.Router();

// Protected route
router.get("/home", verifyAccessToken, (req, res) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    res.status(401).json({ message: "User ID not found in token" });
    return;
  }

  res.status(200).json({ message: `Welcome to your home page ${userId}` });
});

export default router;
