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
import { sendEmailChange, sendEmailVerification, sendPasswordChange } from "./auth.email.service";
import { verifyAccessToken } from "../common/middleware/validateJWT";

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
  const { username, email, password, confirmPassword, profile_pic } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    res.status(400).json({
      ...responseTemplate,
      message: "Username, email, and password are required",
    });
    return;
  }

  if(password !== confirmPassword) {
    res.status(400).json({
      ...responseTemplate,
      message: "Password and Confirm-password do not match",
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
    await sendEmailVerification(email, veificationToken);

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
      await sendEmailVerification(user.email, veificationToken);

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
  const { token } = req.query;

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

//#region changeEmail

export async function changeEmail(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      ...responseTemplate,
      message: "Email is required",
    });
    return;
  }

  try {
    const userExists = await userModel.getByEmail(email);

    if (!userExists) {
      res.status(400).json({
        ...responseTemplate,
        message: "No account found with this email.",
      });
      return;
    }

    const verificationToken = generateVerificationToken(userExists.id);
    await sendEmailChange(email, verificationToken);

    res.status(200).json({
      status: "success",
      message: "Email update link sent to current email address.",
      data: {
        user: {
          userId: userExists.id,
          email: userExists.email,
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

//#endregion changeEmail

//#region updateEmail

export async function updateEmail(req: Request, res: Response): Promise<void> {
  const { token, oldEmail, newEmail } = req.body;

  if (!token || !oldEmail || !newEmail) {
    res.status(400).json({
      ...responseTemplate,
      message: "Token, old email, and new email are required",
    });
    return;
  }

  if (oldEmail === newEmail) {
    res.status(400).json({
      ...responseTemplate,
      message: "Old email and new email cannot be the same",
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

    const emailExists = await userModel.getByEmail(newEmail);
    if (emailExists) {
      res.status(409).json({
        ...responseTemplate,
        message: "Cannot use this email",
      });
      return;
    }

    await userModel.updateEmail(user.id, newEmail);
    res.status(200).json({
      status: "success",
      message: "Email updated successfully",
      data: {
        user: {
          userId: user.id,
          email: newEmail,
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

//#endregion updateEmail

//redgion changePassword

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      ...responseTemplate,
      message: "Email is required",
    });
    return;
  }

  try {
    const userExists = await userModel.getByEmail(email);

    if (!userExists) {
      res.status(400).json({
        ...responseTemplate,
        message: "No account found with this email.",
      });
      return;
    }

    const verificationToken = generateVerificationToken(userExists.id);
    await sendPasswordChange(email, verificationToken);

    res.status(200).json({
      status: "success",
      message: "Password update link sent to current email address.",
      data: {
        user: {
          userId: userExists.id,
          email: userExists.email,
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

// endregion changePassword

//#endregion Functions
