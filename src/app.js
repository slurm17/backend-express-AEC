const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");

// Rutas
const routes = require("./routes/index");
const userRoutes = require("./routes/user.routes");
const accessRoutes = require("./routes/access.routes");
const imagenRoutes = require("./routes/imagenes.routes");
const textosRoutes = require("./routes/textos.routes");
const printRoutes = require("./routes/print.routes");
const socioRoutes = require("./routes/socios.routes");
const qrRoutes = require("./routes/qr.routes");
const configRoutes = require("./routes/configuracion.routes");
const releRoutes = require("./routes/rele.routes");
const releLibreRoutes = require("./routes/rele-libre.routes");
const eventosRoutes = require("./routes/eventos.routes");

// Sockets
const { initIo } = require("./sockets/init-io");
const { entradaScanner } = require("./sockets/entrada-scanner");
const { salidaScanner } = require("./sockets/salida-scanner");

// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// PRUEBAS DE ACCESO SOCIO
const io = initIo(server);
entradaScanner(io);
salidaScanner(io);

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Rutas
app.use("/api", routes);
app.use("/api/users", userRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/imagenes", imagenRoutes);
app.use("/api/textos", textosRoutes);
app.use("/api/imprimir", printRoutes);
app.use("/api/socios", socioRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/config", configRoutes);
app.use("/api/rele", releRoutes);
app.use("/api/rele-libre", releLibreRoutes);
app.use("/api/eventos", eventosRoutes);
const staticDir = path.resolve(process.cwd(), "public", "fotos-socios");
app.use("/fotos-socios", express.static(staticDir));
app.use("/fotos-socios", (req, res) => {
  res.status(404).json({ error: "Imagen no encontrada" });
});

// app.use("/api", printRoutes);

module.exports = app;
// export default app;
