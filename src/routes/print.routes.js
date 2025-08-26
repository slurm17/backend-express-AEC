import { Router } from "express";
import { imprimirTicket } from "../controllers/print.controller.js";

const router = Router();
router.post("/", imprimirTicket);

export default router;
