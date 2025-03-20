import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface User {
  userId: number;
}

export function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.headers["authorization"]?.split(" ")[1];

  if(!accessToken) {
    res.status(401).json({message: "Acceess token missing"});
    return;
  }

  jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as string, (err: any, decoded: any) => {
    if (err) {
      console.log("accessToken", accessToken)
      console.log("access-secret", process.env.JWT_ACCESS_SECRET)
      res.status(403).json({message: "Invalid or expired token"});
      return;
    }
    (req as any).user = decoded as User;
    next();
  })
}






// export async function verifyJWT(req: Request, res: Response) {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     res.status(401).json({ message: "No token" });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(
//       refreshToken,
//       process.env.JWT_REFRESH_SECRET as string
//     );
//     const userId = (decoded as any).userId;
//     const accessToken = generateAccessToken(userId);
//     res.json({ accessToken });
//   } catch (err) {
//     res.status(403).json({ message: "Invalid token" });
//   }
// }
