import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();
const app = express();
app.use(express.json(), cors());

app.use(postRoutes);

app.listen(process.env.PORT_SERVER, () => {
  console.log("Server Running...");
});
