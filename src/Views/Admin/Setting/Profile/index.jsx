import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  Divider,
  Typography,
  SwipeableDrawer,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import IconButton from "@mui/material/IconButton";
import "./style.css";
import swal from "sweetalert";
import {
  Card,
  Dropdown,
  DropdownItem,
  Navbar,
  DropdownMenu,
  DropdownToggle,
  Input,
} from "reactstrap";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
} from "@mui/material";
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
import { Row, Col } from "react-bootstrap";
import { Box, Menu, MenuItem } from "@mui/material";
import { Grid3x3Outlined, Info } from "@mui/icons-material";
import BlueButton from "../../../../components/Button/BlueButton.jsx";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import {
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../../components/Icon/Index.jsx";
import WhiteButton from "../../../../components/Button/WhiteButton.jsx";
import { border } from "@mui/system";
import showToast from "../../../../components/Toast/Toster.jsx";
import Tooltip from "../../../../components/Tooltip/tooltip.js";
import PasswordValidation from "../../../../";
import PasswordValidationSchema from "../../../../components/Password/PasswordValidation.jsx";

const Profile = () => {
  const navigate = useNavigate();
  const { companyName } = useParams();
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const [loader, setLoader] = useState(true);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [postLoader, setPostLoader] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const [CompanyId] = useState(localStorage.getItem("CompanyId"));
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const [oldData, setOldData] = useState("");
  const profileFormik = useFormik({
    initialValues: {
      CompanyId: "",
      ownerName: "",
      EmailAddress: "",
      phoneNumber: "",
      Address: "",
      City: "",
      State: "",
      Zip: "",
      Country: "",
      // Password: "",
      profileImage: "",
      // confirmpassword: "",
    },
    validationSchema: Yup.object({
      // Password: Yup.string().required("password is required"),
      // confirmpassword: Yup.string()
      //   .oneOf([Yup.ref("Password"), null], "Passwords must match")
      //   .required("Confirmation password is required"),
      ownerName: Yup.string().required("ownerName Required"),
      phoneNumber: Yup.string()
        .required("Phone number required")
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "phone number must be in the format (xxx) xxx-xxxx"
        ),
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email required")
        .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
      City: Yup.string().required(" City Required"),
      State: Yup.string().required(" State Required"),
      Address: Yup.string().required("Address Required"),
      Zip: Yup.string().required("Zip Required"),
      Country: Yup.string().required(" Country Required"),
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
          const updatedProfile = { ...values };
          const res = await AxiosInstance.put(
            `/company/profile/${CompanyId}`,
            updatedProfile
          );

          if (res?.data?.statusCode === 200) {
            showToast.success(res?.data?.message);
            // swal(
            //   "Profile saved successfully!",
            //   "Your changes have been saved.",
            //   "success"
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
            }
            ).then(() => {
              navigate(`/${companyName}/index`, {
                state: { navigats: ["/index"] },
              });
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
      CompanyId: "",
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
        const res = await AxiosInstance.put(
          `/company/change-password/${CompanyId}`,
          {
            Password: values.Password,
            confirmpassword: values.confirmpassword,
          }
        );

        if (res?.status === 200) {
          showToast.success(res?.data?.message);
          // swal(
          //   "Profile saved successfully!",
          //   "Your changes have been saved.",
          //   "success"
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
            navigate(`/${companyName}/profile`, {
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
      } finally {
        setLoader(false);
      }
    },
  });

  const formatPhoneNumber = (value) => {
    const PhoneNumber = value?.replace(/[^\d]/g, "");
    const limitedPhoneNumber = PhoneNumber.slice(0, 10);
    const match = limitedPhoneNumber.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (match) {
      let formattedNumber = "";
      if (match[1]?.length >= 3) {
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
    if (profileFormik?.values?.phoneNumber?.length > e.target.value?.length) {
      profileFormik?.setFieldValue("phoneNumber", e.target.value);
    } else {
      const formattedValue = formatPhoneNumber(e.target.value);
      profileFormik?.setFieldValue("phoneNumber", formattedValue);
    }
    setIsEdited(true);
  };

  const getData = async () => {
    try {
      const allCountries = Country?.getAllCountries();
      setCountries(allCountries);

      const res = await AxiosInstance.get(`/company/profile/${CompanyId}`);

      if (res?.data?.statusCode === 200) {
        const data = res?.data?.data;
        setOldData(data);
        setUploadedImageUrl(data?.profileImage);

        profileFormik.setValues({
          ...data,
          Address: data?.Address || "",
          City: data?.City || "",
          State: data?.State || "",
          Zip: data?.Zip || "",
          Country: data?.Country || "",
        });

        if (data?.Country) {
          const selectedCountry = allCountries.find(
            (item) => item?.name === data?.Country
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
        const res = await AxiosInstance.put(`/company/profile/${CompanyId}`, {
          profileImage: image,
        });
        if (res?.data?.statusCode === 200) {
          showToast.success("Profile image updated successfully.");
          setUploadedImageUrl(image);
          profileFormik.setFieldValue("profileImage", image);
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
      profileFormik?.setFieldValue(name, value);
    } else {
      profileFormik?.setFieldValue(name, type === "checkbox" ? checked : value);
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

  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  // const handleSaveClick = () => {
  //   profileFormik.handleSubmit();

  //   swal(
  //     "Profile saved successfully!",
  //     "Your changes have been saved.",
  //     "success"
  //   ).then(() => {
  //     if (!postLoader) {
  //       navigate(`/${companyName}/index`, {
  //         state: { navigats: ["/index"] },
  //       });
  //     }
  //   });
  // };
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
                      navigate(`/${companyName}/materials&labor`, {
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
                      navigate(`/${companyName}/profile`, {
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
            style={{
              textAlign: "center",
              alignItems: "center",
              marginTop: "25%",
              width: "100vh",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <LoaderComponent loader={loader} height="50" width="50" />
          </Grid>
        ) : (
          <Col
            className="col-10 addProductServiceSideLine profileWidthLeft"
            style={{
              borderLeft: "0.5px solid rgba(6, 49, 100, 30%)",
              paddingLeft: "20px",
              marginTop: "-30px",
            }}
            xl={10}
          >
            <Grid
              className="d-flex justify-content-between text-blue-color"
              style={{ fontWeight: 700, marginTop: "4%" }}
            >
              <Typography className="text-blue-color settingUserInfo heading-three">
                <Typography className="bold-text fs-3">
                  {profileFormik?.values?.ownerName}
                </Typography>
              </Typography>
            </Grid>
            <Card
              style={{
                padding: "40px",
                marginTop: "10px",
                borderRadius: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Row className="row">
                <Col className="d-flex col-lg-8 order-2 order-lg-1" lg={8}>
                  <Grid>
                    <InputText
                      value={profileFormik?.values?.ownerName}
                      onChange={handleChange}
                      onBlur={profileFormik?.handleBlur}
                      id="ownerName"
                      name="ownerName"
                      label="Full Name"
                      placeholder="Enter full name "
                      type="text"
                      className="mb-3 my-2 textfield_bottom w-100"
                      error={
                        profileFormik?.touched?.ownerName &&
                        Boolean(profileFormik?.errors?.ownerName)
                      }
                      helperText={
                        profileFormik?.touched?.ownerName &&
                        profileFormik?.errors?.ownerName
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
                      value={profileFormik?.values?.phoneNumber}
                      onChange={handlePhoneChange}
                      id="PhoneNumber"
                      name="PhoneNumber"
                      label="Mobile Number"
                      placeholder="Enter mobile number"
                      type="text"
                      className="mb-3 my-2 textfield_bottom w-100"
                      error={
                        profileFormik?.touched?.phoneNumber &&
                        Boolean(profileFormik?.errors?.phoneNumber)
                      }
                      helperText={
                        profileFormik?.touched?.phoneNumber &&
                        profileFormik?.errors?.phoneNumber
                      }
                    />

                    <Address
                      // className="addressProfileTop"
                      setSelectedCountry={setSelectedCountry}
                      selectedCountry={selectedCountry}
                      countries={countries}
                      handleChange={handleChange}
                      formik={profileFormik}
                      handleZipChange={handleZipChange}
                    />

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
                  className="col-lg-4 d-flex justify-content-center align-items-center flex-column order-1 order-lg-2 mb-2"
                  lg={4}
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
                    style={{
                      marginTop: "0px",
                      marginBottom: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Grid
                      className="d-flex justify-content-center align-items-center personlInfoDp"
                      style={{
                        backgroundColor: "#fff",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        boxShadow: "0 4px 5px rgba(0, 0, 0, 0.4)",
                        overflow: "hidden",
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
                              {profileFormik?.values?.ownerName
                                ?.split(" ")
                                ?.map((part) => part.charAt(0).toUpperCase())
                                ?.join("")}
                            </Typography>
                          )}
                        </>
                      )}
                    </Grid>
                  </Grid>

                  {/* <Grid>
                    <label htmlFor="upload-button">
                      <WhiteButton
                        component="span"
                        className="text-blue-color border-blue-color"
                        style={{
                          background: "#FFFF",
                          textTransform: "none",
                          border: "1px solid ",
                          marginTop: "20px",
                          fontSize: "12px",
                          cursor: "pointer",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          border: "none",
                        }}
                        label="Upload image here..."
                      />
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
                  </Grid> */}
                  <Grid>
                    <label htmlFor="upload-button">
                      <Button
                        component="span"
                        className="text-blue-color border-blue-color"
                        style={{
                          background: "#FFFF",
                          textTransform: "none",
                          border: "1px solid ",
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
                      className="text-blue-color userOpinion"
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

export default Profile;
