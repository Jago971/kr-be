import express from "express";
import { signUp, logIn, logOut } from "../controllers/authController";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", logOut);

export default router;