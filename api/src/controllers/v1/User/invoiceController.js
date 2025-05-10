const { v4: uuidv4 } = require("uuid");
const Charge = require("../../../models/User/Charge");
const Invoice = require("../../../models/User/Invoice");
const InvoiceItem = require("../../../models/User/InvoiceItem");
const Ledger = require("../../../models/User/Ledger");

exports.createInvoice = async (req, res) => {
    try {
        const companyId = Array.isArray(req.user.CompanyId) ? req.user.CompanyId[0] : req.user.CompanyId;
        if (!companyId) {
            return res.status(400).json({ message: "CompanyId not found in user data" });
        }

        const invoiceData = {
            ...req.body.invoice,
            CompanyId: companyId,
            InvoiceId: uuidv4(),
            TotalCharge: 0,
            TotalPayment: 0,
            Balance: 0,
            // Ledger: {},
        };

        const invoice = new Invoice(invoiceData);
        await invoice.save();

        const items = req.body.items.map(item => ({
            ...item,
            InvoiceId: invoice.InvoiceId,
        }));
        await InvoiceItem.insertMany(items);

        const ledger = new Ledger({
            InvoiceId: invoice.InvoiceId,
            CompanyId: companyId,
            CustomerId: invoice.CustomerId,
            TotalCharge: 0,
            TotalPayment: 0,
            PaymentCount: 0,
            Balance: 0,
            ChargePayments: [],
        });
        await ledger.save();

        invoice.Ledger = ledger._id;
        await invoice.save();

        let totalCharge = 0;
        let totalPayment = 0;

        for (let chargeData of req.body.charges) {
            const charge = new Charge({
                ...chargeData,
                InvoiceId: invoice.InvoiceId,
            });
            await charge.save();

            totalCharge += charge.ChargeAmount;
            totalPayment += charge.PaymentAmount;

            ledger.TotalCharge = totalCharge;
            ledger.TotalPayment = totalPayment;
            ledger.Balance = totalCharge - totalPayment;

            if (charge.PaymentAmount > 0) {
                ledger.PaymentCount += 1;
            }
            ledger.ChargePayments.push({
                ChargeId: charge._id,
                Amount: charge.ChargeAmount,
                Type: 'charge',
                Description: charge.Description,
            });

            await ledger.save();
        }

        invoice.TotalCharge = totalCharge;
        invoice.TotalPayment = totalPayment;
        invoice.Balance = totalCharge - totalPayment;

        await invoice.save();

        res.status(201).json({
            message: "Invoice, items, charges, and ledger created successfully",
            invoice,
            ledger,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating invoice", error });
    }
};


// **CREATE INVOICE MAX INVOICE NUMBER**
exports.checkInvoiceNumber = async (req, res) => {
    const { CompanyId } = req.user;
    const { InvoiceNumber } = req.body;

    const findNumber = await Invoice.findOne({
        CompanyId: CompanyId,
        InvoiceNumber: InvoiceNumber,
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


// **GET INVOICE MAX INVOICE NUMBER**
exports.getMaxInvoiceNumber = async (req, res) => {
    try {
        const { CompanyId } = req.user;

        const totalInvoice = await Invoice.find({
            CompanyId,
            IsDelete: false,
        }).select("InvoiceNumber");

        const invoiceNumbers = totalInvoice.map((contract) =>
            parseInt(contract.InvoiceNumber, 10)
        );

        invoiceNumbers.sort((a, b) => a - b);

        let maxInvoiceNumber = 1;

        for (let i = 0; i < invoiceNumbers.length; i++) {
            if (invoiceNumbers[i] === maxInvoiceNumber) {
                maxInvoiceNumber++;
            }
        }

        return res.status(200).json({
            statusCode: 200,
            invoiceNumber: maxInvoiceNumber,
        });
    } catch (error) {
        console.error("Error in getMaxQuoteNumber:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to get max quote number.",
            error: error.message,
        });
    }
};

// **GET INVOICE IN SCHEDULE CALENDAR**
exports.getScheduleData = async (req, res) => {
    const { CompanyId } = req.user;

    const data = await Invoice.aggregate([
        {
            $match: {
                CompanyId: CompanyId,
                IsDelete: false,
            },
        },
        {
            $lookup: {
                from: "user-profiles",
                localField: "CustomerId",
                foreignField: "UserId",
                as: "customer",
            },
        },
        {
            $unwind: {
                path: "$customer",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "locations",
                localField: "LocationId",
                foreignField: "LocationId",
                as: "location",
            },
        },
        {
            $unwind: {
                path: "$location",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                InvoiceId: 1,
                CompanyId: 1,
                CustomerId: 1,
                ContractId: 1,
                LocationId: 1,
                Title: "$Subject",
                InvoiceNumber: 1,
                DueDate: 1,
                Discount: 1,
                Status: 1,
                Tax: 1,
                subTotal: 1,
                ContractDisclaimer: 1,
                Message: 1,
                Total: 1,
                createdAt: 1,
                updatedAt: 1,
                FirstName: "$customer.FirstName",
                LastName: "$customer.LastName",
                Address: "$location.Address",
                City: "$location.City",
                State: "$location.State",
                Zip: "$location.Zip",
                Country: "$location.Country",
                sheduleDate: {
                    $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
                },
            },
        },
    ]);
    return res.status(200).json({
        statusCode: 200,
        data: data,
        message: "Read All Plans",
    });
};
