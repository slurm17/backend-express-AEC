import { activarRele } from "../services/relay.service.js";

export const activarReleController = async (req, res) => {
  try {
    const { puerto } = req.body;

    if (puerto === undefined) {
      return res.status(400).json({ success: false, error: "Falta el parámetro 'puerto'" });
    }

    const result = await activarRele(puerto);
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error en el controller:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};
