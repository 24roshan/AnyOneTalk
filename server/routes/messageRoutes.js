import express from "express";
import db from "../config/db.js";
import { deleteMessage,editMessage } from "../controllers/messageController.js";
import verifyToken from "../middleware/verifyToken.js"; // ✅ Your custom auth middleware


const router = express.Router();
router.put("/:id",verifyToken,editMessage);
router.delete("/:id",verifyToken,deleteMessage);
router.get("/:chatId", (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT * 
    FROM messages 
    WHERE chat_id = ? 
    ORDER BY created_at ASC 
    LIMIT ? OFFSET ?
  `;

  db.query(
    sql,
    [req.params.chatId, parseInt(limit), parseInt(offset)],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

export default router;
