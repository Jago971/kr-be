import express from "express";
import { verifyAccessToken } from "../middleware/verifyJWT";
import { getDashboard, getProfile } from "../controllers/protectedController";

const router = express.Router();

// dashbaord route
router.get("/kind-remind/dashboard", verifyAccessToken, getDashboard);
router.get("/kind-remind/profile", verifyAccessToken, getProfile);

export default router;