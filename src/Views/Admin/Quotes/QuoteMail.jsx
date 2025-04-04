import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Input,
  CardBody,
  CardHeader,
  FormGroup,
  Label,
  Form,
} from "reactstrap";
import {
  UncontrolledAccordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
} from "reactstrap";
import { handleAuth } from "../../../components/Login/Auth";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { postFile } from "../../../components/Files/Functions";
import AxiosInstance from "../../AxiosInstance";
import sendToast from "../../../components/Toast/sendToast";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { Typography } from "@mui/material";
import moment from "moment";
import showToast from "../../../components/Toast/Toster";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../components/Icon/Index";

const QuoteMail = ({
  modal,
  setModal,
  customerData,
  quotesData,
  Total,
  taxAmount,
  discountAmount,
  subTotal,
  formik,
  handleSubmit,
  Attachment,
  handleSubmits
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const cdnUrl = process.env.REACT_APP_CDN_API;
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
    let fileURL = "";
    if (file instanceof File) {
      fileURL = URL.createObjectURL(file);
    } else if (typeof file === "string") {
      fileURL = `${cdnUrl}/upload/${file}`;
    }

    const fileName = file instanceof File ? file.name : file;
    const shortenedFileName = fileName?.substring(0, 30);

    return (
      <Grid
        className="d-flex gap-2 align-items-center display-file-main"
        key={fileName}
      >
        <Grid className="d-flex gap-2 align-items-center image-main-section">
          <Typography
            style={{ cursor: "pointer", fontSize: "14px", marginTop: "7px" }}
          >
            {shortenedFileName}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const [subject, setSubject] = useState(
    `Quote from ${data?.full_name} - ${todayDate}`
  );

  useEffect(() => {
    setSubject(`Quote from ${data?.full_name} - ${todayDate}`);
  }, [data]);
  const [content, setContent] = useState(
    `Dear ${customerData?.FirstName} ${customerData?.LastName},\n\n` +
      `Thank you for the opportunity to provide a quote for ${
        quotesData?.Title || formik?.Title
      }. The total amount for the proposed services is $${Total}, as of ${todayDate}.\n\n` +
      `If you have any questions or need clarification, please feel free to contact us at ${data?.EmailAddress}. We are happy to assist and will respond promptly.\n\n` +
      `We look forward to the possibility of working together and contributing to the success of your project.\n\n` +
      `Warm regards,\n` +
      `${data?.full_name}`
  );
  useEffect(() => {
    const initialContent = `
      <Grid style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; border: 1px solid #dedede; box-shadow: none;">
     
        <Grid style="text-align: center; padding: 10px;    width: 50%;margin-left:auto;margin-right:auto">
           <img src="${cdnUrl}/upload/20241002123818_site-logo1.png" alt="Company Logo" style="width: 50%; height: auto;">
        </Grid>

        
        <Grid style="padding: 20px;">
            <h2 style="font-size: 22px; color: #003366; text-align: center; margin-bottom: 20px;">Your Custom Quote is Ready!</h2>
            <Typography style="font-size: 16px; color: #555;">Dear <strong style="color: #003366;">${
              customerData?.FirstName
            } ${customerData?.LastName}</strong></strong>,</Typography>
               <Typography>Thank you for the opportunity to provide a quote for 
    <strong>${
      quotesData?.Title || formik?.Title
    }</strong> with a total amount of <strong> $${Total}</strong>.</Typography>
            <Typography style="font-size: 16px; color: #555;">We are excited to present you with a quote for <strong style="color: #003366;">${
              quotesData?.Title || formik?.Title
            }</strong>.</Typography>
            <Grid style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                <Typography style="font-size: 24px; color: #e88c44; margin: 0;">Total Amount: <strong>$${Total}</strong></Typography>
                <Typography style="font-size: 16px; color: #718096; margin: 0;">Quote Date: <strong>${moment(
                  quotesData?.createdAt
                ).format("DD-MM-YYYY")}</strong></Typography>
            </Grid>
            <Typography style="font-size: 16px; color: #555;">For any questions or to proceed with this quote, feel free to reach out at <a href="mailto:${
              data?.EmailAddress || customerData?.EmailAddress
            }" style="color: #003366; text-decoration: none;"><strong>${
      data?.EmailAddress || customerData?.EmailAddress
    }</strong></a>. We're happy to assist you!</Typography>
            <Typography style="font-size: 16px; color: #555;">We look forward to working with you!</Typography>
            <Grid style="text-align: right; margin-top: 20px;">
              <Typography style="font-size: 16px; color: #555; margin: 0;">Best regards,<br />
                <strong style="color: #003366;">${
                  data?.full_name
                }</strong><br />
                <Typography style="font-size: 14px; color: #718096;">${
                  data?.EmailAddress || customerData?.EmailAddress
                }</Typography>
              </Typography>
            </Grid>
        </Grid>
          <Grid style="background-color: #f4f4f4; color: #777; text-align: center; padding: 15px 0; border-top: 1px solid #dedede;">
            <Typography style="margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} cloudjobmanager. All rights reserved.</Typography>
        </Grid>
      </Grid>
      `;

    setContent(initialContent);
  }, [data, customerData, quotesData, Total, formik?.Title]);

  const handleChange = (value) => {
    setContent(value);
  };

  const [postLoader, setPoastLoader] = useState(false);
  const [loader, setLoader] = useState(false);

  const handleSendMail = async () => {
    try {
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
      const url = `/quote/send_mail/${data?.companyId}`;
      const object = {
        CustomerId: customerData?.CustomerId,
        QuoteId: quotesData?.QuoteId,
        Title: formik?.Title || quotesData?.Title || "",
        QuoteNumber: formik?.QuoteNumber || quotesData?.QuoteNumber || "",
        SubTotal: subTotal || quotesData?.SubTotal || "",
        Discount: discountAmount || quotesData?.Discount || "",
        Tax: taxAmount || quotesData?.Tax || "",
        Total: Total || quotesData?.Total || "",
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
  const handleSaveAndSendMail = async () => {
    try {
      setLoader(true);
      const saveResponse = await handleSubmits();
           if (saveResponse?.statusCode === 200) {
        await handleSendMail(

        );
       
      } else {
        sendToast(saveResponse?.message || "Failed to save quote.");
      }
    } catch (error) {
      console.log("Error in handleSaveAndSendMail:", error?.message);
    } finally {
      setLoader(false);
    }
  };

  const [isPdfChecked, setIsPdfChecked] = useState(false);

  // Function to handle checkbox change
  const handleCheckboxChange = (event) => {
    setIsPdfChecked(event.target.checked);
  };
  // const handleCheckboxChange = (event) => {
  //   setIsPdfChecked(true);
  //   setTimeout(() => {
  //     setIsPdfChecked(false);
  //   }, 3000);
  // };

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
            <Typography className="email_quote_name heading-four colorBlue">
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

          {/* <Grid className="align-items-center mt-0">
              <UncontrolledAccordion>
                <AccordionItem style={{ border: "none" }}>
                  <AccordionHeader targetId="1" style={{ padding: "0px" }}>
                    <Grid
                      style={{ fontSize: "10px", padding: "0px" }}
                      className="d-flex justify-content-between"
                    >
                      <Typography
                        style={{
                          color: "rgb(42, 79, 97)",
                          fontSize: "15px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Quote Attachments
                      </Typography>
                      <Typography
                        style={{
                          width: "24px",
                          height: "24px",
                          border: "1px solid rgba(6, 49, 100, 1)",
                          borderRadius: "50px",
                          background: "rgba(6, 49, 100, 0.2)",
                          // textAlign: "center",
                          // padding: "1px",
                          fontSize: "18px",
                          marginLeft: "10px",
                          // marginRight: "20px",
                          justifyContent: "center",
                          alignItems: "center",
                          textAlign: "center",
                          display: "flex",
                          padding: "1px 1px 0px 0px",
                        }}
                      >
                        <span> {Attachment?.length || 0}</span>
                      </Typography>
                    </Grid>
                  </AccordionHeader>
                  <AccordionBody
                    accordionId="1"
                    style={{ paddingLeft: "0px", marginTop: "-10px" }}
                  >
                    <Grid style={{ marginBottom: "0" }}>
                      {Attachment ? (
                        <Grid
                          style={{
                            maxHeight: "100px",
                            overflowY: "auto",
                            overflowX: "hidden",
                            marginTop: "15px",
                          }}
                        >
                          {Attachment.map((file, index) => (
                            <FormGroup
                              check
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "10px",
                              }}
                            >
                              <Input
                                type="checkbox"
                                id={`send_copy_${index}`}
                                name="send_copy"
                                className="text-blue-color"
                                style={{
                                  marginTop: "6px",
                                  width: "17px",
                                  height: "17px",
                                }}
                                onChange={(e) => {
                                  const value = e.target.checked;
                                  if (value) {
                                    setSelectedFiles([...selectedFiles, file]);
                                  } else {
                                    setSelectedFiles(() =>
                                      selectedFiles.filter(
                                        (files) => files !== file
                                      )
                                    );
                                  }
                                }}
                              />
                              <Label
                                for={`send_copy_${index}`}
                                className="text-blue-color"
                                style={{
                                  fontSize: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  marginLeft: "12px",
                                }}
                              >
                                <Grid
                                  style={{
                                    paddingTop: "10px",
                                    fontSize: "12px",
                                    color: "rgb(42, 79, 97)",
                                  }}
                                >
                                  {typeof file === "string" ? file : file.name}
                                </Grid>
                              </Label>
                            </FormGroup>
                          ))}
                        </Grid>
                      ) : (
                        <Typography
                          style={{
                            fontSize: "12px",
                            lineHeight: "24px",
                            fontStyle: "italic",
                            color: "rgba(6, 49, 100, 0.7)",
                          }}
                        >
                          No attachments were found. <br /> Any attachments on
                          invoice notes will appear here.
                        </Typography>
                      )}
                    </Grid>
                  </AccordionBody>
                </AccordionItem>
              </UncontrolledAccordion>
            </Grid> */}
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
                  <Grid style={{ marginRight: "10px" }} className="ButtomWithN">
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
                       onClick={async () => 
                        handleSendMail()} 
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
                      {/* <BlueButton
                        onClick={async () => handleSaveAndSendMail()}
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
                      /> */}
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

export default QuoteMail;
