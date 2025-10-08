// routes/eventos.js
import express from "express";
import { pool } from "../config/db.js"; // tu conexión a PostgreSQL

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      identificador,
      tipo_pase,
      nom_y_ap,
      tipo,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      offset = 0
    } = req.query;

    let query = `
      SELECT 
        re.dni AS documento,
        s.nom_y_ap,
        s.nro_socio,
        re.fecha_hora,
        re.tipo_pase,
        re.tipo,
        re.mensaje
      FROM reg_evento re
      LEFT JOIN socios s
        ON re.dni = s.documento::TEXT
      WHERE 1=1
    `;

    const params = [];
    let i = 1;

    // Filtro documento o nro_socio
    if (identificador) {
      query += `
        AND (
          s.documento::TEXT = $${i}
          OR s.nro_socio::TEXT = $${i}
          OR re.dni = $${i}
        )
      `;
      params.push(identificador);
      i++;
    }

    // Filtro tipo_pase
    if (tipo_pase) {
      query += ` AND re.tipo_pase ILIKE $${i}`;
      params.push(tipo_pase);
      i++;
    }

    // Filtro nom_y_ap (búsqueda parcial)
    if (nom_y_ap) {
      query += ` AND s.nom_y_ap ILIKE '%' || $${i} || '%'`;
      params.push(nom_y_ap);
      i++;
    }

    // Filtro tipo (E, S o ambos)
    if (tipo === "E" || tipo === "S") {
      query += ` AND re.tipo = $${i}`;
      params.push(tipo);
      i++;
    } else {
      query += " AND re.tipo IN ('E', 'S')";
    }

    // Filtro rango de fechas
    if (fecha_inicio) {
      query += ` AND re.fecha_hora::DATE >= $${i}`;
      params.push(fecha_inicio);
      i++;
    }

    if (fecha_fin) {
      query += ` AND re.fecha_hora::DATE <= $${i}`;
      params.push(fecha_fin);
      i++;
    }

    // Filtro rango de horas
    if (hora_inicio) {
      query += ` AND re.fecha_hora::TIME >= $${i}`;
      params.push(hora_inicio);
      i++;
    }

    if (hora_fin) {
      query += ` AND re.fecha_hora::TIME <= $${i}`;
      params.push(hora_fin);
      i++;
    }

    // Orden y paginación
    query += ` ORDER BY re.fecha_hora DESC LIMIT 50 OFFSET $${i}`;
    params.push(Number(offset));

    const { rows } = await pool.query(query, params);
    res.json(rows);

  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
});

export default router;
