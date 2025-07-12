import db from "../../config/db.js";
import { comparePassword } from "../../utils/hash.js";
import { generateToken } from "../../utils/jwt.js";

const loginController = async (req, res) => {
  const { email, password } = req.body;

  console.log("Login endpoint hit with:", req.body);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [results] = await db.query(
      "SELECT id, username, email, password FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      console.log("❌ Email not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = comparePassword(password, user.password);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, email: user.email });

    console.log("✅ Login successful for:", user.username);

    res.cookie("token", token, { httpOnly: true }).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login DB error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export default loginController;
