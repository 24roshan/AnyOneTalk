import express from "express";
import db from "../config/db.js";

const router = express.Router();
router.post("/create", (req, res) => {
  const { name, is_group, userIds, created_by } = req.body;

  const sql = "INSERT INTO chats (name, is_group, created_by) VALUES (?, ?, ?)";
  db.query(sql, [name, is_group, created_by], (err, result) => {
    if (err) return res.status(500).json(err);

    const chatId = result.insertId;

    userIds.forEach((uid) => {
      db.query(
        "INSERT INTO chat_members (chat_id, user_id, role) VALUES (?, ?, ?)",
        [chatId, uid, "member"]
      );
    });

    res.status(201).json({ chatId });
  });
});


router.get("/:userId", (req, res) => {
  const sql = `
    SELECT c.* 
    FROM chats c 
    JOIN chat_members cm ON c.id = cm.chat_id 
    WHERE cm.user_id = ?
  `;

  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

export default router;
