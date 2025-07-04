import db from "../../config/db.js";
import { hashPassword } from "../../utils/hash.js";

const registerController = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email and password are required" });
  }

  const hashed = hashPassword(password);
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

  db.query(sql, [username, email, hashed], (err) => {
    if (err) {
      console.error("Registration DB error:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already registered" });
      }
      return res
        .status(500)
        .json({ message: "Server error", detail: err.message });
    }

    res.status(201).json({ message: "Registered successfully" });
  });
};

export default registerController;
