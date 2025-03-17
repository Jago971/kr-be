import { Request, Response } from "express";
import { getDatabase } from "../services/databaseConnector";

type User = {
  id: number;
  username: string;
};

async function getAllUsers(req: Request, res: Response) {
  try {
    const db = await getDatabase();
    const [result] = await db.query("SELECT * FROM users");
    const users = result as User[];
    db.end();
    res.json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching data from the users table:", error);
      console.error("Error details:", error.message); // Log the error message
    } else {
      console.error("An unknown error occurred:", error);
    }
    res.status(500).send("Internal server error");
  }
}

export { getAllUsers };
