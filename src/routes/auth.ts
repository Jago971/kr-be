import express from "express";
import { signup, login, logout } from "../controllers/authController";

const router = express.Router();

router.post("/kind-remind/signup", signup);
router.post("/kind-remind/login", login);
router.post("/kind-remind/logout", logout);

export default router;
