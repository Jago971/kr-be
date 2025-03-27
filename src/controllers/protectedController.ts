import { Request, Response } from "express";

const handleProtectedRoute = (req: Request, res: Response, pageName: string): void => {
  const userId = (req as any).user?.userId;
  const currentAccessToken = req.headers["authorization"]?.split(" ")[1];

  let newAccessToken: string | null = res.getHeader("Authorization")
    ? res.getHeader("Authorization")?.toString().split(" ")[1] ?? null
    : null;

  if (!userId) {
    res.status(401).json({
      status: "error",
      message: "User ID not found in token",
      userId: null,
      accessToken: null,
      newAccessToken: null,
      redirect: true,
    });
    return;
  }

  res.status(200).json({
    status: "success",
    message: `Welcome to your ${pageName} page, ${userId}`,
    userId: userId,
    accessToken: currentAccessToken,
    newAccessToken: newAccessToken,
    redirect: false,
  });
};

export const getHome = (req: Request, res: Response): void => handleProtectedRoute(req, res, "home");
export const getTasks = (req: Request, res: Response): void => handleProtectedRoute(req, res, "tasks");
export const getMessages = (req: Request, res: Response): void => handleProtectedRoute(req, res, "messages");