import React, { useEffect, useState } from "react";

import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import axios from "axios";
import AxiosInstance from "../../Views/AxiosInstance";
import moment from "moment";
import "./style.css";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { FormControl } from "react-bootstrap";
import html2canvas from "html2canvas";
import { generateQuoteCustomerPDF } from "../../components/Files/quoteCustomerPDF";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TableHead,
  Grid,
  Typography,
} from "@mui/material";
import { Circles } from "react-loader-spinner";
import InputText from "../../components/InputFields/InputText";
import showToast from "../../components/Toast/Toster";
import { LoaderComponent } from "../../components/Icon/Index";
import WhiteButton from "../../components/Button/WhiteButton";
import BlueButton from "../../components/Button/BlueButton";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";

function Quotesdetail() {
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const [signatureRef, setSignatureRef] = useState(null);
  const navigate = useNavigate();

  const clearSignature = () => {
    signatureRef?.clear();
  };

  const [typedSignature, setTypedSignature] = useState("");

  const baseUrl = process.env.REACT_APP_BASE_API;
  const location = useLocation();
  const [approving, setApproving] = useState(false);

  const [modal, setModal] = useState(false);
  const [modall, setModall] = useState(false);
  const [mail, setMail] = useState(false);

  const togglee = () => setModall(!modall);
  const setTabId = (tabId) => {
    if (activeTab !== tabId) {
      setActiveTab(tabId);
    }
  };
  const [activeTab, setActiveTab] = useState(1);

  const queryParams = new URLSearchParams(window.location.search);

  const { token } = {
    token: queryParams.get("token"),
  };

  const [quoteDetail, setQuoteDetail] = useState("");
  let fetchData = async () => {
    let id = location?.state?.id;
    if (location?.state?.id) {
      // url = ;
    } else if (token) {
      let url = `/quote/QuoteDetail-decode?token=${token}`;
      const res = await AxiosInstance.get(url);
      if (res.data?.data) {
        id = res.data.data;
      }
    }

    if (id) {
      try {
        const res = await AxiosInstance.get(`/quote/quote_details/${id}`);
        setQuoteDetail(res.data.data);
      } catch (error) {
        console.error("Error: ", error.message);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [savedSignature, setSavedSignature] = useState(null);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [loader, setLoader] = useState(true);
  const [changeRequestReason, setChangeRequestReason] = useState("");

  const saveSignature = async () => {
    const labelElement = document.getElementById("typeSignatureLabel") || "";
    let image = "";
    let changeRequest = {
      CustomerId: "11062024191201",
      reason: changeRequestReason,
      date: moment().utcOffset(330).format("MM-DD-YYYY HH:mm:ss"),
    };
    if (activeTab === 2 && typedSignature && labelElement) {
      try {
        const canvas = await html2canvas(labelElement);
        const signatureData = canvas.toDataURL();

        const signatureBlob = dataURLtoBlob(signatureData);
        const imageData = new FormData();
        imageData.append("files", signatureBlob, "signature.png");

        const url = `${cdnUrl}/upload`;
        const result = await axios.post(url, imageData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSavedSignature(signatureData);
        image = result.data.files[0].filename;
      } catch (error) {
        console.error(error, "imgs");
      }
    } else if (activeTab === 1 && signatureRef) {
      try {
        const signatureCanvas = signatureRef;
        const signatureDataURL = signatureCanvas.toDataURL();
        const signatureBlob = await fetch(signatureDataURL).then((res) =>
          res.blob()
        );

        const imageData = new FormData();
        imageData.append("files", signatureBlob, "signature.png");

        const url = `${cdnUrl}/upload`;
        const result = await axios.post(url, imageData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSavedSignature(signatureDataURL);
        image = result.data.files[0].filename;
      } catch (error) {
        console.error(error, "imgs");
      }
    } else {
    }
    setSignatureSaved(true);

    const quoteApiUrl = `${baseUrl}/quote/${quoteDetail?.quote_id}`;
    try {
      setLoader(true);
      const response = await AxiosInstance.put(quoteApiUrl, {
        signature: image || "",
        change_request: changeRequest || "",
      });

      if (response?.data.statusCode === 200) {
        fetchData();
        setModal(false);
        setModall(false);
        showToast.success(response?.data?.message);
      } else {
        showToast.error(response?.data?.message);
        console.error("Failed to update quote status:", response?.data.message);
      }
    } catch (error) {
      console.error("Error updating quote status:", error);
      showToast.error(error);
    } finally {
      setLoader(false);
      setModal(false);
      setModall(false);
    }
  };

  function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const handleSendMail = async () => {
    try {
      setLoader(true);
      const data = {
        QuoteId: QuoteId,
      };

      const response = await AxiosInstance.post(
        `${baseUrl}/customer/send_mailcompany/${quoteDetail?.QuoteId}`
      );
      if (response?.data?.statusCode === 200) {
        showToast.success(response?.data?.message);
        setModal(false);
      } else {
        // sendToast(response?.data?.message);
      }
    } catch (error) {
      console.error(error?.message);
    } finally {
      setLoader(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      const quoteApiUrl = `${baseUrl}/quote/approve/${quoteDetail.QuoteId}`;
      handleSendMail();

      const payload = {
        status: "Approved",
        AddedAt: new Date(),
      };

      const response = await AxiosInstance.patch(quoteApiUrl, payload);

      if (response?.data.statusCode === 200) {
        fetchData();
        setModal(false);
        showToast.success("Quote approved successfully!");
      } else {
        console.error(
          "Failed to update quote status:",
          response?.data?.message
        );
        showToast.error(
          "Failed to update quote status: " + response?.data?.message
        );
      }
    } catch (error) {
      console.error(
        "Error approving quote:",
        error?.response?.data || error.message || error
      );
      showToast.error(
        "Error approving quote: " +
          (error?.response?.data?.message || error.message || "Unknown error")
      );
    } finally {
      setApproving(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const res = await AxiosInstance.post(
        `/quote/quotepdf/${location?.state?.id}`
      );
      if (res.data.statusCode === 200) {
        const url = `${cdnUrl}/upload/${res.data.fileName}`;
        fetch(url)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.blob();
          })
          .then((blob) => {
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = "quotes_document.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((error) =>
            console.error(
              "There was a problem with the fetch operation:",
              error
            )
          );
      }
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    }
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [RequestMessage, setRequestMessage] = useState("");
  const [errors, setErrors] = useState({});

  const CompanyId = `${quoteDetail?.CompanyId}`;
  const QuoteId = `${quoteDetail?.QuoteId}`;
  const LocationId = `${quoteDetail?.LocationId}`;
  const CustomerId = localStorage.getItem("CustomerId");

  const handleChange = (e) => {
    setRequestMessage(e.target.value);
  };

  const validate = () => {
    let tempErrors = {};
    if (!RequestMessage) {
      tempErrors.RequestMessage = "RequestMessage is required";
    }
    return tempErrors;
  };

  const handleRequestchangemail = async () => {
    try {
      setLoader(true);
      const data = {
        QuoteId: QuoteId,
      };

      const response = await AxiosInstance.post(
        `${baseUrl}/customer/send_requestchangemail/${quoteDetail?.QuoteId}`
      );

      if (response?.data?.statusCode === 200) {
        showToast.success(response?.data?.message);
        setModal(false);
      } else {
        // sendToast(response?.data?.message);
      }
    } catch (error) {
      console.error(error?.message);
    } finally {
      setLoader(false);
    }
  };

  const handleSaveRequest = async () => {
    const tempErrors = validate();
    if (Object.keys(tempErrors).length === 0) {
      try {
        const data = {
          RequestMessage: RequestMessage,
          CompanyId: CompanyId,
          QuoteId: QuoteId,
          LocationId: LocationId,
          CustomerId: CustomerId,
          AddedAt: new Date(),
        };
        setLoader(true);
        const response = await AxiosInstance.post("/requestchange", data);
        if (response.status === 200) {
          showToast.success("Request sent successfully!");
          await fetchData();
          handleRequestchangemail();
        }
        handleClose();
      } catch (error) {
        console.error("Error posting request:", error);
      } finally {
        setLoader(false);
      }
    } else {
      setErrors(tempErrors);
    }
  };

  return (
    <>
      <Grid>
        {loader ? (
          <Grid
            className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
            style={{ height: "80vh", marginTop: "25%" }}
          >
            <LoaderComponent loader={loader} height="50" width="50" />
          </Grid>
        ) : (
          <Grid>
            <Grid
              className="col-9 d-flex download-sec "
              style={{
                display: "flex",
                justifyContent: "space-between",
                width:
                  quoteDetail?.status === "Approved" ||
                  quoteDetail?.status === "Request changed"
                    ? "100%"
                    : quoteDetail?.status === "Awaiting Response"
                    ? "79%"
                    : "auto",
              }}
            >
              <Button className="bg-blue-color" onClick={() => navigate(-1)}>
                <ArrowBackIcon />
              </Button>{" "}
              <Button
                className="bg-blue-color"
                onClick={() => {
                  downloadPdf();
                }}
              >
                <FileDownloadOutlinedIcon /> Download Pdf
              </Button>
            </Grid>
            <Grid className="d-flex client-cliend-details ">
              <Grid
                className="col-9 download-sec"
                style={{
                  width:
                    quoteDetail?.status === "Approved" ||
                    quoteDetail?.status === "Request changed"
                      ? "100%"
                      : quoteDetail?.status === "Awaiting Response"
                      ? "79%"
                      : "auto",
                }}
              >
                <Card
                  className="border-blue-color my-4"
                  style={{ border: "1px solid" }}
                >
                  <CardHeader
                    className="p-3 customerContractDetail"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "none",
                    }}
                  >
                    <Typography
                      className="mb-0 text-blue-color customerContractNumber"
                      style={{ fontSize: "19px" }}
                    >
                      Quotes{" "}
                      {quoteDetail?.QuoteNumber
                        ? "#" + quoteDetail?.QuoteNumber
                        : ""}
                    </Typography>
                    <Typography
                      className="mb-0 text-blue-color"
                      style={{
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor:
                          quoteDetail?.status === "Awaiting Response"
                            ? "rgba(255, 165, 0, 0.2)"
                            : quoteDetail?.status === "Request changed"
                            ? "#FFDFF6"
                            : quoteDetail?.status === "Approved"
                            ? "rgba(88, 230, 88, 0.2)"
                            : "",
                        padding: "10px 24px 10px",
                        borderRadius: "25px",
                      }}
                    >
                      <Typography
                        style={{
                          backgroundColor:
                            quoteDetail?.status === "Awaiting Response"
                              ? "orange"
                              : quoteDetail?.status === "Request changed"
                              ? "#FF33C6"
                              : quoteDetail?.status === "Approved"
                              ? "#58cc58"
                              : "",
                          borderRadius: "50%",
                          padding: "6px",
                          marginRight: "10px",
                          marginBottom: 0,
                        }}
                      ></Typography>
                      {quoteDetail?.status || "Status not available"}
                    </Typography>
                  </CardHeader>
                  <CardBody>
                    <Grid className="d-flex sec-sec">
                      <Grid
                        className="col-8 p-3 border-blue-color"
                        style={{
                          border: "1px solid ",
                          borderTopLeftRadius: "5px",
                          borderBottomLeftRadius: "5px",
                        }}
                      >
                        <Typography
                          className="text-blue-color heading-five"
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                          }}
                        >
                          {quoteDetail?.customer?.FirstName ||
                            "First Name not available"}{" "}
                          {quoteDetail?.customer?.LastName ||
                            "Last Name not available"}
                        </Typography>
                        <Typography
                          className="text-blue-color"
                          style={{ fontSize: "15px" }}
                        >
                          {quoteDetail?.location?.Address
                            ? quoteDetail?.location?.Address + "/"
                            : ""}{" "}
                          {quoteDetail?.location?.City
                            ? quoteDetail?.location?.City + ","
                            : ""}{" "}
                          {quoteDetail?.location?.State
                            ? quoteDetail?.location?.State + " - "
                            : ""}
                          {quoteDetail?.location?.Zip
                            ? quoteDetail?.location?.Zip
                            : ""}
                        </Typography>
                        <Typography
                          style={{ fontSize: "15px" }}
                          className="mb-0 text-blue-color"
                        >
                          {quoteDetail?.customer?.PhoneNumber ||
                            "Phone Number not available"}
                        </Typography>
                      </Grid>
                      <Grid
                        className="col-4 p-3 border-blue-color"
                        style={{
                          border: "1px solid ",
                          borderTopRightRadius: "5px",
                          borderBottomRightRadius: "5px",
                          borderLeft: "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          style={{ fontSize: "15px" }}
                          className="mb-0 text-blue-color"
                        >
                          <Typography className="bold-text">
                            Sent on :{" "}
                          </Typography>
                        </Typography>
                        <Typography
                          style={{ fontSize: "15px" }}
                          className="mb-0 text-blue-color"
                        >
                          {moment(quoteDetail?.createdAt).format("MM-DD-YYYY")}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid
                      className="col-12 border-blue-color overflowWidth"
                      style={{
                        marginTop: "16px",
                        border: "2px solid ",
                        paddingLeft: "15px",
                        paddingRight: "10px",
                        borderRadius: "5px",
                        MinWidth: "600px",
                        // overflowX: "auto",
                      }}
                    >
                      {/* Scrollable Wrapper for both Header and Data */}
                      <Grid className="scrollDetailHere">
                        {/* Header Row */}
                        <Row className="MinwidthPersantage">
                          <Col
                            xl="6"
                            lg="6"
                            md="6"
                            sm="6"
                            xs="6"
                            className="text-blue-color"
                            style={{
                              padding: "10px",
                              border: "none",
                              fontWeight: "500",
                              fontSize: "18px",
                            }}
                          >
                            Materials/Labor
                          </Col>
                          <Col
                            xl="2"
                            lg="2"
                            md="2"
                            sm="2"
                            xs="2"
                            className="text-blue-color"
                            style={{
                              padding: "10px",
                              border: "none",

                              fontWeight: "500",
                              fontSize: "18px",
                            }}
                          >
                            Qty.
                          </Col>
                          <Col
                            xl="2"
                            lg="2"
                            md="2"
                            sm="2"
                            xs="2"
                            className="text-blue-color"
                            style={{
                              padding: "10px",
                              border: "none",

                              fontWeight: "500",
                              fontSize: "18px",
                            }}
                          >
                            Unit Price
                          </Col>
                          <Col
                            xl="2"
                            lg="2"
                            md="2"
                            sm="2"
                            xs="2"
                            className="text-blue-color"
                            style={{
                              padding: "10px",
                              border: "none",

                              fontWeight: "500",
                              fontSize: "18px",
                            }}
                          >
                            Total
                          </Col>
                        </Row>

                        {/* Product Rows */}
                        {quoteDetail?.products?.length > 0 ? (
                          quoteDetail.products.map((product, index) => (
                            <Row key={index} className="MinwidthPersantage">
                              <Col
                                xl="6"
                                lg="6"
                                md="6"
                                sm="6"
                                xs="6"
                                className="text-blue-color"
                                style={{
                                  padding: "10px",
                                  border: "none",
                                }}
                              >
                                <Typography className="heading-five">
                                  {product?.Name ||
                                    "Materials & Labor not available"}
                                </Typography>
                                {product?.Description ||
                                  "Description not available"}
                              </Col>
                              <Col
                                xl="2"
                                lg="2"
                                md="2"
                                sm="2"
                                xs="2"
                                className="text-blue-color"
                                style={{
                                  padding: "10px",
                                  border: "none",
                                }}
                              >
                                {product?.Unit
                                  ? product?.Unit
                                  : product?.Square
                                  ? product?.Square
                                  : product?.Fixed
                                  ? product?.Fixed
                                  : product?.Hourly}
                              </Col>
                              <Col
                                xl="2"
                                lg="2"
                                md="2"
                                sm="2"
                                xs="2"
                                className="text-blue-color"
                                style={{
                                  padding: "10px",
                                  border: "none",
                                }}
                              >
                                $
                                {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(
                                  product?.CostPerHour
                                    ? product.CostPerHour
                                    : product?.CostPerSquare
                                    ? product.CostPerSquare
                                    : product?.CostPerFixed
                                    ? product.CostPerFixed
                                    : product?.CostPerUnit || 0
                                )}
                              </Col>
                              <Col
                                xl="2"
                                lg="2"
                                md="2"
                                sm="2"
                                xs="2"
                                className="text-blue-color"
                                style={{
                                  padding: "10px",
                                  border: "none",
                                }}
                              >
                                $
                                {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(Number(product?.Total) || 0)}
                              </Col>
                            </Row>
                          ))
                        ) : (
                          <Row>
                            <Col colSpan="4">No products available.</Col>
                          </Row>
                        )}
                      </Grid>
                    </Grid>

                    <Grid
                      style={{
                        display: "flex",
                        justifyContent: "end",
                        marginTop: "15px",
                      }}
                    >
                      <Grid
                        className="col-3 border-blue-color"
                        style={{
                          border: "1px solid ",
                          borderRadius: "5px",
                          padding: "15px",
                          width: "50%",
                        }}
                      >
                        <Grid
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography className="mb-0 text-blue-color">
                            <Typography className="bold-text">
                              Sub Total
                            </Typography>
                          </Typography>
                          <Typography className="mb-0 text-blue-color">
                            <Typography className="bold-text">
                              {quoteDetail?.SubTotal
                                ? `$${new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(quoteDetail.SubTotal)}`
                                : ""}
                            </Typography>
                          </Typography>
                        </Grid>
                        {quoteDetail?.Discount ? (
                          <Grid
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography className="mb-0 text-blue-color">
                              <Typography className="bold-text">
                                Discount
                              </Typography>
                            </Typography>
                            <Typography className="mb-0 text-blue-color">
                              <Typography className="bold-text">
                                -{" "}
                                {quoteDetail?.Discount
                                  ? quoteDetail?.Discount + "%"
                                  : ""}
                              </Typography>
                            </Typography>
                          </Grid>
                        ) : null}
                        {quoteDetail?.Tax ? (
                          <Grid
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography className="mb-0 text-blue-color">
                              <Typography className="bold-text">Tax</Typography>
                            </Typography>
                            <Typography className="mb-0 text-blue-color">
                              <Typography className="bold-text">
                                +{" "}
                                {quoteDetail?.Tax ? quoteDetail?.Tax + "%" : ""}
                              </Typography>
                            </Typography>
                          </Grid>
                        ) : null}
                        <hr className="my-1 mb-1 text-blue-color bg-blue-color" />
                        <Grid
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography className="mb-0 text-blue-color">
                            <Typography className="bold-text">Total</Typography>
                          </Typography>
                          <Typography className="mb-0 text-blue-color">
                            <Typography className="bold-text">
                              {quoteDetail?.Total
                                ? `$${new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(quoteDetail?.Total)}`
                                : ""}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid className="my-5">
                      <Typography
                        className="mb-0 text-blue-color"
                        style={{ fontWeight: 600 }}
                      >
                        {quoteDetail?.Notes ? (
                          <>
                            <Typography
                              style={{
                                fontSize: "18px",
                                fontWeight: "600",
                              }}
                            >
                              Customer Message :{" "}
                            </Typography>
                            <Typography
                              style={{
                                fontSize: "17px",
                                fontWeight: "500",
                              }}
                            >
                              {quoteDetail.Notes}
                            </Typography>
                          </>
                        ) : (
                          <Typography
                            style={{ fontSize: "18px", fontWeight: "600" }}
                          >
                              No customer message has been found!
                          </Typography>
                        )}
                      </Typography>
                    </Grid>
                    {/* <Grid className="my-5">
                      <Typography
                        className="mb-0 text-blue-color"
                        style={{ fontWeight: 600 }}
                      >
                        {quoteDetail?.CustomerMessage || "N/A"}
                      </Typography>
                      <Typography className="mb-0 text-blue-color">
                        {quoteDetail?.ContractDisclaimer || "N/A"}
                      </Typography>
                    </Grid> */}
                    {quoteDetail?.signature ? (
                      <Grid className="col-7 d-flex align-items-center">
                        <Grid className="col-8 text-center">
                          <img
                            src={`${cdnUrl}/upload/` + quoteDetail?.signature}
                            style={{ border: "none", height: "80px" }}
                            alt="img"
                          />
                          <hr />
                          <Typography> Signature </Typography>
                        </Grid>
                        <Grid
                          className="col-4 text-center mx-3"
                          style={{ marginTop: "34px" }}
                        >
                          <Typography>
                            {" "}
                            {moment(quoteDetail?.approvedAt).format("ll")}{" "}
                          </Typography>
                          <hr />
                          <Typography className="mb-0"> Date </Typography>
                        </Grid>
                      </Grid>
                    ) : null}
                  </CardBody>
                </Card>
              </Grid>

              {quoteDetail?.status === "Awaiting Response" ? (
                <Grid className="col-3 my-4 mx-2 border-blue-color customerQuoteCost">
                  <Card style={{ height: "100%", border: "1px solid " }}>
                    <CardHeader
                      className="text-center text-blue-color quoteTotalQuote"
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        borderBottom: 0,
                      }}
                    >
                      Quote Total{" "}
                      {quoteDetail?.Total
                        ? `$${new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(quoteDetail.Total)}`
                        : ""}
                    </CardHeader>
                    <CardBody>
                      <Grid
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          style={{
                            backgroundColor: "#07CF10",
                            border: "none",
                            marginBottom: "10px",
                            width: "70%",
                          }}
                          onClick={handleApprove}
                          disabled={approving}
                        >
                          {approving ? "Approving..." : "Approve And Send Mail"}
                        </Button>
                        <WhiteButton
                          className="outline-button-blue-color border-blue-color text-blue-color outline"
                          outline
                          style={{
                            marginBottom: "10px",
                            width: "70%",
                          }}
                          onClick={handleClickOpen}
                          label="Request Changes"
                        />
                      </Grid>
                    </CardBody>
                  </Card>
                </Grid>
              ) : null}
            </Grid>
          </Grid>
        )}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle className="borerBommoModel">Request Changes</DialogTitle>
          <DialogContent>
            <InputText
              value={RequestMessage}
              onChange={handleChange}
              type="text"
              name="RequestMessage"
              label="Enter Request Message here..."
              multiline
              rows={2}
              className="text-blue-color w-100 mt-4"
              error={Boolean(errors.RequestMessage)}
              helperText={errors.RequestMessage}
            />
          </DialogContent>
          <DialogActions>
            <WhiteButton
              onClick={handleClose}
              outline
              className="outline"
              label="Cancel"
            />
            {loader ? (
              <Grid className="d-flex justify-content-center">
                <Circles
                  height="10"
                  width="20"
                  color="#063164"
                  ariaLabel="circles-loading"
                  wrapperStyle={{}}
                  visible={loader}
                />
              </Grid>
            ) : (
              <BlueButton
                onClick={handleSaveRequest}
                className="bg-blue-color"
                label="Save Request"
              />
            )}
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
}

export default Quotesdetail;
