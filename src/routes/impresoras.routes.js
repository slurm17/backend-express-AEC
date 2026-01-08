import { Router } from "express";
import * as impresoraController from "../controllers/impresoras.controller.js";

const router = Router();
router.get("/", impresoraController.getImpresoras);
router.get("/:id", impresoraController.getImpresora);
router.post("/", impresoraController.createImpresora);
router.put("/:id", impresoraController.updateImpresora);
router.delete("/:id", impresoraController.deleteImpresora);

export default router;