import { activarReleLibre } from "../services/relay-libre.service.js";

export const activarReleLibreController = async (req, res) => {
  try {
    const { puerto } = req.body;

    if (puerto === undefined) {
      return res.status(400).json({ success: false, error: "Falta el parámetro 'puerto'" });
    }

    const result = await activarReleLibre(puerto);
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error en el controller:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};
