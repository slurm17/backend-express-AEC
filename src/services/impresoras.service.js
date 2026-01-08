import { pool } from "../config/db.js";

export const getAllImpresoras = async () => {
  const result = await pool.query("SELECT * FROM impresoras ORDER BY id");
  return result.rows;
};

export const getImpresoraById = async (id) => {
  const result = await pool.query("SELECT * FROM impresoras WHERE id = $1", [id]);
  return result.rows[0];
};

export const createImpresora = async ({ nombre, ip, puerto }) => {
  const result = await pool.query(
    "INSERT INTO impresoras (nombre, ip, puerto) VALUES ($1, $2, $3) RETURNING *",
    [nombre, ip, puerto]
  );
  return result.rows[0];
};

export const updateImpresora = async (id, { nombre, ip, puerto }) => {
  const result = await pool.query(
    "UPDATE impresoras SET nombre = $1, ip = $2, puerto = $3 WHERE id = $4 RETURNING *",
    [nombre, ip, puerto, id]
  );
  return result.rows[0];
};

export const deleteImpresora = async (id) => {
  const result = await pool.query("DELETE FROM impresoras WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};
