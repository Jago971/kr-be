//#region Imports

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../user/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
} from "../common/utils/JWT";
import { sendVerificationEmail } from "./auth.email.service";

//#endregion Imports

//#region Constants

const responseTemplate = {
  status: "error",
  message: "",
  data: {},
};

const userModel = new UserModel();

//#endregion Constants

//#region Functions

//#region signup

export async function signup(req: Request, res: Response): Promise<void> {
  const { username, email, password, profile_pic } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({
      ...responseTemplate,
      message: "Username, email, and password are required",
    });
    return;
  }

  try {
    const existingUser = await userModel.getByEmail(email);
    if (existingUser) {
      res.status(409).json({
        ...responseTemplate,
        message: "Email already exists",
      });
      return;
    }

    const userId = await userModel.createUser(
      username,
      email,
      password,
      profile_pic
    );

    const veificationToken = generateVerificationToken(userId);
    await sendVerificationEmail(email, veificationToken);

    res.status(201).json({
      status: "success",
      message: "User created successfully. Please verify your email.",
      data: {
        user: {
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

//#endregion signup

//#region login

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      ...responseTemplate,
      message: "Username and password are required",
    });
    return;
  }

  try {
    const user = await userModel.getByUsername(username);

    if (!user) {
      res.status(400).json({
        ...responseTemplate,
        message: "User does not exist",
      });
      return;
    }

    if (!user.verified) {
      const veificationToken = generateVerificationToken(user.id);
      await sendVerificationEmail(user.email, veificationToken);

      res.status(401).json({
        ...responseTemplate,
        message: "User not verified",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        ...responseTemplate,
        message: "Invalid username or password",
      });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

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
        user: {
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

//#endregion login

//#region logout

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  console.log("refreshToken cookie cleared");

  res.status(200).json({
    ...responseTemplate,
    status: "success",
    message: "Logout successful",
  });
}

//#endregion logout

//#region verifyEmail

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({
      ...responseTemplate,
      message: "Token is missing",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_EMAIL_SECRET as string
    ) as { userId: number };

    const user = await userModel.getById(decoded.userId);
    if (!user) {
      res.status(400).json({
        ...responseTemplate,
        message: "User not found",
      });
      return;
    }

    if (user.verified) {
      res.status(400).json({
        ...responseTemplate,
        message: "User already verified",
      });
      return;
    }

    await userModel.verifyUser(user.id);
    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
      data: {
        user: {
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

//#endregion verifyEmail

//#endregion Functions
