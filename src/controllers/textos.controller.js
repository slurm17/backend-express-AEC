import * as textoService from "../services/textos.service.js";

export const getTextos = async (req, res, next) => {
  try {
    const textos = await textoService.getAllTextos();
    res.json(textos);
  } catch (error) {
    next(error);
  }
};

export const getTexto = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const texto = await textoService.getTextoById(id);
    if (!texto) {return res.status(404).json({ message: "Texto no encontrado" });}
    res.json(texto);
  } catch (error) {
    next(error);
  }
};

export const createTexto = async (req, res, next) => {
  try {
    const nuevoTexto = await textoService.createTexto(req.body);
    res.status(201).json(nuevoTexto);
  } catch (error) {
    next(error);
  }
};

export const updateTexto = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const textoActualizado = await textoService.updateTexto(id, req.body);
    if (!textoActualizado) {return res.status(404).json({ message: "Texto no encontrado" });}
    res.json(textoActualizado);
  } catch (error) {
    next(error);
  }
};

export const deleteTexto = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const eliminado = await textoService.deleteTexto(id);
    if (!eliminado) {return res.status(404).json({ message: "Texto no encontrado" });}
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
