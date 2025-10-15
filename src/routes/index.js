const { Router } = require("express")
const { pool } = require( "../config/db.js")
const router = Router();

// router.get("/", (req, res) => {
//   res.json({ message: "API funcionando 🚀" });
// });

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as fecha");
    res.json({ mensaje: "API funcionando 🚀", fecha: result.rows[0].fecha });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la consulta" });
  }
});

module.export = router;
