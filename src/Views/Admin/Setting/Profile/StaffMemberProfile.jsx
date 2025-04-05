import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  Divider,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import IconButton from "@mui/material/IconButton";
import "./style.css";
import {
  Card,
  Dropdown,
  DropdownItem,
  Navbar,
  DropdownMenu,
  DropdownToggle,
  Input,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import SettingSidebar from "../../../../components/Setting/SettingSidebar.jsx";
import profileIcon from "../../../../assets/image/icons/profile-icon.jpg";
import { Country } from "country-state-city";
import sliderindicator from "../../../../assets/image/icons/sliderindicator.svg";
import MenuIcon from "@mui/icons-material/Menu";
import AxiosInstance from "../../../AxiosInstance.jsx";
import InputText from "../../../../components/InputFields/InputText.jsx";
import Address from "../../../../components/Address/index.jsx";
import sendToast from "../../../../components/Toast/sendToast.jsx";
import { Grid } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton.jsx";

import { Row, Col } from "react-bootstrap";
import {
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../../components/Icon/Index.jsx";
import WhiteButton from "../../../../components/Button/WhiteButton.jsx";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Menu, MenuItem } from "@mui/material";
import Tooltip from "../../../../components/Tooltip/tooltip.js";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import swal from "sweetalert";
import showToast from "../../../../components/Toast/Toster.jsx";
import PasswordValidationSchema from "../../../../components/Password/PasswordValidation.jsx";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { CompanyName } = useParams();
  const cdnUrl = process.env.REACT_APP_CDN_API;
                          
  const [loader, setLoader] = useState(true);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [postLoader, setPostLoader] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const [CompanyId] = useState(localStorage.getItem("CompanyId"));
  const [CustomerId] = useState(localStorage.getItem("CustomerId"));
  const [WorkerId] = useState(localStorage.getItem("worker_id"));
  const [showCPassword, setShowCPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [oldData, setOldData] = useState("");
  const profileFormik = useFormik({
    initialValues: {
      CompanyId: "",
      EmailAddress: "",
      PhoneNumber: "",
      Address: "",
      City: "",
      State: "",
      Zip: "",
      // Password: "",
      Country: "",
      ProfileImage: "",
      FirstName: "",
      LastName: "",
      // confirmpassword: "",
    },
    validationSchema: Yup.object({
      // Password: Yup.string().required("password is required"),
      // confirmpassword: Yup.string()
      //   .oneOf([Yup.ref("Password"), null], "Passwords must match")
      //   .required("Confirmation password is required"),
      FirstName: Yup.string().required("FirstName Required"),
      LastName: Yup.string().required("LastName Required"),
      // PhoneNumber: Yup.string().required("Required"),
      PhoneNumber: Yup.string()
        .required("Phone number required")
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "Phone number must be in the format (xxx) xxx-xxxx"
        ),
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email is required")
        .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
      Address: Yup.string().required("Address required"),
      City: Yup.string().required("City required"),
      State: Yup.string().required("State required"),
      Zip: Yup.string().required("Zip code required"),
      Country: Yup.string().required("Country required"),
    }),
    onSubmit: async (values) => {
      const deepEqual = (a, b) =>
        JSON.stringify(a) === JSON.stringify(b) ||
        (Object.keys(a).length === Object.keys(b).length &&
          Object.keys(a).every((key) => String(a[key]) === String(b[key])));

      const isEqual = deepEqual(oldData, values);
      if (!isEqual) {
        try {
          setPostLoader(true);
          const updatedProfile = {
            ...values,
          };
          const res = await AxiosInstance.put(
            `/v1/worker/profile/${WorkerId}`,
            updatedProfile
          );
          if (res?.data?.statusCode === 200) {
            showToast.success(res?.data?.message);
            swal({
              title: "Profile saved successfully!",
              text: "Your changes have been saved.",
              icon: "success",

              buttons: {
                confirm: {
                  text: "OK",
                  closeModal: true,
                  value: true,
                  className: "bg-orange-color",
                },
              },
              dangerMode: true,
            }).then(() => {
              if (!postLoader) {
                navigate(`/staff-member/index`, {
                  state: { navigats: ["/index"] },
                });
              }
            });
            getData();
          }
        } catch (error) {
          console.error("Error updating profile:", error);
        } finally {
          setPostLoader(false);
        }
      } else {
        sendToast("No changes available to update");
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      WorkerId: "",
      Password: "",
      confirmpassword: "",
    },
    validationSchema: Yup.object({
      Password: PasswordValidationSchema,
      confirmpassword: Yup.string()
        .oneOf([Yup.ref("Password"), null], "Passwords must match")
        .required("Confirmation password is required"),
    }),
    onSubmit: async (values) => {
      setLoader(true);

      try {
        setLoading(true);

        const res = await AxiosInstance.put(
          `/worker/change-password/${WorkerId}`,
          {
            Password: values.Password,
            confirmpassword: values.confirmpassword,
          }
        );

        if (res?.status === 200) {
          showToast.success(res?.data?.message);
          swal({
            title: "Profile saved successfully!",
            text: "Your changes have been saved.",
            icon: "success",

            buttons: {
              confirm: {
                text: "OK",
                closeModal: true,
                value: true,
                className: "bg-orange-color",
              },
            },
            dangerMode: true,
          }).then(() => {
            navigate(`/staff-member/profile`, {
              state: { navigats: ["/profile"] },
            });
          });
          setOpenPassWord(false);
          getData();
        } else {
          showToast.error("Failed to change password");
        }
      } catch (error) {
        if (
          error?.response?.status === 400 ||
          error?.response?.status === 404
        ) {
          showToast.warning(error?.response?.data?.message);
        } else {
          showToast.error("An error occurred while changing the password.");
        }
        console.error("Error changing password", error);
        setLoading(true);
      } finally {
        setLoader(false);
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

  // Handle phone number change and format it
  const handlePhoneChange = (e) => {
    if (profileFormik?.values?.PhoneNumber?.length > e.target.value?.length) {
      profileFormik?.setFieldValue("PhoneNumber", e.target.value);
    } else {
      const formattedValue = formatPhoneNumber(e.target.value);
      profileFormik?.setFieldValue("PhoneNumber", formattedValue);
    }
    setIsEdited(true);
  };

  const getData = async () => {
    try {
      const allCountries = Country.getAllCountries();
      setCountries(allCountries);

      const res = await AxiosInstance.get(`/v1/worker/profile/${WorkerId}`);
      console.log(res, "resres00");
      if (res?.data?.success) {
        const userData = res?.data?.data?.user;
        const profileData = res?.data?.data?.userProfile;

        const combinedData = {
          CompanyId: profileData?.CompanyId || userData?.CompanyId?.[0],
          FirstName: profileData?.FirstName || "",
          LastName: profileData?.LastName || "",
          EmailAddress: userData?.EmailAddress || "",
          PhoneNumber: profileData?.PhoneNumber || "",
          Address: profileData?.Address || "",
          City: profileData?.City || "",
          State: profileData?.State || "",
          Zip: profileData?.Zip || "",
          Country: profileData?.Country || "",
          ProfileImage: profileData?.ProfileImage || "",
        };

        setOldData(combinedData);
        setUploadedImageUrl(profileData?.ProfileImage || "");
        profileFormik.setValues(combinedData);

        if (profileData?.Country) {
          const selectedCountry = allCountries.find(
            (item) => item?.name === profileData?.Country
          );
          setSelectedCountry(selectedCountry);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
      setImageLoader(false);
    }
  };
  useEffect(() => {
    getData();
  }, [CompanyId]);

  const [iamgeLoader, setImageLoader] = useState(true);
  const handleFileChange = (file) => {
    setImageLoader(true);
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
        "image/svg+xml",
        "image/tiff",
        "image/x-icon",
      ];
      if (allowedTypes.includes(file.type)) {
        uploadImage(file);
      } else {
        console.error("Unsupported file type. Only JPG and PNG are allowed.");
        return;
      }
    }
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      const url = `${cdnUrl}/upload`;

      const result = await AxiosInstance.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const image = result?.data?.files[0]?.filename;
      if (image) {
        const res = await AxiosInstance.put(`/v1/worker/profile/${WorkerId}`, {
          ProfileImage: image,
        });
        if (res?.data?.statusCode === 200) {
          showToast.success("Profile image updated successfully.");
          setUploadedImageUrl(image);
          profileFormik.setFieldValue("ProfileImage", image);
          await getData();
        } else {
          sendToast(
            "There was an issue updating image. Please try again later."
          );
        }
      } else {
        sendToast("There was an issue updating image. Please try again later.");
      }
    } catch (error) {
      sendToast("There was an issue updating image. Please try again later.");
    } finally {
      setImageLoader(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      profileFormik.setFieldValue(name, value);
    } else {
      profileFormik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
    setIsEdited(true);
  };

  const handleZipChange = (event) => {
    const { name, value } = event.target;
    const regex = /^[A-Za-z0-9]*$/;

    if (regex.test(value) || value === "") {
      profileFormik.setFieldValue(name, value);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  const [openPassword, setOpenPassWord] = useState(false);

  const Changepassword = () => {
    setOpenPassWord(true);
  };

  const handleClose = () => {
    setOpenPassWord(false);
  };

  const [readOnly, setReadOnly] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const passwordChange = () => {
    if (
      profileFormik?.values?.Password !== profileFormik?.values?.confirmpassword
    ) {
      setReadOnly(true);
      setDisabled(true);
      return;
    } else {
      setOpenPassWord(false);
      profileFormik?.handleSubmit();
    }
  };

  return (
    <>
      <Grid className="manage-team">
        {/* <Grid className="col-2 h-100 hiren">
          <SettingSidebar />
        </Grid> */}
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
            style={{ width: "100%", color: "#fff" }}
          >
            <DropdownToggle
              className="dropdowntoggle"
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

        {loader ? (
          <Grid
            className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
            style={{ height: "70vh" }}
          >
            <LoaderComponent loader={loader} height="50" width="50" />
          </Grid>
        ) : (
          <Col
            className="col-12 profileWidthLeft"
            style={{
              // borderLeft: "0.5px solid rgba(6, 49, 100, 30%)",
              paddingLeft: "20px",
              marginTop: "-30px",
            }}
            xl={12}
          >
            <Grid
              className="d-flex justify-content-between"
              style={{ color: "#063164", fontWeight: 700, marginTop: "4%" }}
            >
              <Typography className="text-blue-color mt-3 settingUserInfo heading-three">
                <Typography className="bold-text fs-3">
                  {profileFormik?.values?.FullName}
                </Typography>
              </Typography>
            </Grid>
            <Card
              style={{
                padding: "40px",
                marginTop: "10px",
                borderRadius: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                marginBottom: "20px",
              }}
            >
              <Row className="row">
                <Col className="d-flex col-lg-6 order-2 order-lg-1" xl={6}>
                  <Grid>
                    <InputText
                      value={profileFormik?.values?.FirstName}
                      onChange={handleChange}
                      id="FirstName"
                      name="FirstName"
                      label="First Name"
                      placeholder="Enter first name "
                      type="text"
                      y
                      className="mb-3 my-2 textfield_bottom w-100"
                      error={
                        profileFormik?.touched?.FirstName &&
                        Boolean(profileFormik?.errors?.FirstName)
                      }
                      helperText={
                        profileFormik?.touched?.FirstName &&
                        profileFormik?.errors?.FirstName
                      }
                    />
                    <InputText
                      value={profileFormik?.values?.LastName}
                      onChange={handleChange}
                      id="LastName"
                      name="LastName"
                      label="Last Name"
                      placeholder="Enter last name "
                      type="text"
                      y
                      className="mb-3 my-2 textfield_bottom w-100"
                      error={
                        profileFormik?.touched?.LastName &&
                        Boolean(profileFormik?.errors?.LastName)
                      }
                      helperText={
                        profileFormik?.touched?.LastName &&
                        profileFormik?.errors?.LastName
                      }
                    />
                    <InputText
                      value={profileFormik?.values?.EmailAddress}
                      onChange={handleChange}
                      id="EmailAddress"
                      name="EmailAddress"
                      label="Email Address"
                      placeholder="Enter email address"
                      type="email"
                      className="mb-3 my-2 textfield_bottom w-100"
                      error={
                        profileFormik?.touched?.EmailAddress &&
                        Boolean(profileFormik?.errors?.EmailAddress)
                      }
                      helperText={
                        profileFormik?.touched?.EmailAddress &&
                        profileFormik?.errors?.EmailAddress
                      }
                    />
                    <InputText
                      value={profileFormik?.values?.PhoneNumber}
                      onChange={handlePhoneChange}
                      id="PhoneNumber"
                      name="PhoneNumber"
                      label="Mobile Number"
                      placeholder="Enter mobile number"
                      type="text"
                      className="mb-3 my-2 textfield_bottom w-100"
                      error={
                        profileFormik?.touched?.PhoneNumber &&
                        Boolean(profileFormik?.errors?.PhoneNumber)
                      }
                      helperText={
                        profileFormik?.touched?.PhoneNumber &&
                        profileFormik?.errors?.PhoneNumber
                      }
                    />

                    <Address
                      setSelectedCountry={setSelectedCountry}
                      selectedCountry={selectedCountry}
                      countries={countries}
                      handleChange={handleChange}
                      formik={profileFormik}
                      handleZipChange={handleZipChange}
                    />
                    {/* <InputText
                      value={profileFormik?.values?.Password}
                      onChange={handleChange}
                      id="Password"
                      name="Password"
                      label="Password "
                      placeholder="Enter password here..."
                      type="text"
                      className="mb-3 my-2 textfield_bottom w-100 profilePasswordSet"
                    /> */}
                    {/* <Box position="relative">
                      <Grid style={{ display: "flex" }}>
                        <InputText
                          value={profileFormik?.values?.Password}
                          onChange={profileFormik?.handleChange}
                          id="Password"
                          name="Password"
                          label="Password"
                          placeholder="Enter password"
                          type={showPassword ? "text" : "password"}
                          className="mb-3 my-2 textfield_bottom w-100"
                          autoComplete="new-password"
                          error={
                            profileFormik?.touched?.Password &&
                            Boolean(profileFormik?.errors?.Password)
                          }
                          helperText={
                            profileFormik?.touched?.Password &&
                            profileFormik?.errors?.Password
                          }
                        />

                        <Grid style={{ display: "flex" }}>
                          <Grid>
                            <IconButton
                              onClick={togglePasswordVisibility}
                              style={{
                                position: "absolute",
                                right: "30px",
                                top: "45%",
                                transform: "translateY(-50%)",
                                color: "#063164",
                              }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </Grid>
                          <Grid
                            style={{ marginLeft: "-35px", marginTop: "13px" }}
                          >
                            <Tooltip />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Box> */}
                    {/* <Grid className="mb-3 my-2 btn-bottm">
                      <Button
                        className="save-profile-btn"
                        onClick={profileFormik?.handleSubmit}
                        style={{
                          fontSize: "16px",
                          textTransform: "none",
                          backgroundColor: "#063164",
                          color: "#fff",
                          width: "20%",
                          opacity: isEdited ? 1 : 0.5,
                        }}
                        disabled={!isEdited}
                      >
                        {postLoader ? (
                          <WhiteLoaderComponent
                            height="20"
                            width="20"
                            padding="20"
                            loader={postLoader}
                          />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </Grid> */}
                    <Box position="relative">
                      <Grid
                        className="d-flex"
                        style={{ justifyContent: "space-between" }}
                      >
                        <Grid>
                          <Typography
                            onClick={Changepassword}
                            style={{
                              fontWeight: "700",
                              fontSize: "14px",
                              color: "#e88c44",
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                          >
                            Change Password
                          </Typography>
                        </Grid>
                        <Grid className="mb-3 btn-bottm justify-content-end">
                          <BlueButton
                            className="save-profile-btn bg-blue-color indexProfileBtn"
                            onClick={profileFormik?.handleSubmit}
                            style={{
                              fontSize: "16px",
                              textTransform: "none",
                              color: "#fff",
                              // width: "20%",
                              width: "100px",
                              whiteSpace: "nowrap",
                              opacity: isEdited ? 1 : 0.5,
                            }}
                            disabled={!isEdited}
                            label={
                              postLoader ? (
                                <WhiteLoaderComponent
                                  height="20"
                                  width="20"
                                  padding="20"
                                  loader={postLoader}
                                />
                              ) : (
                                "Save"
                              )
                            }
                          />
                        </Grid>
                      </Grid>
                      <Dialog
                        open={openPassword}
                        onClose={() => setOpenPassWord(false)}
                      >
                        <DialogTitle className="borerBommoModel">
                          <Grid className="w-100 d-flex justify-content-start align-items-center">
                            <Typography
                              className="text-blue-color text-property heading-four"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "42px",
                                margin: "0 10px",
                                fontWeight: "bold",
                                fontSize: "18px",
                              }}
                            >
                              Change Password
                            </Typography>
                          </Grid>
                        </DialogTitle>
                        <DialogContent className="" style={{ padding: "20px" }}>
                          <Grid
                            style={{
                              display: "flex",
                              flexDirection: "column",
                            }}
                            spacing={3}
                          >
                            <Grid className="d-flex justify-content-start align-items-center">
                              <InputText
                                value={passwordFormik?.values?.Password}
                                onChange={passwordFormik?.handleChange}
                                className="mb-3 my-2 textfield_bottom w-100"
                                onBlur={passwordFormik?.handleBlur}
                                error={
                                  passwordFormik?.touched?.Password &&
                                  Boolean(passwordFormik?.errors?.Password)
                                }
                                helperText={
                                  passwordFormik?.touched?.Password &&
                                  passwordFormik?.errors?.Password
                                }
                                name="Password"
                                label="Password"
                                type={showPassword ? "text" : "password"} // Toggle visibility
                                fieldHeight="56px"
                                autoComplete="new-password"
                                endAdornment={
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                      edge="end"
                                    >
                                      {showPassword ? (
                                        <VisibilityOffIcon />
                                      ) : (
                                        <VisibilityIcon />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                }
                              />
                            </Grid>
                            <Grid className="d-flex justify-content-start align-items-center">
                              <InputText
                                value={passwordFormik?.values?.confirmpassword}
                                onChange={passwordFormik?.handleChange}
                                className="mb-3 my-2 textfield_bottom w-100"
                                onBlur={passwordFormik?.handleBlur}
                                error={
                                  passwordFormik?.touched?.confirmpassword &&
                                  Boolean(
                                    passwordFormik?.errors?.confirmpassword
                                  )
                                }
                                helperText={
                                  passwordFormik?.touched?.confirmpassword &&
                                  passwordFormik?.errors?.confirmpassword
                                }
                                name="confirmpassword"
                                label="Re-type New Password"
                                type={showCPassword ? "text" : "password"} // Toggle visibility
                                fieldHeight="56px"
                                autoComplete="new-password"
                                onPaste={(e) => e.preventDefault()}
                                onCopy={(e) => e.preventDefault()}
                                onCut={(e) => e.preventDefault()}
                                endAdornment={
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      onClick={() =>
                                        setShowCPassword(!showCPassword)
                                      }
                                      edge="end"
                                    >
                                      {showCPassword ? (
                                        <VisibilityOffIcon />
                                      ) : (
                                        <VisibilityIcon />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                }
                              />
                            </Grid>
                          </Grid>
                          <Grid
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                            className="managebuttonModel"
                          >
                            <WhiteButton
                              className="my-2 text-blue-color border-blue-color"
                              onClick={() => {
                                setOpenPassWord(false);
                                passwordFormik?.setFieldValue(
                                  "confirmpassword",
                                  null
                                );
                              }}
                              label="Cancel"
                            />
                            <BlueButton
                              className="my-2 text-blue-color border-blue-color"
                              onClick={passwordFormik.handleSubmit}
                              style={{ width: "20%" }}
                              label={
                                loader ? (
                                  <div className="loader">Loading...</div>
                                ) : (
                                  "Save"
                                )
                              }
                            />
                          </Grid>
                        </DialogContent>
                      </Dialog>
                    </Box>
                  </Grid>
                  <Divider
                    orientation="vertical"
                    flexItem
                    className="d-none d-lg-block"
                    style={{
                      marginLeft: "10%",
                      marginRight: "3%",
                      border: "0.5px solid",
                    }}
                  />
                </Col>
                <Col
                  className="col-lg-6 d-flex justify-content-center align-items-center flex-column order-1 order-lg-2 mb-2"
                  xl={6}
                >
                  <Grid
                    className="text-center "
                    style={{ marginTop: "0px", marginBottom: "30px" }}
                  >
                    <p
                      className="text-blue-color settingUserInfo"
                      style={{
                        fontSize: "30px",
                        fontWeight: "600",
                      }}
                    >
                      Personal Information
                    </p>
                  </Grid>
                  <Grid
                    className="text-center"
                    style={{ marginTop: "0px", marginBottom: "30px" }}
                  >
                    <Grid
                      className="d-flex justify-content-center align-items-center personlInfoDp"
                      style={{
                        backgroundColor: "#fff",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        boxShadow: "0 4px 5px rgba(0, 0, 0, 0.4)",
                        overflow: "hidden", // Ensure image doesn't overflow
                      }}
                    >
                      {iamgeLoader ? (
                        <Grid className="d-flex justify-content-center">
                          <LoaderComponent
                            height="20"
                            width="20"
                            padding="20"
                            loader={iamgeLoader}
                          />
                        </Grid>
                      ) : (
                        <>
                          {uploadedImageUrl ? (
                            <img
                              src={`${cdnUrl}/upload/${uploadedImageUrl}`}
                              alt="Profile"
                              style={{
                                borderRadius: "50%",
                                width: "100%",
                                height: "100%",
                                objectFit: "cover", // Ensures image maintains aspect ratio and covers the area properly
                              }}
                            />
                          ) : (
                            <Typography
                              className="text-blue-color"
                              style={{ fontWeight: 700, fontSize: "20px" }}
                            >
                              {profileFormik?.values?.FirstName?.split(" ")
                                ?.map((part) => part.charAt(0).toUpperCase())
                                ?.join("")}
                            </Typography>
                          )}
                        </>
                      )}
                    </Grid>
                  </Grid>

                  <Grid>
                    <label htmlFor="upload-button">
                      <Button
                        component="span"
                        style={{
                          color: "#063164",
                          background: "#FFFF",
                          textTransform: "none",
                          border: "1px solid #063164",
                          marginTop: "20px",
                          fontSize: "12px",
                          cursor: "pointer",
                          padding: "8px 16px",
                          borderRadius: "4px",
                        }}
                      >
                        Upload image here...
                      </Button>
                    </label>
                    <Input
                      id="upload-button"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        handleFileChange(e.target.files[0]);
                      }}
                      multiple={false}
                    />
                  </Grid>

                  <Grid style={{ marginTop: "40px" }}>
                    <p
                      className="text-blue-color"
                      style={{
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "400",
                      }}
                    >
                      Use this form to update your personal information. Ensure
                      all details are accurate and up-to-date.
                    </p>
                  </Grid>
                  <Grid>
                    <img src={sliderindicator} />
                  </Grid>
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Grid>
    </>
  );
};

export default CustomerProfile;
