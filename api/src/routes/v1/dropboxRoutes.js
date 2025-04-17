const express = require("express");
const {
  createSignatureRequest,
  getSignatureRequestDetails,
  getDropboxFileUrl,
  getFileDataUri,
  deleteAccount,
  cancelSignatureRequest,
  removeSignatureRequest,
} = require("../../controllers/v1/User/dropboxController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/signature_request/send", protect, createSignatureRequest);
router.post(
  "/signature_request/cancel/:signatureRequestId",
  protect,
  cancelSignatureRequest
);
router.post(
  "/signature_request/remove/:signatureRequestId",
  protect,
  removeSignatureRequest
);

router.get(
  "/signature_request/list/:signatureRequestId",
  protect,
  getSignatureRequestDetails
);
router.get(
  "/signature_request/files_as_file_url/:signatureRequestId",
  protect,
  getDropboxFileUrl
);
router.get(
  "/signature_request/files_as_data_uri/:signatureRequestId",
  protect,
  getFileDataUri
);

router.delete("/delete/:signatureRequestId", protect, deleteAccount);

module.exports = router;
