import express from "express";
import { signUp, logIn, logOut } from "../controllers/authController";

const router = express.Router();

router.post("/kind-remind/signup", signUp);
router.post("/kind-remind/login", logIn);
router.post("/kind-remind/logout", logOut);

export default router;