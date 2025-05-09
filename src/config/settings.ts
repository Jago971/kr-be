import dotenv from "dotenv";
dotenv.config();

const settings = {
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "test",
    port: Number(process.env.DB_PORT) || 3307,
  },
  jwt: {
    accesSecret: process.env.JWT_ACCESS_SECRET || "default-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "default-secret",
  },
};

export { settings };