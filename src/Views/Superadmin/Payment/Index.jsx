import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormGroup,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import "./Style.css";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
} from "../../../components/MuiTable/index.jsx";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import IconButton from "@mui/material/IconButton";
import Edit from "../../../assets/image/icons/edit.svg";
import Delete from "../../../assets/image/icons/delete.svg";
import swal from "sweetalert";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
} from "reactstrap";
import { Circles } from "react-loader-spinner";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import { ColorRing } from "react-loader-spinner";
import AxiosInstance from "../../AxiosInstance.jsx";
import CancelIcon from "@mui/icons-material/Close";
import InputText from "../../../components/InputFields/InputText.jsx";
import UpdateStatus from "../../../assets/image/superadmin/UpdateStatus.svg";
import MenuItems from "../../../assets/image/superadmin/MenuItems.svg";
import Add from "../../../assets/image/superadmin/Add.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderComponent } from "../../../components/Icon/Index.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../components/Toast/Toster.jsx";
import WhiteButton from "../../../components/Button/WhiteButton.jsx";
import BlueButton from "../../../components/Button/BlueButton.jsxx";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [companyData, setCompanyData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/company/get`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
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

      getData();

      if (res.data.statusCode === 200) {
        setModelOpen(false);
        setTimeout(() => {
          showToast.success(res.data.message);
        }, 500);
      } else if (res.data.statusCode === 201 || res.data.statusCode === 202) {
        setTimeout(() => {
          showToast.error(res.data.message);
        }, 500);
      } else {
        setTimeout(() => {
          showToast.error(res.data.message);
        }, 500);
      }
    } catch (error) {
      setTimeout(() => {
        showToast.error(error.message || "An error occurred");
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    const selectedIndustry = IndustryData.find(
      (industry) => industry.industryId === item.industryId
    );

    const selectedRevenue = RevenueData.find(
      (revenue) => revenue.revenueId === item.revenueId
    );

    const selectedTeamSize = TeamSizeData.find(
      (teamSize) => teamSize.teamSizeId === item.teamSizeId
    );

    setSelectedIndustryName(selectedIndustry || null);
    setSelectedIndustryId(selectedIndustry ? selectedIndustry?.industryId : "");

    setSelectedRevenueName(selectedRevenue || null);
    setSelectedRevenueId(selectedRevenue ? selectedRevenue?.revenueId : "");

    setSelectedTeamSizeName(selectedTeamSize || null);
    setSelectedTeamSizeId(selectedTeamSize ? selectedTeamSize?.teamSizeId : "");

    setSelectedIndustry(item);
    setSelectedAdminId(item?.companyId);
    setModelOpen(true);
  };

  // Delete
  const handleDelete = (id) => {
    swal("Are you sure you want to delete?", {
      buttons: ["No", "Yes"],
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
            setTimeout(() => {
              showToast.warning("", response?.data.message, "error");
            }, 500);
          }
        } catch (error) {
          console.error("Error:", error);
          setTimeout(() => {
            showToast.error(error);
          }, 500);
        }
      }
    });
  };

  const CollapseData = ({ data }) => {
    return (
      <Grid className="d-flex gap-4">
        <Grid className="card comanydetailcompanytable">
          <Grid
            className="card-header text-blue-color"
            style={{ backgroundColor: "#FFF4EA" }}
          >
            Company Details
          </Grid>
          <Grid className="card-body w-100 bg-orange-color" style={{}}>
            <Grid className="d-flex w-100 flex-row justify-content-between">
              <Typography className="text-white -color">
                Phone Number:{" "}
              </Typography>
              <Typography
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "50%",
                  marginBottom: "7px",
                }}
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
                }}
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
                }}
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
                }}
              >
                {data?.revenue || "revenue not available"}
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
  const handleActionClick = (event, item, CompanyId) => {
    setAnchorEl(event.currentTarget);
    setCurrentItem(item);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

  const cellData = companyData?.map((item) => {
    return {
      key: item.companyId,
      value: [
        item.ownerName,
        item.companyName,
        item.EmailAddress,
        item.status,
        "-",
        <IconButton>
          <img
            src={MenuItems}
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
                // handleEditClick(item);
              }}
            >
              <img src={UpdateStatus} />
              <Typography className="mb-0 text-blue-color mx-2"></Typography>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
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
              }}
            >
              <img src={Edit} />
              <Typography className="mb-0 text-blue-color mx-2">
                Edit
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(currentItem.companyId);
              }}
            >
              <img src={Delete} />
              <Typography className="mb-0 text-blue-color mx-2">
                Delete
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

  const [dropdownOpen1, setDropdownOpen1] = useState(false);
  const [selectedItem1, setSelectedItem1] = useState("Customer Name");

  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  const [selectedItem2, setSelectedItem2] = useState("Status");

  const toggleDropdown1 = () => setDropdownOpen1(!dropdownOpen1);
  const toggleDropdown2 = () => setDropdownOpen2(!dropdownOpen2);

  const handleSelect1 = (item) => {
    setSelectedItem1(item);
    setDropdownOpen1(false);
  };

  const handleSelect2 = (item) => {
    setSelectedItem2(item);
    setDropdownOpen2(false);
  };

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 industry">
        <Grid className="d-flex justify-content-between mb-2 align-items-center">
          <Typography
            style={{ fontWeight: 700 }}
            className="text-blue-color heading-three"
          >
            Invoice Payment
          </Typography>
          <Button
            onClick={() => {
              setModelOpen(true);
              setSelectedIndustryName(null);
              setSelectedIndustryId(null);
              setSelectedRevenueName(null);
              setSelectedRevenueId(null);
              setSelectedTeamSizeName(null);
              setSelectedTeamSizeId(null);
              setSelectedIndustry(null);
              // setSelectedProduct(null);
              // setSelectedProductAndService(null);
              setSelectedAdminId(null);
            }}
            className="text-capitalize bg-button-blue-color addproductbutton text-white-color"
          >
            Add Company
          </Button>
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
            className="d-flex border-blue-color justify-content-between align-items-center table-header bg-blue-color"
            style={{
              borderBottom: "2px solid ",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography
              className="compn text-light heading-five"
              style={{ cursor: "pointer" }}
            >
              Payment List
            </Typography>
            <Grid className="companysearch d-flex gap-2">
              <Dropdown isOpen={dropdownOpen1} toggle={toggleDropdown1}>
                <DropdownToggle
                  caret
                  style={{
                    background: "transparent",
                    border: "1px solid",
                    padding: "5px",
                  }}
                >
                  {selectedItem1 || "selectedItem1 not available"}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem
                    onClick={() => handleSelect1("Krushil Vaghani")}
                  >
                    Krushil Vaghani
                  </DropdownItem>
                  <DropdownItem onClick={() => handleSelect1("Ravi Monpara")}>
                    Ravi Monpara
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown isOpen={dropdownOpen2} toggle={toggleDropdown2}>
                <DropdownToggle
                  caret
                  style={{
                    background: "transparent",
                    border: "1px solid",
                    padding: "5px",
                  }}
                >
                  {selectedItem2 || "selectedItem2 not available"}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => handleSelect2("Paid")}>
                    Paid
                  </DropdownItem>
                  <DropdownItem onClick={() => handleSelect2("Unpaid")}>
                    Unpaid
                  </DropdownItem>
                  <DropdownItem onClick={() => handleSelect2("Pending")}>
                    Pending
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
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
              <JobberTable
                headerData={[
                  "Full Name",
                  "Company Name",
                  "Email",
                  "Status",
                  "Plan Name",
                  "Action",
                ]}
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
        // onClose={() => setModelOpen(false)}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            setModelOpen(false);
          }
        }}
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Grid className="d-flex justify-content-between borerBommoModel">
            <Grid>{""}</Grid>
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
              ownerName: selectedIndustry ? selectedIndustry.ownerName : "",
              phoneNumber: selectedIndustry ? selectedIndustry.phoneNumber : "",
              EmailAddress: selectedIndustry
                ? selectedIndustry.EmailAddress
                : "",
              companyName: selectedIndustry ? selectedIndustry.companyName : "",
              Password: selectedIndustry ? selectedIndustry.Password : "",
              ConfirmPassword: selectedIndustry
                ? selectedIndustry.Password
                : "",
            }}
            enableReinitialize
            validationSchema={Yup.object().shape({
              ownerName: Yup.string().required("Owener Name is Required"),
              phoneNumber: Yup.string().required("Phone Number is Required"),
              EmailAddress: Yup.string()
                .email("Invalid email")
                .required("Email is required")
                .matches(
                  /^[^@]+@[^@]+\.[^@]+$/,
                  "Email must contain '@' and '.'"
                ),
              companyName: Yup.string().required(" Company Name is Required"),
              Password: Yup.string().required("Password is Required"),
              ConfirmPassword: Yup.string()
                .required("Confirm Password is Required")
                .oneOf([Yup.ref("Password"), null], "Passwords must match"),
            })}
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
                    <InputText
                      type="text"
                      size="small"
                      fullWidth
                      placeholder="Enter ownerName *"
                      label="OwnerName *"
                      name="ownerName"
                      value={values.ownerName}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    {touched.ownerName && errors.ownerName ? (
                      <Grid className="text-danger">{errors.ownerName}</Grid>
                    ) : null}
                  </Grid>
                  <Grid className="mt-3 superadmin-company">
                    <InputText
                      type="text"
                      size="small"
                      fullWidth
                      placeholder="Enter phone number"
                      label="Phone Number"
                      name="phoneNumber"
                      value={values?.phoneNumber}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    {touched.phoneNumber && errors.phoneNumber ? (
                      <Grid className="text-danger">{errors.phoneNumber}</Grid>
                    ) : null}
                  </Grid>
                  <Grid className="mt-3">
                    <InputText
                      type="text"
                      size="small"
                      fullWidth
                      placeholder="Enter primary emailAddress"
                      label="Primary EmailAddress *"
                      name="EmailAddress"
                      value={values?.EmailAddress}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    {touched.EmailAddress &&
                    errors.EmailAddress ? (
                      <Grid className="text-danger">
                        {errors.EmailAddress}
                      </Grid>
                    ) : null}
                  </Grid>
                  <Grid className="mt-3 superadmin-company">
                    <InputText
                      type="text"
                      size="small"
                      fullWidth
                      placeholder="Enter company name"
                      label="Company Name"
                      name="companyName"
                      value={values?.companyName}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    {touched.companyName && errors.companyName ? (
                      <Grid className="text-danger">{errors.companyName}</Grid>
                    ) : null}
                  </Grid>

                  <Grid className="form-wrap">
                    <Grid>
                      <Grid className="mt-3 mb-4">
                        <FormControl fullWidth className="">
                          <Autocomplete
                            className=""
                            options={IndustryData || []}
                            getOptionLabel={(option) => option.industry || ""}
                            value={selectedIndustryName || null}
                            onChange={(_, newValue) => {
                              setSelectedIndustryName(newValue);
                              setSelectedIndustryId(
                                newValue ? newValue.industryId : ""
                              );
                              handleChange({
                                target: {
                                  name: "industry",
                                  value: newValue ? newValue.industry : "",
                                },
                              });
                            }}
                            onInputChange={(_, newInputValue) => {
                              setInputValue2(newInputValue);
                            }}
                            renderInput={(params) => (
                              <InputText
                                className=""
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
                                const industry = option.industry || "";
                                return industry
                                  .toLowerCase()
                                  .includes(state.inputValue.toLowerCase());
                              });
                            }}
                            noOptionsText="No matching industry"
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

                  <Grid className="form-wrap">
                    <Grid>
                      <Grid className="mt-3 mb-4">
                        <FormControl fullWidth>
                          <Autocomplete
                            options={RevenueData || []}
                            getOptionLabel={(option) => option.revenue || ""}
                            value={selectedRevenueName || null}
                            onChange={(_, newValue) => {
                              setSelectedRevenueName(newValue);
                              setSelectedRevenueId(
                                newValue ? newValue.revenueId : ""
                              );
                              handleChange({
                                target: {
                                  name: "revenue",
                                  value: newValue ? newValue.revenue : "",
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

                  <Grid className="form-wrap">
                    <Grid>
                      <Grid className="mt-3 mb-4">
                        <FormControl fullWidth>
                          <Autocomplete
                            className=""
                            options={TeamSizeData || []}
                            getOptionLabel={(option) => option.teamSize || ""}
                            value={selectedTeamSizeName || null}
                            onChange={(_, newValue) => {
                              setSelectedTeamSizeName(newValue);
                              setSelectedTeamSizeId(
                                newValue ? newValue.teamSizeId : ""
                              );
                              handleChange({
                                target: {
                                  name: "teamSize",
                                  value: newValue ? newValue.teamSize : "",
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

                  <Grid className="mt-3">
                    <InputText
                      autoComplete="new-password"
                      type="password"
                      size="small"
                      fullWidth
                      placeholder="Enter password "
                      label="Password"
                      name="Password"
                      value={values?.Password}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      style={{ cursor: "pointer" }}
                    />
                    {touched.Password && errors.Password ? (
                      <Grid className="text-danger">{errors.Password}</Grid>
                    ) : null}
                  </Grid>

                  <Grid className="mt-3">
                    <InputText
                      autoComplete="new-password"
                      type="password"
                      size="small"
                      fullWidth
                      placeholder="Enter confirm password"
                      label="Confirm Password"
                      name="ConfirmPassword"
                      value={values?.ConfirmPassword}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    />
                    {touched.ConfirmPassword && errors.ConfirmPassword ? (
                      <Grid className="text-danger">
                        {errors.ConfirmPassword}
                      </Grid>
                    ) : null}
                  </Grid>

                  <Grid className="d-flex justify-content-end">
                    <WhiteButton
                      className="mt-3 text-blue-color border-blue-color "
                      style={{
                        marginRight: "15px",
                        border: "1px solid ",
                      }}
                      onClick={() => setModelOpen(false)}
                      label="Cancel"
                    />
                    <BlueButton
                      className="mt-3 bg-button-blue-color"
                      type="submit"
                      style={{ color: "white" }}
                      label={
                        <>
                          {loading ? (
                            <ColorRing
                              height="30"
                              width="30"
                              colors={["#fff", "#fff", "#fff", "#fff", "#fff"]}
                              ariaLabel="circles-loading"
                              wrapperStyle={{}}
                              wrapperClass=""
                              visible={true}
                            />
                          ) : selectedIndustry ? (
                            "Update"
                          ) : (
                            "Add"
                          )}
                        </>
                      }
                    />
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Payment;
