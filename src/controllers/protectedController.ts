import { Request, Response } from "express";
import { getDatabase } from "../services/databaseConnector";
import { Connection } from "mysql2";

const responseTemplate = {
  status: "error",
  message: "",
  data: {},
};

const handleProtectedRoute = (
  req: Request,
  res: Response,
  pageName: string
): void => {
  const userId = (req as any).user?.userId;
  const currentAccessToken = req.headers["authorization"]?.split(" ")[1];

  let newAccessToken: string | null = res.getHeader("Authorization")
    ? res.getHeader("Authorization")?.toString().split(" ")[1] ?? null
    : null;

  if (!userId) {
    res.status(401).json({
      ...responseTemplate,
      message: "User ID not found in token",
    });
    return;
  }

  res.status(200).json({
    status: "success",
    message: `Welcome to your ${pageName} page, ${userId}`,
    data: {
      authentication: {
        oldAccessToken: currentAccessToken,
        newAccessToken: newAccessToken,
      },
      payload: {
        userId: userId,
      },
    },
  });
};

const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.userId;
  const currentAccessToken = req.headers["authorization"]?.split(" ")[1];

  let newAccessToken: string | null = res.getHeader("Authorization")
    ? res.getHeader("Authorization")?.toString().split(" ")[1] ?? null
    : null;

  if (!userId) {
    res.status(401).json({
      ...responseTemplate,
      message: "User ID not found in token",
    });
    return;
  }

  try {
    const db = await getDatabase();

    const tasks = await db.query(
      `
        SELECT title, content
        FROM tasks
        WHERE owner_id = ?;
    `,
      [userId]
    );

    const messages = await db.query(
        `
        SELECT title, content, recipient_id
        FROM messages
        WHERE owner_id = ?;
    `,
      [userId]
    );

    const receivedMessages = await db.query(
        `
        SELECT title, content
        FROM messages
        WHERE recipient_id = ?;
    `,
      [userId]
    );

    res.status(200).json({
      status: "success",
      message: `Welcome to your dashboard page, user: ${userId}`,
      data: {
        authentication: {
          oldAccessToken: currentAccessToken,
          newAccessToken: newAccessToken,
        },
        payload: {
          userId: userId,
          tasks: tasks[0],
          messages: messages[0],
          receivedMessages: receivedMessages[0]
        },
      },
    });
  } catch (error) {
    res.json({
      message: "error accessing tasks",
      error: error,
    });
  }
};

export const getHome = (req: Request, res: Response): void =>
  handleProtectedRoute(req, res, "home");
export const getTasks = (req: Request, res: Response): Promise<void> =>
  getDashboardData(req, res);
export const getMessages = (req: Request, res: Response): void =>
  handleProtectedRoute(req, res, "messages");

// protect dashboard route
export const getDashboard = (req: Request, res: Response): Promise<void> =>
  getDashboardData(req, res);
