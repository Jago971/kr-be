import express from "express";
import cors from "cors";
import { getAllUsers } from "./controllers/userController";
import { logout, signIn, signUp } from "./controllers/authController";

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://localhost:5173", // Allow only this origin
  methods: "GET, POST, PUT, DELETE", // Allow these HTTP methods
  credentials: true, // Allow cookies and credentials to be sent
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/users", getAllUsers);
app.post("/signup", signUp);
app.post("/signin", signIn);
app.post("/logout", logout);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
