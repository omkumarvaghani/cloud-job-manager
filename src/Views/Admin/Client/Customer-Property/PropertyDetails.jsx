import React, { useEffect, useState } from "react";
import truck from "../../../../assets/image/icons/truck.svg";
import schedule from "../../../../assets/image/icons/schedule.svg";
import {
  CardBody,
  CardHeader,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Table,
  Button,
} from "reactstrap";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Circles } from "react-loader-spinner";
import moment from "moment";
import AxiosInstance from "../../../AxiosInstance";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Grid } from "@mui/material";
import { LoaderComponent } from "../../../../components/Icon/Index";
import { Typography } from "@mui/material";
import { handleAuth } from "../../../../components/Login/Auth";
import BlueButton from "../../../../components/Button/BlueButton";
import Previous from "../../../../assets/image/icons/Previous.png";

const PropertyDetails = () => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const { CompanyName } = useParams();
  const location = useLocation();
  const [tokenDecode, setTokenDecode] = useState({});
  const [DateDecode, setDateDecode] = useState({});
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [DateDecode]);

  const [loader, setLoader] = useState(true);
  const navigate = useNavigate();

  const [data, setData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      if (location?.state?.id) {
        try {
          const res = await AxiosInstance.get(
            `${baseUrl}/v1/location/properties/${location?.state?.id}`
          );
          setData(res?.data?.data);
        } catch (error) {
          console.error("Error: ", error.message);
        } finally {
          setLoader(false);
        }
      }
    };
    fetchData();
  }, [location?.state?.id, baseUrl]);

  const [activeTabId, setActiveTabId] = useState(1);
  const handleClick = (tabId) => {
    setActiveTabId(tabId);
  };

  const [quotes, setQuotes] = useState([]);
  useEffect(() => {
    const fetchQuote = async () => {
      if (data && data?.CustomerId && data?.LocationId) {
        try {
          const response = await AxiosInstance.get(
            `${baseUrl}/quote/get_quotes_customer_property/${
              localStorage.getItem("CompanyId") || tokenDecode?.companyId
            }/${data?.CustomerId}/${data?.LocationId}`
          );
          if (response?.data?.statusCode === 200) {
            setQuotes(response?.data?.data);
          }
        } catch (err) {
          console.error("Error: ", err.message);
        }
      }
    };

    fetchQuote();
  }, [data, tokenDecode]);

  const [contract, setContract] = useState([]);

  useEffect(() => {
    const fetchContract = async () => {
      if (data && data?.CustomerId && data?.LocationId) {
        try {
          const response = await AxiosInstance.get(
            `${baseUrl}/contract/get_contract_customer_property/${
              localStorage.getItem("CompanyId") || tokenDecode?.companyId
            }/${data?.CustomerId}/${data?.LocationId}`
          );
          setContract(response?.data?.data);
        } catch (err) {
          console.error("Error: ", err.message);
        }
      }
    };
    fetchContract();
  }, [data, tokenDecode]);

  const [invoice, setInvoice] = useState([]);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (data && data?.CustomerId && data?.LocationId) {
        try {
          const response = await AxiosInstance.get(
            `${baseUrl}/invoice/get_invoice_customer_property/${
              localStorage.getItem("CompanyId") || tokenDecode?.companyId
            }/${data?.CustomerId}/${data?.LocationId}`
          );
          if (response?.data?.statusCode === 200) {
            setInvoice(response?.data?.data);
          }
        } catch (err) {
          console.error("Error: ", err.message);
        }
      }
    };
    fetchInvoice();
  }, [data, tokenDecode]);

  const handleNavigate = (quoteId) => {
    navigate(`/${CompanyName}/quotes-detail`, {
      state: {
        id: quoteId,
        navigats: [`/index`, `/quotes-detail`],
      },
    });
  };

  const handleContractNavigate = (id) => {
    navigate(`/${CompanyName}/contractdetails`, {
      state: {
        id,
        navigats: [`/index`, `/contractdetails`],
      },
    });
  };

  const handleInvoiceNavigate = (id) => {
    navigate(`/${CompanyName}/invoice-details`, {
      state: {
        id,
        navigats: [`/index`, `/invoice-details`],
      },
    });
  };

  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
          <Button
            style={{
              marginRight: "10px",
              width: "50px",
              height: "40px",
              marginBottom: "10px",
              padding: "0px 0px",
              borderRadius: "4px",
              marginTop: "10px",
            }}
            onClick={() => {
              navigate(-1);
              // navigate(
              //   `/${
              //     CompanyName
              //       ? CompanyName + "/customer"
              //       : "staff-member" + "/workercustomer"
              //   }`,
              //   {
              //     state: {
              //       navigats: location?.state?.navigats.filter(
              //         (item) => item !== "/customer"
              //       ),
              //     },
              //   }
              // );
            }}
            className="text-capitalize bg-button-blue-color text-white-color "
          >
            <ArrowBackOutlinedIcon />
          </Button>
          <Grid
            className="username text-blue-color"
            style={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              fontSize: "27px",
            }}
          >
            Property Details
          </Grid>
          <Grid>
            <Grid
              className="my-2 detail-card "
              style={{ border: "none", gap: "12px" }}
            >
              <Col xs={12} className="first-card add_new_pxroperty_card">
                <Grid
                  className="address"
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    borderRadius: "8px",
                    border: "0.5px solid rgba(6, 49, 100, 30%)",
                    paddingRight: "20px",
                  }}
                >
                  <CardHeader
                    className="d-flex justify-content-between align-items-center Typography-2"
                    style={{ border: "none" }}
                  >
                    <Typography
                      className="text-blue-color heading-five"
                      style={{
                        fontWeight: 600,
                        paddingLeft: "18px",
                        paddingTop: "17px",
                      }}
                    >
                      Location
                    </Typography>
                  </CardHeader>
                  <CardBody style={{ padding: "10px 0px" }}>
                    <Table borderless>
                      <TableHead>
                        <TableRow>
                          <th style={{ paddingLeft: "20px" }}>Address</th>
                          <th className="text-start text-blue-color">City</th>
                          <th className="text-center text-blue-color">State</th>
                          <th className="text-center text-blue-color">
                            Country
                          </th>
                          <th className="text-end text-blue-color">Zip</th>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell
                            style={{
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: "20px",
                            }}
                          >
                            <MyLocationIcon style={{ marginRight: "15px" }} />
                            <Typography
                              className="text-blue-color"
                              style={{ fontSize: "14px" }}
                            >
                              {data?.Address
                                ? data?.Address
                                : "Addres not available"}{" "}
                            </Typography>
                          </TableCell>
                          <TableCell
                            className="text-start text-blue-color"
                            style={{ fontSize: "14px" }}
                          >
                            {data?.City ? data?.City : "City not available"}
                          </TableCell>
                          <TableCell
                            className="text-center text-blue-color"
                            style={{ fontSize: "14px" }}
                          >
                            {data?.State ? data?.State : "Stat not available"}
                          </TableCell>
                          <TableCell
                            className="text-center text-blue-color"
                            style={{ fontSize: "14px" }}
                          >
                            {data?.Country
                              ? data?.Country
                              : "Country not available"}
                          </TableCell>
                          <TableCell
                            className="text-end text-blue-color"
                            style={{ fontSize: "14px", paddingRight: "" }}
                          >
                            {data?.Zip ? data?.Zip : "Zip not available"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardBody>
                </Grid>
                <Grid
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    borderRadius: "8px",
                    border: "0.5px solid rgba(6, 49, 100, 30%)",
                  }}
                  className="my-4"
                >
                  <CardHeader
                    className="d-flex justify-content-between align-items-center Typography-2"
                    style={{ border: "none" }}
                  >
                    <Typography
                      className="text-blue-color heading-five mt-1 mb-2 "
                      style={{ fontWeight: 600, paddingLeft: "18px" }}
                    >
                      {/* Overview */}
                    </Typography>
                  </CardHeader>
                  <CardBody style={{ padding: "10px 0px" }}>
                    <Grid className="text-start">
                      <Nav
                        className="bg-orange-color customerOverviewNav "
                        tabs
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <NavItem>
                          <NavLink
                            className={activeTabId === 1 ? "active" : ""}
                            onClick={() => handleClick(1)}
                            style={{ cursor: "pointer" }}
                          >
                            All
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={activeTabId === 3 ? "active" : ""}
                            onClick={() => handleClick(3)}
                            style={{ cursor: "pointer" }}
                          >
                            Quotes
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={activeTabId === 5 ? "active" : ""}
                            onClick={() => handleClick(5)}
                            style={{ cursor: "pointer" }}
                          >
                            Contract
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={activeTabId === 6 ? "active" : ""}
                            onClick={() => handleClick(6)}
                            style={{ cursor: "pointer" }}
                          >
                            Invoice
                          </NavLink>
                        </NavItem>
                      </Nav>
                      <TabContent
                        activeTab={activeTabId}
                        className="text-start"
                      >
                        <TabPane
                          tabId={1}
                          style={{
                            maxHeight: "300px",
                            overflowY: "scroll",
                            overflowX: "clip",
                          }}
                        >
                          <Row>
                            <Col
                              sm="12"
                              className="d-flex flex-column"
                              style={{
                                gap: "10px",
                                maxHeight:
                                  quotes?.length > 3 ? "300px" : "auto",
                                overflowY:
                                  quotes?.length > 3 ? "auto" : "visible",
                                overflowX: "auto",
                              }}
                            >
                              {(quotes && quotes?.length > 0) ||
                              (contract && contract?.length > 0) ||
                              (invoice && invoice.length > 0) ? (
                                <>
                                  {quotes &&
                                    quotes?.length > 0 &&
                                    quotes.map((data, index) => (
                                      <Grid
                                        key={index}
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          handleNavigate(data?.QuoteId)
                                        }
                                      >
                                        <Grid className="mx-3 allDetailPageScroll ">
                                          <Row
                                            className="row align-items-start pt-2  p-2 Typography-3 border-blue-color text-blue-color customerScrollHorizontal"
                                            style={{
                                              border: "1px solid",
                                              fontSize: "12px",
                                              boxShadow:
                                                "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                              borderRadius: "8px",
                                              border:
                                                "0.5px solid rgba(6, 49, 100, 0.8)",
                                            }}
                                          >
                                            <Col className="col">
                                              <Typography
                                                style={{
                                                  marginBottom: "5px",
                                                  fontWeight: "700",
                                                  fontSize: "13px",
                                                }}
                                              >
                                                <Typography
                                                  style={{
                                                    fontWeight: "700",
                                                    fontSize: "13px",
                                                  }}
                                                >
                                                  Quote #
                                                  {data?.QuoteNumber ||
                                                    "QuoteNumber not available"}
                                                </Typography>
                                              </Typography>
                                              <Typography
                                                style={{
                                                  color:
                                                    data?.status === "Approved"
                                                      ? "rgb(88, 204, 88)"
                                                      : data?.status ===
                                                        "Awaiting Response"
                                                      ? "orange"
                                                      : "#063164",
                                                }}
                                              >
                                                <Typography
                                                  style={{
                                                    fontWeight: "700",
                                                    fontSize: "13px",
                                                  }}
                                                >
                                                  {data?.status ||
                                                    "status not available"}
                                                </Typography>
                                              </Typography>
                                            </Col>
                                            <Col className="col text-center">
                                              <Typography
                                                className=""
                                                style={{
                                                  marginBottom: "5px",
                                                  fontWeight: "700",
                                                  fontSize: "13px",
                                                }}
                                              >
                                                TITLE
                                              </Typography>
                                              <Typography
                                                className=""
                                                style={{
                                                  marginBottom: "5px",
                                                  fontSize: "12px",
                                                  fontWeight: "500",
                                                }}
                                              >
                                                {data?.Title ||
                                                  "Title not available"}
                                              </Typography>
                                            </Col>
                                            <Col className="col text-center">
                                              <Typography
                                                className=""
                                                style={{
                                                  marginBottom: "5px",
                                                  fontWeight: "700",
                                                  fontSize: "13px",
                                                }}
                                              >
                                                ADDRESS
                                              </Typography>
                                              <Typography
                                                className="text-bolt"
                                                style={{
                                                  marginBottom: "5px",
                                                  fontSize: "12px",
                                                  fontWeight: "500",
                                                }}
                                              >
                                                {data?.location?.Address || "-"}
                                                , {data?.location?.City || "-"},{" "}
                                                {data?.location?.State || "-"}
                                              </Typography>
                                            </Col>
                                            <Col className="col text-right">
                                              <Typography
                                                className=""
                                                style={{
                                                  marginBottom: "5px",
                                                  fontWeight: "700",
                                                  fontSize: "13px",
                                                }}
                                              >
                                                CREATED ON
                                              </Typography>
                                              <Typography
                                                className="text-bolt"
                                                style={{
                                                  marginBottom: "5px",
                                                  fontSize: "12px",
                                                  fontWeight: "500",
                                                }}
                                              >
                                                {moment(data?.createdAt).format(
                                                  dateFormat
                                                )}
                                              </Typography>
                                            </Col>
                                          </Row>
                                        </Grid>
                                      </Grid>
                                    ))}
                                  {contract &&
                                    contract?.length > 0 &&
                                    contract.map((data, index) => (
                                      <Grid
                                        key={index}
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          handleContractNavigate(
                                            data?.ContractId
                                          )
                                        }
                                      >
                                        <Grid className="mx-3">
                                          <Row
                                            className="row align-items-start pt-2 p-2 Typography-3 text-blue-color border-blue-color customerScrollHorizontal"
                                            style={{
                                              border: "1px solid",
                                              fontSize: "12px",
                                              boxShadow:
                                                "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                              borderRadius: "8px",
                                              border:
                                                "0.5px solid rgba(6, 49, 100, 0.8)",
                                            }}
                                          >
                                            <Row className="w-100">
                                              <Col xs={3} sm={3} md={3}>
                                                <Typography
                                                  style={{
                                                    marginBottom: "5px",
                                                  }}
                                                >
                                                  <Typography
                                                    style={{
                                                      marginBottom: "5px",
                                                      fontWeight: "700",
                                                      fontSize: "13px",
                                                    }}
                                                  >
                                                    Contract #{" "}
                                                    {data?.ContractNumber || ""}
                                                    not available{" "}
                                                  </Typography>
                                                </Typography>
                                                <Typography
                                                  style={{
                                                    color:
                                                      data?.Status ===
                                                      "Unscheduled"
                                                        ? "#E88C44"
                                                        : data?.Status ===
                                                          "Today"
                                                        ? "#089F57"
                                                        : data?.Status ===
                                                          "Upcoming"
                                                        ? "#089F57"
                                                        : data?.Status ===
                                                          "Scheduled"
                                                        ? "#C8CC00"
                                                        : "",
                                                  }}
                                                >
                                                  <Typography
                                                    style={{
                                                      marginBottom: "5px",
                                                      fontWeight: "700",
                                                      fontSize: "13px",
                                                    }}
                                                  >
                                                    {data?.Status}
                                                  </Typography>
                                                </Typography>
                                              </Col>

                                              <Col
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className="text-center"
                                              >
                                                <Typography
                                                  className="bolt"
                                                  style={{
                                                    marginBottom: "5px",
                                                    fontWeight: "700",
                                                    fontSize: "13px",
                                                  }}
                                                >
                                                  TITLE
                                                </Typography>
                                                <Typography
                                                  className="text-bolt"
                                                  style={{
                                                    marginBottom: "5px",
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                  }}
                                                >
                                                  {data?.Title ||
                                                    "Title not available"}
                                                </Typography>
                                              </Col>

                                              <Col
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className="text-center"
                                              >
                                                <Typography
                                                  className="bolt"
                                                  style={{
                                                    marginBottom: "5px",
                                                    fontWeight: "700",
                                                    fontSize: "13px",
                                                  }}
                                                >
                                                  ADDRESS
                                                </Typography>
                                                <Typography
                                                  className="text-bolt"
                                                  style={{
                                                    marginBottom: "5px",
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                  }}
                                                >
                                                  {data?.location?.Address ||
                                                    "-"}{" "}
                                                  ,{" "}
                                                  {data?.location?.City || "-"}{" "}
                                                  ,{" "}
                                                  {data?.location?.State || "-"}
                                                </Typography>
                                              </Col>

                                              <Col
                                                xs={3}
                                                sm={3}
                                                md={3}
                                                className="text-end"
                                              >
                                                <Typography
                                                  className="bolt"
                                                  style={{
                                                    marginBottom: "5px",
                                                    fontWeight: "700",
                                                    fontSize: "13px",
                                                  }}
                                                >
                                                  CREATED ON
                                                </Typography>
                                                <Typography
                                                  className="text-bolt"
                                                  style={{
                                                    marginBottom: "5px",
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                  }}
                                                >
                                                  {moment(
                                                    data?.createdAt
                                                  ).format(dateFormat)}
                                                </Typography>
                                              </Col>
                                            </Row>
                                          </Row>
                                        </Grid>
                                      </Grid>
                                    ))}
                                  {invoice &&
                                    invoice.length > 0 &&
                                    invoice.map((data, index) => (
                                      <Grid
                                        key={index}
                                        style={{ cursor: "" }}
                                        onClick={() =>
                                          handleInvoiceNavigate(data?.InvoiceId)
                                        }
                                      >
                                        <Grid className="mx-3">
                                          <Row
                                            className="row align-items-start pt-2 p-2 Typography-3 border-blue-color text-blue-color customerScrollHorizontal"
                                            style={{
                                              border: "1px solid",
                                              fontSize: "12px",
                                              boxShadow:
                                                "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                              borderRadius: "8px",
                                              border:
                                                "0.5px solid rgba(6, 49, 100, 0.8)",
                                            }}
                                          >
                                            <Col className="col">
                                              <Typography
                                                style={{
                                                  marginBottom: "5px",
                                                  fontWeight: "700",
                                                  fontSize: "13px",
                                                }}
                                              >
                                                <Typography
                                                  style={{
                                                    marginBottom: "5px",
                                                    fontWeight: "700",
                                                    fontSize: "13px",
                                                  }}
                                                >
                                                  Invoice #
                                                  {data?.InvoiceNumber ||
                                                    "InvoiceNumber not available"}
                                                </Typography>
                                              </Typography>
                                              <Typography
                                                style={{
                                                  color:
                                                    data?.status === "Approved"
                                                      ? "rgb(88, 204, 88)"
                                                      : data?.status ===
                                                        "Awaiting Response"
                                                      ? "orange"
                                                      : "#063164",
                                                }}
                                              >
                                                <Typography
                                                  style={{
                                                    marginBottom: "5px",
                                                    fontWeight: "700",
                                                    fontSize: "13px",
                                                  }}
                                                >
                                                  {" "}
                                                  {data?.Status ||
                                                    "Status not available"}
                                                </Typography>
                                              </Typography>
                                            </Col>
                                            <Col className="col text-center">
                                              <Typography
                                                className="bolt"
                                                style={{
                                                  marginBottom: "5px",
                                                  fontWeight: "700",
                                                  fontSize: "13px",
                                                }}
                                              >
                                                Subject
                                              </Typography>
                                              <Typography
                                                className="text-bolt"
                                                style={{
                                                  marginBottom: "5px",
                                                  fontSize: "12px",
                                                  fontWeight: "500",
                                                }}
                                              >
                                                {data?.Subject ||
                                                  "Subject not available"}
                                              </Typography>
                                            </Col>
                                            <Col className="col text-center">
                                              <Typography
                                                className="bolt"
                                                style={{
                                                  marginBottom: "5px",
                                                  fontWeight: "700",
                                                  fontSize: "13px",
                                                }}
                                              >
                                                ADDRESS
                                              </Typography>
                                              <Typography
                                                className="text-bolt"
                                                style={{
                                                  marginBottom: "5px",
                                                  fontSize: "12px",
                                                  fontWeight: "500",
                                                }}
                                              >
                                                {data?.location?.Address || "-"}
                                                , {data?.location?.City || "-"},{" "}
                                                {data?.location?.State || "-"}
                                              </Typography>
                                            </Col>
                                            <Col className="col text-right">
                                              <Typography
                                                className="bolt"
                                                style={{
                                                  marginBottom: "5px",
                                                  fontWeight: "700",
                                                  fontSize: "13px",
                                                }}
                                              >
                                                CREATED ON
                                              </Typography>
                                              <Typography
                                                className="text-bolt"
                                                style={{
                                                  marginBottom: "5px",
                                                  fontSize: "12px",
                                                  fontWeight: "500",
                                                }}
                                              >
                                                {moment(data?.createdAt).format(
                                                  dateFormat
                                                )}
                                              </Typography>
                                            </Col>
                                          </Row>
                                        </Grid>
                                      </Grid>
                                    ))}
                                </>
                              ) : (
                                <Col sm="12" className="d-flex">
                                  <Grid
                                    style={{
                                      backgroundColor: "rgba(6, 49, 100, 30%)",
                                      padding: "15px",
                                      borderRadius: "50%",
                                      height: "50px",
                                      width: "50px",
                                    }}
                                  >
                                    <img src={truck} alt="Truck Icon" />
                                  </Grid>
                                  <Grid className="mx-2">
                                    <Typography
                                      className="mb-0 my-2 text-blue-color"
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      All
                                    </Typography>
                                    <Typography
                                      className="text-blue-color"
                                      style={{ fontSize: "12px" }}
                                    >
                                      No active Work, Quotes, Contracts and
                                      Invoices for this Customer yet
                                    </Typography>
                                  </Grid>
                                </Col>
                              )}
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId={3}>
                          <Row>
                            <Col
                              sm="12"
                              className="d-flex flex-column"
                              style={{
                                gap: "10px",
                                maxHeight:
                                  quotes?.length > 3 ? "300px" : "auto",
                                overflowY:
                                  quotes?.length > 3 ? "auto" : "visible",
                                overflowX: "auto",
                              }}
                            >
                              {quotes?.length > 0 ? (
                                quotes.map((data) => (
                                  <Grid
                                    key={data?.QuoteNumber}
                                    onClick={() =>
                                      handleNavigate(data?.QuoteId)
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <Grid className="mx-3">
                                      <Row
                                        className="row align-items-start pt-2 p-2 Typography-3 border-blue-color text-blue-color customerScrollHorizontal"
                                        style={{
                                          border: "1px solid ",
                                          fontSize: "12px",
                                          boxShadow:
                                            "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                          borderRadius: "8px",
                                          border:
                                            "0.5px solid rgba(6, 49, 100, 0.8)",
                                        }}
                                      >
                                        <Col className="col">
                                          <Typography
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            <Typography
                                              style={{
                                                marginBottom: "5px",
                                                fontWeight: "700",
                                                fontSize: "13px",
                                              }}
                                            >
                                              Quote #
                                              {data?.QuoteNumber ||
                                                "QuoteNumber not available"}
                                            </Typography>
                                          </Typography>
                                          <Typography
                                            style={{
                                              color:
                                                data?.status === "Approved"
                                                  ? "rgb(88, 204, 88)"
                                                  : data?.status ===
                                                    "Awaiting Response"
                                                  ? "orange"
                                                  : "#063164",
                                            }}
                                          >
                                            <Typography
                                              style={{
                                                marginBottom: "5px",
                                                fontWeight: "700",
                                                fontSize: "13px",
                                              }}
                                            >
                                              {data?.status ||
                                                "status not available"}
                                            </Typography>
                                          </Typography>
                                        </Col>
                                        <Col className="col text-center">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            TITLE
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {data?.Title ||
                                              "Title not available"}
                                          </Typography>
                                        </Col>
                                        <Col className="col text-center">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            ADDRESS
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {data?.location?.Address || "-"},{" "}
                                            {data?.location?.City || "-"},{" "}
                                            {data?.location?.State || "-"}
                                          </Typography>
                                        </Col>
                                        <Col className="col text-right">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            CREATED ON
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {moment(data?.createdAt).format(
                                              dateFormat
                                            )}
                                          </Typography>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </Grid>
                                ))
                              ) : (
                                <Col sm="12" className="d-flex">
                                  <Grid
                                    style={{
                                      backgroundColor: "rgba(6, 49, 100, 30%)",
                                      padding: "15px",
                                      borderRadius: "50%",
                                      height: "50px",
                                      width: "50px",
                                    }}
                                  >
                                    <img src={truck} alt="Truck Icon" />
                                  </Grid>
                                  <Grid className="mx-2">
                                    <Typography
                                      className="mb-0 my-2 text-blue-color"
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Quotes
                                    </Typography>
                                    <Typography
                                      className="text-blue-color"
                                      style={{ fontSize: "12px" }}
                                    >
                                      No active Quotes for this Customer yet
                                    </Typography>
                                  </Grid>
                                </Col>
                              )}
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId={5}>
                          <Row>
                            <Col
                              sm="12"
                              className="d-flex flex-column"
                              style={{
                                gap: "10px",
                                maxHeight:
                                  contract?.length > 3 ? "300px" : "auto",
                                overflowY:
                                  contract?.length > 3 ? "auto" : "visible",
                                overflowX: "auto",
                              }}
                            >
                              {contract?.length > 0 ? (
                                contract.map((data) => (
                                  <Grid
                                    key={data?.ContractNumber}
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      handleContractNavigate(data?.ContractId)
                                    }
                                  >
                                    <Grid className="mx-3">
                                      <Row
                                        className="row align-items-start pt-2 p-2 Typography-3 text-blue-color border-blue-color customerScrollHorizontal"
                                        style={{
                                          border: "1px solid",
                                          fontSize: "12px",
                                          boxShadow:
                                            "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                          borderRadius: "8px",
                                          border:
                                            "0.5px solid rgba(6, 49, 100, 0.8)",
                                        }}
                                      >
                                        <Col className="col">
                                          <Typography
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            <Typography
                                              style={{
                                                marginBottom: "5px",
                                                fontWeight: "700",
                                                fontSize: "13px",
                                              }}
                                            >
                                              Contract #
                                              {data?.ContractNumber ||
                                                "ContractNumber not available"}
                                            </Typography>
                                          </Typography>
                                          <Typography
                                            style={{
                                              color:
                                                data?.Status === "Unscheduled"
                                                  ? "#E88C44"
                                                  : data?.Status === "Today"
                                                  ? "#089F57"
                                                  : data?.Status === "Upcoming"
                                                  ? "#089F57"
                                                  : data?.Status === "Scheduled"
                                                  ? "#C8CC00"
                                                  : "",
                                            }}
                                          >
                                            <Typography
                                              style={{
                                                marginBottom: "5px",
                                                fontWeight: "700",
                                                fontSize: "13px",
                                              }}
                                            >
                                              {data?.Status ||
                                                "Status not available"}
                                            </Typography>
                                          </Typography>
                                        </Col>
                                        <Col className="col text-center">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            TITLE
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {data?.Title ||
                                              "Title not available"}
                                          </Typography>
                                        </Col>
                                        <Col className="col text-center">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "700",
                                            }}
                                          >
                                            ADDRESS
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {data?.location?.Address || "-"},{" "}
                                            {data?.location?.City || "-"},{" "}
                                            {data?.location?.State || "-"}
                                          </Typography>
                                        </Col>
                                        <Col className="col text-right">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            CREATED ON
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {moment(data?.createdAt).format(
                                              dateFormat
                                            )}
                                          </Typography>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </Grid>
                                ))
                              ) : (
                                <Col sm="12" className="d-flex">
                                  <Grid
                                    style={{
                                      backgroundColor: "rgba(6, 49, 100, 30%)",
                                      padding: "15px",
                                      borderRadius: "50%",
                                      height: "50px",
                                      width: "50px",
                                    }}
                                  >
                                    <img src={truck} alt="Truck Icon" />
                                  </Grid>
                                  <Grid className="mx-2">
                                    <Typography
                                      className="mb-0 my-2 text-blue-color"
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Contract
                                    </Typography>
                                    <Typography
                                      className="text-blue-color"
                                      style={{ fontSize: "12px" }}
                                    >
                                      No active Contracts for this Customer yet
                                    </Typography>
                                  </Grid>
                                </Col>
                              )}
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId={6}>
                          <Row>
                            <Col
                              sm="12"
                              className="d-flex flex-column"
                              style={{
                                gap: "10px",
                                maxHeight:
                                  invoice?.length > 3 ? "300px" : "auto",
                                overflowY:
                                  invoice?.length > 3 ? "auto" : "visible",
                                overflowX: "auto",
                              }}
                            >
                              {invoice?.length > 0 ? (
                                invoice?.map((data) => (
                                  <Grid
                                    key={data?.InvoiceNumber}
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      handleInvoiceNavigate(data?.InvoiceId)
                                    }
                                  >
                                    <Grid className="mx-3">
                                      <Row
                                        className="row align-items-start pt-2 p-2 Typography-3 text-blue-color border-blue-color customerScrollHorizontal"
                                        style={{
                                          border: "1px solid",
                                          fontSize: "12px",
                                          boxShadow:
                                            "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                          borderRadius: "8px",
                                          border:
                                            "0.5px solid rgba(6, 49, 100, 0.8)",
                                        }}
                                      >
                                        <Col className="col">
                                          <Typography
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            <Typography
                                              style={{
                                                marginBottom: "5px",
                                                fontWeight: "700",
                                                fontSize: "13px",
                                              }}
                                            >
                                              Invoice #
                                              {data?.InvoiceNumber ||
                                                "InvoiceNumber not available"}
                                            </Typography>
                                          </Typography>
                                          <Typography
                                            style={{
                                              color:
                                                data?.status === "Approved"
                                                  ? "rgb(88, 204, 88)"
                                                  : data?.status ===
                                                    "Awaiting Response"
                                                  ? "orange"
                                                  : "#063164",
                                            }}
                                          >
                                            <Typography
                                              style={{
                                                marginBottom: "5px",
                                                fontWeight: "700",
                                                fontSize: "13px",
                                              }}
                                            >
                                              {" "}
                                              {data?.Status ||
                                                "Status not available"}
                                            </Typography>
                                          </Typography>
                                        </Col>
                                        <Col className="col text-center">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            Subject
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {data?.Subject ||
                                              "Subject not available"}
                                          </Typography>
                                        </Col>
                                        <Col className="col text-center">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            ADDRESS
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {data?.location?.Address || "-"},{" "}
                                            {data?.location?.City || "-"},{" "}
                                            {data?.location?.State || "-"}
                                          </Typography>
                                        </Col>
                                        <Col className="col text-right">
                                          <Typography
                                            className="bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontWeight: "700",
                                              fontSize: "13px",
                                            }}
                                          >
                                            CREATED ON
                                          </Typography>
                                          <Typography
                                            className="text-bolt"
                                            style={{
                                              marginBottom: "5px",
                                              fontSize: "12px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {moment(data?.createdAt).format(
                                              dateFormat
                                            )}
                                          </Typography>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </Grid>
                                ))
                              ) : (
                                <Col sm="12" className="d-flex">
                                  <Grid
                                    style={{
                                      backgroundColor: "rgba(6, 49, 100, 30%)",
                                      padding: "15px",
                                      borderRadius: "50%",
                                      height: "50px",
                                      width: "50px",
                                    }}
                                  >
                                    <img src={truck} alt="Truck Icon" />
                                  </Grid>
                                  <Grid className="mx-2">
                                    <Typography
                                      className="mb-0 my-2 text-blue-color"
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Invoice
                                    </Typography>
                                    <Typography
                                      className="text-blue-color"
                                      style={{ fontSize: "12px" }}
                                    >
                                      No active invoices for this Customer yet
                                    </Typography>
                                  </Grid>
                                </Col>
                              )}
                            </Col>
                          </Row>
                        </TabPane>
                      </TabContent>
                    </Grid>
                  </CardBody>
                </Grid>
                <Grid
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    borderRadius: "8px",
                    border: "0.5px solid rgba(6, 49, 100, 30%)",
                  }}
                  className="my-4"
                >
                  <CardHeader
                    className="d-flex justify-content-between align-items-center Typography-2"
                    style={{ border: "none" }}
                  >
                    <Typography
                      className="text-blue-color heading-five"
                      style={{ fontWeight: 600, paddingLeft: "18px" }}
                    >
                      Schedule
                    </Typography>
                  </CardHeader>
                  <CardBody style={{ padding: "10px 0px" }}>
                    <Row>
                      <Col
                        sm="12"
                        className="d-flex"
                        style={{ paddingLeft: "30px" }}
                      >
                        <Grid
                          className="icon-section"
                          style={{
                            backgroundColor: "rgba(6, 49, 100, 30%)",
                            borderRadius: "50%",
                            height: "50px",
                            width: "50px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img src={schedule} />
                        </Grid>
                        <Grid className="mx-2">
                          <Typography
                            className="mb-0 my-2 text-blue-color"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            No scheduled items
                          </Typography>
                          <Typography
                            className="text-blue-color"
                            style={{ fontSize: "12px" }}
                          >
                            Nothing is scheduled for this Customer yet{" "}
                          </Typography>
                        </Grid>
                      </Col>
                    </Row>
                  </CardBody>
                </Grid>
              </Col>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default PropertyDetails;
