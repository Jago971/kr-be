import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket, Connection } from "mysql2/promise";
import bcrypt from "bcryptjs";

import { hashPassword } from "../utils/hashPassword";
import { getDatabase } from "../services/databaseConnector";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateJWT";

async function checkUserExists(
  db: Connection,
  username: string
): Promise<boolean> {
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
    res.status(400).json({
      status: "error",
      message: "Username, email, and password are required",
      redirect: false,
    });
    return;
  }

  try {
    const db = await getDatabase();

    // Check if user already exists
    const userExists = await checkUserExists(db, username);

    if (userExists) {
      res.status(400).json({
        status: "error",
        message: "User already exists",
        redirect: true,
      });
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
      status: "success",
      message: "User created successfully",
      redirect: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error signing up",
      redirect: false,
    });
  }
}

export async function logIn(req: Request, res: Response) {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    res.status(400).json({
      status: "error",
      message: "Username and password are required",
      userId: null,
      accessToken: null,
    });
    return;
  }

  try {
    const db = await getDatabase();

    // Check if user already exists
    const userExists = await checkUserExists(db, username);

    if (!userExists) {
      res.status(400).json({
        status: "error",
        message: "User does not exist",
        userId: null,
        accessToken: null,
        redirect: false,
      });
      return;
    }

    // Get user from database
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, username, password FROM users WHERE username = ? LIMIT 1;",
      [username]
    );

    // Check if user exists
    if (rows.length === 0) {
      res.status(400).json({
        status: "error",
        message: "Invalid username or password",
        userId: null,
        accessToken: null,
        redirect: false,
      });
      return;
    }

    const user = rows[0];

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        status: "error",
        message: "Invalid username or password",
        userId: null,
        accessToken: null,
        redirect: false,
      });
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
    res.status(200).json({
      status: "success",
      message: "Login successful",
      userId: user.id,
      accessToken: accessToken,
      redirect: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error logging in",
      userId: null,
      accessToken: null,
      redirect: false,
    });
  }
}

export function logOut(req: Request, res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production
    sameSite: "strict",
    path: "/", // Ensure it matches the original cookie's path
  });

  res.status(200).json({ status: "success", message: "Logout successful" });
}
