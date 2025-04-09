
import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "120s",
  });
};

export const generateRefreshToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "1d",
  });
};

export const generateVerificationToken = (userId: number) => {
  return jwt.sign({userId}, process.env.JWT_EMAIL_SECRET as string, {
    expiresIn: "1h"
  })
}
