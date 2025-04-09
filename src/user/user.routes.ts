//#region Imports

import express from "express";
import { verifyAccessToken } from "../common/middleware/validateJWT";
import { getDashboard, getProfile } from "./user.controller";

//#endregion Imports

const router = express.Router();

router.get("/kind-remind/dashboard", verifyAccessToken, getDashboard);
router.get("/kind-remind/profile", verifyAccessToken, getProfile);

export default router;
