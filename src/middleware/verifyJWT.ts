import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/generateJWT";

// Extend Request interface to include user and accessToken
interface AuthenticatedRequest extends Request {
  user?: { userId: number };
  accessToken?: string;
}

// Middleware to verify the access token
export function verifyAccessToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const accessToken = req.headers["authorization"]?.split(" ")[1];
  const refreshToken = req.cookies.refreshToken;

  // Standard response shape
  const responseTemplate = {
    status: "error",
    message: "",
    userId: null,
    accessToken: null,
    newAccessToken: null,
    redirect: true
  };

  if (!accessToken) {
    res.status(401).json({ ...responseTemplate, message: "Access token missing" });
    return;
  }

  jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as string, (err: any, decoded: any) => {
    if (err && err.name === "TokenExpiredError") {
      if (!refreshToken) {
        res.status(401).json({ ...responseTemplate, message: "Refresh token missing" });
        return;
      }

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (refreshErr: any, refreshDecoded: any) => {
        if (refreshErr) {
          res.status(403).json({ ...responseTemplate, message: "Invalid refresh token" });
          return;
        }

        // If refresh token is valid, generate a new access token
        const newAccessToken = generateAccessToken(refreshDecoded.userId);
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);

        req.user = { userId: refreshDecoded.userId };
        req.accessToken = newAccessToken;

        next();
        return;
      });
      return;
    }

    if (err) {
      res.status(403).json({ ...responseTemplate, message: "Invalid or expired token" });
      return;
    }

    req.user = { userId: decoded.userId };
    req.accessToken = accessToken;

    next();
    return;
  });
}
