//#region Imports

import express from "express";
import { signup, login, logout, verifyEmail, changeEmail, updateEmail } from "./auth.controller";
import { verifyAccessToken } from "../common/middleware/validateJWT";

//#endregion Imports

const router = express.Router();

router.post("/kind-remind/signup", signup);
router.post("/kind-remind/login", login);
router.post("/kind-remind/logout", logout);
router.post("/kind-remind/update-email", updateEmail);
router.post("/kind-remind/change-email", verifyAccessToken, changeEmail);

router.get("/kind-remind/verify-email", verifyEmail);

export default router;
