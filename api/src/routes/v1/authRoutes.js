const express = require("express");
const { register, login, checkUserExists, getTokenData, checkTokenData } = require("../../controllers/v1/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/check_user", checkUserExists);

router.get("/token_data", getTokenData);
router.post("/token_data", checkTokenData, getTokenData);

module.exports = router;
