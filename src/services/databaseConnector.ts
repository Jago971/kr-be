import mysql from "mysql2/promise";
import { settings } from "../config/settings";

const getDatabase = async (): Promise<mysql.Connection> => {
  return await mysql.createConnection(settings.db);
};

export { getDatabase };
