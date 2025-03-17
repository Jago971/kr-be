import express from "express";
import cors from "cors";
import { getAllUsers } from "./controllers/userController";
import { signIn, signUp } from "./controllers/authController";

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/users", getAllUsers);
app.post("/signup", signUp);
app.post("/signin", signIn);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
