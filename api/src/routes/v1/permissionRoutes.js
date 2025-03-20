const express = require("express");
const router = express.Router();
const { addPermission, getPermission, updatePermission, deletePermission, getPermissions } = require("../../controllers/v1/Admin/permissionController");
const { protect } = require("../../middleware/authMiddleware");

router.post("/", protect, addPermission);

router.get("/", protect, getPermissions);

router.get("/:PermissionId", protect, getPermission);

router.put("/:PermissionId", protect, updatePermission);

router.delete("/:PermissionId", protect, deletePermission);

module.exports = router;
