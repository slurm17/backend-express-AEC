// src/controllers/imagen.controller.ts
import type { Request, Response, NextFunction } from "express";
import * as imagenService from "../services/imagen.service.js"

export const getImagenes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const imagenes = await imagenService.getAllImagenes();
    res.json(imagenes);
  } catch (error) {
    next(error);
  }
};

export const getImagen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const imagen = await imagenService.getImagenById(id);
    if (!imagen) return res.status(404).json({ message: "Imagen no encontrada" });
    res.json(imagen);
  } catch (error) {
    next(error);
  }
};

export const createImagen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nuevaImagen = await imagenService.createImagen(req.body);
    res.status(201).json(nuevaImagen);
  } catch (error) {
    next(error);
  }
};

export const updateImagen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const imagenActualizada = await imagenService.updateImagen(id, req.body);
    if (!imagenActualizada) return res.status(404).json({ message: "Imagen no encontrada" });
    res.json(imagenActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteImagen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const eliminada = await imagenService.deleteImagen(id);
    if (!eliminada) return res.status(404).json({ message: "Imagen no encontrada" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
