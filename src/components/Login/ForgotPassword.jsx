import { Button, FormGroup, Grid,   Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import "./style.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../../Views/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import backimg from "../../assets/image/icons/back.png"; 
import InputText from "../InputFields/InputText";
import AppLogo from "../../assets/image/CMS_LOGO.svg";
import showToast from "../Toast/Toster";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      EmailAddress: "",
    },
    validationSchema: Yup.object().shape({
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email is required"),
    }),
    onSubmit: (values) => {
      handleSendMail(values.EmailAddress);
    },
  });

  const handleSendMail = async (email) => {
    setIsLoading(true);
    try {
      const data = {
        EmailAddress: email,
      };
      const res = await AxiosInstance.post(
        `/resetpassword/resetpasswordmail`,
        data
      );
      if (res.status === 200) {
        showToast.success("Mail Sent Successfully", {
          position: "top-center",
          autoClose: 1000,
        });
        // setTimeout(() => {
        //   navigate(`/auth/login`);
        // }, 2000);
      } else {
        throw new Error("Email sending failed");
      }
    } catch (error) {
      if (error.response) {
        console.error("Server responded with an error:", error.response?.data);
        showToast.error(error.response?.data.message || "Something went wrong!");
      } else if (error.request) {
        console.error("No response received:", error.request);
        showToast.error("No response from the server, please try again later.");
      } else {
        console.error("Error during request setup:", error.message);
        showToast.error("Error occurred while sending request.");
      }
    } finally {
      setIsLoading(false);
    }
  };
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
  return (
    <Grid className="login">
      <Grid container spacing={2} className="vh-100">
        <Grid
          item
          xs={12}
          md={6}
          className="d-flex flex-direction-column align-items-center pt-3 forgatePasswordNoneHe forgotTopGive"
        >
          <Typography
            className="app-logo forgotpassWordImageSet"
            style={{
              paddingRight: "22px",
              paddingLeft: "0px",
              paddingTop: "20px",
              paddingBottom: "0px",
              marginRight: "auto",
            }}
          >
            <img src={AppLogo} alt="logo" style={{ marginRight: "auto" }} />
          </Typography>
          <Grid
            style={{
              width: "80%",
            }}
            className="d-flex flex-direction-column align-items-center px-3 maon-forget-password"
          >
            <form
              onSubmit={formik?.handleSubmit}
              className="d-flex flex-column justify-content-between forgoFormSubmitClass"
              style={{ height: "60%" }}
            >
              <Typography
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  textAlign: "left",
                  marginTop: "13px",
                  display: "flex",
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigate(-1);
                }}
              >
                <img src={backimg} width={20} height={20} alt="back" />
                <span className="mx-2">Back to login </span>
              </Typography>

              <Grid>
                <Typography
                  className="text forgotHeadText text-blue-color"
                  style={{ fontSize: "35px", marginTop: "20px" }}
                >
                  Forgot your password?
                </Typography>
                <Typography className="text2 " style={{ marginTop: "20px" }}>
                  Don't worry, happens to all of us. Enter your email below to
                  recover your password
                </Typography>
                <FormGroup style={{ width: "100%", marginTop: "20px" }}>
                  <InputText
                    value={formik?.values?.EmailAddress}
                    onChange={formik?.handleChange}
                    onBlur={formik?.handleBlur}
                    error={
                      formik?.touched?.email &&
                      Boolean(formik?.errors?.EmailAddress)
                    }
                    helperText={
                      formik?.touched?.email && formik?.errors?.EmailAddress
                    }
                    name="EmailAddress"
                    label="Email"
                    type="email"
                    className="text-blue-color w-100"
                    fieldHeight="56px"
                  />
                </FormGroup>
                <FormGroup style={{ width: "100%", marginTop: "20px" }}>
                  <Button
                    style={{
                      backgroundColor: "rgba(51, 53, 71, 1)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "600",
                      lineHeight: "21px",
                      borderRadius: "4px",
                      height: "48px",
                      textTransform: "none",
                    }}
                    type="submit"
                    className="bg-orange-color"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Submit"}
                  </Button>
                </FormGroup>
              </Grid>
            </form>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          className="d-flex justify-content-center align-items-center img h-100 decreaseSizeHei"
        >
          <div
            className="firgitPasswordImg forgotImg_cdn "
            style={{ height: "90%", marginTop: "20px" }}
          ></div>
        </Grid>
      </Grid>
      <showToaster />
    </Grid>
  );
};

export default ForgotPassword;
