import db from "../../config/db.js";
import { comparePassword } from "../../utils/hash.js";
import { generateToken } from "../../utils/jwt.js";

const loginController = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = "SELECT id, username, email, password FROM users WHERE email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (
      results.length === 0 ||
      !comparePassword(password, results[0].password)
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];
    const token = generateToken({ id: user.id, email: user.email });

    res.cookie("token", token, { httpOnly: true }).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  });
};

export default loginController;
