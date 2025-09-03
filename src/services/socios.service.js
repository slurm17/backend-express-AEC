// socios.service.js
import fetch from "node-fetch"; // solo si Node <18
import { pool } from "../config/db.js"; // asumo que tenés el pool de pg configurado

export const findSocioByDni = async (dni) => {
  const query = "SELECT * FROM socios WHERE documento = $1";
  const values = [dni];
  const result = await pool.query(query, values);
  return result.rows[0] || null; // retorna el socio o null si no existe
};

export const resetIngresoRestante = async (dni, nuevoValor) => {
  const query = `
    UPDATE socios
    SET ingreso_restante = $1
    WHERE documento = $2
    RETURNING *;
  `;
  const values = [nuevoValor, dni];

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};


const dataFakeSocio = `
{
  "status": "ok",
  "data": {
    "num_socio": "17",
    "nombre": "JUAN GUSTAVO SOSA",
    "estado_socio": "0",
    "fecha_estado": "2025-09-06 00:00:00"
  }
}
`;
const USE_FAKE = true; // 🔥 cambia a false para usar la API real

export const getSociosAccess = async (dni) => {
    if (USE_FAKE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const data = JSON.parse(dataFakeSocio);
          resolve(data.data);
        }, 300); // delay opcional
      });
    }
    const response = await fetch(`${process.env.API_URL}?id=${dni}`);
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

export const createSocio = async (socio) => {
  // 1. Verificar si ya existe
  const checkQuery = "SELECT documento FROM socios WHERE documento = $1";
  const checkResult = await pool.query(checkQuery, [socio.documento]);

  if (checkResult.rows.length > 0) {
    throw new Error(`El socio con documento ${socio.documento} ya existe`);
  }

  // 2. Insertar nuevo socio
  const insertQuery = `
    INSERT INTO socios (documento, nom_y_ap, estado, nro_socio, fecha_estado, ingreso_restante)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    socio.documento,
    socio.nom_y_ap,
    socio.estado,
    socio.nro_socio,
    socio.fecha_estado,
    socio.ingreso_restante,
  ];

  const result = await pool.query(insertQuery, values);
  return result.rows[0];
};
