import { Request, Response } from "express";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { settings } from "../config/settings";
import { hashPassword } from "../utils/hashPassword";
import { getDatabase } from "../services/databaseConnector";

export async function signUp(req: Request, res: Response) {
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

export async function signIn(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const db = await getDatabase();

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, username, password FROM users WHERE username = ? LIMIT 1;",
      [username]
    );

    if (rows.length === 0) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, settings.jwt.secret, {
      expiresIn: "1h",
    });

    res.cookie("kind-remind-login-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
