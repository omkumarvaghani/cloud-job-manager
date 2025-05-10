const cron = require("node-cron");
const Contract = require("../models/User/Contract");

const getStatusBasedOnStartDate = (startDate) => {
    if (!startDate) {
        return "Unscheduled";
    }

    const today = moment().startOf("day");
    const startMoment = moment(startDate).startOf("day");

    if (startMoment.isSame(today, "day")) {
        return "Today";
    } else if (startMoment.isAfter(today)) {
        return "Upcoming";
    } else {
        return "Scheduled";
    }
};

const contractStatusUpdate = async () => {
    try {
        console.log("Cron job started: Updating contract statuses...");

        const contracts = await Contract.find({});

        if (contracts.length === 0) {
            return;
        }

        for (const contract of contracts) {
            let status = "Unscheduled";

            if (
                contract.IsOneoffJob &&
                contract.OneoffJob &&
                contract.OneoffJob.StartDate
            ) {
                status = getStatusBasedOnStartDate(contract.OneoffJob.StartDate);
            } else if (
                contract.IsRecuringJob &&
                contract.RecuringJob &&
                contract.RecuringJob.StartDate
            ) {
                status = getStatusBasedOnStartDate(contract.RecuringJob.StartDate);
            } else if (contract.StartDate) {
                status = getStatusBasedOnStartDate(contract.StartDate);
            }

            if (contract.Status !== status) {
                contract.Status = status;
                try {
                    await contract.save();
                } catch (err) {
                    console.log(`Error saving contract ${contract.ContractId}: `, err);
                }
            }
        }

        console.log("Cron job finished: Contract statuses updated.");
    } catch (error) {
        console.log("Error occurred during cron job:", error);
    }
};

cron.schedule("25 00 * * *", contractStatusUpdate);

module.exports = cron;