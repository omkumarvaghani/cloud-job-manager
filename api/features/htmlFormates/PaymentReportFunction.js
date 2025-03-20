const fs = require("fs");
const path = require("path");
const moment = require("moment");
const todayDate = new Date().toLocaleDateString();

const paymentReportPdf = async (data, startDate, endDate, method) => {
  // Load HTML template
  let html = fs.readFileSync(
    path.join(process.cwd(), "features", "htmlFormates", "PaymentReport.html"),
    "utf8"
  );

  const safeToFixed = (value, decimals = 2) => {
    const number = parseFloat(value);
    return isNaN(number) ? "0.00" : number.toFixed(decimals);
  };

  let filteredData = data;

  // Check if startDate, endDate or method are provided
  if ((startDate && endDate) || method) {
    let start, end;
    if (startDate && endDate) {
      start = moment(startDate, "YYYY-MM-DD").startOf("day");
      end = moment(endDate, "YYYY-MM-DD").endOf("day");
    }

    // Define valid methods
    const validMethods = ["Cash", "Card", "ACH", "Cheque"];

    // Filter data based on createdAt date and/or method
    filteredData = data.filter((item) => {
      const createdAt = moment(item.createdAt, "YYYY-MM-DD");
      const isDateValid =
        startDate && endDate
          ? createdAt.isBetween(start, end, null, "[]")
          : true;
      const isMethodValid = method
        ? validMethods.includes(item.method) && item.method === method
        : true;

      return isDateValid && isMethodValid;
    });
  }

  let invoiceRows = "";
  let currentPageRows = [];

  // Add rows dynamically, without predefining how many rows per page
  filteredData.forEach((item, index) => {
    const date = moment(item.date).format("YYYY-MM-DD");
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${item.method || "-"}</td>
        <td>${safeToFixed(item.amount || 0)}</td>
        <td>${date || "-"}</td>
        <td>${
          item.first_name
            ? item.first_name
            : item.getCustomerDetails?.FirstName || ""
        } ${
      item.last_name
        ? item.last_name
        : item.getCustomerDetails?.LastName || "N/A"
    }</td>
        <td>${
          item.email
            ? item.email
            : item.getCustomerDetails?.EmailAddress || "N/A"
        }</td>
        <td>${
          item.phone
            ? item.phone
            : item.getCustomerDetails?.PhoneNumber || "N/A"
        }</td>
      </tr>`;

    currentPageRows.push(row);
  });

  // Add the rows to the table in the HTML
  invoiceRows += `
    <table>
      <thead>
        <tr>
          <th>Sr. No</th>
          <th>Method</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Customer Name</th>
          <th>email</th>
          <th>phone</th>
        </tr>
      </thead>
      <tbody>
        ${currentPageRows.join("")}
      </tbody>
    </table>`;

  // Insert rows into HTML template
  html = html.replace("{{invoiceRows}}", invoiceRows);

  // Add company information (we will assume it's from the first item in data)
  const firstItem = filteredData[0] || {};
  html = html.replace(
    "{{CompanyName}}",
    firstItem.getCompanyDetails?.companyName || "-"
  );
  html = html.replace(
    "{{Address}}",
    firstItem.getCompanyDetails?.Address || "-"
  );
  html = html.replace(
    "{{phoneNumber}}",
    firstItem.getCompanyDetails?.phoneNumber || "-"
  );
  html = html.replace(
    "{{EmailAddress}}",
    firstItem.getCompanyDetails?.EmailAddress || "-"
  );

  // Add a summary if needed (like total)
  const totalAmount = filteredData.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  html = html.replace("{{TotalAmount}}", safeToFixed(totalAmount));

  // Add today's date
  const todayDate = moment().format("YYYY-MM-DD");
  html = html.replace("{{TodayDate}}", todayDate);

  // CSS for pagination
  html += `
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 0;
        padding: 0;
      }
      th, td {
        padding: 8px;
        text-align: left;
      }
      td {
        word-wrap: break-word;
        white-space: normal;
      }
      .page-break {
        page-break-before: always;
        page-break-inside: avoid;
        margin-top: 10px;
      }

      /* Ensure the content fits on the page */
      @page {
        size: A4 landscape;
        // margin: 10mm;
      }

      /* Ensure there are no breaks within the table rows, and only after a table if necessary */
      @media print {
        tr {
          page-break-inside: avoid;
        }
        table {
          page-break-before: auto;
        }
      }

      .container {
        padding: 0 10px;
        width: 100%;
      }
    </style>`;

  return html;
};

module.exports = { paymentReportPdf };
