import express, { Request, Response } from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { getAllUsers } from "./controllers/userController";
import { logOut, logIn, signUp } from "./controllers/authController";
import { verifyJWT } from './middleware/validateJWT';

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE",
  credentials: true, // Allow cookies and credentials to be sent
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.get("/users", getAllUsers);
app.post("/signup", signUp);
app.post("/login", logIn);
app.post("/logout", logOut);

app.get('/', verifyJWT, (req: Request, res: Response) => {
  if (!req.user) {
    res.redirect("/login");
    return;
  }
  
  const userId = req.user.userId;
  res.status(200).json({ message: `Welcome to your profile, user ${userId}`, userId: userId });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
