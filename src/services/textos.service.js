// src/services/texto.service.ts
import { pool } from '../config/db.js'

export const getAllTextos = async () => {
  const result = await pool.query("SELECT * FROM textos ORDER BY orden ASC");
  return result.rows;
};

export const getTextoById = async (id) => {
  const result = await pool.query("SELECT * FROM textos WHERE id = $1", [id]);
  return result.rows[0] || null;
};

export const createTexto = async (data) => {
  const { contenido, orden, activo = true } = data;
  const result = await pool.query(
    "INSERT INTO textos (contenido, orden, activo) VALUES ($1, $2, $3) RETURNING *",
    [contenido, orden, activo]
  );
  return result.rows[0];
};

export const updateTexto = async (id, data) => {
  const { contenido, orden, activo } = data;
  const result = await pool.query(
    `UPDATE textos 
     SET contenido = COALESCE($1, contenido),
         orden = COALESCE($2, orden),
         activo = COALESCE($3, activo)
     WHERE id = $4
     RETURNING *`,
    [contenido, orden, activo, id]
  );
  return result.rows[0] || null;
};

export const deleteTexto = async (id) => {
  const result = await pool.query("DELETE FROM textos WHERE id = $1 RETURNING id", [id]);
  return (result.rowCount ?? 0) > 0;
};
