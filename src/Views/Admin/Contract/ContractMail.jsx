import { Dialog, DialogContent, DialogTitle, Button, FormControlLabel, Checkbox } from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Input, CardBody, CardHeader, FormGroup, Label } from "reactstrap";
import {
  UncontrolledAccordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
} from "reactstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import pdficon from "../../../assets/image/icons/pdficon.png";
import { handleAuth } from "../../../components/Login/Auth";
import { postFile } from "../../../components/Files/Functions";
import AxiosInstance from "../../AxiosInstance";
import sendToast from "../../../components/Toast/sendToast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../components/Toast/Toster";
import { Typography } from "@mui/material";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";
import {
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../components/Icon/Index";

const ContractMail = ({
  modal,
  setModal,
  customerData,
  propertyData,
  contractData,
  Total,
  taxAmount,
  discountAmount,
  subTotal,
  formik,
  handleSubmit,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const cdn_url = process.env.REACT_APP_CDN_API;
  const [inputValue, setInputValue] = useState(
    customerData?.EmailAddress || ""
  );

  useEffect(() => {
    setInputValue(customerData?.EmailAddress);
  }, [customerData?.EmailAddress]);
  const todayDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [files, setFiles] = useState([]);
  const [sendToMail, setSendToMail] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loader, setLoader] = useState(false);

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
    const droppedFiles = Array.from(e.dataTransfer?.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target?.files);
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
            style={{ width: "30px", height: "30px", marginRight: "10px" }}
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
    `Booking confirmation from ${data?.full_name} - ${todayDate}`
  );

  useEffect(() => {
    setSubject(`Booking confirmation from ${data?.full_name} - ${todayDate}`);
  }, [data]);

  const [content, setContent] = useState(
    `Dear ${customerData?.FirstName} ${
      customerData?.LastName || "LastName not available"
    },\n\n` +
      `Thank you for booking with us.\n\n` +
      `We are pleased to confirm your contract for ${
        contractData?.Title || formik?.Title || "the specified services"
      } ` +
      `for which the Total price is ${contractData?.Total || Total}.` +
      `The location of contract is ${propertyData?.Address || ""} ${
        propertyData?.City ? ", " + propertyData?.City : ""
      } ` +
      `${propertyData?.State ? ", " + propertyData?.State : ""} ` +
      `${propertyData?.Country ? ", " + propertyData?.Country : ""} ` +
      `${propertyData?.Zip ? " - " + propertyData?.Zip : ""}.\n\n` +
      `Should you have any questions or need further assistance, please do not hesitate to contact us at ${data?.EmailAddress}.\n\n` +
      `Sincerely,\n${data?.full_name}`
  );
  const cdnUrl = process.env.REACT_APP_CDN_API;

  useEffect(() => {
    const initialContent = `
    <Grid style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; border: 1px solid #dedede; box-shadow: none;">
     
      <Grid style="text-align: center; padding: 10px;    width: 50%;">
         <img src="${cdnUrl}/upload/20241002123818_site-logo1.png" alt="Company Logo" style="width: 50%; height: auto;">
      </Grid>

    
      <Grid style="padding: 20px;">
          <h2 style="font-size: 22px; color: #003366; text-align: center; margin-bottom: 20px;">Your Custom Contract is Ready!</h2>
          <Typography style="font-size: 16px; color: #555;">Dear <strong style="color: #003366;">${
            customerData?.FirstName
          } ${customerData?.LastName}</strong></strong>,</Typography>
          <Typography>Thank you for booking with us.</Typography>
    <Typography>We are pleased to confirm your contract for <strong>${
      contractData?.Title || formik?.Title
    }</strong> with a total amount of <strong> $${
      contractData?.Total || Total
    }</strong>.</Typography>
          <Grid style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <Typography style="font-size: 24px; color: #e88c44; margin: 0;">Total Amount: <strong>$${
                contractData?.Total || Total
              }</strong></Typography>
              <Typography style="font-size: 16px; color: #718096; margin: 0;">Contract Date: <strong>${moment(
                contractData?.createdAt
              ).format("DD-MM-YYYY")}</strong></Typography>
          </Grid>
          <Typography>The Address of the contract is ${
            propertyData?.Address || ""
          } ${propertyData?.City ? ", " + propertyData?.City : ""}${
      propertyData?.State ? ", " + propertyData?.State : ""
    } ${propertyData?.Country ? ", " + propertyData?.Country : ""} ${
      propertyData?.Zip ? " - " + propertyData?.Zip : ""
    }</Typography>
          <Typography style="font-size: 16px; color: #555;">For any questions or to proceed with this quote, feel free to reach out at <a href="mailto:${
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

    
      <Grid style="background-color: #f4f4f4; color: #777; text-align: center; padding: 15px 0; border-top: 1px solid #dedede;">
          <Typography style="margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} cloudjobrental. All rights reserved.</Typography>
      </Grid>
    </Grid>
    `;

    setContent(initialContent);
  }, [data, customerData, contractData, propertyData, formik?.Title, Total]);

  const [postLoader, setPoastLoader] = useState(false);
  const handleSendMail = async () => {
    try {
      // setPoastLoader(true);
      setLoader(true);
      const fileUrls = [];
      if (selectedFiles?.length > 0) {
        for (const file of selectedFiles) {
          if (typeof file === "string") {
            fileUrls.push(file);
          } else {
            const url = await postFile(file);
            fileUrls.push(url);
          }
        }
      }
      const url = `/contract/send_mail/${data?.companyId}`;
      // const object = {
      //   to: inputValue,
      //   subject,
      //   content,
      //   sendToMe: sendToMail ? data?.EmailAddress : false,
      //   selectedFiles: fileUrls,

      // };
      const object = {
        CustomerId: customerData?.CustomerId,
        ContractId: contractData?.ContractId,
        Title: formik?.Title || contractData?.Title || "",
        ContractNumber:
          formik?.ContractNumber || contractData?.ContractNumber || "",
        SubTotal: subTotal || contractData?.SubTotal || "",
        Discount: discountAmount || contractData?.Discount || "",
        Tax: taxAmount || contractData?.Tax || "",
        Total: Total || contractData?.Total || "",
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

  // Function to handle checkbox change
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
          className="d-flex justify-content-between "
          style={{
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            borderBottom: "4px solid #e88c44",
          }}
        >
          <Grid className="Title " style={{ margin: "0px", padding: "0px" }}>
            <Typography
              className=" mailHeaderToSe heading-four colorBlue"
              style={{ fontWeight: "600", fontSize: "34px" }}
            >
              Please Confirm
            </Typography>
          </Grid>
        </DialogTitle>
        <DialogContent className="w-100 row mt-3  ">
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

export default ContractMail;
