import React from "react";
import {
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  UncontrolledDropdown,
} from "reactstrap";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import truck from "../../../../../assets/image/icons/truck.svg";

import { Grid } from "@mui/material";
import { Typography } from "@mui/material";
import { LoaderComponent } from "../../../../../components/Icon/Index";

const CustomerDetails = ({
  loader,
  navigate,
  data,
  CompanyName,
  location,
  activeTabId,
  handleClick,
  quotes,
  invoice,
  contract,
  handleQuoteNavigate,
  moment,
  handleContractNavigate,
  handleInvoiceNavigate,
  dateFormat,
}) => {
  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center Typography-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
          <Grid>
            <Grid
              style={{
                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                borderRadius: "8px",
                border: "0.5px solid ",
              }}
              className="my-4 p-2 border-blue-color"
            >
              <CardHeader
                className="d-flex justify-content-between align-items-center Typography-2"
                style={{ border: "none" }}
              >
                <Typography
                  className="text-blue-color heading-five"
                  style={{ fontWeight: 600 }}
                >
                  Overview
                </Typography>

                <UncontrolledDropdown style={{ zIndex: "9" }}>
                  <DropdownToggle
                    className="bg-button-blue-color"
                    caret
                    color="dark"
                    style={{
                      padding: "3px 10px 3px 10px",
                      fontSize: "14px",
                      border: "none",
                    }}
                  >
                    + Add
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      className="dropdown-items text-blue-color"
                      onClick={() => {
                        if (CompanyName) {
                          navigate(`/${CompanyName}/add-quotes`, {
                            state: {
                              Customer: data,
                              CustomerId: data?.CustomerId,
                              navigats: [
                                ...location?.state?.navigats,
                                "/add-quotes",
                              ],
                            },
                          });
                        } else {
                          navigate(`/staff-member/add-quotes`, {
                            state: {
                              Customer: data,
                              CustomerId: data?.CustomerId,
                              navigats: [
                                ...location?.state?.navigats,
                                "/add-quotes",
                              ],
                            },
                          });
                        }
                      }}
                    >
                      <RequestQuoteOutlinedIcon className="icones-dropdown text-blue-color " />
                      Quote
                    </DropdownItem>
                    <DropdownItem
                      className="dropdown-items text-blue-color"
                      onClick={() => {
                        if (CompanyName) {
                          navigate(`/${CompanyName}/add-contract`, {
                            state: {
                              Customer: data,
                              CustomerId: data?.CustomerId,
                              navigats: [
                                ...location?.state?.navigats,
                                "/add-contract",
                              ],
                            },
                          });
                        } else {
                          navigate(`/staff-member/add-contract`, {
                            state: {
                              Customer: data,
                              CustomerId: data?.CustomerId,
                              navigats: [
                                ...location?.state?.navigats,
                                "/add-contract",
                              ],
                            },
                          });
                        }
                      }}
                    >
                      <WorkOutlineOutlinedIcon className="icones-dropdown text-blue-color" />
                      Contract
                    </DropdownItem>
                    <DropdownItem
                      className="dropdown-items text-blue-color"
                        onClick={() => {
                            if (CompanyName) {
                              navigate(`/${CompanyName}/invoicetable`, {
                                state: {
                                  Customer: data,
                                  CustomerId: data?.CustomerId,
                                  navigats: [
                                    ...location?.state?.navigats,
                                    "/invoicetable",
                                  ],
                                },
                              });
                            } else {
                              navigate(`/staff-member/invoicetable`, {
                                state: {
                                  Customer: data,
                                  CustomerId: data?.CustomerId,
                                  navigats: [
                                    ...location?.state?.navigats,
                                    "/invoicetable",
                                  ],
                                },
                              });
                            }
                          }}
                      // onClick={() => {
                      //   if (CompanyName && data?.CustomerId) {
                      //     if (data?.location?.length > 1) {
                      //       setIsCustomer(true); 
                      //     } else {
                      //       navigate(`/${CompanyName}/invoicetable`, {
                      //         state: {
                      //           Customer: data,
                      //           CustomerId: data?.CustomerId,
                      //           LocationId: data?.location[0]?.LocationId,
                      //           navigats: [
                      //             ...location?.state?.navigats,
                      //             "/invoicetable",
                      //           ],
                      //         },
                      //       });
                      //     }
                      //   } else {
                      //     navigate(`/staff-member/invoicetable`, {
                      //       state: {
                      //         Customer: data,
                      //         CustomerId: data?.CustomerId,
                      //         navigats: [
                      //           ...location?.state?.navigats,
                      //           "/invoicetable",
                      //         ],
                      //       },
                      //     });
                      //   }
                      // }}
                    >
                      <FileCopyOutlinedIcon className="icones-dropdown text-blue-color" />
                      Invoice
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </CardHeader>
              <CardBody
                style={{
                  padding: "10px 0px",
                  maxHeight: "400px",
                  overflowY: "scroll",
                  scrollbarWidth: "thin",
                }}
              >
                <Grid className="text-start customer_navbar">
                  <Nav
                    className="bg-orange-color"
                    tabs
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      minWidth: "668px",
                      overflowX: "auto",
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
                        className={activeTabId === 4 ? "active" : ""}
                        onClick={() => handleClick(4)}
                        style={{ cursor: "pointer" }}
                      >
                        Contract
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={activeTabId === 5 ? "active" : ""}
                        onClick={() => handleClick(5)}
                        style={{ cursor: "pointer" }}
                      >
                        Invoices
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={activeTabId} className="text-start">
                    <TabPane tabId={1}>
                      <Col
                        sm="12"
                        className="d-flex flex-column"
                        style={{
                          gap: "10px",
                          maxHeight:
                            quotes?.length +
                              invoice?.length +
                              contract?.length >
                            3
                              ? "300px"
                              : "auto",
                          overflowY:
                            quotes?.length +
                              invoice?.length +
                              contract?.length >
                            3
                              ? "auto"
                              : "visible",
                          scrollbarWidth: "thin",
                          minWidth: "700px",
                          overflowX: "auto",
                        }}
                      >
                        {(quotes && quotes?.length > 0) ||
                        (contract && contract?.length > 0) ||
                        (invoice && invoice?.length > 0) ? (
                          <>
                            {quotes &&
                              quotes?.length > 0 &&
                              quotes.map((data, index) => (
                                <Grid
                                  key={index}
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleQuoteNavigate(data?.QuoteId)
                                  }
                                >
                                  <Grid className="scrollForOverview">
                                    <Grid
                                      className="Grid align-items-start pt-2 p-1 border-blue-color text-blue-color"
                                      style={{
                                        border: "1px solid",
                                        fontSize: "12px",
                                        display: "flex",
                                        boxShadow:
                                          "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                        borderRadius: "8px",
                                        border:
                                          "0.5px solid rgba(6, 49, 100, 0.8)",
                                        color: "#063164",
                                        width: "100%",
                                      }}
                                    >
                                      <Col className="col p-2">
                                        <Typography
                                          style={{
                                            marginBottom: "5px",
                                          }}
                                        >
                                          <Typography
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "12px",
                                            }}
                                          >
                                            Quote #{data?.QuoteNumber}
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
                                                : data?.status ===
                                                  "Request changed"
                                                ? "#FF33C6"
                                                : "#063164",
                                          }}
                                        >
                                          <Typography
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {data?.status || "status not available"}
                                          </Typography>
                                        </Typography>
                                      </Col>
                                      <Col className="col text-center">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                          {data?.Title || "Title not available"}
                                        </Typography>
                                      </Col>
                                      <Col className="col text-center">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                          {data?.location?.Address || "-"},
                                          {data?.location?.City || "-"},
                                          {data?.location?.State || "-"}
                                        </Typography>
                                      </Col>
                                      <Col className="col text-right">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                    </Grid>
                                  </Grid>
                                </Grid>
                              ))}
                            {contract &&
                              contract?.length > 0 &&
                              contract?.map((data, index) => (
                                <Grid
                                  key={index}
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleContractNavigate(data?.ContractId)
                                  }
                                >
                                  <Grid className="">
                                    <Grid
                                      className="align-items-start pt-2  p-1 outline-button-blue-color text-blue-color"
                                      style={{
                                        border: "1px solid ",
                                        display: "flex",
                                        fontSize: "12px",
                                        boxShadow:
                                          "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                        borderRadius: "8px",
                                        border:
                                          "0.5px solid rgba(6, 49, 100, 0.8)",
                                        color: "#063164",
                                        width: "100%",
                                      }}
                                    >
                                      <Col className="col p-2">
                                        <Typography
                                          style={{
                                            marginBottom: "5px",
                                          }}
                                        >
                                          <Typography
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "12px",
                                            }}
                                          >
                                            Contract #
                                            {data?.ContractNumber || "ContractNumber not available"}
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
                                              fontWeight: "bold",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {data?.Status || "Status not available"}
                                          </Typography>
                                        </Typography>
                                      </Col>
                                      <Col className="col text-center">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                          {data?.Title || "Title not available"}
                                        </Typography>
                                      </Col>
                                      <Col className="col text-center">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                          {data?.location?.Address || "-"},
                                          {data?.location?.City || "-"},
                                          {data?.location?.State || "-"}
                                        </Typography>
                                      </Col>
                                      <Col className="col text-right">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                          {moment(data?.createdAt).format("ll")}
                                        </Typography>
                                      </Col>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              ))}
                            {invoice &&
                              invoice.length > 0 &&
                              invoice.map((data, index) => (
                                <Grid
                                  key={index}
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleInvoiceNavigate(data?.InvoiceId)
                                  }
                                >
                                  <Grid className=" scrollForOverview">
                                    <Grid
                                      className=" align-items-start pt-2 p-1 outline-button-blue-color text-blue-color"
                                      style={{
                                        border: "1px solid ",
                                        fontSize: "12px",
                                        boxShadow:
                                          "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                        borderRadius: "8px",
                                        border:
                                          "0.5px solid rgba(6, 49, 100, 0.8)",
                                        color: "#063164",
                                        width: "100%",
                                        display: "flex",
                                      }}
                                    >
                                      <Col className="col p-2">
                                        <Typography
                                          style={{
                                            marginBottom: "5px",
                                          }}
                                        >
                                          <Typography
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "12px",
                                            }}
                                          >
                                            Invoice #{data?.InvoiceNumber}
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
                                                : data?.status ===
                                                  "Request changed"
                                                ? "#FF33C6"
                                                : "#063164",
                                          }}
                                        >
                                          <Typography
                                            style={{
                                              fontWeight: "bold",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {data?.Status || "Status not available"}
                                          </Typography>
                                        </Typography>
                                      </Col>
                                      <Col className="col text-center">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                          {data?.Subject || "Subject not available"}
                                        </Typography>
                                      </Col>
                                      <Col className="col text-center">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                          {data?.location?.Address || "-"},
                                          {data?.location?.City || "-"},
                                          {data?.location?.State || "-"}
                                        </Typography>
                                      </Col>
                                      <Col className="col text-right">
                                        <Typography
                                          className="bolt"
                                          style={{
                                            marginBottom: "5px",
                                            fontSize: "12px",
                                            fontWeight: "800",
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
                                          {moment(data?.createdAt).format("ll")}
                                        </Typography>
                                      </Col>
                                    </Grid>
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
                                No active Work, Quotes, Contracts and Invoices
                                this Customer yet
                              </Typography>
                            </Grid>
                          </Col>
                        )}
                      </Col>
                    </TabPane>
                    <TabPane tabId={3}>
                      <Row>
                        <Col
                          sm="12"
                          className="d-flex flex-column"
                          style={{
                            gap: "10px",
                            maxHeight: quotes?.length > 3 ? "300px" : "auto",
                            overflowY: quotes?.length > 3 ? "auto" : "visible",
                            overflowX: "auto",
                            minWidth: "668px",
                            overflowX: "auto",
                          }}
                        >
                          {quotes?.length > 0 ? (
                            quotes.map((data, index) => (
                              <Grid
                                key={index}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleQuoteNavigate(data?.QuoteId)
                                }
                              >
                                <Grid className="">
                                  <Grid
                                    className="row align-items-start pt-2 p-1 text-blue-color border-blue-color customerScrollHorizontal "
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
                                        }}
                                      >
                                        <Typography
                                          style={{
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                          }}
                                        >
                                          Quote #{data?.QuoteNumber || "QuoteNumber not available"}
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
                                              : data?.status ===
                                                "Request changed"
                                              ? "#FF33C6"
                                              : "#063164",
                                        }}
                                      >
                                        <Typography
                                          style={{
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                          }}
                                        >
                                          {data?.status || "status not available"}
                                        </Typography>
                                      </Typography>
                                    </Col>
                                    <Col className="col text-center">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {data?.Title || "Title not available"}
                                      </Typography>
                                    </Col>
                                    <Col className="col text-center">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {data?.location?.City || "-"},
                                        {data?.location?.State || "-"}
                                      </Typography>
                                    </Col>
                                    <Col className="col text-right">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {moment(data.createdAt).format("ll")}
                                      </Typography>
                                    </Col>
                                  </Grid>
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
                                  No active quotes for this Customer yet
                                </Typography>
                              </Grid>
                            </Col>
                          )}
                        </Col>
                      </Row>
                    </TabPane>
                    <TabPane tabId={4}>
                      <Row>
                        <Col
                          sm="12"
                          className="d-flex flex-column"
                          style={{
                            gap: "10px",
                            maxHeight: contract?.length > 3 ? "300px" : "auto",
                            overflowY:
                              contract?.length > 3 ? "auto" : "visible",
                            overflowX: "auto",
                            minWidth: "668px",
                            overflowX: "auto",
                          }}
                        >
                          {contract && contract?.length > 0 ? (
                            contract.map((data, index) => (
                              <Grid
                                key={index}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleContractNavigate(data?.ContractId)
                                }
                              >
                                <Grid className="">
                                  <Row
                                    className="row align-items-start pt-2 p-1 outline-button-blue-color text-blue-color customerScrollHorizontal "
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
                                        }}
                                      >
                                        <Typography
                                          style={{
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                          }}
                                        >
                                          Contract #{data?.ContractNumber}
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
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                          }}
                                        >
                                          {data?.Status}
                                        </Typography>
                                      </Typography>
                                    </Col>
                                    <Col className="col text-center">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {data?.Title || "Title not available"}
                                      </Typography>
                                    </Col>
                                    <Col className="col text-center">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {data?.location?.City || "-"},
                                        {data?.location?.State || "-"}
                                      </Typography>
                                    </Col>
                                    <Col className="col text-right">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {moment(data?.createdAt).format("ll")}
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
                    <TabPane tabId={5}>
                      <Row>
                        <Col
                          sm="12"
                          className="d-flex flex-column"
                          style={{
                            gap: "10px",
                            maxHeight: invoice?.length > 3 ? "300px" : "auto",
                            overflowY: invoice?.length > 3 ? "auto" : "visible",
                            overflowX: "auto",
                            minWidth: "668px",
                            overflowX: "auto",
                          }}
                        >
                          {invoice && invoice.length > 0 ? (
                            invoice.map((data, index) => (
                              <Grid
                                key={index}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleInvoiceNavigate(data?.InvoiceId)
                                }
                              >
                                <Grid className="">
                                  <Row
                                    className="row align-items-start pt-2  p-1 outline-button-blue-color text-blue-color customerScrollHorizontal "
                                    style={{
                                      border: "1px solid ",
                                      fontSize: "12px",
                                      boxShadow:
                                        "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                      borderRadius: "8px",
                                      border:
                                        "0.5px solid rgba(6, 49, 100, 0.8)",
                                      overflowX: "auto",
                                    }}
                                  >
                                    <Col className="col">
                                      <Typography
                                        style={{
                                          marginBottom: "5px",
                                        }}
                                      >
                                        <Typography
                                          style={{
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                          }}
                                        >
                                          Invoice #
                                          {data?.InvoiceNumber || "InvoiceNumber not available"}
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
                                              : data?.status ===
                                                "Request changed"
                                              ? "#FF33C6"
                                              : "#063164",
                                        }}
                                      >
                                        <Typography
                                          style={{
                                            fontWeight: "bold",
                                            fontSize: "12px",
                                          }}
                                        >
                                          {data?.Status || "Status not available"}
                                        </Typography>
                                      </Typography>
                                    </Col>
                                    <Col className="col text-center">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {data?.Subject || "Subject not available"}
                                      </Typography>
                                    </Col>
                                    <Col className="col text-center">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {data?.location?.City || "-"},
                                        {data?.location?.State || "-"}
                                      </Typography>
                                    </Col>
                                    <Col className="col text-right">
                                      <Typography
                                        className="bolt"
                                        style={{
                                          marginBottom: "5px",
                                          fontSize: "12px",
                                          fontWeight: "800",
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
                                        {moment(data?.createdAt).format("ll")}
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
                                  No active Invoices this Customer yet
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
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default CustomerDetails;
