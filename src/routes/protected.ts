import express from "express";
import { verifyAccessToken } from "../middleware/verifyJWT";
import { getDashboard, getHome, getMessages, getTasks } from "../controllers/protectedController";

const router = express.Router();

router.get("/kind-remind/home", verifyAccessToken, getHome);
router.get("/kind-remind/tasks", verifyAccessToken, getTasks);
router.get("/kind-remind/messages", verifyAccessToken, getMessages);

// dashbaord route
router.get("/kind-remind/dashboard", verifyAccessToken, getDashboard);

export default router;