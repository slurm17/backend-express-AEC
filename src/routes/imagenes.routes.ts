// src/routes/imagen.routes.ts
import { Router } from "express";
import * as imagenController from "../controllers/imagen.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", imagenController.getImagenes);
router.get("/:id", imagenController.getImagen);
router.post("/", upload.single("file"), imagenController.createImagen);
router.put("/:id", upload.single("file"), imagenController.updateImagen);
router.delete("/:id", imagenController.deleteImagen);

export default router;
