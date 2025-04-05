import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import { Circles, RotatingLines } from "react-loader-spinner";
import * as Yup from "yup";
import axios from "axios";
import AxiosInstance from "../../../AxiosInstance.jsx";
import IconButton from "@mui/material/IconButton";
import Previous from "../../../../assets/image/icons/Previous.png";
import Address from "../../../../components/Address/index";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import dayjs from "dayjs";
import {
  Card,
  Dropdown,
  DropdownItem,
  Navbar,
  DropdownMenu,
  DropdownToggle,
  Input,
  FormGroup,
  Label,
  Table,
} from "reactstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SettingSidebar from "../../../../components/Setting/SettingSidebar.jsx";
import { Divider } from "@mui/material";
import { Country } from "country-state-city";
import MenuIcon from "@mui/icons-material/Menu";
import Permissions from "../../../../components/Permissions/index.jsx";
import profileIcon from "../../../../assets/image/icons/file.logo.svg";
import InputText from "../../../../components/InputFields/InputText.jsx";
import moment from "moment";
import "./style.css";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { Typography } from "@mui/material";

import BlueButton from "../../../../components/Button/BlueButton.jsx";
import WhiteButton from "../../../../components/Button/WhiteButton.jsx";
import { LoaderComponent } from "../../../../components/Icon/Index.jsx";
import { border, display } from "@mui/system";
import showToast from "../../../../components/Toast/Toster.jsx";
import { MarginOutlined } from "@mui/icons-material";
import DollerInput from "../../../../components/InputFields/Doller.jsx";

const AddUser = () => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();

  const [selectedRole, setSelectedRole] = useState(undefined);
  const [loader, setLoader] = useState(true);
  const getData = async () => {
    try {
      if (location?.state?.id) {
        const response = await AxiosInstance.get(
          `${baseUrl}/v1/worker/get/${location?.state?.id}`
        );
        const fetchedData = response?.data?.data;
        formik.setValues(fetchedData);
        const data = fetchedData.permissions;
        setSelectedRole(data);
        setTimes(JSON.parse(fetchedData.ScheduleTime));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const [countries, setCountries] = useState([]);
  useEffect(() => {
    const countriesData = Country.getAllCountries();
    const uniqueCountries = countriesData.map((country) => country?.name);
    setCountries(uniqueCountries);
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(profileIcon);
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      companyId: "",
      FirstName: "",
      LastName: "",
      City: "",
      State: "",
      Zip: "",
      Country: "",
      PhoneNumber: "",
      EmailAddress: "",
      Address: "",
      LaborCost: "",
      Password: "",
      Title: "",
      Description: "",
      Schedule: "",
    },
    validationSchema: Yup.object({
      FirstName: Yup.string().required("First Name Required"),
      LastName: Yup.string().required("Last Name Required"),
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email required")
        .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
      PhoneNumber: Yup.string()
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "Phone number must be in the format (xxx) xxx-xxxx"
        )
        .required("Phone number is required"),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const object = {
          ...values,
          companyId: localStorage.getItem("CompanyId"),
          WorkerPermission: selectedRole,
          ScheduleTime: JSON.stringify(times),
          AddedAt: new Date(),
          Role: "Worker",
        };

        let response;
        if (location?.state?.id) {
          response = await AxiosInstance.put(
            `${baseUrl}/worker/${location?.state?.id}`,
            object
          );
        } else {
          response = await AxiosInstance.post(`${baseUrl}/v1/user`, object);
        }

        if (response?.data.statusCode === "200") {
          showToast.success(response?.data.message);
          navigate(-1);
        } else if (
          response?.data.statusCode === "203" ||
          response?.data.statusCode === "202"
        ) {
          showToast.error(response?.data.message);
        } else {
          showToast.error(response?.data.message);
        }
      } catch (error) {
        if (error?.response?.status === 400) {
          const errorMessages = error?.response?.data?.errors || [];
          errorMessages.forEach((message) => {
            const fieldName = message.split(" ")[0];
            const userFriendlyFieldName =
              fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
            showToast.warning(`${userFriendlyFieldName}: ${message}`);
            formik.setFieldError(fieldName, message);
          });
        } else {
          showToast.error("An error occurred while submitting the form.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  const formatPhoneNumber = (value) => {
    const PhoneNumber = value.replace(/[^\d]/g, "");
    const limitedPhoneNumber = PhoneNumber.slice(0, 10);
    const match = limitedPhoneNumber.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (match) {
      let formattedNumber = "";
      if (match[1].length >= 3) {
        formattedNumber = `(${match[1]}) `;
      } else {
        formattedNumber = match[1];
      }
      formattedNumber += match[2];
      if (match[3]) {
        formattedNumber += `-${match[3]}`;
      }

      return formattedNumber;
    }
    return limitedPhoneNumber;
  };
  const handlePhoneChange = (e) => {
    if (formik.values.PhoneNumber?.length > e.target.value?.length) {
      formik.setFieldValue("PhoneNumber", e.target.value);
    } else {
      const formattedValue = formatPhoneNumber(e.target.value);
      formik.setFieldValue("PhoneNumber", formattedValue);
    }
  };

  const [selectedCountry, setSelectedCountry] = useState(null);
  useEffect(() => {
    setCountries(Country.getAllCountries());
    if (formik.values.Country) {
      setSelectedCountry(() => {
        const country = Country.getAllCountries().find(
          (item) => item.name === formik.values.Country
        );
        return country;
      });
    }
  }, [formik]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      formik.setFieldValue(name, value);
    } else {
      formik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
  };

  const handleZipChange = (event) => {
    const { name, value } = event.target;
    const regex = /^[A-Za-z0-9]*$/;

    if (regex.test(value) || value === "") {
      formik.setFieldValue(name, value);
    }
  };

  const [open, setOpen] = useState(false);

  const handleOpenDialog = () => {
    setOpen(true);
  };
  const handleCloseDialog = () => {
    setOpen(false);
  };

  const [SundayStartTime, setSundayStartTime] = useState(
    dayjs("2024-01-01 09:00")
  );
  const [SundayEndTime, setSundayEndTime] = useState(dayjs("2024-01-01 17:00"));

  const handleSundayStartTimeChange = (newValue) => {
    setSundayStartTime(newValue);
  };

  const handleSundayEndTimeChange = (newValue) => {
    setSundayEndTime(newValue);
  };
  // monfay
  const [isMondayChecked, setIsMondayChecked] = useState(true);
  const [MondayStartTime, setMondayStartTime] = useState(
    dayjs("2024-01-01 09:00")
  );
  const [MondayEndTime, setMondayEndTime] = useState(dayjs("2024-01-01 17:00"));

  const handleMondayStartTimeChange = (newValue) => {
    setMondayStartTime(newValue);
  };

  const handleMondayEndTimeChange = (newValue) => {
    setMondayEndTime(newValue);
  };
  // tuesday
  const [isTuesdayChecked, setIsTuesdayChecked] = useState(true);
  const [TuesdayStartTime, setTuesdayStartTime] = useState(
    dayjs("2024-01-01 09:00")
  );
  const [TuesdayEndTime, setTuesdayEndTime] = useState(
    dayjs("2024-01-01 17:00")
  );

  const handleTuesdayCheckboxChange = (e) => {
    setIsTuesdayChecked(e.target.checked);
  };

  const handleTuesdayStartTimeChange = (newValue) => {
    setTuesdayStartTime(newValue);
  };

  const handleTuesdayEndTimeChange = (newValue) => {
    setTuesdayEndTime(newValue);
  };
  // Wednesday
  const [isWednesdayChecked, setIsWednesdayChecked] = useState(true);
  const [WednesdayStartTime, setWednesdayStartTime] = useState(
    dayjs("2024-01-01 09:00")
  );
  const [WednesdayEndTime, setWednesdayEndTime] = useState(
    dayjs("2024-01-01 17:00")
  );

  const handleWednesdayCheckboxChange = (e) => {
    setIsWednesdayChecked(e.target.checked);
  };

  const handleWednesdayStartTimeChange = (newValue) => {
    setWednesdayStartTime(newValue);
  };

  const handleWednesdayEndTimeChange = (newValue) => {
    setWednesdayEndTime(newValue);
  };
  // thursday
  const [isThursdayChecked, setIsThursdayChecked] = useState(true);
  const [ThursdayStartTime, setThursdayStartTime] = useState(
    dayjs("2024-01-01 09:00")
  );
  const [ThursdayEndTime, setThursdayEndTime] = useState(
    dayjs("2024-01-01 17:00")
  );

  const handleThursdayCheckboxChange = (e) => {
    setIsThursdayChecked(e.target.checked);
  };

  const handleThursdayStartTimeChange = (newValue) => {
    setThursdayStartTime(newValue);
  };

  const handleThursdayEndTimeChange = (newValue) => {
    setThursdayEndTime(newValue);
  };
  // friday
  const [isFridayChecked, setIsFridayChecked] = useState(true);
  const [FridayStartTime, setFridayStartTime] = useState(
    dayjs("2024-01-01 09:00")
  );
  const [FridayEndTime, setFridayEndTime] = useState(dayjs("2024-01-01 17:00"));

  const handleFridayCheckboxChange = (e) => {
    setIsFridayChecked(e.target.checked);
  };

  const handleFridayStartTimeChange = (newValue) => {
    setFridayStartTime(newValue);
  };

  const handleFridayEndTimeChange = (newValue) => {
    setFridayEndTime(newValue);
  };
  // saturday
  const [isSaturdayChecked, setIsSaturdayChecked] = useState(false);
  const [SaturdayStartTime, setSaturdayStartTime] = useState(
    dayjs("2024-01-01 09:00")
  );
  const [SaturdayEndTime, setSaturdayEndTime] = useState(
    dayjs("2024-01-01 17:00")
  );

  const handleSaturdayCheckboxChange = (e) => {
    setIsSaturdayChecked(e.target.checked);
  };

  const handleSaturdayStartTimeChange = (newValue) => {
    setSaturdayStartTime(newValue);
  };

  const handleSaturdayEndTimeChange = (newValue) => {
    setSaturdayEndTime(newValue);
  };
  const initialTimes = {
    Sunday: {
      start: null,
      end: null,
    },
    Monday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Tuesday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Wednesday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Thursday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Friday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Saturday: {
      start: null,
      end: null,
    },
  };

  const [times, setTimes] = useState(initialTimes);
  const [isChecked, setIsChecked] = useState({
    Sunday: false,
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
  });

  const handleCheckboxChange = (day) => {
    setIsChecked((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleTimeChange = (day, type) => (newValue) => {
    const updatedTimes = { ...times };
    updatedTimes[day] = {
      ...updatedTimes[day],
      [type]: newValue ? newValue.format("MM-DD-YYYY HH:mm:ss") : null,
    };
    setTimes(updatedTimes);
    setTimes(updatedTimes);
  };

  const handleSave = async () => {
    const dataToPost = Object.keys(times).map((day) => ({
      day,
      defaultStart: initialTimes[day].start
        ? initialTimes[day].start.format("hh:mm A")
        : null,
      defaultEnd: initialTimes[day].end
        ? initialTimes[day].end.format("hh:mm A")
        : null,
      selectedStart: times[day].start
        ? moment(times[day].start).format("hh:mm A")
        : null,
      selectedEnd: times[day].end
        ? moment(times[day].end).format("hh:mm A")
        : null,
    }));

    try {
      const response = await axios.post("/api/save-times", dataToPost);
    } catch (error) {
      console.error("Error saving times:", error);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (formik.dirty) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formik.dirty]);

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
        <Grid className="" style={{ display: "flex" }}>
          <Col className="col-2 h-100 hiren" xl={2}>
            <SettingSidebar />
          </Col>
          <Navbar
            className="navbar-setting"
            style={{
              zIndex: "9",
              borderRadius: "5px",
              display: "block",
            }}
          >
            <Dropdown
              className="dropdown menus"
              isOpen={isOpenDropDown}
              toggle={toggle}
              style={{ width: "100%" }}
            >
              <DropdownToggle
                style={{
                  background: "#E88C44",
                  border: "none",
                  color: "#FFFF",
                }}
              >
                <IconButton>
                  <MenuIcon style={{ color: "#FFFF" }} />
                </IconButton>
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>
                  <Typography style={{ fontWeight: 600, marginBottom: "10px" }}>
                    BUSINESS <br /> MANAGEMENT
                  </Typography>
                </DropdownItem>
                <DropdownItem>
                  <Grid className="d-flex flex-column">
                    <Grid
                      className="sidebar-link-setting"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        navigate(`/${CompanyName}/materials&labor`, {
                          state: { navigats: ["/index", "/materials&labor"] },
                        });
                      }}
                    >
                      Materials & Labor
                    </Grid>
                    <Grid
                      className="sidebar-link-setting"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        navigate(`/${CompanyName}/profile`, {
                          state: { navigats: ["/index", "/profile"] },
                        });
                      }}
                    >
                      Manage Team
                    </Grid>
                  </Grid>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Navbar>

          <Col
            className="col-10 subSettingLine"
            style={{
              borderLeft: "0.5px solid rgba(6, 49, 100, 30%)",
              marginTop: "-30px",
              paddingLeft: "20px",
            }}
            xl={10}
          >
            <BlueButton
              className="bg-button-blue-color"
              style={{
                marginRight: "10px",
                width: "35px",
                height: "35px",
                marginBottom: "10px",
                padding: "0px 0px",
                borderRadius: "4px",
                marginTop: "5%",
              }}
              onClick={() => {
                if (formik.dirty) {
                  const confirmLeave = window.confirm(
                    "You have unsaved changes. Are you sure you want to leave?"
                  );
                  if (!confirmLeave) {
                    return;
                  }
                }
                navigate(
                  `/${
                    CompanyName
                      ? CompanyName + "/manageteam"
                      : "staff-member" + "/workermanageteam"
                  }`,
                  {
                    state: {
                      navigats: location?.state?.navigats.filter(
                        (item) => item !== "/manageteam"
                      ),
                    },
                  }
                );
              }}
              label={
                <img src={Previous} style={{ width: "20px", height: "20px" }} />
              }
            />
            <Card
              style={{
                padding: "40px",
                marginTop: "10px",
                borderRadius: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Row className="row">
                <Grid className="">
                  <Grid className="" style={{}}>
                    <Typography
                      className="text-blue-color mb-3 person-info adminAddUser"
                      style={{
                        fontSize: "30px",
                        fontWeight: "600",
                      }}
                    >
                      Personal Information
                    </Typography>
                  </Grid>
                </Grid>

                <Grid className="responsive-container gap-3 personalInfoMation">
                  <Grid className="w-50 sub-Grid infoInputBoxesWidth">
                    <Grid className="d-flex  justify-content-between  gap-2">
                      <InputText
                        value={formik.values?.FirstName}
                        onChange={formik.handleChange}
                        onBlur={(e) => {
                          formik.handleBlur(e);
                        }}
                        error={
                          formik.touched.FirstName &&
                          Boolean(formik.errors.FirstName)
                        }
                        helperText={
                          formik.touched.FirstName && formik.errors.FirstName
                        }
                        name="FirstName"
                        label="First Name"
                        type="text"
                        className="text-blue-color w-100 m-0 mb-4"
                        fieldHeight="56px"
                      />

                      <InputText
                        value={formik.values?.LastName}
                        onChange={formik.handleChange}
                        onBlur={(e) => {
                          formik.handleBlur(e);
                        }}
                        error={
                          formik.touched.LastName &&
                          Boolean(formik.errors.LastName)
                        }
                        helperText={
                          formik.touched.LastName && formik.errors.LastName
                        }
                        name="LastName"
                        label="Last Name"
                        type="text"
                        className="text-blue-color w-100 m-0 mb-4"
                        fieldHeight="56px"
                      />
                    </Grid>
                    <InputText
                      value={formik.values?.EmailAddress}
                      onChange={formik.handleChange}
                      onBlur={(e) => {
                        formik.handleBlur(e);
                      }}
                      error={
                        formik.touched.EmailAddress &&
                        Boolean(formik.errors.EmailAddress)
                      }
                      helperText={
                        formik.touched.EmailAddress &&
                        formik.errors.EmailAddress
                      }
                      name="EmailAddress"
                      label="Email Address"
                      type="text"
                      className="text-blue-color w-100 m-0 mb-4"
                      fieldHeight="56px"
                    />

                    <InputText
                      value={formik.values?.PhoneNumber}
                      onChange={handlePhoneChange}
                      onBlur={(e) => {
                        formik.handleBlur(e);
                      }}
                      error={
                        formik.touched.PhoneNumber &&
                        Boolean(formik.errors.PhoneNumber)
                      } // Show error if touched and invalid
                      helperText={
                        formik.touched.PhoneNumber && formik.errors.PhoneNumber
                      } // Show error message
                      name="PhoneNumber"
                      label="Phone Number"
                      type="text"
                      className="text-blue-color w-100 m-0 mb-3 phoneBtn"
                      fieldHeight="56px"
                    />
                  </Grid>
                  <Grid className="w-50 sub-Grid labor-top infoInputBoxesWidth">
                    <Address
                      setSelectedCountry={setSelectedCountry}
                      selectedCountry={selectedCountry}
                      countries={countries}
                      handleChange={handleChange}
                      formik={formik}
                      handleZipChange={handleZipChange}
                    />
                  </Grid>
                </Grid>

                <Grid className="d-flex gap-3 responsive-container personalInfoMation ">
                  <Grid className="w-50 sub-Grid infoInputBoxesWidth">
                    <Typography
                      className="text-blue-color labor labor-top mb-3 adduserLaborCost"
                      style={{ fontWeight: 700, fontSize: "18px" }}
                    >
                      Labor Cost
                    </Typography>
                    <DollerInput
                      value={formik.values?.LaborCost}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.LaborCost &&
                        Boolean(formik.errors.LaborCost)
                      }
                      helperText={
                        formik.touched.LaborCost && formik.errors.LaborCost
                      }
                      name="LaborCost"
                      label="LaborCost"
                      type="text"
                      placeholder="Enter Labor Cost"
                      className="text-blue-color w-100 m-0 mb-3 personalLaborInput"
                      fieldHeight="60px"
                      endAdornment={
                        <InputAdornment
                          position="end"
                          className="text-blue-color"
                        >
                          <Typography style={{ fontSize: "12px" }}>
                            per hour
                          </Typography>
                        </InputAdornment>
                      }
                    />
                  </Grid>
                </Grid>
              </Row>
              <Grid>
                <Grid className="sub-Grid">
                  <Typography
                    className="text-blue-color labor labor-top"
                    style={{ fontWeight: 700, fontSize: "18px" }}
                  >
                    Schedule
                  </Typography>

                  <Typography
                    className="text-blue-color labor labor-top"
                    style={{ fontWeight: 600, fontSize: "16px" }}
                  >
                    Working hours
                  </Typography>
                  <Typography className="text-blue-color labor labor-top">
                    Availability is only applied to online booking, currently.
                    Set team member's availability so that they are only
                    bookable when they are available.
                  </Typography>
                </Grid>
                <Grid className="mt-4 d-flex justify-content-between align-items-start manageTeamTimeScheduleFlex">
                  {/* Scrollable container for the table */}
                  <Grid style={{ width: "424px", overflowX: "auto" }}>
                    <Table className="w-100">
                      <TableBody>
                        {/* {Object.keys(times).map((day) => (
                          <TableRow key={day}>
                            <TableCell
                              style={{ fontWeight: 700, fontSize: "18px" }}
                              className="text-blue-color"
                            >
                              {day}
                            </TableCell>
                            <TableCell
                              className="text-blue-color"
                              style={{ fontSize: "16px", fontWeight: 500 }}
                            >
                              {times[day].start && times[day].end
                                ? `${moment(times[day].start).format(
                                    "hh:mm A"
                                  )} – ${moment(times[day].end).format(
                                    "hh:mm A"
                                  )}`
                                : "Unavailable"}
                            </TableCell>
                          </TableRow>
                        ))} */}
                        {Object.keys(times).map((day) => (
                          <tr key={day}>
                            <td>{day}</td>
                            <td colSpan={2}>
                              {!isChecked[day]
                                ? "Unavailable" // ✅ If unchecked, show "Unavailable" in full row
                                : `${moment(times[day].start).format(
                                    "hh:mm A"
                                  )} - ${moment(times[day].end).format(
                                    "hh:mm A"
                                  )}`}
                            </td>
                          </tr>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>

                  {/* Edit button */}
                  <Button className="editBtnRightSide">
                    <Typography
                      style={{ borderBottom: "2px solid" }}
                      className="border-blue-color"
                      onClick={handleOpenDialog}
                    >
                      Edit
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </Card>
            <Permissions data={selectedRole} setData={setSelectedRole} />
            <Card
              style={{
                padding: "40px",
                marginTop: "10px",
                borderRadius: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Typography
                style={{ fontWeight: 700 }}
                className="text-blue-color heading-three"
              >
                Communications
              </Typography>
              <Typography
                className="text-blue-color"
                style={{
                  fontSize: "18px",
                  marginBottom: 0,
                  fontWeight: 600,
                }}
              >
                Email Subscriptions
              </Typography>
              <Grid className="d-flex  gap-2">
                <Input
                  type="checkbox"
                  className="border-blue-color"
                  style={{
                    height: "15px",
                    width: "15px",
                    marginTop: "7px",
                    cursor: "pointer",
                  }}
                  defaultChecked={true}
                />
                <Label check className="ml-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontSize: "14px" }}
                  >
                    Surveys
                  </Typography>{" "}
                  <Typography
                    style={{
                      fontSize: "10px",
                      color: "rgba(6, 49, 100, 50%)",
                    }}
                  >
                    Occasionally participate in surveys to provide feedback on
                    our performance
                  </Typography>
                </Label>
              </Grid>
              <Typography
                className="text-blue-color mb-2"
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                Invitation Language
              </Typography>
              <Typography
                style={{ fontSize: "10px", color: "rgba(6, 49, 100, 50%)" }}
              >
                The selected language for the invitation is fixed and cannot be
                altered once it has been sent.
              </Typography>
              <FormGroup check>
                <Input
                  type="radio"
                  className="border-blue-color"
                  onChange={() => {}}
                  style={{
                    cursor: "pointer",
                  }}
                  name="invitationLanguage"
                  value="English"
                  checked
                />
                <Label check className="text-blue-color">
                  <Typography style={{ fontSize: "14px" }}>English</Typography>
                </Label>
              </FormGroup>

              <Grid className="d-flex gap-2">
                <Input
                  type="radio"
                  className="border-blue-color"
                  style={{
                    height: "15px",
                    width: "15px",
                    marginTop: "7px",
                    cursor: "pointer",
                  }}
                  onChange={() => {}}
                  name="invitationLanguage"
                  value="Spanish"
                />
                <Label check className="ml-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontSize: "14px" }}
                  >
                    Spanish
                  </Typography>{" "}
                  <Typography
                    style={{
                      fontSize: "10px",
                      color: "rgba(6, 49, 100, 50%)",
                    }}
                  >
                    The mobile app is accessible in Spanish exclusively for
                    non-administrative users who have their phone language
                    configured to Spanish.
                  </Typography>
                </Label>
              </Grid>
            </Card>

            <Box>
              <Box display="flex" justifyContent="right" color="#063164">
                <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-3"></Grid>
              </Box>
              <Grid
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "20px 10px 20px 10px",
                }}
                className="BlueAndWhiteBtmFlex editScheduleModelBox"
              >
                <WhiteButton onClick={() => navigate(-1)} label="Cancel" />
                {isSubmitting ? (
                  <LoaderComponent
                    loader={isSubmitting}
                    height="20"
                    width="20"
                  />
                ) : (
                  <Grid>
                    <BlueButton
                      onClick={async (e) => {
                        e.preventDefault();
                        const isValid = await formik.validateForm();
                        formik.setTouched({
                          FirstName: true,
                          LastName: true,
                          EmailAddress: true,
                        });

                        if (Object.keys(isValid).length === 0) {
                          formik.handleSubmit();
                        } else showToast.error("Please Fill Required Fields");
                      }}
                      label={
                        location?.state?.id ? "Update Worker" : "Save Worker"
                      }
                    >
                      {/* {" "} */}
                    </BlueButton>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Col>
        </Grid>
      )}

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        className="client"
        maxWidth="md"
      >
        <DialogTitle style={{ fontSize: "20px" }} className="borerBommoModel">
          <Grid className="w-100 d-flex justify-content-start align-items-center">
            <Typography
              className="text-blue-color text-property heading-four "
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "42px",
                margin: "0 10px",
              }}
            >
              Edit Schedule
            </Typography>
          </Grid>
        </DialogTitle>
        <Divider
          style={{
            height: "1px",
            backgroundColor: "rgba(42, 79, 97, 0.8)",
            minWidth: "400px",
          }}
        />
        <DialogContent style={{ minWidth: "400px", overflowX: "auto" }}>
          <form>
            {Object.keys(times).map((day) => (
              <Grid className="d-flex align-items-center my-3" key={day}>
                <Col className="col-4 d-flex" xl={4}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(day)}
                      checked={isChecked[day]}
                    />
                    <Label check>{day}</Label>
                  </FormGroup>
                </Col>
                <Col className="col-8 d-flex gap-1" xl={8}>
                  {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Start Time"
                      value={isChecked[day] ? dayjs(times[day].start) : null}
                      onChange={handleTimeChange(day, "start")}
                      disabled={!isChecked[day]}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <TimePicker
                      label="End Time"
                      value={isChecked[day] ? dayjs(times[day].end) : null}
                      onChange={handleTimeChange(day, "end")}
                      disabled={!isChecked[day]}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider> */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Start Time"
                      value={isChecked[day] ? dayjs(times[day].start) : null}
                      onChange={handleTimeChange(day, "start")}
                      disabled={!isChecked[day]} // ✅ Checkbox unchecked ho to disable
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <TimePicker
                      label="End Time"
                      value={isChecked[day] ? dayjs(times[day].end) : null}
                      onChange={handleTimeChange(day, "end")}
                      disabled={!isChecked[day]} // ✅ Checkbox unchecked ho to disable
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Col>
              </Grid>
            ))}
          </form>
        </DialogContent>
        <DialogActions
          className="editScheduleModelBox  justify-content-between "
          style={{ minWidth: "400px", marginLeft: "10px" }}
        >
          <WhiteButton
            className=""
            style={{
              backgroundColor: "#fff",
              border: "1px solid rgba(6, 49, 100, 0.8)",
              color: "rgba(6, 49, 100, 1)",
            }}
            onClick={handleCloseDialog}
            label="Cancel"
          />
          <BlueButton
            className="bg-button-blue-color createButton"
            style={{ color: "#fff", marginRight: "19px" }}
            onClick={() => {
              handleSave();
              handleCloseDialog();
            }}
            label="Save"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddUser;
