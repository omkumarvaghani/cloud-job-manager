import React, { useEffect, useState } from "react";
import {
  Button,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Table,
  UncontrolledDropdown,
} from "reactstrap";
import * as Yup from "yup";
import clientdetails from "../../../assets/image/client/Clientdetails.svg";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import truck from "../../../assets/image/icons/truck.svg";
import schedule from "../../../assets/image/icons/schedule.svg";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { CircularProgress } from "@mui/material";
import Edit from "../../../assets/image/icons/edit.svg";
import Delete from "../../../assets/image/icons/delete.svg";
import { useAuthAdmin } from "../../../components/Login/Auth";
import ClientProperty from "./Client-Property";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { Formik } from "formik";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import swal from "sweetalert";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance";
import { Grid } from "@mui/material";
import { LoaderComponent } from "../../../components/Icon/Index";
import showToast from "../../../components/Toast/Toster";
import { Typography } from "@mui/material";
import BlueButton from "../../../components/Button/BlueButton";

function ClientDetails() {
  useAuthAdmin();

  const location = useLocation();
  const navigate = useNavigate();
  const { CompanyName } = useParams();

  const [data, setData] = useState();
  const [open, setOpen] = useState({ isOpen: false, propertyData: null });
  const [loader, setLoader] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const [note, setNote] = useState("");
  const handleNoteChange = (event) => {
    setNote(event.target.value);
  };

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(
        `/v1/customer/detail/${location?.state?.id}`
      );
      console.log(res,"resresresresres")
      setData(res?.data?.data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [location?.state?.id]);

  const handlePropertyDelete = async (id) => {
    swal().then(async (willDelete) => {
      if (willDelete) {
        try {
          const res = await AxiosInstance.delete(`//location/${id}`);
          if (res?.data?.statusCode === 200) {
            setTimeout(() => {
              showToast.success(res?.data?.message);
            }, 500);
            getData();
          } else {
            showToast.error("", res?.data?.message, "error");
          }
        } catch (error) {
          showToast.error("", error?.message, "error");
          console.error("Error: ", error?.message);
        }
      }
    });
  };

  const [activeTabId, setActiveTabId] = useState(1);
  const handleClick = (tabId) => {
    setActiveTabId(tabId);
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const moreActiontoggle = () => setDropdownOpen((prevState) => !prevState);

  const [quotes, setQuotes] = useState([]);
  useEffect(() => {
    const fetchQuote = async () => {
      if (data && data.UserId) {
        try {
          const response = await AxiosInstance.get(
            `/quote/get_quotes_client/${localStorage.getItem("CompanyId")}/${
              data.UserId
            }`
          );
          setQuotes(response?.data?.data);
        } catch (err) {
          console.error("Error to fetching quote data: ", err.message);
        }
      }
    };

    fetchQuote();
  }, [data]);

  const handleNavigate = (quoteId, CompanyName) => {
    navigate(`/${CompanyName}/quotes-detail`, {
      state: {
        id: quoteId,
        navigats: ["/index", `/quotes-detail`],
      },
    });
  };

  return (
    <>
      {loader ? (
        <Grid className="d-flex flex-direction-row justify-content-center align-items-center Typography-5 m-5">
          <LoaderComponent height="50" width="50" loader={loader} />
        </Grid>
      ) : (
        <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
          <BlueButton
            style={{
              color: "#fff",
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
            }}
            className="text-capitalize bg-button-blue-color"
            label={<ArrowBackOutlinedIcon />}
          />
          <Grid
            className="d-flex align-items-center justify-content-between username-action"
            style={{ display: "" }}
          >
            <Grid>
              <Grid className="d-flex justify-content-start usrName">
                <Grid
                  className="username text-blue-color"
                  style={{
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    fontSize: "38px",
                  }}
                >
                  <Grid
                    className="bg-blue-color"
                    style={{
                      borderRadius: "50%",
                      marginRight: "10px",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <img src={clientdetails} />
                  </Grid>
                  {data?.FirstName ? data?.FirstName : "-"}&nbsp;
                  {data?.LastName ? data?.LastName : "-"}
                </Grid>
              </Grid>
            </Grid>
            <Grid>
              <Dropdown
                isOpen={dropdownOpen}
                toggle={moreActiontoggle}
                style={{ zIndex: 0 }}
              >
                <DropdownToggle
                  className="text-blue-color outline border-blue-color"
                  style={{
                    background: "none",
                    border: "1px solid ",
                  }}
                >
                  {" "}
                  <MoreHorizIcon />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem
                    className="dropdown-items"
                    style={{ fontSize: "16px" }}
                    onClick={() => {
                      navigate(`/${CompanyName}/add-quotes`, {
                        state: {
                          navigats: [
                            ...location?.state?.navigats,
                            "/add-quotes",
                          ],
                        },
                      });
                    }}
                  >
                    <RequestQuoteOutlinedIcon />
                    Quote
                  </DropdownItem>
                  <DropdownItem
                    className="dropdown-items"
                    style={{ fontSize: "16px" }}
                  >
                    <WorkOutlineOutlinedIcon
                      className="icones-dropdown"
                      style={{ fontSize: "18px" }}
                    />
                    Contract
                  </DropdownItem>
                  <DropdownItem
                    className="dropdown-items"
                    style={{ fontSize: "16px" }}
                  >
                    <FileCopyOutlinedIcon
                      className="icones-dropdown"
                      style={{ fontSize: "18px" }}
                    />
                    Invoice
                  </DropdownItem>
                  <DropdownItem
                    className="dropdown-items"
                    style={{ fontSize: "16px" }}
                    onClick={() => {
                      setModelOpen(true);
                    }}
                  >
                    <MarkEmailReadOutlinedIcon
                      className="icones-dropdown"
                      style={{ fontSize: "18px" }}
                    />
                    Send a mail
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Grid>
          </Grid>
          <Grid>
            <Grid
              className="my-2 detail-card "
              style={{ border: "none", gap: "12px" }}
            >
              <Col lg={8} className="first-card">
                <Grid
                  className="address border-blue-color"
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    borderRadius: "8px",
                    border: "0.5px solid ",
                  }}
                >
                  <CardHeader
                    className="d-flex justify-content-between align-items-center Typography-2"
                    style={{ border: "none" }}
                  >
                    <Typography
                      style={{ fontWeight: 600 }}
                      className="text-blue-color heading-five"
                    >
                      Properties
                    </Typography>
                    {CompanyName && (
                      <BlueButton
                        className="bg-button-blue-color company-detail-btn"
                        onClick={() =>
                          setOpen({ isOpen: true, propertyData: null })
                        }
                        label=" + New Property"
                      />
                    )}
                  </CardHeader>
                  <CardBody
                    className="card-body client-details"
                    style={{ padding: "10px 0px" }}
                  >
                    <Table borderless>
                      <thead>
                        <TableRow>
                          <TableHead style={{ paddingLeft: "20px" }}>
                            Address
                          </TableHead>
                          <TableHead className="text-center">City</TableHead>
                          <TableHead className="text-center">State</TableHead>
                          <TableHead className="text-center">Country</TableHead>
                          <TableHead className="text-center">Zip</TableHead>
                          {CompanyName && (
                            <TableHead style={{ textAlign: "center" }}>
                              Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </thead>
                      <tbody>
                        {data?.location?.map((property, index) => (
                          <TableRow
                            style={{ cursor: "pointer", width: "318px" }}
                            key={index}
                            onClick={() =>
                              navigate(`/${CompanyName}/property-details`, {
                                state: {
                                  id: property?.LocationId,
                                  navigats: [
                                    ...location?.state?.navigats,
                                    "/property-details",
                                  ],
                                },
                              })
                            }
                          >
                            <TableCell
                              style={{
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: "20px",
                              }}
                            >
                              <MyLocationIcon
                                className="text-blue-color"
                                style={{ marginRight: "15px" }}
                              />
                              <Typography
                                className="text-blue-color"
                                style={{ fontSize: "14px" }}
                              >
                                {property?.Address ? property?.Address : "-"}{" "}
                              </Typography>
                            </TableCell>
                            <TableCell
                              className="text-center text-blue-color"
                              style={{ fontSize: "14px" }}
                            >
                              {property?.City ? property?.City : "-"}
                            </TableCell>
                            <TableCell
                              className="text-center text-blue-color"
                              style={{ fontSize: "14px" }}
                            >
                              {property?.State ? property?.State : "-"}
                            </TableCell>
                            <TableCell
                              className="text-center text-blue-color"
                              style={{ fontSize: "14px" }}
                            >
                              {property?.Country ? property?.Country : "-"}
                            </TableCell>
                            <TableCell
                              className="text-center text-blue-color"
                              style={{ fontSize: "14px" }}
                            >
                              {property?.Zip ? property?.Zip : "-"}
                            </TableCell>
                            {CompanyName && (
                              <TableCell
                                style={{
                                  textAlign: "center",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <IconButton>
                                  <img
                                    src={Edit}
                                    alt="edit"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent parent element click propagation
                                      setOpen({
                                        isOpen: true,
                                        propertyData: property, // Pass the property data for editing
                                      });
                                    }}
                                  />
                                </IconButton>
                                <IconButton>
                                  <img
                                    className="customerEditImgToEdit"
                                    src={Delete}
                                    alt="delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePropertyDelete(
                                        property?.LocationId
                                      );
                                    }}
                                  />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </tbody>
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
                      className="text-blue-color heading-five"
                      style={{ fontWeight: 600 }}
                    >
                      Overview
                    </Typography>

                    {CompanyName && (
                      <UncontrolledDropdown>
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
                            className="dropdown-items text-blue-color "
                            onClick={() => {
                              navigate(`/${CompanyName}/add-quotes`, {
                                state: {
                                  navigats: [
                                    ...location?.state?.navigats,
                                    "/add-quotes",
                                  ],
                                },
                              });
                            }}
                          >
                            <RequestQuoteOutlinedIcon className="icones-dropdown text-blue-color" />
                            Quote
                          </DropdownItem>
                          <DropdownItem className="dropdown-items text-blue-color">
                            <WorkOutlineOutlinedIcon className="icones-dropdown text-blue-color" />
                            Contract
                          </DropdownItem>
                          <DropdownItem className="dropdown-items text-blue-color">
                            <FileCopyOutlinedIcon className="icones-dropdown text-blue-color" />
                            Invoice
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    )}
                  </CardHeader>
                  <CardBody style={{ padding: "10px 0px" }}>
                    <Grid className="text-start">
                      <Nav
                        className="bg-orange-color"
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
                            Active Work
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
                      <TabContent
                        activeTab={activeTabId}
                        className="text-start"
                      >
                        <TabPane tabId={1}>
                          <Row>
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
                                <img src={truck} />
                              </Grid>
                              <Grid className="mx-2">
                                <Typography
                                  className="mb-0 my-2 text-blue-color heading-six"
                                  style={{ fontSize: "14px", fontWeight: 600 }}
                                >
                                  Active Work
                                </Typography>
                                <Typography
                                  className="text-blue-color"
                                  style={{ fontSize: "12px" }}
                                >
                                  No active jobs, invoices or quotes for this
                                  Customer yet
                                </Typography>
                              </Grid>
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId={2}>
                          <Row>
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
                                <img src={truck} />
                              </Grid>
                              <Grid className="mx-2">
                                <Typography
                                  className="mb-0 my-2 text-blue-color heading-six"
                                  style={{ fontSize: "14px", fontWeight: 600 }}
                                >
                                  Requests
                                </Typography>
                                <Typography
                                  className="text-blue-color"
                                  style={{ fontSize: "12px" }}
                                >
                                  No active jobs, invoices or quotes for this
                                  Customer yet
                                </Typography>
                              </Grid>
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
                              }}
                            >
                              {quotes?.length > 0 ? (
                                quotes.map((data) => (
                                  <Grid
                                    key={data?.QuoteNumber}
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      handleNavigate(data?.QuoteId)
                                    }
                                  >
                                    <Table className="quote-card">
                                      <TableBody className="quote-table">
                                        <TableRow className="quote-number">
                                          <TableCell>
                                            <Typography>
                                              Quote #
                                              {data?.QuoteNumber || "N/A"}
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
                                              {data?.status || "N/A"}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                        <TableRow className="quote-details">
                                          <TableCell>
                                            <Typography className="bolt">
                                              TITLE
                                            </Typography>
                                            <Typography className="text-bolt">
                                              {data?.Title || "N/A"}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                        <TableRow className="quote">
                                          <TableCell>
                                            <Typography className="bolt">
                                              ADDRESS
                                            </Typography>
                                            <Grid className="d-flex">
                                              <Typography className="text-bolt">
                                                {data?.location?.Address ||
                                                  "N/A"}{" "}
                                                ,
                                              </Typography>
                                            </Grid>
                                            <Grid className="d-flex">
                                              <Typography className="text-bolt">
                                                {data?.location?.City || "N/A"},
                                              </Typography>
                                              <Typography className="text-bolt">
                                                {data?.location?.State || "N/A"}
                                              </Typography>
                                            </Grid>
                                          </TableCell>
                                        </TableRow>
                                        <TableRow className="quote-address">
                                          <TableCell>
                                            <Typography className="bolt">
                                              CREATED ON
                                            </Typography>
                                            <Typography className="text-bolt">
                                              {moment(data.createdAt).format(
                                                "MM-DD-YYYY"
                                              )}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
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
                                      className="mb-0 heading-six my-2 text-blue-color"
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
                                      No active jobs, invoices or quotes for
                                      this Customer yet
                                    </Typography>
                                  </Grid>
                                </Col>
                              )}
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId={4}>
                          <Row>
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
                                <img src={truck} />
                              </Grid>
                              <Grid className="mx-2">
                                <Typography
                                  className="mb-0 my-2 text-blue-color heading-six"
                                  style={{ fontSize: "14px", fontWeight: 600 }}
                                >
                                  Contract
                                </Typography>
                                <Typography
                                  className="text-blue-color"
                                  style={{ fontSize: "12px" }}
                                >
                                  No active jobs, invoices or quotes for this
                                  Customer yet
                                </Typography>
                              </Grid>
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tabId={5}>
                          <Row>
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
                                <img src={truck} />
                              </Grid>
                              <Grid className="mx-2">
                                <Typography
                                  className="mb-0 my-2 text-blue-color heading-six"
                                  style={{ fontSize: "14px", fontWeight: 600 }}
                                >
                                  Invoice
                                </Typography>
                                <Typography
                                  className="text-blue-color"
                                  style={{ fontSize: "12px" }}
                                >
                                  No active jobs, invoices or quotes for this
                                  Customer yet
                                </Typography>
                              </Grid>
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
                      style={{ fontWeight: 600 }}
                    >
                      Schedule
                    </Typography>

                    {CompanyName && (
                      <UncontrolledDropdown>
                        <DropdownToggle
                          className="bg-blue-color"
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
                          <DropdownItem className="dropdown-items text-blue-color">
                            <TaskAltIcon className="icones-dropdown text-blue-color" />
                            Task
                          </DropdownItem>
                          <DropdownItem className="dropdown-items text-blue-color">
                            <CalendarMonthOutlinedIcon className="icones-dropdown text-blue-color" />
                            Calendar Event
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    )}
                  </CardHeader>
                  <CardBody style={{ padding: "10px 0px" }}>
                    <Row>
                      <Col
                        sm="12"
                        className="d-flex"
                        style={{ paddingLeft: "30px" }}
                      >
                        <Grid
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
                            className="mb-0 my-2 text-blue-color heading-six"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            No scheduled items
                          </Typography>
                          <Typography
                            className="text-blue-color"
                            style={{ fontSize: "12px" }}
                          >
                            Nothing is scheduled for this client yet{" "}
                          </Typography>
                        </Grid>
                      </Col>
                    </Row>
                  </CardBody>
                </Grid>
              </Col>
              <Col xs={12} sm={6} md={4} className="first-card">
                <Typography className="text-blue-color heading-three">
                  Contact Info.
                </Typography>
                <Grid className="table-responsive mx-0">
                  <Table style={{ width: "100%", tableLayout: "auto" }}>
                    <TableBody>
                      <TableRow className="companydata"></TableRow>
                      <TableRow className="phoneno">
                        <TableCell
                          className="text-blue-color tabledata-contactinfo"
                          style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            minWidth: "150px",
                          }}
                        >
                          Phone Number
                        </TableCell>
                        <TableCell
                          className="text-end text-blue-color"
                          style={{ fontSize: "14px" }}
                        >
                          {data?.PhoneNumber ? (
                            <a
                              className="border-blue-color"
                              style={{
                                textDecoration: "none",
                              }}
                              href={`tel:${data.PhoneNumber}`}
                            >
                              {data.PhoneNumber || "N/A"}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow className="email">
                        <TableCell
                          className="text-blue-color tabledata-contactinfo"
                          style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            minWidth: "150px",
                          }}
                        >
                          Email
                        </TableCell>
                        <TableCell
                          className="text-end text-blue-color"
                          style={{ fontSize: "14px" }}
                        >
                          {data?.EmailAddress ? (
                            <a
                              className="border-blue-color"
                              style={{
                                textDecoration: "none",
                              }}
                              href={`tel:${data?.EmailAddress}`}
                            >
                              {data?.EmailAddress || "N/A"}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Grid>

                <Grid
                  style={{
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    borderRadius: "8px",
                    border: "0.5px solid rgba(5, 15, 36, 30%)",
                  }}
                  className="my-4"
                >
                  <CardHeader
                    className="d-flex justify-content-between align-items-center Typography-2"
                    style={{ border: "none" }}
                  >
                    <Typography
                      className="text-blue-color heading-five"
                      style={{
                        fontWeight: 600,
                        fontSize: "26px",
                      }}
                    >
                      Billing History
                    </Typography>

                    {CompanyName && (
                      <UncontrolledDropdown>
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
                          <DropdownItem className="dropdown-items text-blue-color">
                            Collect Payments
                          </DropdownItem>
                          <DropdownItem className="dropdown-items text-blue-color">
                            Record Deposit
                          </DropdownItem>
                          <DropdownItem className="dropdown-items text-blue-color">
                            Invoice
                          </DropdownItem>
                          <DropdownItem className="dropdown-items text-blue-color">
                            Set Initial Balance
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    )}
                  </CardHeader>
                  <CardBody style={{ padding: "10px 0px" }}>
                    <Row>
                      <Col
                        sm="12"
                        className="d-flex"
                        style={{ paddingLeft: "30px" }}
                      >
                        <Grid
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
                            className="mb-0 my-2 text-blue-color heading-six"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            No billing history
                          </Typography>
                          <Typography
                            className="text-blue-color"
                            style={{ fontSize: "12px" }}
                          >
                            This client hasn’t been billed yet.
                          </Typography>
                        </Grid>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter
                    className="d-flex justify-content-between bg-orange-color text-white-color border-blue-color"
                    style={{
                      borderTop: "1px solid",
                      borderBottomLeftRadius: "8px",
                      borderBottomRightRadius: "8px",
                      alignItems: "center",
                      padding: "12px 13px 0",
                    }}
                  >
                    <Typography>Current Balance</Typography>
                    <Typography>$ 00</Typography>
                  </CardFooter>
                </Grid>
                <Typography
                  className="text-blue-color"
                  style={{ fontWeight: 600 }}
                >
                  Internal notes and attachments <HelpOutlineOutlinedIcon />
                </Typography>
                <Grid
                  className=""
                  border-blue-color
                  style={{
                    border: "1px solid",
                    borderRadius: "10px",
                    padding: "10px",
                  }}
                >
                  <textarea
                    className="note-details text-blue-color border-blue-color"
                    placeholder="Note details"
                    value={note}
                    onChange={handleNoteChange}
                    style={{
                      border: "0.5px solid rgba(6, 49, 100, 80%)",
                      padding: "15px",
                      borderRadius: "10px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  ></textarea>
                  <Grid className="file-upload">
                    <input
                      type="file"
                      id="file-input"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="file-input"
                      className="text-blue-color"
                      style={{
                        cursor: "pointer",
                        display: "block",
                        padding: "13px",
                        borderRadius: "10px",
                        textAlign: "center",
                      }}
                    >
                      Drag your files here or{" "}
                      <Typography>Select a File</Typography>
                    </label>
                    {file && (
                      <Typography>
                        Selected File: {file?.name || "N/A"}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Col>
            </Grid>
          </Grid>
        </Grid>
      )}
      <ClientProperty
        open={open}
        setOpen={setOpen}
        data={data}
        getData={getData}
      />
      <Dialog fullWidth open={modelOpen} onClose={() => setModelOpen(false)}>
        <DialogTitle>{"Please Confirm"}</DialogTitle>
        <DialogContent dividers>
          <Formik
            initialValues={{
              item: "",
            }}
            enableReinitialize
            validationSchema={Yup.object().shape({
              item: Yup.string().required("Item is Required"),
              product_name: Yup.string().required("Product Name is Required"),
              description: Yup.string().required("Description is Required"),
              cost: Yup.number().required("Cost is Required"),
              markup: Yup.number().required("Markup is Required"),
              unit_price: Yup.number().required("Unit Price is Required"),
            })}
          >
            {() => (
              <Form>
                <Grid>
                  <Typography>
                    This will send a Client Hub login email to
                    <br />
                    <Typography className="bold-text">
                      {data?.email}
                    </Typography>{" "}
                    Do you want to continue?
                  </Typography>
                  <Grid style={{ display: "flex", justifyContent: "end" }}>
                    <Button
                      className="text-blue-color border-blue-color nogoback"
                      style={{
                        padding: "3px 10px 3px 10px",
                        fontSize: "14px",
                        background: "none",
                      }}
                      onClick={() => setModelOpen(false)}
                    >
                      No, Go Back
                    </Button>
                    <Button
                      className="bg-blue-color"
                      style={{
                        padding: "3px 10px 3px 10px",
                        fontSize: "14px",
                        marginLeft: "15px",
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Yes, Send Mail"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ClientDetails;
