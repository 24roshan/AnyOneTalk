import express from "express";
import {
  createGroupChat,
  getUserGroups,
} from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", createGroupChat);
router.get("/user/:userId", getUserGroups);

export default router;
