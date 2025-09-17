import { Router } from "express";
import * as configController from "../controllers/configuracion.controller.js";

const router = Router();

router.get("/", configController.getConfiguracionController);
router.post("/", configController.createConfiguracionController);
router.put("/", configController.updateConfiguracionController);

export default router;
