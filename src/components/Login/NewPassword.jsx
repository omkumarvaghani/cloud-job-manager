import {
  Button,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import "./style.css";
import locke from "../../assets/image/icons/Rectangle 20.png";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import AxiosInstance from "../../Views/AxiosInstance";
import { Link, useLocation, useNavigate } from "react-router-dom";
import backimg from "../../assets/image/icons/back.png";
import InputText from "../InputFields/InputText";
import * as Yup from "yup";
import showToast from "../Toast/Toster";
import AppLogo from "../../assets/image/CMS_LOGO.svg";
import { WhiteLoaderComponent } from "../Icon/Index";
import PasswordValidation from "../Password/PasswordValidation";

const NewPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCPassword, setShowCPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    setIsLoading(true);

    AxiosInstance.get(`/v1/forget-pass/check_token_status/${token}`)
      .then((response) => {
        const data = response?.data;
        setIsLoading(false);
        if (data.expired) {
          setTokenExpired(true);
        } else {
          setEmail(token);
        }
      })
      .catch((error) => {
        console.error("Error checking token status:", error);
        setIsLoading(false);
      });
  }, [location.search]);

  const validatePassword = Yup.object({
    password: PasswordValidation,

    confirmpassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirmation password is required"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmpassword: "",
    },
    validationSchema: validatePassword,
    onSubmit: async (values) => {
      try {
        setLoader(true);
        const response = await AxiosInstance.put(
          `/v1/forget-pass/reset_passwords/${email}`,
          { Password: values.password },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.status === 200) {
          showToast.success("Password Set Successfully", {
            position: "top-center",
            autoClose: 1000,
          });
          setTimeout(() => {
            navigate(response?.data.url);
          }, 1000);
        } else {
          setError(response?.data.message);
          showToast.error("Failed To Change Password", {
            position: "top-center",
            autoClose: 1000,
          });
        }
      } catch (error) {
        setError("An error occurred while changing the password");
      } finally {
        setLoader(false);
      }
    },
  });

  if (loader) {
    return (
      <WhiteLoaderComponent
        height="20"
        width="20"
        padding="20"
        loader={loader}
      />
    );
  }

  if (tokenExpired) {
    return <Grid>Token has expired. Please request a new reset link.</Grid>;
  }
  return (
    <div className="loginnn">
      <Grid container spacing={2} className="vh-100">
        <Grid
          item
          xs={12}
          md={6}
          className="d-flex flex-direction-column align-items-center pt-3"
        >
          <Typography
            className="resetPassword-logo"
            style={{
              marginRight: "188px",
              marginTop: "34px",
            }}
          >
            <img
              src={AppLogo}
              alt="logo"
              style={{ width: "250px", height: "60px" }}
            ></img>
          </Typography>
          <div
            style={{
              width: "80%",
              height: "90%",
              paddingTop: "20px",
              marginLeft: "20px",
            }}
            className="d-flex flex-direction-column align-items-center px-3 maon-forget-password"
          >
            <form
              style={{ width: "85%", height: "90%", marginTop: "35px" }}
              onSubmit={formik?.handleSubmit}
            >
              <Link to="/auth/login">
                <Typography
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    lineHeight: "21px",
                    textAlign: "left",
                    color: "black",
                    marginTop: "0px",
                    paddingTop: "0px",
                    display: "flex",
                    marginBottom: "15px",
                  }}
                >
                  <img src={backimg} width={20} height={20} alt="back" />
                  <span className="mx-2">Back to login </span>
                </Typography>
              </Link>
              <Typography
                className="text text-blue-color"
                style={{ fontSize: "35px", margintop: "20px" }}
              >
                Set your password
              </Typography>
              <Typography
                className="text2"
                style={{ color: "#606060", margintop: "20px" }}
              >
                Please enter your new password below.
              </Typography>
              <FormGroup style={{ width: "100%", marginTop: "12px" }}>
                <InputText
                  value={formik?.values.password}
                  onChange={formik?.handleChange}
                  onBlur={formik?.handleBlur}
                  error={
                    formik?.touched?.password &&
                    Boolean(formik?.errors?.password)
                  }
                  helperText={
                    formik?.touched?.password && formik?.errors?.password
                  }
                  name="password"
                  label="New password"
                  type={showPassword ? "text" : "password"}
                  className="text-blue-color w-100 m-0 mb-3"
                  fieldHeight="56px"
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
              </FormGroup>
              <FormGroup style={{ width: "100%", marginTop: "12px" }}>
                <InputText
                  value={formik?.values?.confirmpassword}
                  onChange={formik?.handleChange}
                  onBlur={formik?.handleBlur}
                  error={
                    formik?.touched?.confirmpassword &&
                    Boolean(formik?.errors?.confirmpassword)
                  }
                  helperText={
                    formik?.touched?.confirmpassword &&
                    formik?.errors?.confirmpassword
                  }
                  name="confirmpassword"
                  label="Re-type New Password"
                  type={showCPassword ? "text" : "password"}
                  className="text-blue-color w-100 m-0 mb-3"
                  fieldHeight="56px"
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  endAdornment={
                    <InputAdornment position="end">
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
                    </InputAdornment>
                  }
                />
              </FormGroup>
              <FormGroup style={{ width: "100%", marginTop: "12px" }}>
                <Button
                  style={{
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    lineHeight: "21px",
                    borderRadius: "4px",
                    gap: "4px",
                    height: "48px",
                    textTransform: "none",
                    background: "rgb(39 84 110)",
                    marginTop: "20px",
                  }}
                  fullWidth
                  variant="contained"
                  type="submit"
                  className="bg-orange-color"
                >
                  Submit
                </Button>
              </FormGroup>
            </form>
          </div>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          className="d-flex justify-content-center align-items-center"
        >
          <img
            src={locke}
            alt="logo"
            style={{ maxWidth: "65%", height: "90%" }}
          ></img>
        </Grid>
      </Grid>
    </div>
  );
};

export default NewPassword;
