const Notification = require("../Notification/model");
const moment = require("moment");

async function addNotification(data) {
  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;
  try {
    const notification = {
      NotificationId: uniqueId,
      CompanyId: data.CompanyId,
      QuoteId: data.QuoteId,
      account_id: data.account_id,
      TemplateId: data.TemplateId,
      recurring_charge_id: data.recurring_charge_id,
      CustomerId: data.CustomerId,
      VisitId: data.VisitId,
      recurringId: data.recurringId,
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
      Is_Admin: data.Is_Admin,
      Is_Superadmin: data.Is_Superadmin,
      Is_Customer: data.Is_Customer,
      Is_Staffmember: data.Is_Staffmember,
    };

    await Notification.create(notification);
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
}

module.exports = {
  addNotification,
};
