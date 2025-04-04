import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Grid,
  Box,
  IconButton,
  Input,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card } from "reactstrap";
import AxiosInstance from "../../../AxiosInstance.jsx";
import InputText from "../../../../components/InputFields/InputText.jsx";
import sliderindicator from "../../../../assets/image/icons/sliderindicator.svg";
import swal from "sweetalert";
import Address from "../../../../components/Address/index.jsx";
import { Country } from "country-state-city";
import { Circles } from "react-loader-spinner";
import showToast from "../../../../components/Toast/Toster.jsx";
import sendToast from "../../../../components/Toast/sendToast.jsx";
import {
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../../components/Icon/Index.jsx";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import BlueButton from "../../../../components/Button/BlueButton.jsx";

import WhiteButton from "../../../../components/Button/WhiteButton.jsx";
import PasswordValidationSchema from "../../../../components/Password/PasswordValidation.jsx";
const Superadmin = () => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  const navigate = useNavigate();

  const [loader, setLoader] = useState(true);
  const [postLoader, setPostLoader] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [imageLoader, setImageLoader] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [isEdited, setIsEdited] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const profileFormik = useFormik({
    initialValues: {
      FullName: "",
      EmailAddress: "",
      PhoneNumber: "",
      Address: "",
      City: "",
      State: "",
      Zip: "",
      Country: "",
      ProfileImage: "",
    },
    validationSchema: Yup.object({
      FullName: Yup.string().required("Full Name required"),
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email required"),
      PhoneNumber: Yup.string()
        .required("Phone number required")
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "Phone number must be in the format (xxx) xxx-xxxx"
        ),
      Address: Yup.string().required("Address required"),
      City: Yup.string().required("City required"),
      State: Yup.string().required("State required"),
      Zip: Yup.string().required("Zip required"),
      Country: Yup.string().required("Country required"),
    }),
    validateOnBlur: true,
    validateOnChange: true,
    validateOnSubmit: true,
    onSubmit: async (values) => {
      try {
        setPostLoader(true);
        const res = await AxiosInstance.put(`/v1/super-admin/profile`, values);
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
              navigate(`/superadmin/index`, {
                state: { navigats: ["/index"] },
              });
            }
          });
          getData();
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        showToast.error("Error updating profile.");
      } finally {
        setPostLoader(false);
      }
    },
  });

  const getData = async () => {
    try {
      const allCountries = Country.getAllCountries();
      setCountries(allCountries);

      const res = await AxiosInstance.get(`/v1/super-admin/profile`);

      if (res?.data?.statusCode === 200) {
        const data = res?.data?.data;
        setInitialData(data);
        setUploadedImageUrl(data?.ProfileImage);

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
  }, []);

  const passwordFormik = useFormik({
    initialValues: {
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
        const res = await AxiosInstance.put(`/superadmin/change-password`, {
          Password: values.Password,
          confirmpassword: values.confirmpassword,
        });

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
            // if (!postLoader) {
            navigate(`/superadmin/SuperAdminProfile`, {
              state: { navigats: ["/SuperAdminProfile"] },
            });
            // }
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    if (phoneNumber?.length === 0) return "";
    if (phoneNumber?.length <= 3) return `(${phoneNumber}`;
    if (phoneNumber?.length <= 6)
      return `(${phoneNumber?.slice(0, 3)}) ${phoneNumber?.slice(3)}`;
    return `(${phoneNumber?.slice(0, 3)}) ${phoneNumber?.slice(
      3,
      6
    )}-${phoneNumber?.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    if (profileFormik?.values?.PhoneNumber?.length > input?.length) {
      profileFormik?.setFieldValue("PhoneNumber", input);
    } else {
      const formattedValue = formatPhoneNumber(input);
      profileFormik?.setFieldValue("PhoneNumber", formattedValue);
    }
    setIsEdited(true);
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

  // const handleSaveClick = () => {
  //   profileFormik.handleSubmit();

  // };

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
      formData?.append("files", file);
      const url = `${cdnUrl}/upload`;

      const result = await AxiosInstance.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const image = result?.data?.files[0]?.filename;
      if (image) {
        const res = await AxiosInstance.put("/v1/super-admin/profile", {
          ProfileImage: image,
        });
        if (res.data.statusCode === 200) {
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

  const hasChanges =
    JSON.stringify(profileFormik?.values) !== JSON.stringify(initialData);
  const isFormValid = profileFormik?.isValid && hasChanges;

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
        {loader ? (
          <Grid
            className="d-flex justify-content-center align-items-center text-blue-color "
            style={{ height: "100%", width: "100%", marginTop: "25%" }}
          >
            <Circles
              height="50"
              width="50"
              color="#063164"
              ariaLabel="circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
              visible={loader}
            />
          </Grid>
        ) : (
          <Card style={{ padding: "40px", borderRadius: "20px" }}>
            <Grid container spacing={3} className="superAdminProfile">
              <Grid item xs={12} md={6}>
                <InputText
                  value={profileFormik?.values?.FullName}
                  onChange={profileFormik?.handleChange}
                  id="FullName"
                  name="FullName"
                  label="Full Name"
                  placeholder="Enter full name"
                  type="text"
                  className="mb-3 my-2 w-100"
                  error={
                    profileFormik?.touched?.FullName &&
                    Boolean(profileFormik?.errors?.FullName)
                  }
                  helperText={
                    profileFormik?.touched?.FullName &&
                    profileFormik?.errors?.FullName
                  }
                />
                <InputText
                  value={profileFormik?.values?.EmailAddress}
                  onChange={profileFormik?.handleChange}
                  id="EmailAddress"
                  name="EmailAddress"
                  label="Email Address"
                  placeholder="Enter email address"
                  type="email"
                  className="mb-3 my-2 w-100"
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
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Grid>
                      <Grid style={{ marginLeft: "-35px", marginTop: "13px" }}>
                        <Tooltip />
                      </Grid>
                    </Grid>
                  </Grid>
                </Box> */}
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
                                  onClick={() => setShowPassword(!showPassword)}
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
                              Boolean(passwordFormik?.errors?.confirmpassword)
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
                {/* <Button
                  onClick={profileFormik.handleSubmit}
                  disabled={!hasChanges}
                  style={{
                    backgroundColor: isFormValid ? "#063164" : "#b3cde0",
                    color: "#fff",
                  }}
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
                </Button> */}
              </Grid>

              <Grid className="col-lg-6 d-flex justify-content-center align-items-center flex-column order-1 order-lg-2 mb-2">
                <Grid
                  className="text-center "
                  style={{ marginTop: "0px", marginBottom: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontSize: "30px",
                      fontWeight: "600",
                    }}
                  >
                    Personal Information
                  </Typography>
                </Grid>
                <Grid
                  className="text-center"
                  style={{ marginTop: "0px", marginBottom: "30px" }}
                >
                  {/* <Grid
                    className="d-flex justify-content-center align-items-center"
                    style={{
                      backgroundColor: "#fff",
                      width: "80px",
                      height: "80px",
                      borderRadius: "50px",
                      boxShadow: "0 4px 5px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    {imageLoader ? (
                      <Grid className="d-flex justify-content-center">
                        <LoaderComponent
                          height="20"
                          width="20"
                          padding="20"
                          loader={imageLoader}
                        />
                      </Grid>
                    ) : (
                      <img
                        src={
                          uploadedImageUrl
                            ? `${cdnUrl}/upload/${uploadedImageUrl}`
                            : profileIcon
                        }
                        alt="Profile"
                        style={{
                          borderRadius: "50%",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    )}
                  </Grid> */}
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
                    {imageLoader ? (
                      <Grid className="d-flex justify-content-center">
                        <LoaderComponent
                          height="20"
                          width="20"
                          padding="20"
                          loader={imageLoader}
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
                            {profileFormik?.values?.FullName?.split(" ")
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
                  <Typography
                    className="text-blue-color"
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "400",
                      width: "300px",
                    }}
                  >
                    Use this form to update your personal information. Ensure
                    all details are accurate and up-to-date.
                  </Typography>
                </Grid>
                <Grid>
                  <img src={sliderindicator} />
                </Grid>
              </Grid>
            </Grid>
          </Card>
        )}
      </Grid>
    </>
  );
};

export default Superadmin;
