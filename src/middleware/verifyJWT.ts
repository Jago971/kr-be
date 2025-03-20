import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/generateJWT";

interface User {
  userId: number;
}

// Middleware to verify the access token
export function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.headers["authorization"]?.split(" ")[1];
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    res.status(401).json({ message: "Access token missing" });
    return;
  }

  jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as string, (err: any, decoded: any) => {
    if (err && err.name === "TokenExpiredError") {
      // Access token has expired, check for refresh token
      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token missing" });
        return;
      }

      // If refresh token exists, verify it and generate a new access token
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (refreshErr: any, refreshDecoded: any) => {
        if (refreshErr) {
          res.status(403).json({ message: "Invalid refresh token" });
          return;
        }

        // If refresh token is valid, generate a new access token
        const newAccessToken = generateAccessToken(refreshDecoded.userId);
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        (req as any).user = refreshDecoded as User; // Attach the decoded user info to the request object
        return next();
      });
      return;
    }

    if (err) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }

    (req as any).user = decoded as User; // Attach user data to request
    next();
  });
}
