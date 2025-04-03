const fs = require("fs");
const path = require("path");
const moment = require("moment");

const quotePdf = async (data) => {
    let html = fs.readFileSync(
        path.join(process.cwd(), "src", "HtmlFormates", "QuotePdf.html"),
        "utf8"
    );

    const todayDate = moment().format("YYYY-MM-DD");
    const discountAmount = (data.Discount / 100) * data.SubTotal;
    const gstAmount = (data.Tax / 100) * (data.SubTotal - discountAmount);

    const safeToFixed = (value, decimals = 2) => {
        const number = parseFloat(value);
        return isNaN(number) ? "0.00" : number.toFixed(decimals);
    };

    html = html.replace("{{QuoteNumber}}", data?.QuoteNumber || "-");
    html = html.replace("{{CreatedAt}}", todayDate || "-");
    html = html.replace("{{Total}}", safeToFixed(data?.Total));

    html = html.replace("{{customerName}}", `${data?.customerData?.FirstName || "-"} ${data?.customerData?.LastName || "-"}`);
    html = html.replace("{{PhoneNumber}}", data?.customerData?.PhoneNumber || "-");
    html = html.replace("{{EmailAddress}}", data?.customerData?.EmailAddress || "-");

    html = html.replace("{{Address}}", data?.locationData?.Address || "-");
    html = html.replace("{{City}}", data?.locationData?.City || "-");
    html = html.replace("{{State}}", data?.locationData?.State || "-");
    html = html.replace("{{Zip}}", data?.locationData?.Zip || "-");
    html = html.replace("{{Country}}", data?.locationData?.Country || "-");

    html = html.replace("{{companyName}}", data?.companyData?.CompanyName || "-");
    html = html.replace("{{CompanyAddress}}", data?.companyData?.Address || "-");
    html = html.replace("{{CompanyCity}}", data?.companyData?.City || "-");
    html = html.replace("{{CompanyState}}", data?.companyData?.State || "-");
    html = html.replace("{{CompanyZip}}", data?.companyData?.Zip || "-");
    html = html.replace("{{CompanyCountry}}", data?.companyData?.Country || "-");
    html = html.replace("{{CompanyEmail}}", data?.companyData?.EmailAddress || "-");
    html = html.replace("{{CompanyPhone}}", data?.companyData?.PhoneNumber || "-");

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

    html = html.replace("{{invoiceStatus}}", data?.Status || "-");

    html = html.replace("{{SubTotal}}", safeToFixed(data.SubTotal));
    html = html.replace("{{Discount}}", safeToFixed(data.Discount, 0));
    html = html.replace("{{discountAmount}}", safeToFixed(discountAmount));
    html = html.replace("{{Tax}}", safeToFixed(data.Tax));
    html = html.replace("{{gstAmount}}", safeToFixed(gstAmount));
    html = html.replace("{{grandTotal}}", safeToFixed(data.Total));

    return html;
};

module.exports = { quotePdf };
