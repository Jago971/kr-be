import express from "express";
import { verifyAccessToken } from "../middleware/verifyJWT";
import { getHome, getMessages, getTasks } from "../controllers/protectedController";

const router = express.Router();

router.get("/kind-remind/home", verifyAccessToken, getHome);
router.get("/kind-remind/tasks", verifyAccessToken, getTasks);
router.get("/kind-remind/messages", verifyAccessToken, getMessages);

export default router;