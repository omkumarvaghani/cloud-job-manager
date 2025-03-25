const express = require("express");
const { handleMaterialsAndLabor, getMaterialsAndLaborDropdown, getMaterialsAndLabors, getMaterialsAndLabor, updateMaterialsAndLabor, deleteMaterialsAndLabor } = require("../../controllers/v1/Admin/materialController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, handleMaterialsAndLabor);
router.get("/", protect, getMaterialsAndLabor);
router.get("/get/:CompanyId", protect, getMaterialsAndLabors);
router.get("/get_material/:CompanyId", protect, getMaterialsAndLaborDropdown);
router.put("/:ProductId", protect, updateMaterialsAndLabor);
router.delete("/:ProductId", protect, deleteMaterialsAndLabor);

module.exports = router;
