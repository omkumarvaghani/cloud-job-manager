import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
} from "../../../components/MuiTable/index.jsx";
import "./style.css";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import { Card, CardBody, CardFooter, CardHeader, Label } from "reactstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance.jsx";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import swal from "sweetalert";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
} from "../../../components/Icon/Index.jsx";
import BlueButton from "../../../components/Button/BlueButton.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../components/Toast/Toster.jsx";

const Permission = () => {
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [companyData, setCompanyData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const moment = require("moment");
  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");

  const getData = async () => {
    try {

      const res = await AxiosInstance.get(`${baseUrl}/permissionsteps`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      setCompanyData(res?.data?.data);
      setCountData(res?.data?.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search, sortField, sortOrder]);

  const handleEditClick = (id) => {
    if (id) {
      navigate("/superadmin/add-permission", {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-permission"],
        },
      });
    }
  };

  // Delete
  const handleDelete = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover!",
      icon: "warning",

      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Delete",
          closeModal: true,
          value: true,
          className: "bg-orange-color",
        },
      },
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await AxiosInstance.delete(`/permissionsteps/${id}`);
          if (response?.data?.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            getData();
          } else {
            showToast.warning("", response?.data?.message, "error");
          }
        } catch (error) {
          showToast.error(error?.message);
        }
      }
    });
  };

  const CollapseData = ({ data }) => {
    return (
      <Grid className="gap-4">
        <Row
          className="d-flex row mb-2 my-4 permission-box"
          style={{
            width: "100%",
            marginLeft: "0px",
            borderRadius: "14px",
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            paddingLeft: "30px",
            paddingTop: "25px",
            paddingBottom: "20px",
          }}
        >
          <Row className="row">
            <Col
              className="col-xl-3 col-lg-6 col-md-6 col-sm-12 permission-row"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography className="text-blue-color mb-6 shcedulePermission">
                <Typography className="bold-text" fontSize={"15px"}>
                  Schedule
                </Typography>
              </Typography>
              {!(
                data?.Schedule?.ViewTheirOwnSchedule ||
                data?.Schedule?.ViewAndCompleteTheirOwnSchedule ||
                data?.Schedule?.EditTheirOwnSchedule ||
                data?.Schedule?.EditEveryonesSchedule ||
                data?.Schedule?.EditAndDeleteEveryonesSchedule ||
                data?.Schedule?.Delete
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}

              {/* Individual permissions */}
              {data?.Schedule?.ViewTheirOwnSchedule && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View their own schedule{" "}
                  <DoneIcon style={{ color: "#00EE64", fontSize: "18px" }} />
                </Typography>
              )}
              {data?.Schedule?.ViewAndCompleteTheirOwnSchedule && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View and complete their own schedule{" "}
                  <DoneIcon style={{ color: "#00EE64", fontSize: "18px" }} />
                </Typography>
              )}
              {data?.Schedule?.EditTheirOwnSchedule && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  Edit their own schedule{" "}
                  <DoneIcon style={{ color: "#00EE64", fontSize: "18px" }} />
                </Typography>
              )}
              {data?.Schedule?.EditEveryonesSchedule && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  Edit everyone's schedule{" "}
                  <DoneIcon style={{ color: "#00EE64", fontSize: "18px" }} />
                </Typography>
              )}
              {data?.Schedule?.EditAndDeleteEveryonesSchedule && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  Edit and delete everyone's schedule{" "}
                  <DoneIcon style={{ color: "#00EE64", fontSize: "18px" }} />
                </Typography>
              )}
              {data?.Schedule?.Delete && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  Delete{" "}
                  <DoneIcon style={{ color: "#00EE64", fontSize: "18px" }} />
                </Typography>
              )}
            </Col>

            <Col
              className="col-xl-3 col-lg-6 col-md-6 col-sm-12 permission-row giveMarginTop"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography className="text-blue-color">
                <Typography className="bold-text" style={{ fontSize: "15px" }}>
                  Show Pricing
                </Typography>
              </Typography>
              {!data?.ShowPricing
                ?.AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}
              {data?.ShowPricing
                ?.AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs && (
                <Typography
                  className="text-blue-color mb-0 mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  Allows editing of quotes, invoices, and line items on jobs.
                  <DoneIcon style={{ color: "#00EE64", fontSize: "18px" }} />
                </Typography>
              )}
            </Col>

            <Col
              className="col-xl-3 col-lg-6 col-md-6 col-sm-12 giveMarginTop"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography className="text-blue-color">
                <Typography className="bold-text" fontSize={"15px"}>
                  Time Tracking and Timesheets
                </Typography>
              </Typography>
              {!(
                data?.TimeTrackingAndTimesheets?.ViewAndRecordTheirOwn ||
                data?.TimeTrackingAndTimesheets
                  ?.ViewFullCustomerAndPropertyInfo ||
                data?.TimeTrackingAndTimesheets?.ViewRecordAndEditTheirOwn ||
                data?.TimeTrackingAndTimesheets?.ViewRecordAndEditEveryones
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}
              {data?.TimeTrackingAndTimesheets?.ViewAndRecordTheirOwn && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View Customer name and address only
                  <DoneIcon
                    className="mx-2"
                    style={{ color: "#00EE64", fontSize: "18px" }}
                  />
                </Typography>
              )}
              {data?.TimeTrackingAndTimesheets
                ?.ViewFullCustomerAndPropertyInfo && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View full Customer and property info
                  <DoneIcon
                    className="mx-2"
                    style={{ color: "#00EE64", fontSize: "18px" }}
                  />
                </Typography>
              )}
              {data?.TimeTrackingAndTimesheets?.ViewRecordAndEditTheirOwn && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View and edit full Customer and property info
                  <DoneIcon
                    className="mx-2"
                    style={{ color: "#00EE64", fontSize: "18px" }}
                  />
                </Typography>
              )}
              {data?.TimeTrackingAndTimesheets?.ViewRecordAndEditEveryones && (
                <Typography
                  className="text-blue-color mb-0 mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View, edit, and delete full Customer and property info
                  <DoneIcon
                    className="mx-2"
                    style={{ color: "#00EE64", fontSize: "18px" }}
                  />
                </Typography>
              )}
            </Col>
          </Row>

          <Row className="row">
            <Col
              className="col-xl-3 col-lg-6 col-md-6 col-sm-12 permission-row"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography
                className="text-blue-color giveMarginTop"
                style={{ marginTop: "20px" }}
              >
                <Typography className="bold-text" fontSize={"15px"}>
                  Customers Properties
                </Typography>
              </Typography>
              {!(
                data?.CustomersProperties?.ViewCustomerNameAndAddressOnly ||
                data?.CustomersProperties?.ViewFullCustomerAndPropertyInfo ||
                data?.CustomersProperties
                  ?.ViewAndEditFullCustomerAndPropertyInfo ||
                data?.CustomersProperties
                  ?.ViewEditAndDeleteFullCustomerAndPropertyInfo
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}
              {data?.CustomersProperties?.ViewCustomerNameAndAddressOnly && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View Customer name and address only
                  <DoneIcon
                    className="mx-2"
                    style={{ color: "#00EE64", fontSize: "18px" }}
                  />
                </Typography>
              )}
              {data?.CustomersProperties?.ViewFullCustomerAndPropertyInfo && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View full Customer and property info
                  <DoneIcon
                    className="mx-2"
                    style={{ color: "#00EE64", fontSize: "18px" }}
                  />
                </Typography>
              )}
              {data?.CustomersProperties
                ?.ViewAndEditFullCustomerAndPropertyInfo && (
                <Typography
                  className="text-blue-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View and edit full Customer and property info
                  <DoneIcon
                    className="mx-2"
                    style={{ color: "#00EE64", fontSize: "18px" }}
                  />
                </Typography>
              )}
              {data?.CustomersProperties
                ?.ViewEditAndDeleteFullCustomerAndPropertyInfo && (
                <Typography
                  className="text-blue-color mb-0 mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  View, edit, and delete full Customer and property info
                  <DoneIcon
                    className="mx-2"
                    style={{ color: "#00EE64", fontSize: "18px" }}
                  />
                </Typography>
              )}
            </Col>

            <Col
              className="col-xl-3 col-lg-6 col-md-6 col-sm-12 permission-row"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography className="text-blue-color">
                <Typography
                  className="bold-text giveMarginTop"
                  style={{ fontSize: "15px", marginTop: "20px" }}
                >
                  Notes
                </Typography>
              </Typography>
              {!(
                data?.Notes?.ViewNotesOnJobsAndVisitsOnly ||
                data?.Notes?.ViewAllNotes ||
                data?.Notes?.ViewAndEditAll ||
                data?.Notes?.ViewEditAndDeleteAll
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Notes?.ViewNotesOnJobsAndVisitsOnly && (
                  <>
                    View notes on jobs and visits only
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Notes?.ViewAllNotes && (
                  <>
                    View all notes
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Notes?.ViewAndEditAll && (
                  <>
                    View and edit all
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Notes?.ViewEditAndDeleteAll && (
                  <>
                    View, edit, and delete all
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
            </Col>

            <Col
              className="col-xl-3 col-lg-6 col-md-6 col-sm-12"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography
                className="text-blue-color giveMarginTop"
                style={{ marginTop: "20px" }}
              >
                <Typography className="bold-text" style={{ fontSize: "15px" }}>
                  Expenses
                </Typography>
              </Typography>
              {!(
                data?.Expenses?.ViewRecordAndEditTheirOwn ||
                data?.Expenses?.ViewRecordAndEditEveryones
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Expenses?.ViewRecordAndEditTheirOwn && (
                  <>
                    View, record, and edit their own
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Expenses?.ViewRecordAndEditEveryones && (
                  <>
                    View, record, and edit everyone's
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
            </Col>
          </Row>

          <Row className="row">
            <Col
              className="col-xl-3 col-lg-6 col-md-6 col-sm-12 permission-row giveMarginTop"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography className="text-blue-color">
                <Typography className="bold-text" style={{ fontSize: "15px" }}>
                  Quotes
                </Typography>
              </Typography>
              {!(
                data?.Quotes?.ViewOnly ||
                data?.Quotes?.ViewCreateAndEdit ||
                data?.Quotes?.ViewCreateEditAndDelete
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Quotes?.ViewOnly && (
                  <>
                    View only
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Quotes?.ViewCreateAndEdit && (
                  <>
                    View, create, and edit
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Quotes?.ViewCreateEditAndDelete && (
                  <>
                    View, create, edit, and delete
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
            </Col>

            <Col
              className="col-xl-3 col-lg-4 col-md-6 col-sm-12 permission-row giveMarginTop"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography className="text-blue-color my-0">
                <Typography className="bold-text" style={{ fontSize: "15px" }}>
                  Contract
                </Typography>
              </Typography>
              {!(
                data?.Contract?.ViewOnly ||
                data?.Contract?.ViewCreateAndEdit ||
                data?.Contract?.ViewCreateEditAndDelete
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Contract?.ViewOnly && (
                  <>
                    View only{" "}
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Contract?.ViewCreateAndEdit && (
                  <>
                    View, create, and edit{" "}
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Contract?.ViewCreateEditAndDelete && (
                  <>
                    View, create, edit, and delete{" "}
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
            </Col>

            <Col
              className="col-xl-3 col-lg-4 col-md-6 col-sm-12 giveMarginTop"
              xl={4}
              lg={4}
              md={12}
              sm={12}
              xs={12}
            >
              <Typography className="text-blue-color my-0">
                <Typography className="bold-text" style={{ fontSize: "15px" }}>
                  Invoice
                </Typography>
              </Typography>
              {!(
                data?.Invoice?.ViewOnly ||
                data?.Invoice?.ViewCreateAndEdit ||
                data?.Invoice?.ViewCreateEditAndDelete
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify removeMarginTOp"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                  <CloseIcon style={{ color: "#FF6347 ", fontSize: "18px" }} />
                </Typography>
              )}
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Invoice?.ViewOnly && (
                  <>
                    View only{" "}
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Invoice?.ViewCreateAndEdit && (
                  <>
                    View, create, and edit{" "}
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
              <Typography
                className="text-blue-color mt-3 text-justify removeMarginTOp"
                fontSize={"14px"}
              >
                {data?.Invoice?.ViewCreateEditAndDelete && (
                  <>
                    View, create, edit, and delete{" "}
                    <DoneIcon
                      className="mx-2"
                      style={{ color: "#00EE64", fontSize: "18px" }}
                    />
                  </>
                )}
              </Typography>
            </Col>
          </Row>
          {/* <Row className="row">
         
                <Col className="col-xl-3 col-lg-6 col-md-6 col-sm-12 permission-row">
                  <Typography className="text-blue-color">
                    <Typography
                      className="bold-text"
                      style={{ fontSize: "15px" }}
                    >
                      Reports
                    </Typography>
                  </Typography>
                  {!(
     data?.Reports
     ?.UsersWillOnlyBeAbleToSeeReportsAvailableToThemBasedOnTheirOtherPermissions
              ) && (
                <Typography
                  className="text-red-color mt-3 text-justify"
                  fontSize={"14px"}
                >
                  No Permissions Assigned
                </Typography>
              )}
                  <Typography
                    className="text-blue-color mt-3 text-justify"
                    fontSize={"14px"}
                  >
                    {data?.Reports
                      ?.UsersWillOnlyBeAbleToSeeReportsAvailableToThemBasedOnTheirOtherPermissions && (
                      <>
                        Users will only be able to see reports available to them
                        based on their other permissions.
                        <DoneIcon
                          className="mx-2"
                          style={{ color: "#00EE64", fontSize: "18px" }}
                        />
                      </>
                    )}
                  </Typography>
                </Col>
           
          </Row> */}
        </Row>
      </Grid>
    );
  };

  const cellData = companyData?.map((item, index) => {
    return {
      key: item?.PermissionId,
      value: [
        page * rowsPerPage + index + 1,
        <>
          <Typography className="bold-text">
            {item?.Title || "Title not available"}
          </Typography>{" "}
          {item?.Description || "Description not available"}
        </>,
        // item.createdAt,
        moment(item?.createdAt).format("MM-DD-YYYY"),
        <>
          <EditIcon
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item?.PermissionId);
            }}
          />
          {/* </IconButton>
          <IconButton> */}
          <DeleteIcone
            calssName="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item?.PermissionId);
            }}
          />
        </>,
      ],
      component: item,
    };
  });

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 industry">
        <Grid className="d-flex justify-content-end mb-2 align-items-center">
          <BlueButton
            onClick={() => {
              navigate(`/superadmin/add-permission`, {
                state: {
                  navigats: [...location?.state?.navigats, "/add-permission"],
                },
              });
            }}
            label="Add Permission"
          />
        </Grid>
        <Card
          className="border-blue-color"
          style={{
            borderRadius: "20px",
            border: "2px solid ",
            padding: 0,
          }}
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header bg-blue-color product-service-p"
            style={{
              borderBottom: "2px solid",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography
              className="compn text-light prodeuct_table heading-five fw-medium"
              style={{ cursor: "pointer" }}
            >
              Permission
            </Typography>
            <Grid className="d-flex search_box companyPlanSearch">
              <JobberSearch
                search={search}
                setSearch={setSearch}
                style={{ background: "transparent", color: "white" }}
              />
            </Grid>
          </CardHeader>

          {loader ? (
            <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
              <LoaderComponent loader={loader} height="50" width="50" />
            </Grid>
          ) : (
            <CardBody style={{ padding: "10px 0px" }}>
              <Grid>
                <JobberTable
                  className="permission-head-title"
                  // headerData={[
                  //   "Sr no",
                  //   "Title And Description",
                  //   "Date",
                  //   "Action",
                  // ]}
                  headerData={[
                    { label: "Sr No.", field: "" },
                    { label: "Title And Description", field: "Title" },
                    { label: "Date", field: "createdAt" },
                    { label: "Action", field: "" },
                  ]}
                  setSortField={setSortField}
                  setSortOrder={setSortOrder}
                  sortOrder={sortOrder}
                  sortField={sortField}
                  cellData={cellData}
                  CollapseComponent={(data) => CollapseData(data)}
                  isCollapse={true}
                  page={page}
                  isNavigate={false}
                />
              </Grid>
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color border-blue-color"
            style={{
              borderTop: "2px solid ",
              borderBottomLeftRadius: "20px",
              borderBottomRightRadius: "20px",
            }}
          >
            <JobberPagination
              totalData={countData}
              currentData={rowsPerPage}
              dataPerPage={rowsPerPage}
              pageItems={[10, 25, 50]}
              page={page}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          </CardFooter>
        </Card>
      </Grid>
    </>
  );
};

export default Permission;
