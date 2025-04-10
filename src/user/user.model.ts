//#region Imports

import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDatabase } from "../common/database/connector";
import { hashPassword } from "../common/utils/password";

//#endregion Imports

//#region Interfaces

export interface User {
  id: number;
  verified: boolean;
  username: string;
  email: string;
  password: string;
  profile_pic: string;
}

//#endregion Interfaces

//#region UserModel

export class UserModel {
  //#region Constructor

  private db: Pool;

  constructor() {
    this.db = getDatabase(); // Use connection pool
  }

  //#endregion Constructor

  //#region GetUserById

  async getById(userId: number): Promise<User | null> {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        "SELECT id, username, email, password, profile_pic, verified FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
      return rows.length > 0 ? (rows[0] as User) : null;
    } catch (err) {
      console.error("Error in getById:", err);
      throw err;
    }
  }

  //#endregion GetUserById

  //#region GetUserByUsername

  async getByUsername(username: string): Promise<User | null> {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        "SELECT id, username, email, password, profile_pic, verified FROM users WHERE username = ? LIMIT 1",
        [username]
      );
      return rows.length > 0 ? (rows[0] as User) : null;
    } catch (err) {
      console.error("Error in getByUsername:", err);
      throw err;
    }
  }

  //#endregion GetUserByUsername

  //#region getUserByEmail

  async getByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        "SELECT id, username, email, password, profile_pic, verified FROM users WHERE email = ? LIMIT 1",
        [email]
      );
      return rows.length > 0 ? (rows[0] as User) : null;
    } catch (err) {
      console.error("Error in getByEmail:", err);
      throw err;
    }
  }

  //#endregion getUserByEmail

  //#region createUser

  async createUser(
    username: string,
    email: string,
    password: string,
    profile_pic: string
  ): Promise<number> {
    try {
      const hashedPassword = hashPassword(password);
      const [result] = await this.db.query<ResultSetHeader>(
        "INSERT INTO users (username, email, password, profile_pic, verified) VALUES (?, ?, ?, ?, ?)",
        [username, email, hashedPassword, profile_pic, false]
      );
      return result.insertId;
    } catch (err) {
      console.error("Error in createUser:", err);
      throw err;
    }
  }

  //#endregion createUser

  //#region checkVerification

  async checkVerification(userId: number): Promise<boolean> {
    try {
      const [rows] = await this.db.query<RowDataPacket[]>(
        "SELECT verified FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
      return rows.length > 0 ? (rows[0].verified as boolean) : false;
    } catch (err) {
      console.error("Error in checkVerification:", err);
      throw err;
    }
  }

  //#endregion checkVerification

  //#region VerifyUser

  async verifyUser(userId: number): Promise<void> {
    try {
      await this.db.query("UPDATE users SET verified = ? WHERE id = ?", [
        true,
        userId,
      ]);
    } catch (err) {
      console.error("Error in verifyUser:", err);
      throw err;
    }
  }

  //#endregion VerifyUser

  //#region updateEmail

  async updateEmail(userId: number, newEmail: string): Promise<void> {
    try {
      await this.db.query("UPDATE users SET email = ?, verified = false WHERE id = ?", [newEmail, userId]);
    } catch (error) {
      console.error("Error in updateEmail:", error);
      throw error;
    }
  }

  //#endregion updateEmail
}

//#endregion UserModel
