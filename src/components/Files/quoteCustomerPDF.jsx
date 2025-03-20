import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import Img from "../../assets/image/logo.png";

const postFile = async (file) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  let strings;
  try {
    const fileData = new FormData();

    if (Array.isArray(file)) {
      file.forEach((f) => fileData.append("files", f));
    } else {
      fileData.append("files", file);
    }
    if (!strings) {
      const res = await axios.post(`${cdnUrl}/upload`, fileData);
      strings = Array.isArray(file)
        ? res.data.files.map((file) => file.filename)
        : res.data.files[0]?.filename;
    }

    return strings;
  } catch (error) {
    console.error("Error: ", error.message);
    throw error;
  }
};

const putFile = async (name, file) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  try {
    const fileData = new FormData();
    fileData.append("files", file);
    const res = await axios.put(`${cdnUrl}/upload/${name}`, fileData);
    return res.data;
  } catch (error) {
    console.error("Error: ", error.message);
  }
};

const deleteFile = async (name) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  try {
    const res = await axios.delete(`${cdnUrl}/upload/${name}`);
    return res.data;
  } catch (error) {
    console.error("Error: ", error.message);
  }
};

const generateQuoteCustomerPDF = (quotesData, action) => {
  const doc = new jsPDF();
  const img1Width = 20;
  const img1Height = 13;
  doc.addImage(Img, "JPEG", 10, 1, img1Width, img1Height);
  const greyColor = [82, 86, 89];
  doc.setFontSize(12);
  doc.text("RECIPIENT:", 14, 33);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${quotesData?.customer?.FirstName + " " + quotesData?.customer?.LastName}`,
    14,
    39
  );
  doc.setFont("helvetica", "normal");
  doc.text(`${quotesData?.location?.Address}`, 14, 44);
  doc.text(
    `${
      quotesData?.location?.City +
      " " +
      quotesData?.location?.State +
      " " +
      quotesData?.location?.Country
    }`,
    14,
    49
  );
  doc.text(`${quotesData?.location?.Zip}`, 14, 54);
  doc.setFillColor(...greyColor);
  doc.rect(140, 25, 56, 10, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Quote #${quotesData.QuoteNumber}`, 141, 31);

  doc.setFillColor(...greyColor);
  doc.rect(140, 45, 56, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Sent on", 141, 41);
  doc.text(`${moment(quotesData.updatedAt).format("ll")}`, 175, 41);
  doc.setTextColor(255, 255, 255);
  doc.text("Total", 141, 51);
  doc.text(`${quotesData.Total}`, 180, 51);

  const { products } = quotesData;
  let bodyData = [];
  products.forEach((product) => {
    bodyData.push([
      `${product?.Name || "Name not available"}`,
      `${product?.Description || "Description not available"}`.trim(),
      `${product?.Unit || "Unit not available"}`,
      `$${product?.CostPerUnit || "CostPerUnit not available"}`,
      `$${product?.Total || "Total not available"}`,
    ]);
  });

  doc.autoTable({
    startY: 60,
    head: [["Product/Service", "Description", "Qty.", `Unit Price`, "Total"]],
    body: bodyData,
    columnStyles: {
      3: { cellWidth: 30 },
      4: { fontStyle: "bold" },
    },
    headStyles: { fillColor: greyColor },
    margin: { top: 10 },
    createdHeader: function (data) {
      data.table.body[0][3].text = "Unit Price";
    },
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const rightMargin = 15;
  const bottomMargin = 30;

  const discountAmount = (quotesData.Discount / 100) * quotesData.SubTotal;
  const gstAmount =
    (quotesData.Tax / 100) * (quotesData.SubTotal - discountAmount);

  const totalFields = [
    { label: "Subtotal", value: `$${quotesData.SubTotal}`, isBold: true },
    {
      label: `Discount(${quotesData.Discount || "-"}%)`,
      value: quotesData.Discount ?`$${discountAmount.toFixed(2)}`:"-",
      isBold: false,
    },
    {
      label: `GST(${quotesData.Tax || "-"}%)`,
      value: quotesData.Tax ? `$${gstAmount.toFixed(2)}` : "-",
      isBold: false,
    },
    { label: "Total", value: `$${quotesData.Total}`, isBold: true },
  ];

  const boxHeight = 9;
  const boxWidth = 35;
  const boxX = pageWidth - rightMargin - boxWidth;
  let boxY = pageHeight - bottomMargin - totalFields.length * boxHeight;

  doc.setDrawColor(0, 0, 0);
  totalFields.forEach((field) => {
    const text = field.label;
    const amount = field.value;

    if (field.isBold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }

    doc.rect(boxX, boxY, boxWidth, boxHeight);

    const amountWidth = doc.getTextWidth(amount);
    const amountX = boxX + boxWidth / 2 - amountWidth / 2;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(text, boxX - doc.getTextWidth(text) - 5, boxY + 7);
    doc.text(amount, amountX, boxY + 7);

    boxY += boxHeight;
  });

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  const topMargin = 250;
  doc.text(
    "This quote is valid for the next 30 days, after which values may be",
    13,
    topMargin
  );
  doc.text("subject to change.", 13, topMargin + 7);

  if (quotesData?.signature) {
    const signatureY = pageHeight - 40;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.line(13, signatureY - 5, 40, signatureY - 5);
    doc.line(40, signatureY - 5, 110, signatureY - 5);

    doc.text("Date", 19, signatureY);
    doc.text("Client Signature", 55, signatureY);
    const cdnUrl = process.env.REACT_APP_CDN_API;

    const imgData = `${cdnUrl}/upload/${quotesData.signature}`;
    doc.addImage(imgData, "JPG", 55, signatureY - 16, 40, 10);

    doc.text(
      `${moment(quotesData.updatedAt).format("ll")}`,
      14,
      signatureY - 6
    );
  }

  if (action === "download") {
    doc.save("quote.pdf");
  } else if (action === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }
};

export { postFile, putFile, deleteFile, generateQuoteCustomerPDF };
