// const fs = require("fs");
// const path = require("path");
// const moment = require("moment");
// const todayDate = moment().format("YYYY-MM-DD");
// const quotePdf = async (data) => {
//   let html = fs.readFileSync(
//     path.join(process.cwd(), "features", "htmlFormates", "QuotePdf.html"),
//     "utf8"
//   );
//   const discountAmount = (data.Discount / 100) * data.SubTotal;
//   const gstAmount = (data.Tax / 100) * (data.SubTotal - discountAmount);

//   const safeToFixed = (value, decimals = 2) => {
//     const number = parseFloat(value);
//     return isNaN(number) ? "0.00" : number.toFixed(decimals);
//   };

//   // Replace placeholders with data
//   // html = html.replace("{{companyLogo}}", data.companyLogo || "");
//   html = html.replace("{{QuoteNumber}}", data.QuoteNumber || "-");
//   html = html.replace("{{CreatedAt}}", todayDate || "-");
//   html = html.replace("{{Total}}", data.Total || "0.00");

//   // Customer Information
//   html = html.replace(
//     "{{customerName}}",
//     `${data?.customer?.FirstName ? data?.customer?.FirstName : "-"} ${
//       data?.customer?.LastName ? data?.customer?.LastName : "-"
//     }` || "-"
//   );
//   html = html.replace("{{Address}}", `${data?.location?.Address}` || "-");
//   html = html.replace("{{City}}", `${data?.location?.City}` || "-");
//   html = html.replace("{{State}}", `${data?.location?.State}` || "-");
//   html = html.replace("{{Zip}}", `${data?.location?.Zip}` || "-");
//   html = html.replace("{{Country}}", `${data?.location?.Country}` || "-");
//   html = html.replace("{{PhoneNumber}}", data?.customer?.PhoneNumber || "-");
//   html = html.replace("{{EmailAddress}}", data?.customer?.EmailAddress || "-");
//   // Invoice Table Rows
//   const invoiceRows = data.products
//     ?.map(
//       (product, index) =>
//         `<tr>
//           <td>${index + 1}</td>
//           <td>${product?.Name}</td>
//           <td>${product?.Description}</td>
//           <td>${
//             product?.Unit
//               ? product?.Unit
//               : product?.Square
//               ? product?.Square
//               : product?.Fixed
//               ? product?.Fixed
//               : product?.Hour || "-"
//           }</td>
//              <td>$${
//                product?.CostPerHour
//                  ? Number(product.CostPerHour).toFixed(2)
//                  : product?.CostPerSquare
//                  ? Number(product.CostPerFixed).toFixed(2)
//                  : product?.CostPerFixed
//                  ? Number(product.CostPerSquare).toFixed(2)
//                  : Number(product?.CostPerUnit).toFixed(2) || "0.00"
//              }
//           <td>$${product?.Total}</td>
//         </tr>`
//     )
//     .join("");
//   html = html.replace("{{invoiceRows}}", invoiceRows);

//   //   // Payment and Summary
//   html = html.replace(
//     "{{invoiceStatus}}",
//     data?.status === "Awaiting Response"
//       ? `<span style="color:rgba(255, 165, 0, 0.2);">Awaiting Response</span>`
//       : data?.status === "Approved"
//       ? `<span style="color: rgba(88, 230, 88, 0.2);">Approved</span>`
//       : data?.status === "Draft"
//       ? `<span style="color: rgba(0, 0, 255, 0.2);">Draft</span>`
//       : `<span style="color: rgba(0, 0, 0, 0.2);">''</span>`
//   );
//   html = html.replace("{{SubTotal}}", safeToFixed(data.SubTotal));
//   html = html.replace("{{Discount}}", safeToFixed(data.Discount, 0));
//   html = html.replace("{{discountAmount}}", safeToFixed(discountAmount));
//   html = html.replace("{{Tax}}", safeToFixed(data.Tax));
//   html = html.replace("{{gstAmount}}", safeToFixed(gstAmount));
//   html = html.replace("{{grandTotal}}", safeToFixed(data.Total));

//   return html;
// };

// module.exports = { quotePdf };

const fs = require("fs");
const path = require("path");
const moment = require("moment");

// const quotePdf = async (data) => {
//   let html = fs.readFileSync(
//     path.join(process.cwd(), "features", "htmlFormates", "QuotePdf.html"),
//     "utf8"
//   );

//   const todayDate = moment().format("YYYY-MM-DD"); // Dynamically generate date on each function call
//   const discountAmount = (data.Discount / 100) * data.SubTotal;
//   const gstAmount = (data.Tax / 100) * (data.SubTotal - discountAmount);

//   const safeToFixed = (value, decimals = 2) => {
//     const number = parseFloat(value);
//     return isNaN(number) ? "0.00" : number.toFixed(decimals);
//   };

//   // Replace placeholders with data
//   html = html.replace("{{QuoteNumber}}", data.QuoteNumber || "-");
//   html = html.replace("{{CreatedAt}}", todayDate || "-"); // Updated dynamic date
//   html = html.replace("{{Total}}", data.Total || "0.00");

//   // Customer Information
//   html = html.replace(
//     "{{customerName}}",
//     `${data?.customer?.FirstName || "-"} ${data?.customer?.LastName || "-"}`
//   );
//   html = html.replace("{{Address}}", data?.location?.Address || "-");
//   html = html.replace("{{City}}", data?.location?.City || "-");
//   html = html.replace("{{State}}", data?.location?.State || "-");
//   html = html.replace("{{Zip}}", data?.location?.Zip || "-");
//   html = html.replace("{{Country}}", data?.location?.Country || "-");
//   html = html.replace("{{PhoneNumber}}", data?.customer?.PhoneNumber || "-");
//   html = html.replace("{{EmailAddress}}", data?.customer?.EmailAddress || "-");

//   // Invoice Table Rows
//   const invoiceRows = data.products
//     ?.map(
//       (product, index) =>
//         `<tr>
//           <td>${index + 1}</td>
//           <td>${product?.Name || "-"}</td>
//           <td>${product?.Description || "-"}</td>
//           <td>${product?.Unit || product?.Square || product?.Fixed || product?.Hour || "-"}</td>
//           <td>$${
//             product?.CostPerHour
//               ? Number(product.CostPerHour).toFixed(2)
//               : product?.CostPerSquare
//               ? Number(product.CostPerSquare).toFixed(2)
//               : product?.CostPerFixed
//               ? Number(product.CostPerFixed).toFixed(2)
//               : Number(product?.CostPerUnit).toFixed(2) || "0.00"
//           }</td>
//           <td>$${safeToFixed(product?.Total)}</td>
//         </tr>`
//     )
//     .join("");
//   html = html.replace("{{invoiceRows}}", invoiceRows);

//   // Payment and Summary
//   const statusColors = {
//     "Awaiting Response": "rgba(255, 165, 0, 0.2)",
//     Approved: "rgba(88, 230, 88, 0.2)",
//     Draft: "rgba(0, 0, 255, 0.2)",
//     Default: "rgba(0, 0, 0, 0.2)",
//   };

//   html = html.replace(
//     "{{invoiceStatus}}",
//     `<span style="color: ${statusColors[data?.status] || statusColors.Default};">
//       ${data?.status || "''"}
//     </span>`
//   );

//   html = html.replace("{{SubTotal}}", safeToFixed(data.SubTotal));
//   html = html.replace("{{Discount}}", safeToFixed(data.Discount, 0));
//   html = html.replace("{{discountAmount}}", safeToFixed(discountAmount));
//   html = html.replace("{{Tax}}", safeToFixed(data.Tax));
//   html = html.replace("{{gstAmount}}", safeToFixed(gstAmount));
//   html = html.replace("{{grandTotal}}", safeToFixed(data.Total));

//   return html;
// };

const quotePdf = async (data) => {
  let html = fs.readFileSync(
    path.join(process.cwd(), "features", "htmlFormates", "QuotePdf.html"),
    "utf8"
  );

  const todayDate = moment().format("YYYY-MM-DD");
  const discountAmount = (data.Discount / 100) * data.SubTotal;
  const gstAmount = (data.Tax / 100) * (data.SubTotal - discountAmount);

  const safeToFixed = (value, decimals = 2) => {
    const number = parseFloat(value);
    return isNaN(number) ? "0.00" : number.toFixed(decimals);
  };
  html = html.replace("{{QuoteNumber}}", data.QuoteNumber || "-");
  html = html.replace("{{CreatedAt}}", todayDate || "-");
  html = html.replace("{{Total}}", data.Total || "0.00");
  html = html.replace("{{companyName}}", data.companyData.companyName);
  html = html.replace("{{EmailAddress}}", data.companyData.EmailAddress);

  html = html.replace("{{customerName}}", `${data?.customer?.FirstName || "-"} ${data?.customer?.LastName || "-"}`);
  html = html.replace("{{Address}}", data?.location?.Address || "-");
  html = html.replace("{{City}}", data?.location?.City || "-");
  html = html.replace("{{State}}", data?.location?.State || "-");
  html = html.replace("{{Zip}}", data?.location?.Zip || "-");
  html = html.replace("{{Country}}", data?.location?.Country || "-");

  html = html.replace("{{CompanyAddress}}", data?.companyData?.Address || "-");
  html = html.replace("{{CompanyCity}}", data?.companyData?.City || "-");
  html = html.replace("{{CompanyState}}", data?.companyData?.State || "-");
  html = html.replace("{{CompanyZip}}", data?.companyData?.Zip || "-");
  html = html.replace("{{CompanyCountry}}", data?.companyData?.Country || "-");
  html = html.replace("{{CompanyEmail}}", data?.companyData?.EmailAddress || "-");
  html = html.replace("{{CompanyPhone}}", data?.companyData?.phoneNumber || "-");
  html = html.replace("{{PhoneNumber}}", data?.customer?.PhoneNumber || "-");
  html = html.replace("{{EmailAddress}}", data?.customer?.EmailAddress || "-");

  const invoiceRows = data.products
    ?.map(
      (product, index) =>
        `<tr>
          <td>${index + 1}</td>
          <td>${product?.Name || "-"}</td>
          <td>${product?.Description || "-"}</td>
          <td>${product?.Unit || product?.Square || product?.Fixed || product?.Hour || "-"}</td>
          <td>$${safeToFixed(product?.CostPerUnit || product?.CostPerHour || product?.CostPerSquare || product?.CostPerFixed)}</td>
          <td>$${safeToFixed(product?.Total)}</td>
        </tr>
        ${index % 10 === 9 ? '<tr class="page-break"></tr>' : ''}`
    )
    .join("");
  html = html.replace("{{invoiceRows}}", invoiceRows);

  // const statusColors = {
  //   "Awaiting Response": "rgba(255, 165, 0, 0.2)",
  //   Approved: "rgba(88, 230, 88, 0.2)",
  //   Draft: "rgba(0, 0, 255, 0.2)",
  //   Default: "rgba(0, 0, 0, 0.2)",
  // };

  // html = html.replace("{{invoiceStatus}}", `<span style="color: ${statusColors[data?.status] || statusColors.Default};">${data?.status || "''"}</span>`);
  html = html.replace("{{invoiceStatus}}", data?.status || "-");
  
  html = html.replace("{{SubTotal}}", safeToFixed(data.SubTotal));
  html = html.replace("{{Discount}}", safeToFixed(data.Discount, 0));
  html = html.replace("{{discountAmount}}", safeToFixed(discountAmount));
  html = html.replace("{{Tax}}", safeToFixed(data.Tax));
  html = html.replace("{{gstAmount}}", safeToFixed(gstAmount));
  html = html.replace("{{grandTotal}}", safeToFixed(data.Total));

  return html;
};
module.exports = { quotePdf };
