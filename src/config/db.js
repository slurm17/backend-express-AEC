import pkg from "pg";
import dotenv from "dotenv";
pkg.types.setTypeParser(1184, str => str);
const { Pool } = pkg;
dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verificar conexión al iniciar
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conexión a PostgreSQL exitosa");
    client.release();
  } catch (error) {
    console.error("❌ Error al conectar a PostgreSQL:", error);
  }
})();