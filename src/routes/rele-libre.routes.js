import express from "express";
import { activarReleLibreController } from "../controllers/rele-libre.controller.js";

const router = express.Router();

router.post("/", activarReleLibreController);

export default router;
