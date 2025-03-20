import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket, Connection } from "mysql2/promise";
import bcrypt from "bcryptjs";

import { hashPassword } from "../utils/hashPassword";
import { getDatabase } from "../services/databaseConnector";
import { generateAccessToken, generateRefreshToken } from "../utils/generateJWT";

async function checkUserExists(db: Connection, username: string): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT username FROM users WHERE username = ? LIMIT 1;",
    [username]
  );

  return rows.length > 0;
}

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
    const userExists = await checkUserExists(db, username);

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    // Insert user into database
    const result = await db.query<ResultSetHeader>(
      "INSERT INTO `users` (username, email, password) VALUES (?, ?, ?);",
      [username, email, hashedPassword]
    );

    const userId = result[0].insertId;
    res.status(201).json({
      message: "User created successfully.",
      userId,
    });
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

    // Check if user already exists
    const userExists = await checkUserExists(db, username);

    if (!userExists) {
      res.status(400).json({ message: "User does not exist. Sign up" });
      return;
    }

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

    // Create JWT tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login successful", accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
}

export function logOut(req: Request, res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production
    sameSite: "strict",
    path: "/", // Ensure it matches the original cookie's path
  });

  res.status(200).json({ message: "Logout successful" });
}
