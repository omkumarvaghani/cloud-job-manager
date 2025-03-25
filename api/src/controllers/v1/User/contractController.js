const Contract = require("../../../models/User/Contract");
const ContractItem = require("../../../models/User/ContractItem");
const Visit = require("../../../models/User/Visit");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { logUserEvent } = require("../../../middleware/eventMiddleware");

// **CREATE CONTRACT**
const createOneoffVisits = async (
    oneOffJob,
    title,
    description,
    companyId,
    customerId,
    contractId,
    workerId,
    locationId
) => {
    const { StartDate, EndDate, Repeats } = oneOffJob;

    const startDate = moment(StartDate);
    const endDate = moment(EndDate);
    const visits = [];

    const visitData = {
        ItemName: title,
        Note: description,
        CompanyId: companyId,
        UserId: customerId,
        ContractId: contractId,
        WorkerId: workerId,
        LocationId: locationId,
    };

    if (Repeats === "Daily") {
        for (
            let date = startDate.clone();
            date.isBefore(endDate) || date.isSame(endDate, "day");
            date.add(1, "days")
        ) {
            const VisitId = Date.now();
            const uniqueId = `${VisitId}-${date.format("YYYYMMDD")}`;

            visits.push({
                ...visitData,
                VisitId: uniqueId,
                StartDate: date.format("YYYY-MM-DD"),
                StartTime: oneOffJob.StartTime,
                EndDate: date.format("YYYY-MM-DD"),
                EndTime: oneOffJob.EndTime,
            });
        }
    } else if (Repeats === "Weekly") {
        for (
            let date = startDate.clone();
            date.isBefore(endDate) || date.isSame(endDate, "day");
            date.add(1, "weeks")
        ) {
            const VisitId = Date.now();
            const uniqueId = `${VisitId}-${date.format("YYYYMMDD")}`;

            visits.push({
                ...visitData,
                VisitId: uniqueId,
                StartDate: date.format("YYYY-MM-DD"),
                StartTime: oneOffJob.StartTime,
                EndDate: date.format("YYYY-MM-DD"),
                EndTime: oneOffJob.EndTime,
            });
        }
    } else if (Repeats === "Monthly") {
        for (
            let date = startDate.clone();
            date.isBefore(endDate) || date.isSame(endDate, "day");
            date.add(1, "months")
        ) {
            const VisitId = Date.now();
            const uniqueId = `${VisitId}-${date.format("YYYYMMDD")}`;

            visits.push({
                ...visitData,
                VisitId: uniqueId,
                StartDate: date.format("YYYY-MM-DD"),
                StartTime: oneOffJob.StartTime,
                EndDate: date.format("YYYY-MM-DD"),
                EndTime: oneOffJob.EndTime,
            });
        }
    } else if (Repeats && !isNaN(Repeats)) {
        const customInterval = parseInt(Repeats, 10);
        for (
            let date = startDate.clone();
            date.isBefore(endDate) || date.isSame(endDate, "day");
            date.add(customInterval, "days")
        ) {
            const VisitId = Date.now();
            const uniqueId = `${VisitId}-${date.format("YYYYMMDD")}`;

            visits.push({
                ...visitData,
                VisitId: uniqueId,
                StartDate: date.format("YYYY-MM-DD"),
                StartTime: oneOffJob.StartTime.format("hh:mm A"),
                EndDate: date.format("YYYY-MM-DD"),
                EndTime: oneOffJob.EndTime,
            });
        }
    }

    const visitPromises = visits.map((visit) => Visit.create(visit));
    await Promise.all(visitPromises);
};
const createRecuringVisits = async (
    jobData,
    title,
    description,
    companyId,
    customerId,
    contractId,
    workerId,
    locationId,
    isRecurring = false
) => {
    try {
        const { StartDate, Repeats, StartTime, EndTime, Duration, Frequency } =
            jobData;
        const startDate = moment(StartDate);
        const visits = [];

        const visitData = {
            ItemName: title,
            Note: description,
            CompanyId: companyId,
            UserId: customerId,
            ContractId: contractId,
            WorkerId: workerId,
            LocationId: locationId,
            StartTime,
            EndTime,
            Duration,
        };

        const calculateTotalVisits = (repeats, duration, frequency) => {
            switch (repeats) {
                case "Weekly on":
                    if (duration === "day(s)") {
                        return 1;
                    } else if (duration === "week(s)") {
                        return frequency;
                    } else if (duration === "month(s)") {
                        return frequency * 4;
                    } else if (duration === "year(s)") {
                        return frequency * 52;
                    }
                    break;

                case "Every 2 Weeks on":
                    if (duration === "day(s)") {
                        return 1;
                    } else if (duration === "week(s)") {
                        return Math.ceil(frequency / 2);
                    } else if (duration === "month(s)") {
                        return frequency * 2;
                    } else if (duration === "year(s)") {
                        return frequency * 26;
                    }
                    break;

                case "Monthly on the date":
                    if (duration === "day(s)") {
                        return 1;
                    } else if (duration === "week(s)") {
                        return Math.ceil(frequency / 4);
                    } else if (duration === "month(s)") {
                        return frequency;
                    } else if (duration === "year(s)") {
                        return frequency * 12;
                    }
                    break;

                default:
                    return 1;
            }
        };
        const totalVisits = calculateTotalVisits(Repeats, Duration, Frequency);

        for (let i = 0; i < totalVisits; i++) {
            let visitDate;
            switch (Repeats) {
                case "Weekly on":
                    visitDate = startDate.clone().add(i, "weeks");
                    break;
                case "Every 2 Weeks on":
                    visitDate = startDate.clone().add(i * 2, "weeks");
                    break;
                case "Monthly on the date":
                    visitDate = startDate.clone().add(i, "months");
                    break;
                default:
                    visitDate = startDate.clone();
            }

            const VisitId = Date.now() + i;

            visits.push({
                ...visitData,
                VisitId,
                StartDate: visitDate.format("YYYY-MM-DD"),
                EndDate: visitDate.format("YYYY-MM-DD"),
            });
        }

        if (visits.length > 0) {
            const visitPromises = visits.map((visit) => Visit.create(visit));
            await Promise.all(visitPromises);
        }

        return visits.length;
    } catch (error) {
        console.error("Error creating visits:", error);
        throw new Error("Error creating visits: " + error.message);
    }
};

exports.createContract = async (req, res) => {
    const contractData = req.body;
    if (contractData._id) {
        delete contractData._id;
    }
    const uniqueId = uuidv4();
    contractData.ContractId = uniqueId;

    try {
        const assignPersonIds = Array.isArray(contractData.UserId)
            ? contractData.UserId
            : contractData.UserId
                ? [contractData.UserId]
                : [];

        contractData.WorkerId = assignPersonIds;

        const createdContract = await Contract.create(contractData);

        await logUserEvent(
            contractData.CompanyId,
            "CREATE",
            `Successfully created contract with ContractId: ${createdContract.ContractId}`,
            { ContractId: createdContract.ContractId }
        );

        if (createdContract.QuoteId) {
            const status = await Contract.updateOne(
                { ContractId: createdContract.ContractId },
                { $set: { Status: "Converted" } }
            );
            Contract.Status = "Converted";
            await logUserEvent(
                contractData.CompanyId,
                "UPDATE",
                `Contract with ContractId: ${createdContract.ContractId} converted to 'Converted' status`,
                { ContractId: createdContract.ContractId }
            );
        }

        if (Array.isArray(contractData.products) && contractData.products.length > 0) {
            const productPromises = contractData.products.map(async (product, index) => {
                const uniqueItemId = uuidv4();

                if (product._id) {
                    delete product._id;
                }
                product.ContractId = uniqueId;
                product.ContractItemId = uniqueItemId;
                product.LocationId = contractData.LocationId;
                product.UserId = contractData.UserId;
                product.CompanyId = contractData.CompanyId;
                product.createdAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
                product.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

                const createdProduct = await ContractItem.create(product);
                return createdProduct;
            });

            await Promise.all(productPromises);
        }

        if (
            contractData.OneoffJob &&
            contractData.OneoffJob.StartDate !== "" &&
            contractData.OneoffJob.EndDate !== ""
        ) {
            await createOneoffVisits(
                contractData.OneoffJob,
                contractData.Title,
                contractData.Description,
                contractData.CompanyId,
                contractData.UserId,
                contractData.ContractId,
                assignPersonIds,
                contractData.LocationId
            );
            await logUserEvent(
                contractData.CompanyId,
                "CREATE",
                `Created one-off visits for ContractId: ${contractData.ContractId}`,
                { ContractId: contractData.ContractId }
            );
        }

        if (contractData.RecuringJob && contractData.RecuringJob.StartDate !== "") {
            await createRecuringVisits(
                contractData.RecuringJob,
                contractData.Title,
                contractData.Description,
                contractData.CompanyId,
                contractData.UserId,
                contractData.ContractId,
                assignPersonIds,
                contractData.LocationId,
                true
            );
            await logUserEvent(
                contractData.CompanyId,
                "CREATE",
                `Created recurring visits for ContractId: ${contractData.ContractId}`,
                { ContractId: contractData.ContractId }
            );
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Contract created successfully",
            data: createdContract,
        });
    } catch (error) {
        console.error("Error creating contract:", error);
        await logUserEvent(
            contractData.CompanyId,
            "ERROR",
            `Failed to create contract with ContractId: ${contractData.ContractId}`,
            { error: error.message }
        );
        return res.status(500).json({
            statusCode: 500,
            message: "Error creating contract",
            error: error.message,
        });
    }
};

// **CHECK CONTRACT NUMBER**
exports.checkContractNumber = async (req, res) => {
    const { CompanyId } = req.params;
    const { ContractNumber } = req.body;

    const findNumber = await Contract.findOne({
        CompanyId: CompanyId,
        ContractNumber: ContractNumber,
        IsDelete: false,
    });

    if (findNumber) {
        return res.status(203).json({
            statusCode: 203,
            message: "Number already exists",
        });
    } else {
        return res.status(200).json({
            statusCode: 200,
            message: "Ok",
        });
    }
};