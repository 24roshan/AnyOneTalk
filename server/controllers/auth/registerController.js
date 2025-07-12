import db from "../../config/db.js";
import { hashPassword } from "../../utils/hash.js";

const registerController = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Register endpoint hit with:", req.body);


  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email and password are required" });
  }

  try {
    // Check if user already exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Register new user
    const hashed = hashPassword(password);
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("❌ Registration DB error:", err);
    res.status(500).json({
      message: "Server error",
      detail: err.message,
    });
  }
};

export default registerController;
