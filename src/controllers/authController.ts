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

const responseTemplate = {
    status: "error",
    message: "",
    data: {},
};

export async function signUp(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({
            ...responseTemplate,
            message: "Username, email, and password are required",
        });
        return;
    }

    try {
        const db = await getDatabase();

        // Check if user already exists
        const userExists = await checkUserExists(db, username);

        if (userExists) {
            res.status(409).json({
                ...responseTemplate,
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

        const userId = result[0].insertId;

        res.status(201).json({
            status: "success",
            message: "User created successfully",
            data: {
                authentication: {
                    oldAccessToken: null,
                    newAccessToken: null,
                },
                payload: {
                    userId: userId,
                },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ...responseTemplate,
            message: "Server error",
        });
    }
}

export async function logIn(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        res.status(400).json({
            ...responseTemplate,
            message: "Username and password are required",
        });
        return;
    }

    try {
        const db = await getDatabase();

        // Check if user exists
        const userExists = await checkUserExists(db, username);

        if (!userExists) {
            res.status(400).json({
                ...responseTemplate,
                message: "User does not exist",
            });
            return;
        }

        // Get user data from database
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT id, username, password FROM users WHERE username = ? LIMIT 1;",
            [username]
        );

        const user = rows[0];

        // Check if password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({
                ...responseTemplate,
                message: "Invalid username or password",
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
            data: {
                authentication: {
                    oldAccessToken: null,
                    newAccessToken: accessToken,
                },
                payload: {
                    userId: user.id,
                },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ...responseTemplate,
            message: "Server error",
        });
    }
}

export function logOut(req: Request, res: Response): void {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });

    res.status(200).json({
        ...responseTemplate,
        status: "success",
        message: "Logout successful",
    });
}
