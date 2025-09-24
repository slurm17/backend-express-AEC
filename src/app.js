import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import userRoutes from "./routes/user.routes.js";
import accessRoutes from "./routes/access.routes.js";
import imagenRoutes from "./routes/imagenes.routes.js";
import textosRoutes from "./routes/textos.routes.js";
import printRoutes from "./routes/print.routes.js";
import socioRoutes from "./routes/socios.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import configRoutes from "./routes/configuracion.routes.js";
import releRoutes from "./routes/rele.routes.js";
import path from "path";
import http from "http";
// import { SerialPort } from "serialport";
// import { ReadlineParser } from "@serialport/parser-readline";
// import  { Server } from "socket.io";
// import bodyParser from "body-parser";
// import printRoutes from "./routes/";
import { fileURLToPath } from "url";
// import { activarRele } from "./services/relay.service.js"
// import { SERIAL } from "./config/constants.js";
import { initIo } from "./sockets/init-io.js";
import { entradaScanner } from "./sockets/entrada-scanner.js";
import { salidaScanner } from "./sockets/salida-scanner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// app.use(express.static(path.join(__dirname, "public")));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

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
const staticDir = path.resolve(process.cwd(), "public", "fotos-socios");
app.use("/fotos-socios", express.static(staticDir));
app.use("/fotos-socios", (req, res) => {
  res.status(404).json({ error: "Imagen no encontrada" });
});

// app.use("/api", printRoutes);

export default app;
