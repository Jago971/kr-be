import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/auth.routes";
import protectedRoutes from "./user/user.routes";

const port = 3002;
const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE",
  credentials: true, // Allow cookies and credentials to be sent
};

dotenv.config(); // allows access of .env files in 'process'
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // allows reading of form data
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(authRoutes); // include the auth routes
app.use(protectedRoutes); // include the protected routes

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
