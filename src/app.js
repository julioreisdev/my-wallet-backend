import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import postRoutes from "./routes/postRoutes.js";
import getRoutes from "./routes/getRoutes.js";

dotenv.config();
const app = express();
app.use(express.json(), cors());

app.use(postRoutes);
app.use(getRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server Running...");
});
