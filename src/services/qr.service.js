import { pool } from "../config/db.js";

export const createCodigoQr = async (codigo, tipo, documento, id_invitado, fecha_emitido, fecha_venc, tarea) => {

  const query = `
    INSERT INTO codigo_qr (codigo, tipo, documento, id_invitado, fecha_emitido, fecha_venc, tarea)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [codigo, tipo, documento, id_invitado || null, fecha_emitido, fecha_venc, tarea || null];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const findCodigoQrByCodigo = async (codigo) => {
  const query = "SELECT * FROM codigo_qr WHERE codigo = $1";
  const values = [codigo];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};
