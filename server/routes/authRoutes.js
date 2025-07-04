import express from "express";
import registerController from "../controllers/auth/registerController.js";
import loginController from "../controllers/auth/loginController.js";
import profileController from "../controllers/auth/profileController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/profile", verifyToken, profileController);

export default router;
