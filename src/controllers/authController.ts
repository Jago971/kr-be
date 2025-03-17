import { Request, Response } from "express";
import hashPassword from "../utils/hashPassword";
import { getDatabase } from "../services/databaseConnector";
import { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcrypt";

async function signUp(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const db = await getDatabase();
    const [existingUser] = await db.query<RowDataPacket[]>(
      "SELECT username FROM users WHERE username = ? LIMIT 1;",
      [username]
    );

    if (existingUser.length > 0) {
      res.status(400).json({
        message: "User already exists",
        username: username,
        existingUser: existingUser[0],
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    await db.query("INSERT INTO `users` (username, password) VALUES (?, ?);", [
      username,
      hashedPassword,
    ]);
    res
      .status(201)
      .json({ message: "User created successfully", user: { username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
}

async function signIn(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const db = await getDatabase();
    
    const [user] = await db.query<RowDataPacket[]>(
      "SELECT username, password FROM users WHERE username = ? LIMIT 1;",
      [username]
    );

    if (user.length === 0) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }

    res.status(200).json({ message: "Login successful", user: { username: user } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
}

export { signUp, signIn };
