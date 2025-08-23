// src/services/imagen.service.ts
import { pool } from '../config/db.js'
import fs from "fs";
import path from "path";

export const getAllImagenes = async () => {
  const result = await pool.query("SELECT * FROM imagenes ORDER BY orden ASC");
  return result.rows;
};

export const getImagenById = async (id: number) => {
  const result = await pool.query("SELECT * FROM imagenes WHERE id = $1", [id]);
  return result.rows[0] || null;
};

export const createImagen = async (data: { url: string; titulo?: string; descripcion?: string; activa?: boolean, orden: number }) => {
  const { url, titulo, descripcion, activa = true, orden } = data;
  const result = await pool.query(
    "INSERT INTO imagenes (url, titulo, descripcion, activa, orden) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [url, titulo, descripcion, activa, orden]
  );
  return result.rows[0];
};

export const updateImagen = async (id: number, data: Partial<{ url: string; titulo: string; descripcion: string; activa: boolean, orden: number }>) => {
  const { url, titulo, descripcion, activa, orden } = data;
  const result = await pool.query(
    `UPDATE imagenes 
     SET url = COALESCE($1, url), 
         titulo = COALESCE($2, titulo), 
         descripcion = COALESCE($3, descripcion),
         activa = COALESCE($4, activa),
         orden = COALESCE($5, orden)
     WHERE id = $6
     RETURNING *`,
    [url, titulo, descripcion, activa, orden, id]
  );
  return result.rows[0] || null;
};

export const deleteImagen = async (id: number) => {
  // 1. Buscar la URL en la DB
  const resultSelect = await pool.query("SELECT url FROM imagenes WHERE id = $1", [id]);
  if (resultSelect.rowCount === 0) return false;

  const url = resultSelect.rows[0].url;

  // 2. Borrar el registro
  const resultDelete = await pool.query("DELETE FROM imagenes WHERE id = $1 RETURNING id", [id]);
  if (resultDelete.rowCount === 0) return false;

  // 3. Borrar archivo físico
  const filePath = path.join(process.cwd(), "uploads", path.basename(url));

  fs.unlink(filePath, (err) => {
    if (err) {
      // No cortar el flujo si falla, solo logueamos
      console.error("Error borrando archivo:", err);
    }
  });

  return true;
};
