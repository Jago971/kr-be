import { Request, Response } from "express";
import { getDatabase } from "../services/databaseConnector";

const responseTemplate = {
  status: "error",
  message: "",
  data: {},
};

export const getDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
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
          tasks: tasks[0],
          messages: messages[0],
          receivedMessages: receivedMessages[0],
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

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const [profileRows] = await db.query<any[]>(
      "SELECT username, email, profile_pic FROM users WHERE id = ?",
      [userId]
    );

    const profile = profileRows[0];

    res.status(200).json({
      status: "success",
      message: `Welcome to your dashboard page, user: ${userId}`,
      data: {
        authentication: {
          oldAccessToken: currentAccessToken,
          newAccessToken: newAccessToken,
        },
        payload: {
          user: {
            userId: userId,
            username: profile.username,
            email: profile.email,
            profile_pic: profile.profile_pic
          },
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
