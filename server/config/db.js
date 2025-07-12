// config/db.js
import dotenv from "dotenv";
import mysql from "mysql2/promise"; // ✅ using promise API

dotenv.config();

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

console.log("✅ MySQL pool created");

export default db;
