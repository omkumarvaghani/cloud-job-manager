const express = require("express");
const {
    createVisit,
    getVisits,
    getVisitSchedule,
    getVisitDetails,
    getContractScheduleData,
    confirmVisits,
    confirByWorker,
    deleteVisitData
} = require("../../controllers/v1/User/visitController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createVisit);

router.get("/schedule/:CompanyId", protect, getVisits);
router.get("/visit-schedule/:CompanyId", protect, getVisitSchedule);
router.get("/:ContractId/:CompanyId", protect, getVisitDetails);
router.get("/contract-schedule/:CompanyId", protect, getContractScheduleData);

router.put("/confirm/:VisitId/:ContractId", protect, confirmVisits);
router.put("/confirm-worker/:VisitId/:ContractId", protect, confirByWorker);

router.delete("/:VisitId/:ContractId", protect, deleteVisitData);

module.exports = router;
