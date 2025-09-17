import { pool } from "../config/db.js";

// Obtener la configuración (asumo que hay un solo registro)
export const getConfiguracion = async () => {
  const query = "SELECT * FROM configuracion LIMIT 1";
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

// Insertar configuración (solo si no existe)
export const createConfiguracion = async ({ venc_pase_hs, pase_permitidos, duracion_img_seg }) => {
  const query = `
    INSERT INTO configuracion (venc_pase_hs, pase_permitidos, duracion_img_seg)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [venc_pase_hs, pase_permitidos, duracion_img_seg];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Actualizar configuración (asumo que solo hay un registro)
export const updateConfiguracion = async ({ venc_pase_hs, pase_permitidos, duracion_img_seg }) => {
  const query = `
    UPDATE configuracion
    SET venc_pase_hs = $1,
        pase_permitidos = $2,
        duracion_img_seg = $3
    RETURNING *;
  `;
  const values = [venc_pase_hs, pase_permitidos, duracion_img_seg];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
