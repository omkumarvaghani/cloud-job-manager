import {
  Button,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import AppLogo from "../../assets/image/CMS_LOGO.svg";
import "./style.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../../Views/AxiosInstance";
import Steps from "./Steps";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import InputText from "../InputFields/InputText";
import sendToast from "../Toast/sendToast";
import { Row, Col } from "react-bootstrap";
import PasswordValidation from "../Password/PasswordValidation";
import Tooltip from "../../components/Tooltip/tooltip";
import showToast from "../../components/Toast/Toster";

const SignUp = () => {
  useEffect(() => {
    window.onload = () => {
      console.log("Page has loaded!");
    };
    return () => {
      window.onload = null;
    };
  }, []);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [signSteps, setSignSteps] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const step = queryParams.get("step");
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const validatePassword = Yup.object({
    EmailAddress: Yup.string()
      .email("Invalid email")
      .required("Email is required")
      .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
    Password: PasswordValidation,
    cpassword: Yup.string()
      .oneOf([Yup.ref("Password"), null], "Passwords must match")
      .required("Confirmation password is required"),
  });

  const formik = useFormik({
    initialValues: {
      Password: "",
      cpassword: "",
      EmailAddress: "",
    },
    validationSchema: validatePassword,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const [loader, setLoader] = useState(false);
  // const handleSubmit = async (values) => {
  //   try {
  //     setLoader(true);
  //     const res = await AxiosInstance.post(`/company/check_user`, {
  //       EmailAddress: values.EmailAddress,
  //     });
  //     if (res.data.statusCode === 200) {
  //       setSignSteps(true);
  //     } else {
  //       sendToast(res.data.message);
  //     }
  //   } catch (error) {
  //     if (error.response) {
  //       console.error("Server responded with an error:", error.response?.data);
  //       showToast.error(
  //         error.response?.data.message || "Something went wrong!"
  //       );
  //     } else if (error.request) {
  //       console.error("No response received:", error.request);
  //       showToast.error("No response from the server, please try again later.");
  //     } else {
  //       console.error("Error during request setup:", error.message);
  //       showToast.error("Error occurred while sending request.");
  //     }
  //   } finally {
  //     setLoader(false);
  //   }
  // };

  const handleSubmit = async (values) => {
    try {
      setLoader(true);
      const res = await AxiosInstance.post(`/v1/auth/check_user`, {
        EmailAddress: values.EmailAddress,
      });
      if (res.data.statusCode === "200") {
        if (step === "1") {
          navigate(`/auth/signup?step=2`);
        } else {
          navigate(`/auth/signup?step=1`);
        }
      } else {
        sendToast(res.data.message);
      }
    } catch (error) {
      if (error.response) {
        showToast.error(
          error.response?.data.message || "Something went wrong!"
        );
      } else if (error.request) {
        showToast.error("No response from the server, please try again later.");
      } else {
        showToast.error("Error occurred while sending request.");
      }
    } finally {
      setLoader(false);
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleWindowLoad = () => {
      setLoading(false);
    };
    window.addEventListener("load", handleWindowLoad);
    return () => {
      window.removeEventListener("load", handleWindowLoad);
    };
  }, []);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const imageLoaded = sessionStorage.getItem("imageLoaded");

    if (imageLoaded === "true") {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    sessionStorage.setItem("imageLoaded", "true");
  };

  const confirmPasswordRef = useRef(null);
  const nextFieldRef = useRef(null);

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      confirmPasswordRef.current.focus();
    }
  };

  const handleConfirmPasswordKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      nextFieldRef.current.focus();
    }
  };

  return (
    <>
      <Grid className="login signup ">
        {/* {!signSteps ? ( */}
        {!step ? (
          <Grid className="main-signup vh-100 d-flex signUpPageForm">
            <Grid
              className="d-flex justify-content-center align-items-center col-xs-12 col-md-6 img leftsidebvo"
              xs={12}
              md={6}
            >
              <div className="signup-image"></div>
            </Grid>
            <Col
              className="d-flex flex-direction-column pt-3 col-xs-12 col-md-6 formColRawWidth"
              xs={12}
              md={6}
            >
              <Typography className="app-logo signup-logo">
                <Link to="/auth/login">
                  <img src={AppLogo} alt="logo" className="" loading="eager" />
                </Link>
              </Typography>
              <Grid className="d-flex inout-contener">
                <form
                  style={{ width: "70%" }}
                  onSubmit={formik.handleSubmit}
                  className="formmm"
                >
                  <Typography className="text" style={{ fontSize: "25px" }}>
                    Sign In
                  </Typography>
                  <Typography className="text2">
                    Let's proceed with setting you up to access your personal
                    account.
                  </Typography>
                  <FormGroup style={{ width: "100%", marginTop: "8px" }}>
                    <InputText
                      value={formik?.values?.EmailAddress}
                      onChange={formik?.handleChange}
                      onBlur={formik?.handleBlur}
                      error={
                        formik?.touched?.EmailAddress &&
                        Boolean(formik?.errors?.EmailAddress)
                      }
                      helperText={
                        formik?.touched?.EmailAddress &&
                        formik?.errors?.EmailAddress
                      }
                      name="EmailAddress"
                      label="Enter Email"
                      type="text"
                      className="text-blue-color w-100"
                      fieldHeight="56px"
                      placeholder=" Enter abc@example.com"
                    />
                  </FormGroup>
                  <FormGroup
                    style={{ width: "100%", marginTop: "8px", display: "flex" }}
                    className="textboxes"
                  >
                    <InputText
                      value={formik?.values?.Password}
                      onChange={formik?.handleChange}
                      onBlur={formik?.handleBlur}
                      error={
                        formik?.touched?.Password &&
                        Boolean(formik?.errors?.Password)
                      }
                      helperText={
                        formik.touched.Password && formik.errors.Password
                      }
                      name="Password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="text-blue-color w-100"
                      fieldHeight="56px"
                      autoComplete="off" // Disable autocomplete
                      onKeyDown={(e) => {
                        if (e.key === "Tab" && !e.shiftKey) {
                          e.preventDefault();
                          document.getElementById("cpassword").focus();
                        }
                      }}
                      endAdornment={
                        <InputAdornment position="end" style={{ gap: "10px" }}>
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
                          {/* Prevents tooltip from being focused */}
                          <div style={{ pointerEvents: "none" }} tabIndex="-1">
                            <Tooltip title="Password must be at least 8 characters long" />
                          </div>
                        </InputAdornment>
                      }
                    />
                  </FormGroup>

                  <FormGroup
                    style={{ width: "100%", marginTop: "8px", display: "flex" }}
                    className="reenterpassword"
                  >
                    <InputText
                      id="cpassword"
                      value={formik.values?.cpassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.cpassword &&
                        Boolean(formik.errors.cpassword)
                      }
                      helperText={
                        formik.touched.cpassword && formik.errors.cpassword
                      }
                      name="cpassword"
                      label="Enter Re-Password"
                      placeholder="Enter re-password"
                      type={showCPassword ? "text" : "password"}
                      className="text-blue-color w-100"
                      fieldHeight="56px"
                      autoComplete="new-password"
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onKeyDown={(e) => {
                        if (e.key === "Tab" && !e.shiftKey) {
                          e.preventDefault();
                          const nextElement =
                            document.getElementById("nextField");
                          if (nextElement) {
                            nextElement.focus();
                          }
                        }
                      }}
                      endAdornment={
                        <InputAdornment position="end" style={{ gap: "10px" }}>
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowCPassword(!showCPassword)}
                            edge="end"
                          >
                            {showCPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                          <div style={{ pointerEvents: "none" }} tabIndex="-1">
                            <Tooltip title="Re-enter your password" />
                          </div>
                        </InputAdornment>
                      }
                    />
                  </FormGroup>

                  <Typography
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "21px",
                      textAlign: "center",
                      marginTop: "13px",
                    }}
                  >
                    Do you have an account?{" "}
                    <span
                      style={{
                        color: "rgba(255, 134, 130, 1)",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/auth/login")}
                    >
                      Login
                    </span>
                  </Typography>
                  <FormGroup style={{ width: "100%", marginTop: "15px" }}>
                    <Button
                      style={{
                        backgroundColor: "rgba(51, 53, 71, 1)",
                        color: "#fff",
                        fontSize: "14px",
                        fontWeight: "600",
                        lineHeight: "21px",
                        width: "100%",
                        padding: "16px 32px",
                      }}
                      type="submit"
                    >
                      {loader ? (
                        <ColorRing
                          height="30"
                          width="30"
                          colors={["#fff", "#fff", "#fff", "#fff", "#fff"]}
                          ariaLabel="circles-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                          visible={true}
                        />
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                  </FormGroup>

                  <Typography
                    style={{
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "21px",
                      textAlign: "center",
                      marginTop: "13px",
                      color: "rgba(49, 49, 49, 1)",
                    }}
                  >
                    You can receive marketing emails, SMS, news, and resources
                    from our contractor management system. You can unsubscribe
                    at any time. Please view our
                    <Link
                      to="https://cloudjobmanager.com/privacy-policy/"
                      target="_blank"
                    >
                      <Typography style={{ fontWeight: "600" }}>
                        Privacy Policy
                      </Typography>{" "}
                    </Link>
                    for more information.
                  </Typography>
                </form>
              </Grid>
            </Col>
          </Grid>
        ) : (
          <Steps
            EmailAddress={formik.values.EmailAddress}
            Password={formik.values.Password}
          />
        )}
      </Grid>
    </>
  );
};

export default SignUp;
