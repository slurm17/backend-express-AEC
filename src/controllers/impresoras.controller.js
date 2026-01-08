import * as impresoraService from "../services/impresoras.service.js";

export const getImpresoras = async (req, res, next) => {
  try {
    const impresoras = await impresoraService.getAllImpresoras();
    res.json(impresoras);
  } catch (error) {
    next(error);
  }
};

export const getImpresora = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const impresora = await impresoraService.getImpresoraById(id);
    if (!impresora) {
      return res.status(404).json({ message: "Impresora no encontrada" });
    }
    res.json(impresora);
  } catch (error) {
    next(error);
  }
};

export const createImpresora = async (req, res, next) => {
  try {
    const nuevaImpresora = await impresoraService.createImpresora(req.body);
    res.status(201).json(nuevaImpresora);
  } catch (error) {
    next(error);
  }
};

export const updateImpresora = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const impresoraActualizada = await impresoraService.updateImpresora(id, req.body);
    if (!impresoraActualizada) {
      return res.status(404).json({ message: "Impresora no encontrada" });
    }
    res.json(impresoraActualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteImpresora = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const eliminado = await impresoraService.deleteImpresora(id);
    if (!eliminado) {
      return res.status(404).json({ message: "Impresora no encontrada" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
