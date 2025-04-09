//#region Imports

import mysql, { Pool } from "mysql2/promise";
import { settings } from "../../config/settings";

//#endregion Imports

let pool: Pool;

export const getDatabase = (): Pool => {
  if (!pool) {
    pool = mysql.createPool(settings.db);
  }
  return pool;
};
