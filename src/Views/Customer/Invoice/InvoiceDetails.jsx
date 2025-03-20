import React, { useEffect, useState } from "react";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardTitle,
  Col,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import axios from "axios";
import AxiosInstance from "../../../Views/AxiosInstance";
import moment from "moment";
import "../style.css";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { FormControl } from "react-bootstrap";
import html2canvas from "html2canvas";
import { InvoiceCustomerPDF } from "../../../components/Files/InvoiceCustomerPDF";
import { TableHead, Typography } from "@mui/material";
import { Circles } from "react-loader-spinner";
import { LoaderComponent } from "../../../components/Icon/Index";
import { Grid } from "@mui/material";
import showToast from "../../../components/Toast/Toster";
import BlueButton from "../../../components/Button/BlueButton";

function InvoiceDetails() {
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const [signatureRef, setSignatureRef] = useState(null);
  const navigate = useNavigate();

  const clearSignature = () => {
    signatureRef?.clear();
  };

  const [typedSignature, setTypedSignature] = useState("");

  const baseUrl = process.env.REACT_APP_BASE_API;
  const location = useLocation();

  const [modal, setModal] = useState(false);
  const [modall, setModall] = useState(false);

  const togglee = () => setModall(!modall);
  const setTabId = (tabId) => {
    if (activeTab !== tabId) {
      setActiveTab(tabId);
    }
  };
  const [activeTab, setActiveTab] = useState(1);

  const [invoiceDetail, setinvoiceDetail] = useState("");
  let fetchData = async () => {
    try {
      const res = await AxiosInstance.get(
        `/invoice/invoice_detail/${location?.state?.id}`
      );
      setinvoiceDetail(res?.data?.data);
    } catch (error) {
      console.error("Error: ", error?.message);
    } finally {
      setLoader(false);
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
        image = result?.data?.files[0]?.filename;
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
        imageData?.append("files", signatureBlob, "signature.png");

        const url = `${cdnUrl}/upload`;
        const result = await axios.post(url, imageData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSavedSignature(signatureDataURL);
        image = result?.data?.files[0]?.filename;
      } catch (error) {
        console.error(error, "imgs");
      }
    } else {
    }
    setSignatureSaved(true);

    const invoiceApiUrl = `${baseUrl}/invoices/clientdashboard/${invoiceDetail.invoice_id}`;
    try {
      setLoader(true);
      const response = await AxiosInstance.put(invoiceApiUrl, {
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
        console.error(
          "Failed to update invoice status:",
          response?.data.message
        );
      }
    } catch (error) {
      console?.error("Error updating invoice status:", error);
      showToast?.error(error);
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

  const downloadPdf = async () => {
    try {
      const res = await AxiosInstance.post(
        `/invoice/invoicepdf/${location?.state?.id}`
      );
      if (res.data.statusCode === 200) {
        const url = `${cdnUrl}/upload/${res?.data?.fileName}`;

        fetch(url)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response?.blob();
          })
          .then((blob) => {
            const link = document?.createElement("a");
            link.href = window?.URL?.createObjectURL(blob);
            link.download = "invoice_document.pdf";
            document?.body.appendChild(link);
            link.click();
            document?.body?.removeChild(link);
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

  const toggle = () => setModal(!modal);
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
          <Grid className="">
            <Row className="row download-sec mb-4">
              <Col className="col-12 d-flex justify-content-between" xl={12}>
                <BlueButton
                  onClick={() => navigate(-1)}
                  label={
                    <>
                      <ArrowBackIcon />
                    </>
                  }
                />
                <BlueButton
                  onClick={() => {
                    downloadPdf();
                  }}
                  label={
                    <>
                      <FileDownloadOutlinedIcon /> Download Pdf
                    </>
                  }
                />
              </Col>
            </Row>

            <Row
              className="row  client-cliend-details"
              style={{ padding: "!2px" }}
            >
              <Col className="col-12" xl={12}>
                <Card
                  className="my-4 border-blue-color"
                  style={{ border: "1px solid " }}
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
                      Invoice No{" "}
                      {invoiceDetail?.InvoiceNumber
                        ? "#" + invoiceDetail?.InvoiceNumber
                        : ""}
                    </Typography>
                    <Typography
                      className="mb-0 text-blue-color"
                      style={{
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 24px 10px",
                        borderRadius: "25px",
                        backgroundColor:
                          invoiceDetail?.Status === "Paid"
                            ? "#AEF6D3"
                            : invoiceDetail?.Status === "Unpaid"
                            ? "#FFC6C6"
                            : invoiceDetail?.Status === "Pending"
                            ? "#FFE9BC"
                            : invoiceDetail.Status === "Canceled"
                            ? "#FFE9BC"
                            : "",
                      }}
                    >
                      <Typography
                        style={{
                          backgroundColor:
                            invoiceDetail?.Status === "Paid"
                              ? "#089F57"
                              : invoiceDetail?.Status === "Unpaid"
                              ? "#FF0000"
                              : invoiceDetail?.Status === "Pending"
                              ? "#FFAF0B"
                              : invoiceDetail.Status === "Canceled"
                              ? "#FFAF0B"
                              : "",
                          borderRadius: "50%",
                          padding: "6px",
                          marginRight: "10px",
                          marginBottom: 0,
                        }}
                      ></Typography>
                      {invoiceDetail?.Status || "Status not available"}
                    </Typography>
                  </CardHeader>
                  <CardBody>
                    <Row className="row">
                      <Col
                        className="col-md-8 col-12 p-3 border-blue-color first-address-section"
                        style={{
                          border: "1px solid ",
                          borderTopLeftRadius: "10px",
                          borderBottomLeftRadius: "10px",
                        }}
                        md={8}
                        xl={8}
                      >
                        <Typography
                          className="text-blue-color heading-five"
                          style={{ fontSize: "20px", fontWeight: 600 }}
                        >
                          {invoiceDetail?.FirstName} {invoiceDetail?.LastName}
                        </Typography>
                        <Typography
                          className="text-blue-color"
                          style={{ fontSize: "15px" }}
                        >
                          {invoiceDetail?.location?.Address
                            ? invoiceDetail?.location?.Address + "/"
                            : ""}{" "}
                          {invoiceDetail?.location?.City
                            ? invoiceDetail?.location?.City + ","
                            : ""}{" "}
                          {invoiceDetail?.location?.State
                            ? invoiceDetail?.location?.State + " - "
                            : ""}
                          {invoiceDetail?.location?.Zip
                            ? invoiceDetail?.location?.Zip
                            : ""}
                        </Typography>
                        <Typography
                          style={{ fontSize: "15px" }}
                          className="mb-0 text-blue-color"
                        >
                          {invoiceDetail?.PhoneNumber || "Phone Number not available"}
                        </Typography>
                      </Col>
                      <Col
                        className="col-md-4 col-12 p-3 border-blue-color Sec-address-section"
                        style={{
                          border: "1px solid ",
                          borderTopRightRadius: "10px",
                          borderBottomRightRadius: "10px",
                          borderLeft: "none",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        md={4}
                        xl={4}
                      >
                        <Grid className="d-flex gap-5">
                          <Typography
                            style={{ fontSize: "15px" }}
                            className="mb-0 text-blue-color"
                          >
                            <Typography className="bold-text">
                              Issue Date :
                            </Typography>
                          </Typography>
                          <Typography
                            style={{ fontSize: "15px" }}
                            className="mb-0 text-blue-color"
                          >
                            {moment(invoiceDetail?.IssueDate).format(
                              "MM-DD-YYYY"
                            )}
                          </Typography>
                        </Grid>
                        <Grid className="d-flex gap-5">
                          <Typography
                            style={{ fontSize: "15px" }}
                            className="mb-0 text-blue-color"
                          >
                            <Typography className="bold-text">
                              Due Date :
                            </Typography>
                          </Typography>
                          <Typography
                            style={{ fontSize: "15px", marginLeft: "10px" }}
                            className="mb-0 text-blue-color"
                          >
                            {moment(invoiceDetail?.DueDate).format(
                              "MM-DD-YYYY"
                            )}
                          </Typography>
                        </Grid>
                      </Col>
                    </Row>

                    <Col
                      className="col-12 border-blue-color mt-4 product-service-customer overflowWidth"
                      style={{
                        border: "2px solid",
                        paddingLeft: "15px",
                        paddingRight: "10px",
                        // overflowX: "auto",
                        borderRadius: "5px",
                      }}
                      xl={12}
                    >
                      {/* Scrollable Wrapper for both Header and Data */}
                      <Grid className="scrollDetailHere">
                        {/* Header Row */}
                        <Grid className="head-service-customer d-flex">
                          <Row className="MinwidthPersantage widthGivenHere">
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
                              Product/Service
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
                              }}
                            >
                              Total
                            </Col>
                          </Row>
                        </Grid>

                        {/* Product Rows */}
                        {invoiceDetail?.Items?.length > 0 ? (
                          invoiceDetail?.Items?.map((product, index) => (
                            <Grid
                              key={index}
                              className="head-service-customer d-flex"
                            >
                              <Row className="MinwidthPersantage">
                                <Col
                                  xl="6"
                                  lg="6"
                                  md="6"
                                  sm="6"
                                  xs="6"
                                  className="text-blue-color"
                                  style={{ padding: "10px", border: "none" }}
                                >
                                  <Typography className="heading-five">
                                    {product?.Name || "Materials & Labor not Available"} 
                                  </Typography>
                                  {product?.Description || "Desctiption not Available"}
                                </Col>
                                <Col
                                  xl="2"
                                  lg="2"
                                  md="2"
                                  sm="2"
                                  xs="2"
                                  className="text-blue-color"
                                  style={{ padding: "10px", border: "none" }}
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
                                  style={{ padding: "10px", border: "none" }}
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
                                  style={{ padding: "10px", border: "none" }}
                                >
                                  $
                                  {new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(Number(product?.Total) || 0)}
                                </Col>
                              </Row>
                            </Grid>
                          ))
                        ) : (
                          <Row>
                            <Col colSpan="4">No products available.</Col>
                          </Row>
                        )}
                      </Grid>
                    </Col>

                    <Grid className="d-flex justify-content-end mt-3 d-flex">
                      <Col
                        className="col-3 border-blue-color"
                        style={{
                          border: "1px solid",
                          borderRadius: "5px",
                          padding: "15px",
                          width: "50%",
                        }}
                        xl={3}
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
                              {invoiceDetail?.subTotal
                                ? `$${new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(invoiceDetail?.subTotal)}`
                                : ""}
                            </Typography>
                          </Typography>
                        </Grid>
                        {invoiceDetail?.Discount && (
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
                                {invoiceDetail?.Discount
                                  ? invoiceDetail?.Discount + "%"
                                  : ""}
                              </Typography>
                            </Typography>
                          </Grid>
                        )}
                        {invoiceDetail?.Tax && (
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
                                {invoiceDetail?.Tax
                                  ? "$" + invoiceDetail?.Tax
                                  : ""}
                              </Typography>
                            </Typography>
                          </Grid>
                        )}
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
                              {invoiceDetail?.Total
                                ? `$${new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(invoiceDetail?.Total)}`
                                : ""}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Col>
                    </Grid>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default InvoiceDetails;
