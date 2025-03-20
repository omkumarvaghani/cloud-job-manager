import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

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

const generateInvoicePDF = (invoicedata, action) => {
  const doc = new jsPDF();
  const greyColor = [82, 86, 89];
  doc.setFontSize(12);
  doc.text("RECIPIENT:", 14, 33);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${
      invoicedata?.customer?.FirstName + " " + invoicedata?.customer?.LastName
    }`,
    14,
    39
  );
  doc.setFont("helvetica", "normal");
  doc.text(`${invoicedata?.location?.Address}`, 14, 44);
  doc.text(
    `${
      invoicedata?.location?.City +
      " " +
      invoicedata?.location?.State +
      " " +
      invoicedata?.location?.Country
    }`,
    14,
    49
  );
  doc.text(`${invoicedata?.location?.Zip}`, 14, 54);
  doc.setFillColor(...greyColor);
  doc.rect(140, 25, 56, 10, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Invoice #${invoicedata?.InvoiceNumber}`, 141, 31);

  doc.setFillColor(...greyColor);
  doc.rect(140, 45, 56, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Sent on", 141, 41);
  doc.text(`${moment(invoicedata?.updatedAt).format("ll")}`, 175, 41);
  doc.setTextColor(255, 255, 255);
  doc.text("Total", 141, 51);
  doc.text(`${invoicedata?.Total}`, 180, 51);

  const { Items } = invoicedata;
  let bodyData = [];
  if (Items && Items.length > 0) {
    Items.forEach((item) => {
      bodyData.push([
        `${item?.Name || "-"}`,
        `${item?.Description || "-"}`.trim(),
        `${
          item?.Unit
            ? item?.Unit
            : item?.Square
            ? item?.Square
            : item?.Fixed
            ? item?.Fixed
            : item?.Hourly || "-"
        }`,
        `${
          item?.CostPerHour
            ? Number(item.CostPerHour).toFixed(2)
            : item?.CostPerSquare
            ? Number(item.CostPerSquare).toFixed(2)
            : item?.CostPerFixed
            ? Number(item.CostPerFixed).toFixed(2)
            : Number(item?.CostPerUnit).toFixed(2) || "-"
        }`,
        `${item?.Total || "-"}`,
      ]);
    });
  } else {
    bodyData.push(["", "", "", "", ""]);
  }

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
    createdHeader: function (invoicedata) {
      invoicedata.table.body[0][3].text = "Unit Price";
    },
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const rightMargin = 15;
  const bottomMargin = 30;

  const discountAmount = (invoicedata.Discount / 100) * invoicedata.subTotal;
  const gstAmount =
    (invoicedata.Tax / 100) * (invoicedata.subTotal - discountAmount);
  const totalFields = [
    { label: "Subtotal", value: `$${invoicedata.subTotal}`, isBold: true },
    {
      label: `Discount(${invoicedata.Discount || "-"}%)`,
      value: invoicedata.Discount ? `$${discountAmount.toFixed(2)}` : "-",
      isBold: false,
    },
    {
      label: `GST(${invoicedata.Tax || "-"}%)`,
      value: invoicedata.Tax ? `$${gstAmount.toFixed(2)}` : "-",
      isBold: false,
    },
    { label: "Total", value: `$${invoicedata.Total}`, isBold: true },
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
    "This Invoice is valid for the next 30 days, after which values may be",
    13,
    topMargin
  );
  doc.text("subject to change.", 13, topMargin + 7);

  if (invoicedata?.signature) {
    const signatureY = pageHeight - 40;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.line(13, signatureY - 5, 40, signatureY - 5);
    doc.line(40, signatureY - 5, 110, signatureY - 5);

    doc.text("Date", 19, signatureY);
    doc.text("Client Signature", 55, signatureY);
    const cdnUrl = process.env.REACT_APP_CDN_API;

    const imgData = `${cdnUrl}/upload/${invoicedata.signature}`;
    doc.addImage(imgData, "JPG", 55, signatureY - 16, 40, 10);

    doc.text(
      `${moment(invoicedata.updatedAt).format("ll")}`,
      14,
      signatureY - 6
    );
  }

  if (action === "download") {
    doc.save("Invoice.pdf");
  } else if (action === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }
};

export { postFile, putFile, deleteFile, generateInvoicePDF };
