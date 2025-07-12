import express from "express";
import db from "../config/db.js";
const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
