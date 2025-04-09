//#region Imports

import express from "express";
import { signup, login, logout, verifyEmail } from "./auth.controller";

//#endregion Imports

const router = express.Router();

router.post("/kind-remind/signup", signup);
router.post("/kind-remind/login", login);
router.post("/kind-remind/logout", logout);
router.post("/kind-remind/verify", verifyEmail);

export default router;
