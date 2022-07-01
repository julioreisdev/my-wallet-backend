import { transacoesUser } from "../controllers/userControllers.js";
import { Router } from "express";
import validateToken from "../middlewares/validateToken.js";

const router = Router();

router.get("/transacoes", validateToken, transacoesUser);

export default router;
