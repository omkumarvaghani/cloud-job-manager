// const fs = require("fs");
// const path = require("path");
// const moment = require("moment");
// const todayDate = moment().format("YYYY-MM-DD");

// const PaymentReceipt = async (
//   paymentDetails,
//   data,
//   findCompany,
//   findCustomer
// ) => {

//   // Generate the row data
//   const rowData = () => {
//     return `
//     <tr>
//       <td>${todayDate || "-"}</td>
//       <td>${data?.transactionid || "-"}</td>
//       <td>${paymentDetails?.method || "-"}</td>
//       <td>${paymentDetails?.amount || "-"}</td>
//     </tr>`;
//   };

//   let html = fs.readFileSync(
//     path.join(process.cwd(), "features", "htmlFormates", "PaymentReceipt.html"),
//     "utf8"
//   );

//   Object.keys(data).forEach((key) => {
//     const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
//     html = html.replace(regex, data[key] || "-");
//   });

//   if (findCompany) {
//     html = html.replace(
//       "<!-- COMPANY DATA -->",
//       `<div class="company-details">
//         <h4>${findCompany?.companyName || "N/A"}</h4>
//         ${findCompany?.City}${findCompany?.State}${findCompany?.Country}${findCompany?.Zip}
//       </div>
//       <div class="contact-info">
//         <h4>${findCompany?.EmailAddress || ""}</h4>
//         <h4>${findCompany?.phoneNumber || ""}</h4>
//       </div>` || ""
//     );
//   }

//   if (findCustomer) {
//     html = html.replace(
//       "<!-- CUSTOMER DATA -->",
//       `<div class="customer-details">
//         <h4>To,</h4>
//         <p>
//           ${findCustomer?.FirstName || ""} ${findCustomer?.data?.LastName || ""}<br />
//         ${findCustomer?.location}${findCustomer?.City}${findCustomer?.State}${findCustomer?.Country}${findCustomer?.Zip}
//         </p>
//       </div>` || ""
//     );
//   }

//   // Replace the table row
//   html = html.replace("<!-- TABLE ROW -->", rowData());

//   return html;
// };

// module.exports = { PaymentReceipt };

const fs = require("fs");
const path = require("path");
const moment = require("moment");
const todayDate = moment().format("YYYY-MM-DD");

const PaymentReceipt = async (
  paymentDetails,
  data,
  findCompany,
  findCustomer
) => {

  // Generate the row data
  const rowData = () => {
    return `
    <tr>
      <td>${todayDate || "-"}</td>
      <td>${data?.transactionid || "-"}</td>
      <td>${paymentDetails?.method || "-"}</td>
      <td>${paymentDetails?.amount || "-"}</td>
    </tr>`;
  };

  let html = fs.readFileSync(
    path.join(process.cwd(), "features", "htmlFormates", "PaymentReceipt.html"),
    "utf8"
  );

  // Replace placeholders in the template
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    html = html.replace(regex, data[key] || "-");
  });

  // Handle multiple or missing company details
  if (findCompany && findCompany.length > 0) {
    let companyHtml = "";
    findCompany.forEach((company) => {
      companyHtml += `<div class="company-details">
        <h4>${company?.companyName || "N/A"}</h4>
        <p>${[
          company?.City || "",
          company?.State || "",
          company?.Country || "",
          company?.Zip || "",
        ]
          .filter(Boolean)
          .join(", ")}</p>
      </div>
      <div class="contact-info">
        <h4>${company?.EmailAddress || ""}</h4>
        <h4>${company?.phoneNumber || ""}</h4>
      </div>`;
    });
    html = html.replace("<!-- COMPANY DATA -->", companyHtml);
  } else {
    // If no company data is available, use a placeholder
    html = html.replace(
      "<!-- COMPANY DATA -->",
      `<div class="company-details">
        <h4>Company details not available.</h4>
      </div>`
    );
  }

  // Handle customer data dynamically
  if (findCustomer && findCustomer.length > 0) {
    let customerHtml = "";
    findCustomer.forEach((customer) => {
      customerHtml += `<div class="customer-details">
        <h4>To,</h4>
        <p>
          ${customer?.FirstName || ""} ${customer?.LastName || ""}<br />
          ${[
            customer?.location || "",
            customer?.City || "",
            customer?.State || "",
            customer?.Country || "",
            customer?.Zip || "",
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>`;
    });
    html = html.replace("<!-- CUSTOMER DATA -->", customerHtml);
  } else {
    // If no customer data is available, use a placeholder
    html = html.replace(
      "<!-- CUSTOMER DATA -->",
      `<div class="customer-details">
        <h4>To,</h4>
        <p>Customer details not available.</p>
      </div>`
    );
  }

  // Replace the table row
  html = html.replace("<!-- TABLE ROW -->", rowData());
  html = html.replace("{{Date}}", todayDate);
  return html;
};

module.exports = { PaymentReceipt };
