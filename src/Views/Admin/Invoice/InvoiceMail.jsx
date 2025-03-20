import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Input, CardHeader, FormGroup, Label } from "reactstrap";
import {
  UncontrolledAccordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
} from "reactstrap";
import pdficon from "../../../assets/image/icons/pdficon.png";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { handleAuth } from "../../../components/Login/Auth";
import { postFile } from "../../../components/Files/Functions";
import AxiosInstance from "../../AxiosInstance";
import sendToast from "../../../components/Toast/sendToast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../components/Toast/Toster";
import { Typography } from "@mui/material";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../components/Icon/Index";
import { FormatAlignJustify } from "@mui/icons-material";

const InvoiceMail = ({
  modal,
  setModal,
  customerData,
  Total,
  invoiceData,
  taxAmount,
  discountAmount,
  subTotal,
  formik,
  handleSubmit,
  DueDate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const cdn_url = process.env.REACT_APP_CDN_API;
  const [inputValue, setInputValue] = useState(
    customerData?.EmailAddress || ""
  );
  const { companyName } = useParams();

  useEffect(() => {
    setInputValue(customerData?.EmailAddress);
  }, [customerData?.EmailAddress]);

  const todayDate =
    DueDate &&
    new Date(DueDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const [files, setFiles] = useState([]);
  const [sendToMail, setSendToMail] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
    } else if (e.type === "dragleave") {
    }
  };

  const [data, setData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await handleAuth(navigate, location);
        setData(res?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const renderFilePreview = (file) => {
    if (file?.type === "application/pdf") {
      return (
        <Grid
          key={file?.name}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <img
            src={pdficon}
            alt="PDF Icon"
            style={{ width: "25px", height: "25px", marginRight: "10px" }}
          />
          <Typography>{file?.name}</Typography>
        </Grid>
      );
    } else if (file?.type?.startsWith("image/")) {
      return (
        <Grid
          key={file?.name}
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={URL.createObjectURL(file)}
            alt={`file-preview-${file?.name}`}
            style={{
              width: "25px",
              height: "25px",
              objectFit: "cover",
              marginRight: "10px",
            }}
          />
          <Typography style={{ fontSize: "14px" }}>{file?.name}</Typography>
        </Grid>
      );
    } else {
      return (
        <Grid key={file?.name} style={{ marginBottom: "10px" }}>
          <Typography>{file?.name}</Typography>
        </Grid>
      );
    }
  };

  const [subject, setSubject] = useState(
    `Invoice from ${data?.full_name} - For Services Rendered`
  );

  useEffect(() => {
    setSubject(`Invoice from ${data?.full_name} - For Services Rendered`);
  }, [data]);

  const cdnUrl = process.env.REACT_APP_CDN_API;

  const [content, setContent] = useState(
    `Dear ${customerData?.FirstName} ${customerData?.LastName},\n\n` +
      `Thank you for your recent business with us.\n\n` +
      `We are writing to inform you that the invoice with a total amount of $${Total} with all discount & tax is paid by ${todayDate}.\n\n` +
      `If you have any questions or require any clarification regarding this invoice, please feel free to contact us at ${data?.EmailAddress}.\n\n` +
      `We appreciate your prompt attention to this matter.\n\n` +
      `Sincerely,\n${data?.full_name}`
  );

  useEffect(() => {
    const initialContent = `
    <Grid style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; border: 1px solid #dedede; box-shadow: none;">
      <!-- Header -->
      <Grid style="text-align: center; padding: 10px;    width: 50%;">
         <img src="${cdnUrl}/upload/20250214095325_site-logo2.png" alt="Company Logo" style="width: 50%; height: auto;">
      </Grid>

      <!-- Body -->
      <Grid style="padding: 20px;">
          <h2 style="font-size: 22px; color: #003366; text-align: center; margin-bottom: 20px;">Your Custom Invoice is Ready!</h2>
          <Typography style="font-size: 16px; color: #555;">Dear <strong style="color: #003366;">${
            customerData?.FirstName
          } ${customerData?.LastName}</strong></strong>,</Typography>
          <Typography>Thank you for your recent business with us.</Typography>
          <Typography>We are writing to inform you that the invoice of <strong>${
            invoiceData?.Subject || formik?.Subject
          }</strong> with a total amount of <strong> $${Total}</strong>  with all discount & tax is paid by ${new Date().toLocaleDateString()}</Typography>
          <Grid style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <Typography style="font-size: 24px; color: #e88c44; margin: 0;">Total Amount: <strong>$${Total}</strong></Typography>
              <Typography style="font-size: 16px; color: #718096; margin: 0;">Quote Date: <strong>${new Date().toLocaleDateString()}</strong></Typography>
          </Grid>
          <Typography style="font-size: 16px; color: #555;">For any questions or to proceed with this invoice, feel free to reach out at <a href="mailto:${
            data?.EmailAddress || customerData?.EmailAddress
          }" style="color: #003366; text-decoration: none;"><strong>${
      data?.EmailAddress || customerData?.EmailAddress
    }</strong></a>. We're happy to assist you!</Typography>
          <Typography style="font-size: 16px; color: #555;">We look forward to working with you!</Typography>
          <Grid style="text-align: right; margin-top: 20px;">
            <Typography style="font-size: 16px; color: #555; margin: 0;">Best regards,<br />
              <strong style="color: #003366;">${data?.full_name}</strong><br />
              <Typography style="font-size: 14px; color: #718096;">${
                data?.EmailAddress || customerData?.EmailAddress
              }</Typography>
            </Typography>
          </Grid>
      </Grid>

      <!-- Footer -->
      <Grid style="background-color: #f4f4f4; color: #777; text-align: center; padding: 15px 0; border-top: 1px solid #dedede;">
          <Typography style="margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} cloudjobrental. All rights reserved.</Typography>
      </Grid>
    </Grid>
    `;

    setContent(initialContent);
  }, [data, customerData, Total, formik?.Subject]);

  const handleChange = (value) => {
    setContent(value);
  };
  const [loader, setLoader] = useState(false);
  const handleSendMail = async () => {
    try {
      setLoader(true);
      const fileUrls = [];
      if (selectedFiles?.length > 0) {
        for (const file of selectedFiles) {
          if (typeof file === "string") {
            fileUrls?.push(file);
          } else {
            const url = await postFile(file);
            fileUrls?.push(url);
          }
        }
      }
      const url = `/invoice/send_mail/${data?.companyId}`;
      const object = {
        CustomerId: customerData?.CustomerId,
        companyName: companyName,
        InvoiceId: invoiceData?.InvoiceId,
        CompanyId: invoiceData?.CompanyId,
        Subject: formik?.Subject || invoiceData?.Subject || "",
        InvoiceNumber:
          formik?.InvoiceNumber || invoiceData?.InvoiceNumber || "",
        SubTotal: subTotal || invoiceData?.SubTotal || "",
        Discount: discountAmount || invoiceData?.Discount || "",
        Tax: taxAmount || invoiceData?.Tax || "",
        Total: Total || invoiceData?.Total || "",
        IsSendpdf: !!isPdfChecked,
      };
      const response = await AxiosInstance.post(url, object);
      if (response?.data?.statusCode === 200) {
        showToast.success(response?.data?.message);
        setModal(false);
        if (handleSubmit) {
          handleSubmit();
        }
      } else {
        sendToast(response?.data?.message);
      }
    } catch (error) {
      console.error(error?.message);
    } finally {
      setLoader(false);
    }
  };

  const [isPdfChecked, setIsPdfChecked] = useState(false);
  
  // const handleCheckboxChange = (event) => {
  //   setIsPdfChecked(event.target.checked);
  // };

  const handleCheckboxChange = (event) => {
    setIsPdfChecked(true);
    setTimeout(() => {
      setIsPdfChecked(false); 
    }, 3000);
  };

  return (
    <>
      <Dialog
        open={modal}
        onClose={() => setModal(!modal)}
        style={{ height: "100%" }}
        fullWidth={true}
        PaperProps={{
          style: {
            borderRadius: "12px",
            // overflow: "hidden",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
        className="email-quote email_sendModel"
      >
        <DialogTitle
          className="d-flex justify-content-between  "
          style={{
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            borderBottom: "4px solid #e88c44",
          }}
        >
          <Grid className="Title" style={{ margin: "0px", padding: "0px" }}>
            <Typography className=" email_quote_nam e heading-four colorBlue">
              Please Confirm
            </Typography>
          </Grid>
        </DialogTitle>
        <DialogContent className="w-100 row mt-3 ">
          <Typography
            className="text-blue-color"
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#333",
              textAlign: "center",
            }}
          >
            Are you sure you want to send the{" "}
            <strong value={inputValue}>Mail</strong> to:
            <Typography
              component="span"
              style={{
                fontWeight: "bold",
                marginLeft: "5px",
              }}
              className="text-orange-color"
            >
              {customerData?.EmailAddress || "the customer's email"}
            </Typography>
            ?{/* <br /> */}
            <Typography
              style={{
                fontSize: "14px",
                color: "#555",
                marginTop: "10px",
                display: "block",
              }}
            >
              Note: Ensure the email address is correct before proceeding.
            </Typography>
          </Typography>

          <Grid className="order-3 order-lf-3">
            <hr />
            {loader ? (
              <Grid className="d-flex justify-content-end">
                <LoaderComponent
                  height="20"
                  width="20"
                  padding="20"
                  loader={loader}
                />
              </Grid>
            ) : (
              <Grid className="d-flex  justify-content-between  QUoteSendCancelBtn ">
                {/* <Grid
                  className="d-flex  button-responsive"
                  style={{ marginTop: "0px" }}
                > */}
                  <Grid
                    style={{
                      color: "rgba(6, 49, 100, 1)",
                      fontSize: "18px",
                      fontWeight: "600",
                      display: "flex",
                      flexDirection: "start",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isPdfChecked}
                          onChange={handleCheckboxChange}
                          color="primary"
                        />
                      }
                      label="Send PDF"
                    />
                  </Grid>
                  <Grid style={{ display: "flex" }}>
                    <Grid
                      style={{ marginRight: "10px" }}
                      className="ButtomWithN"
                    >
                      <WhiteButton
                        onClick={() => {
                          setModal(false);
                          setFiles([]);
                        }}
                        label="No, Go Back"
                        style={{
                          fontSize: "14px",
                          color: "#063164",
                          border: "1px solid #063164",
                          background: "#fff",
                          textTransform: "none",
                          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                          display: "flex",
                          FormatAlignJustify: "end",
                        }}
                        className="ButtomWithN"
                      />
                    </Grid>
                    <Grid
                      className="d-flex  button-responsive"
                      style={{ marginTop: "0px" }}
                    >
                      <Grid className="ButtomWithN">
                        <BlueButton
                          onClick={handleSendMail}
                          style={{
                            fontSize: "14px",
                            color: "#fff",
                            textTransform: "none",
                            marginLeft: "15px",
                            backgroundColor: "#063164",
                            border: "none",
                            boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.15)",
                            transition: "all 0.3s ease",
                          }}
                          label="Yes, Send email"
                          className="yesSnedmailQuote"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                {/* </Grid> */}
              </Grid>
            )}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceMail;
