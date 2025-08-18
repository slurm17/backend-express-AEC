// src/routes/imagen.routes.ts
import { Router } from "express";
import * as imagenController from "../controllers/imagen.controller.js";

const router = Router();

// GET /imagenes → lista todas las imágenes
router.get("/", imagenController.getImagenes);

// GET /imagenes/:id → obtiene una imagen por ID
router.get("/:id", imagenController.getImagen);

// POST /imagenes → crea una nueva imagen
router.post("/", imagenController.createImagen);

// PUT /imagenes/:id → actualiza una imagen existente
router.put("/:id", imagenController.updateImagen);

// DELETE /imagenes/:id → elimina una imagen
router.delete("/:id", imagenController.deleteImagen);

export default router;
