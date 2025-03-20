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
import AxiosInstance from "../../AxiosInstance";
import moment from "moment";
import "../style.css";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { FormControl } from "react-bootstrap";
import html2canvas from "html2canvas";
import { generateContractCustomerPDF } from "../../../components/Files/ContractCustomerPDF";
import { TableHead, Grid, Typography } from "@mui/material";
import { Circles } from "react-loader-spinner";
import "./style.css";
import { LoaderComponent } from "../../../components/Icon/Index";
import showToast from "../../../components/Toast/Toster";

function ContractsDetails() {
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

  const [contractDetail, setcontractDetail] = useState("");
  let fetchData = async () => {
    try {
      const res = await AxiosInstance.get(
        `/contract/contract_details/${location?.state?.id}`
      );
      setcontractDetail(res.data.data);
    } catch (error) {
      console.error("Error: ", error.message);
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

    const contractApiUrl = `${baseUrl}/contracts/clientdashboard/${contractDetail.contract_id}`;
    try {
      setLoader(true);
      const response = await AxiosInstance.put(contractApiUrl, {
        signature: image || "",
        change_request: changeRequest || "",
      });

      if (response?.data.statusCode === 200) {
        fetchData();
        setModal(false);
        setModall(false);
        showToast.success(response?.data.message);
      } else {
        showToast.error(response?.data.message);
        console.error(
          "Failed to update contract status:",
          response?.data.message
        );
      }
    } catch (error) {
      console.error("Error updating contract status:", error);
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

  const toggle = () => setModal(!modal);

  const downloadPdf = async () => {
    try {
      const res = await AxiosInstance.post(
        `/contract/contractpdf/${location?.state?.id}`
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
            link.download = "contract_document.pdf";
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
              className="col-12 d-flex download-sec "
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor:
                  contractDetail?.Status === "Unscheduled"
                    ? "white"
                    : contractDetail?.Status === "Today"
                    ? "white"
                    : contractDetail?.Status === "Upcoming"
                    ? "white"
                    : contractDetail?.Status === "Scheduled"
                    ? "white"
                    : "",
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
            <Grid className="d-flex client-cliend-details">
              <Grid
                className="col-12"
                style={{
                  backgroundColor:
                    contractDetail?.Status === "Unscheduled"
                      ? "white"
                      : contractDetail?.Status === "Today"
                      ? "white"
                      : contractDetail?.Status === "Upcoming"
                      ? "white"
                      : contractDetail?.Status === "Scheduled"
                      ? "white"
                      : "",
                }}
              >
                <Card
                  className="my-4 border-blue-color"
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
                      Contract No{" "}
                      {contractDetail?.ContractNumber
                        ? "#" + contractDetail?.ContractNumber
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
                          contractDetail?.Status === "Unscheduled"
                            ? "#FF0000"
                            : contractDetail?.Status === "Today"
                            ? "#DBECFF"
                            : contractDetail?.Status === "Upcoming"
                            ? "AEF6D3"
                            : contractDetail?.Status === "Scheduled"
                            ? "#FFE9BC"
                            : "",
                      }}
                    >
                      <Typography
                        style={{
                          backgroundColor:
                            contractDetail?.Status === "Unscheduled"
                              ? "#FFC6C6"
                              : contractDetail?.Status === "Today"
                              ? "#3595FF"
                              : contractDetail?.Status === "Upcoming"
                              ? "#089F57"
                              : contractDetail?.Status === "Scheduled"
                              ? "#FFAF0B"
                              : "",
                          borderRadius: "50%",
                          padding: "6px",
                          marginRight: "10px",
                          marginBottom: 0,
                        }}
                      ></Typography>
                      {contractDetail?.Status || "Status not available"}
                    </Typography>
                  </CardHeader>
                  <CardBody>
                    <Grid className="d-flex sec-sec">
                      <Grid
                        className="col-8 p-3 border-blue-color"
                        style={{
                          border: "1px solid ",
                          borderTopLeftRadius: "10px",
                          borderBottomLeftRadius: "10px",
                        }}
                      >
                        <Typography
                          className="text-blue-color heading-five"
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                          }}
                        >
                          {contractDetail?.customer?.FirstName ||
                            "FirstName not available"}{" "}
                          {contractDetail?.customer?.LastName ||
                            "Last Name not available"}
                        </Typography>
                        <Typography
                          className="text-blue-color"
                          style={{ fontSize: "15px" }}
                        >
                          {contractDetail?.location?.Address
                            ? contractDetail?.location?.Address + "/"
                            : ""}{" "}
                          {contractDetail?.location?.City
                            ? contractDetail?.location?.City + ","
                            : ""}{" "}
                          {contractDetail?.location?.State
                            ? contractDetail?.location?.State + " - "
                            : ""}
                          {contractDetail?.location?.Zip
                            ? contractDetail?.location?.Zip
                            : ""}
                        </Typography>
                        <Typography
                          style={{ fontSize: "15px" }}
                          className="mb-0 text-blue-color"
                        >
                          {contractDetail?.customer?.PhoneNumber ||
                            "Phone Number not available"}
                        </Typography>
                      </Grid>
                      <Grid
                        className="col-4 p-3 border-blue-color"
                        style={{
                          border: "1px solid",
                          borderTopRightRadius: "10px",
                          borderBottomRightRadius: "10px",
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
                          {moment(contractDetail?.createdAt).format(
                            "MM-DD-YYYY"
                          )}
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
                        // overflowX:"auto"
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
                        <Grid>
                          {contractDetail?.Items?.length > 0 ? (
                            contractDetail.Items.map((product, index) => (
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
                                    {product.Name ||
                                      "Materials & Labor not Available"}
                                  </Typography>
                                  {product.Description ||
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
                              {contractDetail?.subTotal
                                ? `$${new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(contractDetail.subTotal)}`
                                : ""}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid>
                          {contractDetail?.Discount ? (
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
                                  {contractDetail?.Discount
                                    ? contractDetail?.Discount + "%"
                                    : ""}
                                </Typography>
                              </Typography>
                            </Grid>
                          ) : null}

                          {contractDetail?.Tax ? (
                            <Grid
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography className="mb-0 text-blue-color">
                                <Typography className="bold-text">
                                  Tax
                                </Typography>
                              </Typography>
                              <Typography className="mb-0 text-blue-color">
                                <Typography className="bold-text">
                                  +{" "}
                                  {contractDetail?.Tax
                                    ? contractDetail?.Tax + "%"
                                    : ""}
                                </Typography>
                              </Typography>
                            </Grid>
                          ) : null}
                        </Grid>

                        <hr className="my-1 mb-1 text-blue-color" />
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
                              {contractDetail?.Total
                                ? `$${new Intl.NumberFormat("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(contractDetail.Total)}`
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
                        {contractDetail?.Notes ? (
                          <>
                            <Typography
                              style={{ fontSize: "18px", fontWeight: "600" }}
                            >
                              Customer Message :{" "}
                            </Typography>
                            <Typography
                              style={{ fontSize: "17px", fontWeight: "500" }}
                            >
                              {contractDetail.Notes}
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
                  </CardBody>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default ContractsDetails;
