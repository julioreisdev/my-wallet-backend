import { createUser, loginUser } from "../controllers/userControllers.js";
import { Router } from "express";

const router = Router();

router.post("/cadastro", createUser);
router.post("/login", loginUser);

export default router;
