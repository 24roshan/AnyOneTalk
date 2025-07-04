import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const file = req.files.file;

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ msg: "Invalid file type" });
  }

  if (file.size > 10 * 1024 * 1024) {
    return res.status(400).json({ msg: "File too large (max 10MB)" });
  }

  const uploadPath = path.join(__dirname, "../uploads", file.name);

  file.mv(uploadPath, (err) => {
    if (err) return res.status(500).json({ err });
    const fileUrl = `/uploads/${file.name}`;
    res.status(200).json({ fileUrl });
  });
});

export default router;
