const EventLog = require("../models/User/EventLogs");

async function logUserEvent(CompanyId, EventType, EventDescription = null, Metadata = {}) {
    try {

        const validCompanyId = Array.isArray(CompanyId) ? CompanyId[0] : CompanyId;

        await EventLog.create({
            CompanyId: validCompanyId,
            EventType,
            EventDescription,
            Metadata,
        });

        console.log(`Event logged: ${EventType} for company ${validCompanyId}`);
    } catch (error) {
        console.error("Error logging event:", error);
    }
}


module.exports = { logUserEvent };