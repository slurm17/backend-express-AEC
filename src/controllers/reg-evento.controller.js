// controllers/regEvento.controller.ts
import * as regEventoService from "../services/regEvento.service";

export const getEventos = async (req, res) => {
  try {
    const eventos = await regEventoService.getAllEventos();
    res.json(eventos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener los eventos" });
  }
};

export const postEvento = async (req, res) => {
  try {
    const newEvento = await regEventoService.createEvento(req.body);
    res.status(201).json(newEvento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear el evento" });
  }
};
