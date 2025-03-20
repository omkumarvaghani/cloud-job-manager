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
    return res?.data;
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

const generateContractCustomerPDF = (contractData, action) => {
  const doc = new jsPDF();
  const greyColor = [82, 86, 89];
  doc.setFontSize(12);
  doc.text("RECIPIENT:", 14, 33);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${
      contractData?.customer?.FirstName + " " + contractData?.customer?.LastName
    }`,
    14,
    39
  );
  doc.setFont("helvetica", "normal");
  doc.text(`${contractData?.location?.Address}`, 14, 44);
  doc.text(
    `${
      contractData?.location?.City +
      " " +
      contractData?.location?.State +
      " " +
      contractData?.location?.Country
    }`,
    14,
    49
  );
  doc.text(`${contractData?.location?.Zip}`, 14, 54);
  doc.setFillColor(...greyColor);
  doc.rect(140, 25, 56, 10, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Contract #${contractData?.ContractNumber}`, 141, 31);

  doc.setFillColor(...greyColor);
  doc.rect(140, 45, 56, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Sent on", 141, 41);
  doc.text(`${moment(contractData?.updatedAt).format("ll")}`, 175, 41);
  doc.setTextColor(255, 255, 255);
  doc.text("Total", 141, 51);
  doc.text(`${contractData?.Total}`, 180, 51);

  const { Items } = contractData;
  let bodyData = [];
  Items?.forEach((Items) => {
    bodyData.push([
      `${Items?.Name || ""}`,
      `${Items?.Description || ""}`.trim(),
      `${Items?.Unit || ""}`,
      `$${Items?.CostPerUnit || ""}`,
      `$${Items?.Total || ""}`,
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

  const discountAmount = (contractData?.Discount / 100) * contractData?.subTotal;
  const gstAmount =
    (contractData?.Tax / 100) * (contractData?.subTotal - discountAmount);

  const totalFields = [
    { label: "Subtotal", value: `$${contractData?.subTotal}`, isBold: true },
    {
      label: `Discount(${contractData?.Discount || "0"}%)`,
      value: contractData?.Discount ? `$${discountAmount.toFixed(2)}` : "-",
      isBold: false,
    },
    {
      label: `GST(${contractData?.Tax || "0"}%)`,
      value: contractData?.Tax ? `$${gstAmount.toFixed(2)}` : "-",
      isBold: false,
    },
    { label: "Total", value: `$${contractData?.Total}`, isBold: true },
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
    "This Contract is valid for the next 30 days, after which values may be",
    13,
    topMargin
  );
  doc.text("subject to change.", 13, topMargin + 7);
  if (action === "download") {
    doc.save("Contract.pdf");
  } else if (action === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }
};

export { postFile, putFile, deleteFile, generateContractCustomerPDF };
