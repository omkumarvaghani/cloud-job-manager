const express = require("express");
const {
    createTemplate,
    getTemplates,
    getTemplate,
    getOneTemplate,
    getSettingTemplate,
    updateTemplate,
    updateSettingTemplate,
    deleteTemplate,
} = require("../../controllers/v1/User/templateController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTemplate);

router.get("/", protect, getTemplates);
router.get("/get/:TemplateId", protect, getTemplate);
router.get("/get/:CompanyId/:MailType", protect, getOneTemplate);
router.get("/settings", protect, getSettingTemplate);

router.put("/:TemplateId", protect, updateTemplate);
router.put("/settings/:TemplateId", protect, updateSettingTemplate);

router.delete("/:TemplateId", protect, deleteTemplate);

module.exports = router;
