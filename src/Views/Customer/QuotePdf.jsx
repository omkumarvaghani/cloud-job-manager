import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import Img123 from "../../assets/image/CMS_LOGO.svg"

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

const generatePDF = (data) => {
  const doc = new jsPDF();
  const greyColor = [82, 86, 89]; 
  
  const img1Width = 15; // Increased width for Img1
  const img1Height = 13; // Adjust height if needed
    // doc.addImage(
    //   Img123,
    //   "svg",
    //   10, // X position (10 units from the left edge)
    //   15, // Y position (10 units from the top edge)
    //   img1Width,
    //   img1Height
    // );


  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(data?.clientDetails?.CompanyName, 14, 22);

  doc.setFontSize(12);
  doc.text("RECIPIENT:", 14, 33);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${data?.first_name} ${data?.last_name}`, 14, 39);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${data?.property?.street_address1 || "Address not available"} ${
      data?.property?.street_address2 || "Address not available"
    } ${data?.property?.street_address3 || "Address not available"}`,
    14,
    44
  );
  doc.text(
    `${data?.property?.city || "city not available"} ${data?.property?.state || "state not available"} ${data?.property?.country || "country not available"}`,
    14,
    49
  );
  doc.text(data?.property?.zip_code, 14, 54);

  doc.setFillColor(...greyColor);
  doc.rect(140, 25, 56, 10, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Quote #${data?.quote_number || "Quote Number not available"}`, 141, 31);

  doc.setFillColor(...greyColor);
  doc.rect(140, 45, 56, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Sent on", 141, 41);
  doc.text(`${moment(data?.updatedAt).format("ll")}`, 174, 41);
  doc.setTextColor(255, 255, 255);

  doc.text("Total", 141, 52);
  doc.setFont("helvetica", "bold");
  doc.text(`$${data?.subtotal}`, 187, 52);

  const { products } = data;
  let bodyData = [];
  products?.forEach((product) => {
    bodyData.push([
      product?.product_name,
      product?.description.trim(),
      product?.qty,
      `$${product.unit_price || "Unot price not available"}`,
      `$${product.total || "Total not available"} `,
    ]);
  });

  const columnWidths = {
    0: 60, 
    1: 60, 
    2: 20, 
    3: 35, 
    4: 35, 
    5: 25, 
  };

  doc.autoTable({
    startY: 60,
    head: [["Product/Service", "Description", "Qty.", `Unit Price`, "Total"]],
    body: bodyData,
    columnStyles: {
      4: { fontStyle: "bold" }, 
    },
    headStyles: { fillColor: greyColor },
    margin: { top: 10 },
    columnWidth: "auto", 
    columnWidths: columnWidths, 
    columnStyles: {
      3: { cellWidth: 30 }, 
    },
    createdHeader: function (data) {
      data.table.body[0][3].text = "Unit Price"; 
    },
  });


  const pageWidth = doc.internal?.pageSize?.width;
  const pageHeight = doc.internal?.pageSize?.height;
  const rightMargin = 15;
  const bottomMargin = 30;

  const totalText = "Total";
  const totalAmount = `$${data?.total}`;

  const totalTextWidth = doc.getTextWidth(totalText);
  const totalAmountWidth = doc.getTextWidth(totalAmount);

  const totalTextX =
    pageWidth - rightMargin - totalTextWidth - totalAmountWidth - 4;
  const totalAmountX = pageWidth - rightMargin - totalAmountWidth;
  const totalY = pageHeight - bottomMargin - 15;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold"); 
  doc.text(totalText, totalTextX, totalY);
  doc.text(totalAmount, totalAmountX, totalY);
  doc.setFont("helvetica", "normal"); 

  const padding = 2;
  const boxHeight = 10;
  const boxY = totalY - 6;
  const boxWidth = totalTextWidth + totalAmountWidth + padding * 4;

  doc.rect(totalTextX - padding, boxY, boxWidth, boxHeight);
  doc.text(totalText, totalTextX, totalY);
  doc.text(totalAmount, totalAmountX, totalY);

  doc.setFontSize(10);

  doc.text(
    "This quote is valid for the next 30 days, after which values may be subject to change.",
    13,
    pageHeight - bottomMargin
  );

  if (data?.signature) {
    const signatureY = pageHeight - 40;

    doc.setTextColor(0, 0, 0);

    doc.line(13, signatureY - 5, 40, signatureY - 5); 
    doc.line(40, signatureY - 5, 110, signatureY - 5); 

    doc.text("Date", 19, signatureY);
    doc.text("Client Signature", 55, signatureY);

    const imgData = `${cdnUrl}/upload/${data?.signature}`;
    doc.addImage(imgData, "JPG", 55, signatureY - 16, 40, 10);

    doc.text(`${moment(data.updatedAt).format("ll")}`, 14, signatureY - 6);
  }

  doc.save("quote.pdf");
};

export { postFile, putFile, deleteFile, generatePDF };
