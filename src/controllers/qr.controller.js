import { findCodigoQrByCodigo, createCodigoQr } from "../services/qr.service.js";

export const getCodigoQr = async (req, res) => {
  try {
    const { codigo } = req.params;
    const data = await findCodigoQrByCodigo(codigo);

    if (!data) {
      return res.status(404).json({ message: "Código QR no encontrado" });
    }

    res.json({ status: "ok", data });
  } catch (error) {
    console.error("Error al buscar código QR:", error);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
};

export const postCodigoQr = async (req, res) => {
  try {
    const { codigo, tipo, documento, id_invitado, fecha_emitido, fecha_venc, tarea } = req.body;

    if (!codigo || !tipo || !documento || !fecha_venc) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const nuevoCodigoQr = await createCodigoQr(
      codigo,
      tipo,
      documento,
      id_invitado,
      fecha_emitido,
      fecha_venc,
      tarea
    );

    res.status(201).json({ status: "ok", data: nuevoCodigoQr });
  } catch (error) {
    console.error("Error al crear código QR:", error);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
};
