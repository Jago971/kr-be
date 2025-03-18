import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { settings } from "../config/settings";
import { hashPassword } from "../utils/hashPassword";
import { getDatabase } from "../services/databaseConnector";

export async function signUp(req: Request, res: Response) {
  const { username, email, password } = req.body;

  // Check if username, email, and password are provided
  if (!username || !email || !password) {
    res
      .status(400)
      .json({ message: "Username, email, and password are required" });
    return;
  }

  try {
    const db = await getDatabase();

    // Check if user already exists
    const [existingUser] = await db.query<RowDataPacket[]>(
      "SELECT username FROM users WHERE username = ? LIMIT 1;",
      [username]
    );

    if (existingUser.length > 0) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    // Insert user into database
    const result = await db.query<ResultSetHeader>(
      "INSERT INTO `users` (username, email, password) VALUES (?, ?, ?);",
      [username, email, hashedPassword]
    );

    // Create JWT token
    const token = jwt.sign(
      { userId: result[0].insertId },
      settings.jwt.secret,
      {
        expiresIn: "1h",
      }
    );

    // Set token in cookie
    res.cookie("kind-remind-login-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(201).json({ message: "Sign up successful", user: { username } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error signing up" });
  }
}

export async function logIn(req: Request, res: Response) {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const db = await getDatabase();

    // Get user from database
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, username, password FROM users WHERE username = ? LIMIT 1;",
      [username]
    );

    // Check if user exists
    if (rows.length === 0) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }

    const user = rows[0];

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid username or password" });
      return;
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, settings.jwt.secret, {
      expiresIn: "1h",
    });

    // Set token in cookie
    res.cookie("kind-remind-login-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(200).json({ message: "Log in successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
}

export function logOut(req: Request, res: Response) {
  res.clearCookie("kind-remind-login-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.status(200).json({ message: "Log out successful" });
}
