
const express = require("express");
const { register, login, checkUserExists, getTokenData, checkTokenData, verifyAndFetchCompany, checkEmail } = require("../../controllers/v1/authController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/check_user", checkUserExists);
router.post("/check-email", checkEmail);

router.get("/token_data", protect, getTokenData);
router.post("/token_data", checkTokenData, getTokenData);
router.post("/auth", protect, verifyAndFetchCompany);

module.exports = router;
