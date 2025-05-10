const fs = require("fs");
const path = require("path");
const moment = require("moment");

const todayDate = moment().format("YYYY-MM-DD");

const contractPdf = async (data) => {
    let html = fs.readFileSync(
        path.join(process.cwd(), "src", "HtmlFormates", "ContractPDF.html"),
        "utf8"
    );

    const safeToFixed = (value, decimals = 2) => {
        const number = parseFloat(value);
        return isNaN(number) ? "0.00" : number.toFixed(decimals);
    };

    const subTotal = data.items.reduce((sum, item) => sum + parseFloat(item.Total || 0), 0);

    const discountAmount = (parseFloat(data.Discount || 0) / 100) * subTotal;
    const gstAmount = (parseFloat(data.Tax || 0) / 100) * (subTotal - discountAmount);
    const grandTotal = subTotal - discountAmount + gstAmount;

    html = html.replace("{{ContractNumber}}", data.ContractNumber || "N/A");
    html = html.replace("{{CreatedAt}}", todayDate);
    html = html.replace("{{Total}}", safeToFixed(grandTotal));

    html = html.replace("{{customerName}}", `${data?.customerData?.FirstName || ""} ${data?.customerData?.LastName || ""}`);
    html = html.replace("{{Address}}", data?.locationData?.Address || "N/A");
    html = html.replace("{{City}}", data?.locationData?.City || "N/A");
    html = html.replace("{{State}}", data?.locationData?.State || "N/A");
    html = html.replace("{{Zip}}", data?.locationData?.Zip || "N/A");
    html = html.replace("{{Country}}", data?.locationData?.Country || "N/A");
    html = html.replace("{{PhoneNumber}}", data?.customerData?.PhoneNumber || "N/A");
    html = html.replace("{{EmailAddress}}", data?.customerData?.EmailAddress || "N/A");

    html = html.replace("{{companyName}}", data?.companyData?.CompanyName || "N/A");
    html = html.replace("{{primaryEmailAddress}}", data?.companyData?.EmailAddress || "N/A");
    html = html.replace("{{CompanyAddress}}", data?.companyData?.Address || "N/A");
    html = html.replace("{{CompanyCity}}", data?.companyData?.City || "N/A");
    html = html.replace("{{CompanyState}}", data?.companyData?.State || "N/A");
    html = html.replace("{{CompanyZip}}", data?.companyData?.Zip || "N/A");
    html = html.replace("{{CompanyCountry}}", data?.companyData?.Country || "N/A");
    html = html.replace("{{CompanyEmail}}", data?.companyData?.EmailAddress || "N/A");
    html = html.replace("{{CompanyPhone}}", data?.companyData?.PhoneNumber || "N/A");

    const invoiceRows = data.items.map(
        (item, index) =>
            `<tr>
                <td>${index + 1}</td>
                <td>${item.Name || "N/A"}</td>
                <td>${item.Description || "N/A"}</td>
                <td>${item.Unit || item.Square || item.Fixed || item.Hourly || "N/A"}</td>
                <td>$${safeToFixed(item.CostPerHour || item.CostPerSquare || item.CostPerFixed || item.CostPerUnit || 0)}</td>
                <td>$${safeToFixed(item.Total || 0)}</td>
            </tr>`
    ).join("");

    html = html.replace("{{invoiceRows}}", invoiceRows);

    html = html.replace("{{subTotal}}", safeToFixed(subTotal));
    html = html.replace("{{Discount}}", safeToFixed(data.Discount || 0));
    html = html.replace("{{discountAmount}}", safeToFixed(discountAmount));
    html = html.replace("{{Tax}}", safeToFixed(data.Tax || 0));
    html = html.replace("{{gstAmount}}", safeToFixed(gstAmount));
    html = html.replace("{{grandTotal}}", safeToFixed(grandTotal));
    html = html.replace("{{invoiceStatus}}", data.Status || "N/A");

    return html;
};

module.exports = { contractPdf };
