// src/routes/accessRoutes.js
import { Router } from "express";
import accessConnection from "../db/access.js";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const rows = await accessConnection.query("SELECT * FROM Users");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
