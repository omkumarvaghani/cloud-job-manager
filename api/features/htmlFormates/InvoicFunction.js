const fs = require("fs");
const path = require("path");
const todayDate = new Date().toLocaleDateString();
const invoicePdf = async (data) => {
  let html = fs.readFileSync(
    path.join(process.cwd(), "features", "htmlFormates", "InvoicPdf.html"),
    "utf8"
  );
  const discountAmount = (data.Discount / 100) * data.subTotal;
  const gstAmount = (data.Tax / 100) * (data.subTotal - discountAmount);

  const safeToFixed = (value, decimals = 2) => {
    const number = parseFloat(value);
    return isNaN(number) ? "0.00" : number.toFixed(decimals);
  };

  // Replace placeholders with data
  // html = html.replace("{{companyLogo}}", data.companyLogo || "");
  html = html.replace("{{InvoiceNumber}}", data.InvoiceNumber || "-");
  html = html.replace("{{CreatedAt}}", todayDate || "-");
  html = html.replace("{{Total}}", data.Total || "0.00");

  // Customer Information
  html = html.replace(
    "{{customerName}}",
    `${data?.customer?.FirstName ? data?.customer?.FirstName : "-"} ${
      data?.customer?.LastName ? data?.customer?.LastName : "-"
    }` || "-"
  );
  html = html.replace("{{Address}}", `${data?.location?.Address}` || "-");
  html = html.replace("{{City}}", `${data?.location?.City}` || "-");
  html = html.replace("{{State}}", `${data?.location?.State}` || "-");
  html = html.replace("{{Zip}}", `${data?.location?.Zip}` || "-");
  html = html.replace("{{Country}}", `${data?.location?.Country}` || "-");
  html = html.replace("{{PhoneNumber}}", data?.customer?.PhoneNumber || "-");
  html = html.replace("{{EmailAddress}}", data?.customer?.EmailAddress || "-");
  html = html.replace("{{companyName}}", data.companyData.companyName);
  html = html.replace("{{EmailAddress}}", data.companyData.EmailAddress);

  html = html.replace("{{CompanyAddress}}", data?.companyData?.Address || "-");
  html = html.replace("{{CompanyCity}}", data?.companyData?.City || "-");
  html = html.replace("{{CompanyState}}", data?.companyData?.State || "-");
  html = html.replace("{{CompanyZip}}", data?.companyData?.Zip || "-");
  html = html.replace("{{CompanyCountry}}", data?.companyData?.Country || "-");
  html = html.replace("{{CompanyEmail}}", data?.companyData?.EmailAddress || "-");
  html = html.replace("{{CompanyPhone}}", data?.companyData?.phoneNumber || "-");
  html = html.replace("{{invoiceStatus}}", data?.Status || "-");
  // Invoice Table Rows
  const invoiceRows = data.Items
    ?.map(
      (item, index) =>
        `<tr>
          <td>${index + 1}</td>
          <td>${item?.Name}</td>
          <td>${item?.Description}</td>
          <td>${
            item?.Unit
            ? item?.Unit
            : item?.Square
            ? item?.Square
            : item?.Fixed
            ? item?.Fixed
            : item?.Hourly || "0"
          }</td>
             <td>$${
              item?.CostPerHour
              ? Number(item.CostPerHour).toFixed(2)
              : item?.CostPerSquare
              ? Number(item.CostPerSquare).toFixed(2)
              : item?.CostPerFixed
              ? Number(item.CostPerFixed).toFixed(2)
              : Number(item?.CostPerUnit).toFixed(2) || "0.00"
             }
          <td>$${item?.Total}</td>
        </tr>`
    )
    .join("");
  html = html.replace("{{invoiceRows}}", invoiceRows);

  //   // Payment and Summary
//   html = html.replace(
//     "{{invoiceStatus}}",
//     data?.Status === "Paid"
//       ? `<span style="color:#AEF6D3;">Paid</span>`
//       : data?.Status === "Unpaid"
//       ? `<span style="color: #FFC6C6;">Unpaid</span>` 
//       : data?.Status === "Pending"
     
//   );
// html = html.replace(
//     "{{invoiceStatus}}",
//     data?.Status === "Paid"
//       ? `<span style="color:AEF6D3;">Paid</span>`
//       : data?.Status === "Unpaid"
//       ? `<span style="color: #FFC6C6;">Unpaid</span>`
//       : data?.Status === "Pending"
//       ? `<span style="color:#FFE9BC;">Pending</span>`
//       : data?.Status === "Canceled"
//       ? `<span style="color: #FF0000;">Canceled</span>`
//       : `<span style="color: rgba(0, 0, 0, 1);"></span>`
//   );
  html = html.replace("{{subTotal}}", safeToFixed(data.subTotal));
  html = html.replace("{{Discount}}", safeToFixed(data.Discount, 0));
  html = html.replace("{{discountAmount}}", safeToFixed(discountAmount));
  html = html.replace("{{Tax}}", safeToFixed(data.Tax));
  html = html.replace("{{gstAmount}}", safeToFixed(gstAmount)); 
  html = html.replace("{{grandTotal}}", safeToFixed(data.Total));

  return html;
};

module.exports = { invoicePdf };
