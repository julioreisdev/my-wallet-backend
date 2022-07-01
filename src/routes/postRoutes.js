import { createUser, loginUser, transacaoUser } from "../controllers/userControllers.js";
import { Router } from "express";
import validateToken from "../middlewares/validateToken.js";

const router = Router();

router.post("/cadastro", createUser);
router.post("/login", loginUser);
router.post("/transacao", validateToken, transacaoUser);

export default router;
