import { getConfiguracion, createConfiguracion, updateConfiguracion } from "../services/configuracion.service.js";

// GET /configuracion
export const getConfiguracionController = async (req, res) => {
  try {
    const config = await getConfiguracion();
    if (!config) {
      return res.status(404).json({ message: "Configuración no encontrada" });
    }
    res.json(config);
  } catch (err) {
    console.error("Error al obtener configuración:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// POST /configuracion
export const createConfiguracionController = async (req, res) => {
  try {
    const { venc_pase_hs, pase_permitidos, duracion_img_seg } = req.body;
    const config = await createConfiguracion({ venc_pase_hs, pase_permitidos, duracion_img_seg });
    res.status(201).json(config);
  } catch (err) {
    console.error("Error al crear configuración:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// PUT /configuracion
export const updateConfiguracionController = async (req, res) => {
  try {
    const { venc_pase_hs, pase_permitidos, duracion_img_seg } = req.body;
    const config = await updateConfiguracion({ venc_pase_hs, pase_permitidos, duracion_img_seg });
    res.json(config);
  } catch (err) {
    console.error("Error al actualizar configuración:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
