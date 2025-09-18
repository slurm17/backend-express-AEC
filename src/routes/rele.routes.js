import express from "express";
import { activarReleController } from "../controllers/rele.controller.js";

const router = express.Router();

router.post("/", activarReleController);

export default router;
