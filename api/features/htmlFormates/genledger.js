const fs = require("fs");
const path = require("path");
const moment = require("moment");

const todayDate = moment().format("YYYY-MM-DD");

const GeneralLedger = async (sortedData, totalBalance) => {
  const invoiceRows = () => {
    if (Array.isArray(sortedData)) {
      return sortedData
        .map(
          (data, index) => `
                <tr>
          <td>${index + 1}</td>

                    <td>${moment(data?.date || data?.createdAt).format(
                      "YYYY-MM-DD"
                    )}</td>
                    <td>${
                      data.type === "payment"
                        ? `-$${data.amount.toFixed(2)}`
                        : `+$${data.amount.toFixed(2)}`
                    }</td>
                    <td>${data?.balance || "0.00"}</td>
                    <td>${data?.type || "-"}</td>
                    <td>${data?.account_name || "Invoice"}</td>
                </tr>
                <td></td>
            `
        )
        .join("");
    } else {
      return `
                <tr>
                    <td>${moment(
                      sortedData?.date || sortedData?.createdAt
                    ).format("YYYY-MM-DD")}</td>
                    <td>${sortedData?.amount || "0.00"}</td>
                    <td>${sortedData?.balance || "0.00"}</td>
                    <td>${sortedData?.type || "-"}</td>
                    <td>${sortedData?.account_name || "Invoice"}</td>
                </tr>
            `;
    }
  };

  // const invoiceRows = sortedData
  //   ?.map(
  //     (product, index) =>
  //       `<tr>
  //         <td>${index + 1}</td>
  //          <td>${moment(data?.date || data?.createdAt).format(
  //                     "YYYY-MM-DD"
  //                   )}</td>
  //          <td>${
  //                     data.type === "payment"
  //                       ? `-$${data.amount.toFixed(2)}`
  //                       : `+$${data.amount.toFixed(2)}`
  //                   }</td>
  //           <td>${data?.balance || "0.00"}</td>
  //                   <td>${data?.type || "-"}</td>
  //                   <td>${data?.account_name || "Invoice"}</td>
  //       </tr>
  //       ${index % 10 === 9 ? '<tr class="page-break"></tr>' : ''}`
  //   )
  //   .join("");

  const TotalBalance = totalBalance;
  let html = fs.readFileSync(
    path.join(process.cwd(), "features", "htmlFormates", "genledger.html"),
    "utf8"
  );

  const firstItem = sortedData[0] || {};

  html = html.replace(
    "{{CompanyName}}",
    firstItem?.company?.companyName || "-"
  );

  const address = firstItem?.company?.Address || "";
  const city = firstItem?.company?.City || "";
  const state = firstItem?.company?.State || "";
  const country = firstItem?.company?.Country || "";
  const zip = firstItem?.company?.Zip || "";
  
  let fullAddress = `${address}, ${state}`.trim(); 
  let remainingDetails = [city, country, zip].filter(Boolean).join(", "); 
  
  if (remainingDetails) {
    fullAddress += `<br />${remainingDetails}`;
  }

  html = html.replace("{{Address}}", fullAddress || ""); 
  html = html.replace(
    "{{CompanyAddress}}",
    firstItem?.companyData?.Address || "-"
  );
  const currentDate = new Date().toLocaleDateString();
  html = html.replace("{{CreatedAt}}", currentDate);

  html = html.replace("{{CompanyCity}}", firstItem?.companyData?.City || "-");
  html = html.replace("{{CompanyState}}", firstItem?.companyData?.State || "-");
  html = html.replace("{{CompanyZip}}", firstItem?.companyData?.Zip || "-");
  html = html.replace(
    "{{CompanyCountry}}",
    firstItem?.companyData?.Country || "-"
  );
  html = html.replace(
    "{{CompanyEmail}}",
    firstItem?.companyData?.EmailAddress || "-"
  );
  html = html.replace(
    "{{CompanyPhone}}",
    firstItem?.companyData?.phoneNumber || "-"
  );
  html = html.replace("{{invoiceStatus}}", firstItem?.Status || "-");
  html = html.replace(
    "{{EmailAddress}}",
    firstItem?.company?.EmailAddress || "-"
  );
  html = html.replace(
    "{{phoneNumber}}",
    firstItem?.company?.phoneNumber || "-"
  );
  html = html.replace(
    "{{FirstName}}",
    firstItem?.customerData?.FirstName || "-"
  );
  html = html.replace("{{LastName}}", firstItem?.customerData?.LastName || "-");
  html = html.replace(
    "{{PhoneNumber}}",
    firstItem?.customerData?.PhoneNumber || "-"
  );
  html = html.replace(
    "{{EmailAddress}}",
    firstItem?.customerData?.EmailAddress || "-"
  );
  // Replace placeholders
  html = html.replace("{{invoiceRows}}", invoiceRows());
  html = html.replace("{{Date}}", todayDate);
  html = html.replace("{{totalbalance}}", TotalBalance);

  return html;
};

module.exports = { GeneralLedger };
