const fs = require("fs");
var path = require("path");
const { chromium } = require("playwright");
const { default: puppeteer } = require("puppeteer");
const ExcelJS = require("exceljs");
const { createObjectCsvWriter } = require("csv-writer");

async function generatePdfFromHtml(htmlContent) {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  const contentDimensions = await page.evaluate(() => {
    const body = document.body;
    return {
      height: Math.ceil(
        Math.max(body.scrollHeight, body.offsetHeight, body.clientHeight)
      ),
    };
  });

  const pdfBuffer = await page.pdf({
    width: `814px`,
    height: `${contentDimensions.height}px`,
    printBackground: true,
    margin: {
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    },
  });

  await browser.close();

  return pdfBuffer;
}

// async function generateAndSavePdf(htmlContent) {
//   try {
//     const baseFilename = "generated_document.pdf";
//     const folder = path.join(__dirname, "../../cdn/files");

//     if (!fs.existsSync(folder)) {
//       fs.mkdirSync(folder, { recursive: true });
//     }

//     // async function getUniqueFileName(baseFilename) {
//     //   let uniqueFilename = baseFilename;
//     //   var filePath = path.join(folder, uniqueFilename);

//     //   while (fs.existsSync(filePath)) {
//     //     const regex = /(?: \((\d+)\))?\.pdf$/;
//     //     const match = regex.exec(baseFilename);
//     //     const number = match ? parseInt(match[1] || "0", 10) + 1 : 1;
//     //     uniqueFilename = `generated_document (${number}).pdf`;
//     //     filePath = path.join(folder, uniqueFilename);
//     //   }

//     //   return uniqueFilename;
//     // }

//     const pdfBuffer = await generatePdfFromHtml(htmlContent);

//     // const newFileName = await getUniqueFileName(baseFilename);
//     const filePath = path.join(folder, baseFilename);

//     fs.writeFileSync(filePath, pdfBuffer);

//     return baseFilename;
//   } catch (error) {
//     console.error("Error generating PDF:", error.message);
//     return error;
//   }
// }

async function generateAndSavePdf(htmlContent) {
  try {
    const baseFilename = "generated_document.pdf";
    const folder = path.join(__dirname, "../../cdn/files");

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate: `<div class="footer" style="  text-align: center;
      font-size: 14px;
      color: #999;
      position: fixed;
      bottom: 0;
      width: 100%;
      background-color: #fff;
      z-index: 1000;">
        <p>
          Thank you for choosing us. If you have any inquiries regarding this
          payment, please don't hesitate to contact us.
        </p>
      <div class="curved-bar" style="      width: 100%;
      height: 20px;
      background-color: rgba(6, 49, 100, 1); -webkit-print-color-adjust: exact;
      border-radius: 100% 100% 0% 0%;"></div>

      </div>`,
      margin: { bottom: "50px" },
    });
    await browser.close();
    const filePath = path.join(folder, baseFilename);
    fs.writeFileSync(filePath, pdfBuffer);
    return baseFilename; 
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    return error;
  }
}

async function generateAndSaveReportPdf(htmlContent) {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  const baseFilename = "generated_payment_report.pdf";
  const folder = path.join(__dirname, "../../cdn/files");
  const filePath = path.join(folder, baseFilename);

  await page.setContent(htmlContent, { waitUntil: "networkidle" });
  const options = {
    path: filePath, 
    format: "A4", 
    orientation: "landscape", 
    printBackground: true, 
    displayHeaderFooter: true,
    footerTemplate: `<div class="footer" style="  text-align: center;
    font-size: 14px;
    color: #999;
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    z-index: 1000;">
      <p>
        Thank you for choosing us. If you have any inquiries regarding this
        payment, please don't hesitate to contact us.
      </p>
    <div class="curved-bar" style="      width: 100%;
    height: 20px;
    background-color: rgba(6, 49, 100, 1); -webkit-print-color-adjust: exact;
    border-radius: 100% 100% 0% 0%;"></div>

    </div>`,
    margin: { bottom: "50px" },
  };

  // Generate and save the PDF
  await page.pdf(options);

  await browser.close();

  // Return the file name (or file path, depending on your use case)
  return baseFilename; // or return filePath if you need the full path
}

async function makeCSV(
  filePath,
  startDate,
  endDate,
  data,
  paddedData,
  columns,
  QuoteId
) {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: columns,
  });

  await csvWriter.writeRecords(paddedData);
}

async function makeExcel(filteredData, outputFilePath, options = {}) {
  const { columns } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");

  worksheet.columns = columns;

  filteredData.forEach((item) => {
    worksheet.addRow(item);
  });

  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength < 18 ? 20 : 20;
  });

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FF000000" }, size: 14 };
    cell.alignment = { horizontal: "center" };
  });

  // Set Left Align for Data Rows
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = { horizontal: rowNumber === 1 ? "center" : "right" };
    });
  });

  await workbook.xlsx.writeFile(outputFilePath);
}
module.exports = {
  generatePdfFromHtml,
  generateAndSavePdf,
  generateAndSaveReportPdf,
  makeCSV,
  makeExcel,
};
