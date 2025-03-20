import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const generateContractPDF = (contractData, action) => {
  const doc = new jsPDF();
  const cdnUrl = process.env.REACT_APP_CDN_API;

  doc.setFont("helvetica");
  doc.setFontSize(10);
  doc.setFillColor(6, 49, 100); 
  doc.rect(0, 0, 210, 30, "F"); 
  doc.setTextColor(255, 255, 255); 
  doc.setFontSize(20);
  doc.text("cloudjobmanager", 10, 10);
  doc.setFontSize(12);
  doc.text("Business Name", 10, 20);
  const logo = new Image();
  logo.src =
    `${cdnUrl}/upload/20240925111357_cmslogoreceipt.png`;
  doc.addImage(logo, "PNG", 150, 5, 50, 20); 
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); 
  doc.text(`CONTRACT NUMBER: #${contractData.ContractNumber}`, 10, 40);
  doc.text(`Sent ON: ${moment(contractData.updatedAt).format("ll")}`, 10, 50);
  doc.text(`Total: ${contractData.Total}`, 10, 60);

  
  doc.text(`RECIPIENT`, 130, 40);
  doc.text(
    `${
      contractData?.customer?.FirstName + " " + contractData?.customer?.LastName
    }`,
    130,
    50
  );
  doc.text(`Address:`, 130, 60);
  doc.text(`${contractData?.location?.Address}`, 130, 65);
  doc.text(`${contractData?.location?.City}`, 130, 70);
  doc.text(
    `${
      contractData?.location?.City +
      " " +
      contractData?.location?.State +
      " " +
      contractData?.location?.Country
    }`,
    130,
    70
  );
  const { Items } = contractData;
  let bodyData = [];
  Items?.forEach((Items) => {
    bodyData.push([
      `${Items.Name || "Name not available"}`,
      `${Items.Description || "Description not available"}`.trim(),
      `${Items.Unit || "Unit not available"}`,
      `$${Items?.CostPerUnit || "CostPerUnit not available"}`,
      `$${Items?.Total || "Total not available"}`,
    ]);
  });

  doc.autoTable({
    startY: 100,
    head: [
      [
        "Sr. No",
        "Product/Service",
        "Description",
        "Qty",
        "Unit Price",
        "Total",
      ],
    ],
    body: bodyData,
    theme: "grid",
    styles: {
      halign: "left",
      valign: "middle",
      fontSize: 10,
    },
    headStyles: {
      fillColor: [6, 49, 100], 
      textColor: [255, 255, 255], 
    },
  });
  doc.setFontSize(90);
  doc.setTextColor(47, 154, 13); 
  doc.text("Approved", 50, 200, { angle: 35, opacity: 0.0 });

  const discountAmount = (contractData.Discount / 100) * contractData.subTotal;
  const gstAmount =
    (contractData.Tax / 100) * (contractData.subTotal - discountAmount);

  doc.setFontSize(12);
  doc.text("Sub Total:", 130, 240);
  doc.text(`${contractData.subTotal}`, 180, 240);
  doc.text("Discount ():", 130, 250);
  doc.text(`${contractData.Discount}`, 180, 250);
  doc.text("Tax ():", 130, 260);
  doc.text(`${contractData.Tax}`, 180, 260);
  doc.setFillColor(6, 49, 100);
  doc.setTextColor(255, 255, 255);
  doc.rect(130, 270, 60, 10, "F");
  doc.text("Total:", 135, 275);
  doc.text(`${contractData.Total}`, 180, 275);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(
    "Thank you for choosing us. If you have any inquiries regarding this invoice, please don’t hesitate to contact us.",
    10,
    290
  );
  if (action === "download") {
    doc.save("Contract.pdf");
  } else if (action === "print") {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }
};

export { generateContractPDF };
