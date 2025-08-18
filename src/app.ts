import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import userRoutes from "./routes/user.routes.js"
import accessRoutes from "./routes/access.routes.js";
import imagenRoutes from "./routes/imagenes.routes.js"
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", routes);
app.use("/api/users", userRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/imagenes", imagenRoutes);

export default app;
