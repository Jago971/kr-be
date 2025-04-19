//#region Imports

import express from "express";
import { signup, login, logout, verifyEmail, changeEmail, updateEmail, changePassword } from "./auth.controller";
import { verifyAccessToken } from "../common/middleware/validateJWT";

//#endregion Imports

const router = express.Router();

router.post("/kind-remind/signup", signup);
router.post("/kind-remind/login", login);
router.post("/kind-remind/logout", logout);
router.post("/kind-remind/update-email", updateEmail); // user form submitted to update email
router.post("/kind-remind/change-email", verifyAccessToken, changeEmail); // when an update request is sent, will verify access then send a email-change email
router.post("/kind-remind/verify-email", verifyAccessToken, changePassword); // when a user clicks the link in the email, this will verify the token and update the email in the database

router.get("/kind-remind/verify-email", verifyEmail);

export default router;
