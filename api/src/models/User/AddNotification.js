const Notification = require("./Notification");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

async function addNotification(data) {

    const uniqueId = uuidv4();
    try {
        const notification = {
            NotificationId: uniqueId,
            CompanyId: data.CompanyId,
            QuoteId: data.QuoteId,
            AccountId: data.AccountId,
            TemplateId: data.TemplateId,
            RecurringChargeId: data.RecurringChargeId,
            UserId: data.UserId,
            VisitId: data.VisitId,
            RecurringId: data.RecurringId,
            WorkerId: data.WorkerId,
            signatureRequestId: data.signatureRequestId,
            ProductId: data.ProductId,
            ContractId: data.ContractId,
            InvoiceId: data.InvoiceId,
            RequestChangeId: data.RequestChangeId,
            LocationId: data.LocationId,
            createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
            CreatedBy: data.CreatedBy,
            AddedAt: data.AddedAt,
            Is_Company: data.Is_Company,
            Is_Admin: data.Is_Admin,
            Is_Customer: data.Is_Customer,
            Is_Worker: data.Is_Worker,
        };

        await Notification.create(notification);
    } catch (error) {
        console.error("Error creating notification:", error.message);
    }
}

module.exports = {
    addNotification,
};
