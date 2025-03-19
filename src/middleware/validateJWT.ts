import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { settings } from "../config/settings";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

interface JwtPayload {
  userId: string;
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['kind-remind-login-token'];
  console.log("token", token);

  if (!token) {
    console.log("redirecting at verify");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, settings.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.log("error", error)
    return res.redirect("/login");
  }
};
