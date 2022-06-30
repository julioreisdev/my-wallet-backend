import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createUser, loginUser } from "./controllers/userControllers.js";

dotenv.config();
const app = express();
app.use(express.json(), cors());

app.post("/cadastro", createUser);
app.post("/login", loginUser);

app.listen(process.env.PORT_SERVER, () => {
  console.log("Server Running...");
});
