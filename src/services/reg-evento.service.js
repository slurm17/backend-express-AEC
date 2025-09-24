// services/regEvento.service.ts
import { pool } from "../config/db.js";

// export interface RegEvento {
//   id?: number;
//   tipo: 'E' | 'S';
//   tipo_pase: string;
//   qr: boolean;
//   codigo_qr?: string;
//   dni: string;
//   fecha_hora?: Date;
//   mensaje?: string;
// }

export const getAllEventos = async () => {
  const result = await pool.query("SELECT * FROM reg_evento ORDER BY fecha_hora DESC");
  return result.rows;
};

export const createEvento = async (evento) => {
  console.log("🚀 ~ createEvento ~ evento:", evento)
  const result = await pool.query(
    `INSERT INTO reg_evento (tipo, tipo_pase, qr, codigo_qr, dni, fecha_hora, mensaje, estado, error_event)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      evento.tipo,
      evento.tipo_pase,
      evento.qr,
      evento.codigo_qr || null,
      evento.dni,
      evento.fecha_hora || new Date(),
      evento.mensaje || null,
      evento.estado ?? null,
      evento.error_event
    ]
  );
  return result.rows[0];
};
