import express from "express";
import * as qrController from "../controllers/qr.controller.js";

const router = express.Router();

router.get("/:codigo", qrController.getCodigoQr);
router.post("/", qrController.postCodigoQr);

export default router;
