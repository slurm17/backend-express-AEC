// socios.controller.js
import { findSocioByDni } from "../services/socios.service.js";

import { resetIngresoRestante } from "../services/socios.service.js";

// socios.controller.js
import { getSociosAccess } from "../services/socios.service.js";

export const getSociosAccessController = async (req, res) => {
  try {
    const { dni } = req.params; // o req.query.dni, según cómo definas la ruta

    if (!dni) {
      return res.status(400).json({ error: "DNI requerido" });
    }

    const socio = await getSociosAccess(dni);

    if (!socio) {
      return res.status(404).json({ error: "Socio no encontrado" });
    }

    return res.json(socio);
  } catch (error) {
    console.error("Error en getSociosAccessController:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateIngresoRestante = async (req, res) => {
  const { dni } = req.params;
  const { nuevoValor } = req.body;

  try {
    if (nuevoValor === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Debes enviar el nuevo valor de ingreso_restante",
      });
    }

    const socioActualizado = await resetIngresoRestante(dni, nuevoValor);

    if (!socioActualizado) {
      return res.status(404).json({
        status: "error",
        message: `No se encontró socio con documento ${dni}`,
      });
    }

    return res.json({ status: "ok", data: socioActualizado });
  } catch (error) {
    console.error("Error en updateIngresoRestante:", error.message);
    return res.status(500).json({ status: "error", message: "Error al actualizar socio" });
  }
};


export const getSocio = async (req, res) => {
  const { dni } = req.params;

  try {
    const socio = await findSocioByDni(dni);
    if (!socio) {
      return res.status(404).json({ 
        status: "error", 
        message: `No se encontró socio con documento ${dni}` 
      });
    }

    return res.json({ status: "ok", data: socio });
  } catch (error) {
    console.error("Error en getSocio:", error.message);
    return res.status(500).json({ status: "error", message: "Error del servidor" });
  }
};

import { createSocio } from "../services/socios.service.js";

export const addSocio = async (req, res) => {
  const { documento, nom_y_ap, estado, nro_socio, fecha_estado, ingreso_restante } = req.body;

  try {
    if (!documento || !nom_y_ap || estado === undefined || !nro_socio || !fecha_estado || ingreso_restante === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Faltan datos obligatorios",
      });
    }

    const nuevoSocio = await createSocio({
      documento,
      nom_y_ap,
      estado,
      nro_socio,
      fecha_estado,
      ingreso_restante,
    });

    return res.status(201).json({ status: "ok", data: nuevoSocio });
  } catch (error) {
    if (error.message.includes("ya existe")) {
      return res.status(409).json({ status: "error", message: error.message }); // 409 Conflict
    }

    console.error("Error en addSocio:", error.message);
    return res.status(500).json({ status: "error", message: "Error al crear socio" });
  }
};

