import express from 'express';
import cors from 'cors';
import { getAllUsers } from './controllers/userController';

const app = express();
const port = 3002;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
  }));

// Simple test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/users", getAllUsers)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
