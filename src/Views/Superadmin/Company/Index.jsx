import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  InputAdornment,
  DialogTitle,
  Menu,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
} from "../../../components/MuiTable/index.jsx";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import IconButton from "@mui/material/IconButton";
import swal from "sweetalert";
import "./style.css";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { Circles } from "react-loader-spinner";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import AxiosInstance from "../../AxiosInstance.jsx";
import CancelIcon from "@mui/icons-material/Close";
import InputText from "../../../components/InputFields/InputText.jsx";
import UpdateStatus from "../../../assets/image/superadmin/UpdateStatus.svg";
import MenuItems from "../../../assets/image/superadmin/MenuItems.svg";
import Add from "../../../assets/image/superadmin/Add.svg";
import MailModel from "./MailModel.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import truesign from "../../../assets/image/superadmin/Truesign.svg";
import Inactive from "../../../assets/image/superadmin/Inactivesign.svg";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import NmiKeys from "../NmiKeys/NmiKeys.jsx";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../components/Icon/Index.jsx";
import "./style.css";
import BlueButton from "../../../components/Button/BlueButton.jsx";
import WhiteButton from "../../../components/Button/WhiteButton.jsx";
import showToast from "../../../components/Toast/Toster.jsx";
// import zxcvbn from "zxcvbn";
// import strongPasswordGenerator from "strong-password-generator";
import PasswordValidation from "../../../components/Password/PasswordValidation.jsx";

import Tooltip from "../../../components/Tooltip/tooltip.js";

const Company = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [updatemodelOpen, setUpdatemodelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [companyData, setCompanyData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/company/get`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      setCompanyData(res.data.data);
      setCountData(res.data.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    getData();
  }, [page, search, sortField, sortOrder]);

  const [contentWrite, setContentWrite] = useState("");
  const updateData = async (IsActive, Message) => {
    swal({
      title: "Are you sure?",
      text: "Are you sure you want to update the status?",
      icon: "warning",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Update",
          closeModal: true,
          value: true,
          className: "bg-orange-color",
        },
      },
      dangerMode: true,
    }).then(async (willUpdate) => {
      if (willUpdate) {
        try {
          const res = await AxiosInstance.put(
            `${baseUrl}/company/active/${companyId}`,
            { IsActive, Message }
          );
          if (res.data.statusCode === 200) {
            setTimeout(() => {
              showToast.success("Status Updated Successfully");
              getData();
            }, 500);
          } else {
            showToast.error(res.data.message);
          }
        } catch (error) {
          showToast.error("Something Went Wrong");
          console.error("Error updating data:", error);
        }
      }
    });
  };

  const toggleActiveState = () => {
    setCurrentItem((prev) => ({ ...prev, IsActive: !prev.IsActive }));
  };

  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search]);

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      values["industryId"] = selectedIndustryId;
      values["revenueId"] = selectedRevenueId;
      values["teamSizeId"] = selectedTeamSizeId;
      values["Industry"] = selectedIndustryName
        ? selectedIndustryName?.industry
        : "";
      values["Revenue"] = selectedRevenueName
        ? selectedRevenueName?.revenue
        : "";
      values["TeamSize"] = selectedTeamSizeName
        ? selectedTeamSizeName?.teamSize
        : "";
      let res;
      if (!selectedAdminId) {
        res = await AxiosInstance.post(
          `${baseUrl}/company/superadmin/register`,
          values
        );
      } else {
        res = await AxiosInstance.put(
          `${baseUrl}/company/${selectedAdminId}`,
          values
        );
      }

      if (res.data.statusCode === 200) {
        setModelOpen(false);
        getData();
        setTimeout(() => {
          showToast.success(res.data.message);
        }, 4);
      } else if (res.data.statusCode === 201) {
        getData();
        setTimeout(() => {
          showToast.error(res.data.message);
        }, 500);
      } else if (res.data.statusCode === 202) {
        getData();
        setTimeout(() => {
          showToast.error(res.data.message);
        }, 500);
      } else {
        showToast.error(res.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessages = error.response.data.errors || [];
        errorMessages.forEach((errorMessage) => {
          showToast.warning(errorMessage);
        });
      } else {
        showToast.error(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    const selectedIndustry = IndustryData.find(
      (industry) => industry?.industryId === item?.industryId
    );

    const selectedRevenue = RevenueData.find(
      (revenue) => revenue?.revenueId === item?.revenueId
    );

    const selectedTeamSize = TeamSizeData.find(
      (teamSize) => teamSize?.teamSizeId === item?.teamSizeId
    );

    setSelectedIndustryName(selectedIndustry || null);
    setSelectedIndustryId(selectedIndustry ? selectedIndustry?.industryId : "");

    setSelectedRevenueName(selectedRevenue || null);
    setSelectedRevenueId(selectedRevenue ? selectedRevenue?.revenueId : "");

    setSelectedTeamSizeName(selectedTeamSize || null);
    setSelectedTeamSizeId(selectedTeamSize ? selectedTeamSize?.teamSizeId : "");

    setSelectedIndustry(item);
    setSelectedAdminId(item.companyId);
    setModelOpen(true);
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
          const response = await AxiosInstance.delete(
            `${baseUrl}/company/${id}`
          );
          if (response?.data.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data.message);
            }, 500);
            getData();
          } else {
            showToast.warning("", response?.data.message, "error");
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error);
        }
      }
    });
  };

  const confirmPasswordRef = useRef(null);
  const nextFieldRef = useRef(null);

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevent default tab behavior
      if (confirmPasswordRef.current) {
        confirmPasswordRef.current.focus(); // Move focus to Confirm Password field
      }
    }
  };

  const handleConfirmPasswordKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevent default tab behavior
      if (nextFieldRef.current) {
        nextFieldRef.current.focus(); // Move focus to the next field
      }
    }
  };
  const CollapseData = ({ data }) => {
    return (
      <Grid className="d-flex gap-4 companyDetailNmiKeysDetail">
        <Grid className="card  nmiKeyDetailPage">
          <Grid
            className="card-header text-blue-color"
            style={{ backgroundColor: "#FFF4EA" }}
          >
            Company Details
          </Grid>
          <Grid className="card-body w-100 bg-orange-color" style={{}}>
            <Grid className="d-flex w-100 flex-row justify-content-between">
              <Typography className="text-white-color">
                Phone Number:{" "}
              </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "50%",
                  marginBottom: "7px",
                  fontSize: "14px",
                }}
                className="text-blue-color"
              >
                {data?.phoneNumber || "phoneNumber not available"}
              </Typography>
            </Grid>
            <Grid className="d-flex w-100 flex-row justify-content-between">
              <Typography className="text-white -color">Industry: </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "50%",
                  marginBottom: "7px",
                  fontSize: "14px",
                }}
                className="text-blue-color"
              >
                {data?.industry || "industry not available"}
              </Typography>
            </Grid>
            <Grid className="d-flex w-100 flex-row justify-content-between">
              <Typography className="text-white -color">Team Size: </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "50%",
                  marginBottom: "7px",
                  fontSize: "14px",
                }}
                className="text-blue-color"
              >
                {data?.teamsize || "teamsize not available"}
              </Typography>
            </Grid>
            <Grid className="d-flex w-100 flex-row justify-content-between">
              <Typography className="text-white -color">
                Annual Revenue:{" "}
              </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "50%",
                  marginBottom: "7px",
                  fontSize: "14px",
                }}
                className="text-blue-color"
              >
                {data?.revenue || "revenue not available"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid className="card  nmiKeyDetailPage">
          <Grid
            className="card-header text-blue-color"
            style={{ backgroundColor: "#FFF4EA" }}
          >
            NMI Keys Details
          </Grid>
          <Grid className="card-body w-100 bg-orange-color" style={{}}>
            <Grid className="d-flex w-100 flex-row justify-content-between">
              <Typography className="text-white -color">
                Security Key:{" "}
              </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "50%",
                  marginBottom: "7px",
                  fontSize: "14px",
                }}
                className="text-blue-color"
              >
                {data?.SecurityKey || "SecurityKey not available"}
              </Typography>
            </Grid>
            <Grid className="d-flex w-100 flex-row justify-content-between">
              <Typography className="text-white -color">
                Public Key:{" "}
              </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "50%",
                  marginBottom: "7px",
                  fontSize: "14px",
                }}
                className="text-blue-color"
              >
                {data?.PublicKey || "PublicKey not available"}
              </Typography>
            </Grid>
            <Grid className="d-flex w-100 flex-row justify-content-between">
              <Typography className="text-white -color">
                Signing Key:{" "}
              </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "50%",
                  marginBottom: "7px",
                  fontSize: "14px",
                }}
                className="text-blue-color"
              >
                {data?.SigningKey || "SigningKey not available"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [companyId, setCompanyID] = useState(false);
  const handleActionClick = (event, item, CompanyId) => {
    setAnchorEl(event.currentTarget);
    setCurrentItem(item);
    setContentWrite(item?.Message || "");
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const [modelOpenNmi, setModelOpenNmi] = useState(false);

  const cellData = companyData?.map((item, index) => {
    return {
      key: item?.companyId,
      value: [
        page * rowsPerPage + index + 1,
        item?.ownerName ? item?.ownerName : "-",
        item?.CompanyName ? item?.CompanyName : "-",
        item?.EmailAddress ? item?.EmailAddress : "-",

        <Grid
          className="Active-inactive-button"
          style={{ display: "flex", alignItems: "center" }}
        >
          <Typography
            style={{
              color: item?.IsActive === true ? "green" : "red",
              fontWeight: "4  00",
              fontSize: "16px",
              marginRight: "5px",
              padding: "3px",
            }}
          >
            {item?.IsActive === true ? "Active" : "Inactive"}
          </Typography>
          <Typography
            style={{
              backgroundColor: item?.IsActive === true ? "green" : "red",
              borderRadius: "50%",
              padding: "5px",
              marginRight: "10px",
            }}
          ></Typography>
        </Grid>,

        item?.IsPlanActive === true
          ? item?.planData
          : item?.IsPlanActive === false
          ? "No Plan"
          : item?.plandata,

        <IconButton>
          <img
            src={MenuItems}
            alt="img"
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick(e, item);
            }}
          />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setUpdatemodelOpen(true);
                setAnchorEl(false);
                setCompanyID(currentItem.companyId);
              }}
            >
              <img src={UpdateStatus} />
              <Typography className="mb-0 text-blue-color mx-2">
                Update Status
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setAnchorEl(false);
              }}
            >
              <img src={Add} />
              <Typography className="mb-0 text-blue-color mx-2">
                Add Mail Service
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(currentItem);
                setAnchorEl(false);
              }}
            >
              <EditIcon style={{ color: "white" }} />
              <Typography className="mb-0 text-blue-color mx-2">
                Edit
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(currentItem?.companyId);
                setAnchorEl(false);
              }}
            >
              <DeleteIcone className="mx-0" />
              <Typography className="mb-0 text-blue-color mx-2">
                Delete
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setModelOpenNmi(true, currentItem);
                setAnchorEl(false);
              }}
            >
              <img src={Add} />
              <Typography className="mb-0 text-blue-color mx-2">
                Add NMI Keys
              </Typography>
            </MenuItem>
          </Menu>
        </IconButton>,
      ],
      component: item,
    };
  });

  const [IndustryData, setIndustryData] = useState();

  const [selectedIndustryName, setSelectedIndustryName] = useState(null);
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [newIndustry, setNewIndustry] = useState(null);

  const handleAddNewIndustry = (newIndustryName) => {
    const newIndustryOption = { industry: newIndustryName, industryId: "" };
    setIndustryData((prev) => [...prev, newIndustryOption]);
    setSelectedIndustryName(newIndustryOption);
    setSelectedIndustryId("");

    setNewIndustry(newIndustryOption);
  };

  let getIndustryData = async () => {
    const response = await AxiosInstance.get(`${baseUrl}/industry/industry`);
    setIndustryData(response?.data?.data);
  };

  React.useEffect(() => {
    getIndustryData();
  }, []);

  const [RevenueData, setRevenueData] = useState();
  const [selectedRevenueName, setSelectedRevenueName] = useState(null);
  const [selectedRevenueId, setSelectedRevenueId] = useState("");
  const [inputValue3, setInputValue3] = useState("");
  const [newRevenue, setNewRevenue] = useState(null);

  const handleAddNewRevenue = (newRevenueName) => {
    const newRevenueOption = { revenue: newRevenueName, revenueId: "" };
    setRevenueData((prev) => [...prev, newRevenueOption]);
    setSelectedRevenueName(newRevenueOption);
    setSelectedRevenueId("");

    setNewRevenue(newRevenueOption);
  };

  let getRevenueData = async () => {
    const response = await AxiosInstance.get(`${baseUrl}/revenue/revenue`);
    setRevenueData(response?.data?.data);
  };

  React.useEffect(() => {
    getRevenueData();
  }, []);

  const [TeamSizeData, setTeamSizeData] = useState();
  const [selectedTeamSizeName, setSelectedTeamSizeName] = useState(null);
  const [selectedTeamSizeId, setSelectedTeamSizeId] = useState(null);
  const [inputValue4, setInputValue4] = useState("");
  const [newTeamSize, setNewTeamSize] = useState(null);

  const handleAddNewTeamSize = (newTeamSizeName) => {
    const newTeamSizeOption = { teamSize: newTeamSizeName, teamSizeId: "" };
    setTeamSizeData((prev) => [...prev, newTeamSizeOption]);
    setSelectedTeamSizeName(newTeamSizeOption);
    setSelectedTeamSizeId("");

    setNewTeamSize(newTeamSizeOption);
  };
  let getTeamSIzeData = async () => {
    const response = await AxiosInstance.get(`${baseUrl}/teamsize/teamsize`);
    setTeamSizeData(response?.data?.data);
  };

  React.useEffect(() => {
    getTeamSIzeData();
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isStrongPassword = (Password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return strongPasswordRegex.test(Password);
  };
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, "");

    if (phoneNumber.length < 1) {
      return phoneNumber;
    }

    if (phoneNumber.length <= 3) {
      return `(${phoneNumber}`;
    }

    if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )} - ${phoneNumber.slice(6, 10)}`;
  };

  return (
    <>
      <Grid>
        <Dialog
          open={updatemodelOpen}
          disableEscapeKeyDown
          className="active_inactive-model"
        >
          <DialogTitle>
            <Grid container spacing={2} className="modelbox">
              <Grid item xs={12} className="cancel_icon">
                <Grid
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setUpdatemodelOpen(false);
                  }}
                >
                  <CancelIcon />
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                style={{ display: "flex", gap: "2%" }}
                className="Active-inactive-button"
              >
                <Grid>
                  <button
                    onClick={() => {
                      if (!currentItem?.IsActive) {
                        toggleActiveState();
                      }
                    }}
                    className="active-btn"
                    style={{
                      width: "185px",
                      height: "47px",
                      borderRadius: "4px",
                      background: currentItem?.IsActive ? "#25ad22" : "#fff",
                      color: currentItem?.IsActive ? "white" : "#25ad22",
                      border: "2px solid #25ad22",
                      fontFamily: "Poppins",
                      fontSize: "16px",
                      fontWeight: "400",
                      lineHeight: "24px",
                    }}
                  >
                    Active
                  </button>
                  {currentItem?.IsActive && (
                    <img src={truesign} className="true_sign_btn" />
                  )}
                </Grid>
                <Grid>
                  <button
                    onClick={() => {
                      if (currentItem?.IsActive) {
                        toggleActiveState();
                      }
                    }}
                    className="inactive-btn"
                    style={{
                      background: !currentItem?.IsActive ? "#d12913" : "#fff",
                      border: "2px solid #d12913",
                      color: !currentItem?.IsActive ? "white" : "#d12913",
                      width: "185px",
                      height: "47px",
                      borderRadius: "4px",
                    }}
                  >
                    Inactive
                  </button>
                  {!currentItem?.IsActive && (
                    <img src={truesign} className="true_sign_btn" />
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12} className="dis_box">
                <Grid>{!currentItem?.IsActive && <img src={Inactive} />}</Grid>
                {!currentItem?.IsActive && (
                  <Grid className="line-height">
                    <input
                      className="active_acc"
                      placeholder="Enter reason for Inactive account..."
                      value={contentWrite.trim() === "" ? "" : contentWrite}
                      onChange={(e) => setContentWrite(e.target.value)}
                      type="text"
                      name="Message"
                    />
                  </Grid>
                )}
              </Grid>
              <Grid item xs={12} className="div_btn">
                <button
                  className="submit_btn"
                  onClick={() => {
                    if (!currentItem?.IsActive && contentWrite.trim() === "") {
                      showToast.error(
                        "Please provide a reason to mark the company as inactive"
                      );
                      return;
                    }

                    const isActive = currentItem?.IsActive;
                    if (!isActive) {
                      updateData(isActive, contentWrite);
                    } else {
                      updateData(isActive, " ");
                    }
                    setUpdatemodelOpen(false);
                  }}
                >
                  Submit
                </button>
              </Grid>
            </Grid>
          </DialogTitle>
        </Dialog>
      </Grid>

      <Grid className="justify-content-center align-items-center mb-3 industry">
        <Grid className="d-flex justify-content-end mb-2 align-items-center">
          <BlueButton
            onClick={() => {
              setModelOpen(true);
              setSelectedIndustryName(null);
              setSelectedIndustryId(null);
              setSelectedRevenueName(null);
              setSelectedRevenueId(null);
              setSelectedTeamSizeName(null);
              setSelectedTeamSizeId(null);
              setSelectedIndustry(null);
              setSelectedAdminId(null);
            }}
            label="Add Company"
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
            className="d-flex justify-content-between align-items-center table-header bg-blue-color title_search-bar customersAddCustomers"
            style={{
              borderBottom: "2px solid ",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography
              className="compn text-light company-title heading-five tableNameHead fw-medium  "
              style={{ cursor: "pointer" }}
            >
              Company
            </Typography>
            <Grid className="search-company d-flex searchBarOfTable companyPlanSearch">
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
            <CardBody
              style={{ padding: "10px 0px" }}
              className="company-table-head"
            >
              <JobberTable
                className="company-table-head"
                // headerData={[
                //   "Full Name",
                //   "Company Name",
                //   "Email",
                //   "Status",
                //   "Plan Name",
                //   "Action",
                // ]}
                headerData={[
                  { label: "Sr No." },
                  { label: "Full Name", field: "ownerName" },
                  { label: "Company Name", field: "CompanyName" },
                  { label: "Email", field: "EmailAddress" },
                  { label: "Status", field: "IsActive" },
                  { label: "Plan Name", field: "plandata" },
                  { label: "Action" },
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

      <Dialog
        fullWidth
        open={modelOpen}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            setModelOpen(false);
          }
        }}
        disableEscapeKeyDown
      >
        <DialogTitle className="borerBommoModel">
          <Grid className="d-flex justify-content-between">
            <Grid>{"Company Form"}</Grid>
            <Grid
              style={{ cursor: "pointer" }}
              onClick={(e) => setModelOpen(false)}
            >
              <CancelIcon />
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent dividers>
          <Formik
            initialValues={{
              ownerName: selectedIndustry ? selectedIndustry?.ownerName : "",
              phoneNumber: selectedIndustry
                ? selectedIndustry?.phoneNumber
                : "",
              EmailAddress: selectedIndustry
                ? selectedIndustry?.EmailAddress
                : "",
              CompanyName: selectedIndustry
                ? selectedIndustry?.CompanyName
                : "",
              Password: selectedIndustry ? selectedIndustry?.Password : "",
              ConfirmPassword: selectedIndustry
                ? selectedIndustry?.Password
                : "",
            }}
            enableReinitialize
            validationSchema={Yup.object().shape({
              ownerName: Yup.string().required("Owner Name Required"),
              phoneNumber: Yup.string().required("Phone Number Required"),
              EmailAddress: Yup.string()
                .email("Invalid email")
                .required("Email is Required")
                .matches(
                  /^[^@]+@[^@]+\.[^@]+$/,
                  "Email must contain '@' and '.'"
                ),
              CompanyName: Yup.string().required("Company Name Required"),

              // Password: Yup.string()
              //   .required("No password provided")
              //   .min(12, "Password must be at least 12 characters long")
              //   .matches(
              //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/,
              //     "Must contain an uppercase letter, lowercase letter, number, and special character"
              //   )
              //   .test(
              //     "zxcvbn-strength",
              //     "Password is too weak or common",
              //     (value) => {
              //       const result = zxcvbn(value);
              //       return result.score >= 3;
              //     }
              //   )
              //   .test(
              //     "no-sequential-or-repeating",
              //     "Your input should not contain sequential or repeating patterns (e.g., '123', 'aaa','abc') and must not have more than two identical characters or numbers in sequence.",
              //     (value) => {
              //       return !/(\d)\1\1|\d{3,}|[A-Za-z]{3,}/.test(value);
              //     }
              //   ),
              Password: PasswordValidation,

              ConfirmPassword: Yup.string()
                .oneOf([Yup.ref("Password"), null], "Passwords must match")
                .required("Confirmation password is required"),
            })}
            // validateOnChange={false}

            // validateOnBlur={false}
            onSubmit={(values, { resetForm }) => {
              handleSubmit(values);
              resetForm(values);
              setModelOpen(false);
            }}
          >
            {({ values, errors, touched, handleBlur, handleChange }) => (
              <Form>
                <Grid className="">
                  <Grid className="superadmin-company">
                    <Grid spacing={3}>
                      <Grid item className="mb-3">
                        <InputText
                          type="text"
                          size="small"
                          fullWidth
                          placeholder="Enter ownerName *"
                          label="OwnerName *"
                          name="ownerName"
                          value={values?.ownerName}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        />
                        {touched?.ownerName && errors?.ownerName ? (
                          <Grid className="text-danger">
                            {errors?.ownerName}
                          </Grid>
                        ) : null}
                      </Grid>

                      <Grid item className="mb-2">
                        <InputText
                          type="text"
                          size="small"
                          fullWidth
                          placeholder="Enter phone number"
                          label="Phone Number "
                          name="phoneNumber"
                          value={values?.phoneNumber}
                          onBlur={handleBlur}
                          onChange={(e) => {
                            let inputValue = e.target.value;
                            const formattedValue =
                              formatPhoneNumber(inputValue);
                            handleChange({
                              target: {
                                name: "phoneNumber",
                                value: formattedValue,
                              },
                            });
                          }}
                        />
                        {touched?.phoneNumber && errors?.phoneNumber ? (
                          <Grid className="text-danger">
                            {errors?.phoneNumber}
                          </Grid>
                        ) : null}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid className="superadmin-company">
                    <Grid spacing={3}>
                      <Grid item className="mb-2">
                        <InputText
                          type="text"
                          size="small"
                          fullWidth
                          placeholder="Enter primary emailAddress"
                          label="Primary EmailAddress"
                          name="EmailAddress"
                          value={values?.EmailAddress}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        />
                        {touched?.EmailAddress &&
                        errors?.EmailAddress ? (
                          <Grid className="text-danger">
                            {errors?.EmailAddress}
                          </Grid>
                        ) : null}
                      </Grid>
                      <Grid item className="mb-2">
                        <InputText
                          type="text"
                          size="small"
                          fullWidth
                          placeholder="Enter company name"
                          label="Company Name"
                          name="CompanyName"
                          value={values?.CompanyName}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        />
                        {touched?.CompanyName && errors?.CompanyName ? (
                          <Grid className="text-danger">
                            {errors?.CompanyName}
                          </Grid>
                        ) : null}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid className="form-wrap">
                    <Grid spacing={3}>
                      <Grid item>
                        <Grid className="mt-3 mb-2">
                          {/* <FormControl fullWidth>
                            <Autocomplete
                              options={IndustryData || []}
                              getOptionLabel={(option) => option.industry || ""}
                              value={selectedIndustryName || null}
                              onChange={(_, newValue) => {
                                setSelectedIndustryName(newValue);
                                setSelectedIndustryId(
                                  newValue ? newValue?.industryId : ""
                                );
                                handleChange({
                                  target: {
                                    name: "industry",
                                    value: newValue ? newValue?.industry : "",
                                  },
                                });
                              }}
                              onInputChange={(_, newInputValue) => {
                                setInputValue2(newInputValue);
                              }}
                              renderInput={(params) => (
                                <InputText
                                  {...params}
                                  label="Select industry *"
                                  name="industry"
                                  size="small"
                                  onBlur={handleBlur}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" &&
                                      !IndustryData.some(
                                        (ind) =>
                                          ind.industry.toLowerCase() ===
                                          inputValue2.toLowerCase()
                                      )
                                    ) {
                                      handleAddNewIndustry(inputValue2);
                                    }
                                  }}
                                  style={{ paddingTop: "0" }}
                                />
                              )}
                              filterOptions={(options, state) => {
                                return options.filter((option) => {
                                  const industry = option?.industry || "";
                                  return industry
                                    .toLowerCase()
                                    .includes(state.inputValue.toLowerCase());
                                });
                              }}
                              noOptionsText="No matching industry"
                            />
                          </FormControl> */}
                          <FormControl fullWidth>
                            <Autocomplete
                              options={
                                IndustryData?.filter((option) =>
                                  option.industry?.trim()
                                ) || []
                              } // Filter out empty or invalid entries
                              getOptionLabel={(option) => option.industry || ""}
                              value={selectedIndustryName || null}
                              onChange={(_, newValue) => {
                                setSelectedIndustryName(newValue);
                                setSelectedIndustryId(
                                  newValue ? newValue?.industryId : ""
                                );
                                handleChange({
                                  target: {
                                    name: "industry",
                                    value: newValue ? newValue?.industry : "",
                                  },
                                });
                              }}
                              onInputChange={(_, newInputValue) => {
                                setInputValue2(newInputValue);
                              }}
                              renderInput={(params) => (
                                <InputText
                                  {...params}
                                  label="Select industry *"
                                  name="industry"
                                  size="small"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" &&
                                      !IndustryData.some(
                                        (ind) =>
                                          ind.industry.toLowerCase() ===
                                          inputValue2.toLowerCase()
                                      )
                                    ) {
                                      handleAddNewIndustry(inputValue2);
                                    }
                                  }}
                                  style={{ paddingTop: "0" }}
                                />
                              )}
                              filterOptions={(options, state) => {
                                return options.filter((option) => {
                                  const industry = option?.industry || "";
                                  return industry
                                    .toLowerCase()
                                    .includes(state.inputValue.toLowerCase());
                                });
                              }}
                              noOptionsText="No matching industry"
                              // Customize dropdown menu font size
                              ListboxComponent={(props) => (
                                <ul
                                  {...props}
                                  style={{
                                    ...props.style,
                                    fontSize: "15px", // Set the font size for dropdown items (adjust as needed)
                                  }}
                                />
                              )}
                            />
                          </FormControl>

                          {touched.industry && errors.industry ? (
                            <Grid className="text-danger field-error">
                              {errors.industry}
                            </Grid>
                          ) : null}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid className="form-wrap">
                    <Grid spacing={3}>
                      <Grid item>
                        <Grid className="mt-3 mb-2">
                          <FormControl fullWidth>
                            <Autocomplete
                              // options={RevenueData || []}
                              options={
                                RevenueData?.filter((option) =>
                                  option.revenue?.trim()
                                ) || []
                              } // Filter out empty or invalid entries
                              getOptionLabel={(option) => option.revenue || ""}
                              value={selectedRevenueName || null}
                              onChange={(_, newValue) => {
                                setSelectedRevenueName(newValue);
                                setSelectedRevenueId(
                                  newValue ? newValue?.revenueId : ""
                                );
                                handleChange({
                                  target: {
                                    name: "revenue",
                                    value: newValue ? newValue?.revenue : "",
                                  },
                                });
                              }}
                              onInputChange={(_, newInputValue) => {
                                setInputValue3(newInputValue);
                              }}
                              renderInput={(params) => (
                                <InputText
                                  {...params}
                                  label="Select revenue *"
                                  name="revenue"
                                  size="small"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" &&
                                      !RevenueData.some(
                                        (ind) =>
                                          ind.revenue &&
                                          ind.revenue.toLowerCase() ===
                                            inputValue3.toLowerCase()
                                      )
                                    ) {
                                      handleAddNewRevenue(inputValue3);
                                    }
                                  }}
                                />
                              )}
                              filterOptions={(options, state) => {
                                return options.filter((option) =>
                                  (option.revenue || "")
                                    .toLowerCase()
                                    .includes(state.inputValue.toLowerCase())
                                );
                              }}
                              noOptionsText="No matching revenue"
                            />
                          </FormControl>
                          {touched.revenue && errors.revenue ? (
                            <Grid className="text-danger field-error">
                              {errors.revenue}
                            </Grid>
                          ) : null}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid className="form-wrap">
                    <Grid spacing={3}>
                      <Grid item>
                        <Grid className="mt-3 mb-2">
                          <FormControl fullWidth>
                            <Autocomplete
                              // options={TeamSizeData || []}
                              options={
                                TeamSizeData?.filter((option) =>
                                  option.teamSize?.trim()
                                ) || []
                              }
                              getOptionLabel={(option) =>
                                option?.teamSize || ""
                              }
                              value={selectedTeamSizeName || null}
                              onChange={(_, newValue) => {
                                setSelectedTeamSizeName(newValue);
                                setSelectedTeamSizeId(
                                  newValue ? newValue.teamSizeId : ""
                                );
                                handleChange({
                                  target: {
                                    name: "teamSize",
                                    value: newValue ? newValue?.teamSize : "",
                                  },
                                });
                              }}
                              onInputChange={(_, newInputValue) => {
                                setInputValue4(newInputValue);
                              }}
                              renderInput={(params) => (
                                <InputText
                                  {...params}
                                  label="Select teamSize *"
                                  name="teamSize"
                                  size="small"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" &&
                                      !TeamSizeData.some(
                                        (ind) =>
                                          ind.teamSize &&
                                          ind.teamSize.toLowerCase() ===
                                            inputValue4.toLowerCase()
                                      )
                                    ) {
                                      handleAddNewTeamSize(inputValue4);
                                    }
                                  }}
                                />
                              )}
                              filterOptions={(options, state) => {
                                return options.filter((option) =>
                                  (option.teamSize || "")
                                    .toLowerCase()
                                    .includes(state.inputValue.toLowerCase())
                                );
                              }}
                              noOptionsText="No matching teamsize"
                            />
                          </FormControl>
                          {touched.teamSize && errors.teamSize ? (
                            <Grid className="text-danger field-error">
                              {errors.teamSize}
                            </Grid>
                          ) : null}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid className="mt-3">
                    <Grid spacing={3}>
                      <Grid item>
                        <Grid style={{}}>
                          <Grid style={{ display: "flex" }}>
                            <InputText
                              type={showPassword ? "text" : "password"}
                              size="small"
                              fullWidth
                              placeholder="Enter password"
                              label="Password"
                              name="Password"
                              value={values?.Password}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              onKeyDown={handlePasswordKeyDown} // Add onKeyDown event handler
                              style={{ cursor: "pointer" }}
                              autoComplete="new-password"
                              endAdornment={
                                <InputAdornment
                                  position="end"
                                  style={{ gap: "10px" }}
                                >
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    edge="end"
                                  >
                                    {showPassword ? (
                                      <VisibilityIcon />
                                    ) : (
                                      <VisibilityOffIcon />
                                    )}
                                  </IconButton>
                                  <Grid style={{ marginRight: "-5px" }}>
                                    <Tooltip />
                                  </Grid>
                                </InputAdornment>
                              }
                            />
                          </Grid>
                          {touched.Password && errors.Password ? (
                            <Grid className="text-danger fontSize-8px">
                              {errors.Password}
                            </Grid>
                          ) : null}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid spacing={3}>
                    <Grid item>
                      <Grid className="mt-3 position-relative">
                        <InputText
                          type={showCPassword ? "text" : "password"}
                          size="small"
                          fullWidth
                          placeholder="Enter confirm password"
                          label="Confirm Password"
                          name="ConfirmPassword"
                          value={values?.ConfirmPassword}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          onKeyDown={handleConfirmPasswordKeyDown} // Confirm Password field ke liye onKeyDown handler
                          autoComplete="new-password"
                          inputRef={confirmPasswordRef} // Confirm Password field ke liye ref
                          endAdornment={
                            <InputAdornment
                              position="end"
                              style={{ gap: "10px" }}
                            >
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowCPassword(!showCPassword)}
                                edge="end"
                              >
                                {showCPassword ? (
                                  <VisibilityIcon />
                                ) : (
                                  <VisibilityOffIcon />
                                )}
                              </IconButton>
                              <Grid style={{ marginRight: "-5px" }}>
                                <Tooltip />
                              </Grid>
                            </InputAdornment>
                          }
                        />
                        {touched.ConfirmPassword && errors.ConfirmPassword ? (
                          <Grid className="text-danger">
                            {errors.ConfirmPassword}
                          </Grid>
                        ) : null}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid className="d-flex justify-content-between mt-4 mb-1 BlueAndWhiteBtmFlex planFormBrn">
                    <WhiteButton
                      className="planCancelBtn"
                      style={{ marginTop: "3%" }}
                      onClick={() => setModelOpen(false)}
                      label="Cancel"
                      inputRef={nextFieldRef}
                    />
                    <BlueButton
                      className="mt-3 bg-button-blue-color"
                      type="submit"
                      style={{ color: "white", height: "41px" }}
                      label={
                        loading ? (
                          <WhiteLoaderComponent
                            height="20"
                            width="20"
                            padding="20"
                            loader={loading}
                          />
                        ) : selectedIndustry ? (
                          "Update"
                        ) : (
                          "Add"
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <MailModel isOpen={isOpen} setIsOpen={setIsOpen} item={currentItem} />
      <NmiKeys
        modelOpen={modelOpenNmi}
        setModelOpen={setModelOpenNmi}
        item={currentItem}
        getAllData={getData}
      />
    </>
  );
};

export default Company;
