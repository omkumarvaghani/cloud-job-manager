const fs = require("fs");
const path = require("path");

const invoiceReciept = async (data) => {
  const rowData = () => {
    const rows = data?.paymentHistory
      ?.map(
        (item) =>
          `<tr>
        <td>${item?.date || "-"}</td>
        <td>${item?.transactionid || "-"}</td>
        <td>${item?.method || "-"}</td>
        <td>${item?.amount || "-"}</td>
      </tr>`
      )
      .join("");
    return rows;
  };

  let html = fs.readFileSync(
    path.join(process.cwd(), "features", "htmlFormates", "InvoiceReceipt.html"),
    "utf8"
  );

  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    html = html.replace(regex, data[key] || "-");
  });

  if (data?.CompanyData) {
    Object.keys(data).forEach(() => {
      html = html.replace(
        "<!-- COMPANY DATA -->",
        `<div class="company-details">
          <h4>${data?.CompanyData?.CompanyName || ""}</h4>
          ${
            data?.CompanyData?.location
              ? `<p>${Object.entries(data?.CompanyData?.location)
                  .map(([key, value]) => value || "")
                  .join(", ")}</p>`
              : ""
          }
        </div>
        <div class="contact-info">
          <h4>${data?.CompanyData?.EmailAddress || ""}</h4>
          <h4>${data?.CompanyData?.PhoneNumber || ""}</h4>
        </div>` || ""
      );
    });
  }

  if (data?.customer) {
    Object.keys(data).forEach(() => {
      html = html.replace(
        "<!-- CUSTOMER DATA -->",
        `<div class="customer-details">
          <h4>To,</h4>
          <p>
            ${data?.customer?.FirstName || ""} ${
          data?.customer?.LastName || ""
        }<br />
          ${
            data?.location
              ? `<p>${Object.entries(data?.location)
                  .map(([key, value]) => value || "")
                  .join(", ")}</p>`
              : ""
          }
          </p>
        </div>` || ""
      );
    });
  }

  if (data?.paymentHistory && data?.paymentHistory?.length > 0) {
    Object.keys(data).forEach((key) => {
      html = html.replace("<!-- TABLE ROW -->", rowData());
    });
  }
  return html;
};

module.exports = { invoiceReciept };
