// const fs = require("fs");
// const path = require("path");
// const todayDate = new Date().toLocaleDateString();
// const contractPdf = async (data) => {
//   let html = fs.readFileSync(
//     path.join(process.cwd(), "features", "htmlFormates", "InvoicePDF.html"),
//     "utf8"
//   );
//   const discountAmount = (data.Discount / 100) * data.subTotal;
//   const gstAmount =
//     (data.Tax / 100) * (data.subTotal - discountAmount);

//   // Replace placeholders with data
//     // html = html.replace("{{companyLogo}}", data.companyLogo || "");
//     html = html.replace("{{ContractNumber}}", data.ContractNumber || "-");
//     html = html.replace("{{CreatedAt}}", todayDate || "-");
//     html = html.replace("{{Total}}", data.Total || "0.00");

//   // Customer Information
//     html = html.replace("{{customerName}}", `${data.customer.FirstName} ${data.customer.LastName}` || "");
//     html = html.replace("{{Address}}", `${data.location.Address}` || "-");
//     html = html.replace("{{City}}", `${data.location.City}` || "-");
//     html = html.replace("{{State}}", `${data.location.State}` || "-");
//     html = html.replace("{{Zip}}", `${data.location.Zip}` || "-");
//     html = html.replace("{{Country}}", `${data.location.Country}` || "-");
//     html = html.replace("{{PhoneNumber}}", data.customer.PhoneNumber || "-");
//     html = html.replace("{{EmailAddress}}", data.customer.EmailAddress || "-");
//   // Invoice Table Rows
//   const invoiceRows = data.Items.map(
//     (item, index) =>
//       `<tr>
//           <td>${index + 1}</td>
//           <td>${item?.Name}</td>
//           <td>${item?.Description}</td>
//           <td>${
//             item?.Unit
//               ? item?.Unit
//               : item?.Square
//               ? item?.Square
//               : item?.Hour || "-"
//           }</td>
//           <td>$${
//             item?.CostPerHour
//               ? Number(item.CostPerHour).toFixed(2)
//               : item?.CostPerSquare
//               ? Number(item.CostPerSquare).toFixed(2)
//               : Number(item?.CostPerUnit).toFixed(2) || "-"
//           } $${item?.Total || "-"}</td>
//           <td>$${item?.Total}</td>
//         </tr>`
//   ).join("");
//   html = html.replace("{{invoiceRows}}", invoiceRows);

//   //   // Payment and Summary
//     // html = html.replace("{{invoiceStatus}}", data.invoiceStatus || "Draft");
//     // html = html.replace("{{subTotal}}", data.subTotal || "0.00");
//     // html = html.replace("{{Discount}}", data.Discount || "0");
//     // html = html.replace("{{discountAmount}}", discountAmount || "0.00");
//     // html = html.replace("{{Tax}}", data.Tax || "0");
//     // html = html.replace("{{gstAmount}}", gstAmount || "0.00");
//     // html = html.replace("{{grandTotal}}", data.Total || "0.00");
//     html = html.replace("{{invoiceStatus}}", data.Status || "-");
//     html = html.replace("{{subTotal}}", (parseFloat(data.subTotal) || "-").toFixed(2));
//     html = html.replace("{{Discount}}", (parseFloat(data.Discount) || "-"));
//     html = html.replace("{{discountAmount}}", (parseFloat(discountAmount) || 0).toFixed(2));
//     html = html.replace("{{Tax}}", (parseFloat(data.Tax) || "-"));
//     html = html.replace("{{gstAmount}}", (parseFloat(gstAmount) || "-").toFixed(2));

//     html = html.replace("{{grandTotal}}", (parseFloat(data.Total) || "-").toFixed(2));

//   return html;
// };

// module.exports = { contractPdf };
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const todayDate = moment().format("YYYY-MM-DD");

const contractPdf = async (data) => {
  let html = fs.readFileSync(
    path.join(process.cwd(), "features", "htmlFormates", "InvoicePDF.html"),
    "utf8"
  );

  // Calculate discount and GST amounts
  const discountAmount = (data.Discount / 100) * data.subTotal;
  const gstAmount = (data.Tax / 100) * (data.subTotal - discountAmount);

  // Define a safe function for formatting numbers
  const safeToFixed = (value, decimals = 2) => {
    const number = parseFloat(value);
    return isNaN(number) ? "0.00" : number.toFixed(decimals);
  };

  // Replace placeholders with data
  // html = html.replace("{{companyLogo}}", data.companyLogo || "");
  html = html.replace("{{ContractNumber}}", data.ContractNumber || "0");
  html = html.replace("{{CreatedAt}}", todayDate || "0");
  html = html.replace("{{Total}}", safeToFixed(data.Total));

  // Customer Information
  html = html.replace(
    "{{customerName}}",
    `${data.customer.FirstName || ""} ${data.customer.LastName || ""}`
  );
  html = html.replace("{{Address}}", `${data.location.Address || "0"}`);
  html = html.replace("{{City}}", `${data.location.City || "0"}`);
  html = html.replace("{{State}}", `${data.location.State || "0"}`);
  html = html.replace("{{Zip}}", `${data.location.Zip || "0"}`);
  html = html.replace("{{Country}}", `${data.location.Country || "0"}`);
  html = html.replace("{{PhoneNumber}}", data.customer.PhoneNumber || "0");
  html = html.replace("{{EmailAddress}}", data.customer.EmailAddress || "0");

  // Invoice Table Rows
  const invoiceRows = data.Items.map(
    (item, index) =>
      `<tr>
          <td>${index + 1}</td>
          <td>${item?.Name || "0"}</td>
          <td>${item?.Description || "0"}</td>
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
          } $${item?.Total || "0.00"}</td>
          <td>$${item?.Total || "0.00"}</td>
        </tr>`
  ).join("");
  html = html.replace("{{invoiceRows}}", invoiceRows);

  // Payment and Summary
  html = html.replace("{{invoiceStatus}}", data.Status || "0");
  html = html.replace("{{subTotal}}", safeToFixed(data.subTotal));
  html = html.replace("{{Discount}}", safeToFixed(data.Discount, 0));
  html = html.replace("{{discountAmount}}", safeToFixed(discountAmount));
  html = html.replace("{{Tax}}", safeToFixed(data.Tax));
  html = html.replace("{{gstAmount}}", safeToFixed(gstAmount));
  html = html.replace("{{grandTotal}}", safeToFixed(data.Total));

  return html;
};

module.exports = { contractPdf };
