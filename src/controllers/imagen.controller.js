import * as imagenService from "../services/imagen.service.js";
import fs from "fs";
import path from "path";

export const getImagenes = async (req, res, next) => {
  try {
    const imagenes = await imagenService.getAllImagenes();
    res.json(imagenes);
  } catch (error) {
    next(error);
  }
};

export const getImagen = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const imagen = await imagenService.getImagenById(id);
    if (!imagen) {return res.status(404).json({ message: "Imagen no encontrada" });}
    res.json(imagen);
  } catch (error) {
    next(error);
  }
};

export const createImagen = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {return res.status(400).json({ message: "Archivo de imagen requerido" });}

    const nuevaImagen = await imagenService.createImagen({
      url: `/uploads/${file.filename}`,
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      activa: req.body.activa === "true",
      orden: Number(req.body.orden),
    });

    res.status(201).json(nuevaImagen);
  } catch (error) {
    next(error);
  }
};

export const updateImagen = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const file = req.file;
    const url = req.body.url;

    if (!file && !url) {return res.status(400).json({ message: "Archivo de imagen requerido" });}

      const data = {
        url: file ? `/uploads/${file.filename}` : url,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        activa: req.body.activa === "true",
        orden: Number(req.body.orden),
      };
    

    const imagenActualizada = await imagenService.updateImagen(id, data);
    
    if (!imagenActualizada) {return res.status(404).json({ message: "Imagen no encontrada" });}

    res.json(imagenActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteImagen = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const eliminada = await imagenService.deleteImagen(id);
    if (!eliminada) {return res.status(404).json({ message: "Imagen no encontrada" });}
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
