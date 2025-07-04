import express from "express";
import db from "../config/db.js";
const router = express.Router();

router.get("/users", (req, res) => {
  const sql = "SELECT id, username FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results);
  });
});

export default router;
