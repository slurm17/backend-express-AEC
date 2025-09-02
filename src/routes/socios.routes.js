import { Router } from "express";
import * as socioController from "../controllers/socios.controller.js";

const router = Router();

router.patch("/:dni/ingreso-restante", socioController.updateIngresoRestante);
router.get("/:dni", socioController.getSocio);

export default router;