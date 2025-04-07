const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  createSuperAdmin,
  getSuperData,
  updateSuperAdminProfile,
  updateAdminChangePass,
} = require("../../controllers/v1/Admin/superController");

const router = express.Router();

router.post("/admin", createSuperAdmin);

router.get("/profile", getSuperData);

router.put("/profile", updateSuperAdminProfile);
router.put("/change-password", updateAdminChangePass);

module.exports = router;
