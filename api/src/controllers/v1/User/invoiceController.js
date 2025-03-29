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
