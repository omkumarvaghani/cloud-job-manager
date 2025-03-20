import React, { useState } from "react";
import SignUp1 from "../../assets/image/sign_up1.jpg";
import SignUp2 from "../../assets/image/sign_up2.jpg";
import appLogo from "../../assets/image/CMS_LOGO.svg";
import { useFormik } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../../Views/AxiosInstance";
import { Grid, FormGroup, Typography } from "@mui/material";
import { useEffect } from "react";
import Select from "react-select";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";
import InputText from "../InputFields/InputText";
import sendToast from "../Toast/sendToast";
import { Row, Col } from "react-bootstrap";
import showToast from "../Toast/Toster";
import BlueButton from "../Button/BlueButton";
import { OrangeButton, WhiteLoaderComponent } from "../Icon/Index";
import { border, borderRadius, color, padding } from "@mui/system";

const customStyles = {
  placeholder: (provided) => ({
    ...provided,
    fontSize: "16px",
    fontWeight: "400",
    height: "48px",
    display: "flex",
    alignItems: "center",
    fontFamily: "Poppins, sans-serif",
    color: "#063164",
  }),
  control: (provided, state) => ({
    ...provided,
    border: "1px solid rgba(121, 116, 126, 1)",
    borderRadius: "8px",
    marginTop: "15px",
    color: "rgba(28, 27, 31, 1)",
    fontSize: "16px",
    fontWeight: "400",
    height: "48px",
    display: "flex",
    alignItems: "center",
    fontFamily: "Poppins, sans-serif",
    boxShadow: state.isFocused ? "none" : provided.boxShadow,
    "&:hover": {
      borderColor: "rgba(121, 116, 126, 1)",
    },
  }),
  singleValue: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    color: state.selectProps ? "rgba(28, 27, 31, 1)" : "rgba(153, 153, 153, 1)",
    fontWeight: "400",
    height: "48px",
    display: "flex",
    alignItems: "center",
    fontFamily: "Poppins, sans-serif",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "16px",
    fontWeight: "400",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: state.isFocused && "rgba(51, 53, 71, 1)",
    color: state.isFocused && "#fff",
  }),
  menu: (provided) => ({
    ...provided,
    fontSize: "16px",
    fontWeight: "400",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#fff",
  }),
};

const Steps = ({ EmailAddress, Password }) => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [industry, setIndustry] = useState([]);
  const [teamSize, setTeamSize] = useState([]);
  const [revenue, setRevenue] = useState([]);

  const fetchData = async (currentStepa) => {
    if (currentStepa === 1) {
      try {
        const res = await AxiosInstance.get(`${baseUrl}/v1/industry/dropdown`);
        if (res.data.statusCode === 200) {
          setIndustry(() => {
            return res.data.data.map((item) => {
              return { label: item.Industry, value: item.IndustryId };
            });
          });
        }
      } catch (error) {
        sendToast("Unable to connect to the server. Please try again later.");
      }
    } else {
      try {
        const res = await AxiosInstance.get(`${baseUrl}/v1/revenue/dropdown`);
        console.log(res, "res");
        const res2 = await AxiosInstance.get(`${baseUrl}/v1/teamsize/dropdown`);
        if (res.data.statusCode === 200 && res2.data.statusCode === 200) {
          const data1 = res.data.data?.map((item) => {
            return { label: item.Revenue, value: item.RevenueId };
          });
          const data2 = res2.data.data?.map((item) => {
            return { label: item.TeamSize, value: item.TeamSizeId };
          });
          setRevenue(data1);
          setTeamSize(data2);
        }
      } catch (error) {
        sendToast("Unable to connect to the server. Please try again later.");
      }
    }
  };

  useState(() => {
    fetchData(1);
  }, []);
  // useState(() => {
  //   fetchData(1);
  // }, []);

  // const formik = useFormik({
  //   initialValues: {
  //     OwnerName: "",
  //     phoneNumber: "",
  //     EmailAddress: "",
  //     industry: {
  //       label: "Select industry type here...",
  //       value: "",
  //     },
  //     CompanyName: "",
  //     teamSize: {
  //       label: "Select your team size (including yourself) here...",
  //       value: "",
  //     },
  //     revenue: {
  //       label: "Select your estimated annual revenue here...",
  //       value: "",
  //     },
  //   },
  //   validationSchema:
  //     currentStep === 1
  //       ? Yup.object({
  //           OwnerName: Yup.string().required("OwnerName Required"),
  //           phoneNumber: Yup.string()
  //             .required("Phone number required")
  //             .matches(
  //               /^\(\d{3}\) \d{3}-\d{4}$/,
  //               "Phone number must be in the format (xxx) xxx-xxxx"
  //             ),
  //           industry: Yup.object({
  //             label: Yup.string().required("Label Required"),
  //             value: Yup.string().required(" value Required"),
  //           }).required("value Required"),
  //         })
  //       : Yup.object({
  //           CompanyName: Yup.string().required("Company Name Required"),
  //           teamSize: Yup.object({
  //             label: Yup.string().required("Label Required"),
  //             value: Yup.string().required("Value Required"),
  //           }).required("Value is Required"),
  //           revenue: Yup.object({
  //             label: Yup.string().required("Label Required"),
  //             value: Yup.string().required("Value Required"),
  //           }).required("Value Required"),
  //         }),
  //   onSubmit: (values) => {
  //     if (currentStep === 1) {
  //       setCurrentStep(currentStep + 1);
  //       fetchData(currentStep + 1);
  //     } else {
  //       handleSubmit(values);
  //     }
  //   },
  //   validateOnChange: true,
  //   validateOnBlur: true,
  // });
  const formik = useFormik({
    initialValues: {
      OwnerName: "",
      phoneNumber: "",
      EmailAddress: "",
      Industry: {
        label: "Select industry type here...",
        value: "",
      },
      CompanyName: "",
      TeamSize: {
        label: "Select your team size (including yourself) here...",
        value: "",
      },
      Revenue: {
        label: "Select your estimated annual revenue here...",
        value: "",
      },
    },
    validationSchema:
      currentStep === 1
        ? Yup.object({
            OwnerName: Yup.string().required("OwnerName Required"),
            phoneNumber: Yup.string()
              .required("Phone number required")
              .matches(
                /^\(\d{3}\) \d{3}-\d{4}$/,
                "Phone number must be in the format (xxx) xxx-xxxx"
              ),
            Industry: Yup.object({
              label: Yup.string().required("Label Required"),
              value: Yup.string().required(" value Required"),
            }).required("value Required"),
          })
        : Yup.object({
            CompanyName: Yup.string().required("Company Name Required"),
            TeamSize: Yup.object({
              label: Yup.string().required("Label Required"),
              value: Yup.string().required("Value Required"),
            }).required("Value is Required"),
            Revenue: Yup.object({
              label: Yup.string().required("Label Required"),
              value: Yup.string().required("Value Required"),
            }).required("Value Required"),
          }),
    onSubmit: (values) => {
      if (currentStep === 1) {
        setCurrentStep(currentStep + 1);
        navigate(`/auth/signup?step=2`);
        fetchData(currentStep + 1);
      } else {
        handleSubmit(values);
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
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
    if (formik.values.phoneNumber?.length > e.target.value?.length) {
      formik.setFieldValue("phoneNumber", e.target.value);
    } else {
      const formattedValue = formatPhoneNumber(e.target.value);
      formik.setFieldValue("phoneNumber", formattedValue);
    }
  };

  const [loader, setLoader] = useState(false);
  const handleSubmit = async (values) => {
    values.EmailAddress = EmailAddress;
    values.Password = Password;
    values.IndustryId = values.Industry.value;
    values.TeamSizeId = values.TeamSize.value;
    values.RevenueId = values.Revenue.value;
    values.Role = "Company";
    try {
      setLoader(true);
      const res = await AxiosInstance.post(
        `${baseUrl}/v1/auth/register`,
        values
      ); 
      console.log(res, "res");
      if (res.data.statusCode === "200") {
        showToast.success(res.data.message);
        setTimeout(() => { 
          navigate("/auth");
        }, 500);
      } else {
        sendToast(res.data.message);
      }
    } catch (error) {
      console.log(error, "error");
      sendToast("Unable to connect to the server. Please try again later.");
    } finally {
      setLoader(false);
    }
  };
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const cdnUrl = process.env.REACT_APP_CDN_API;

  useEffect(() => {
    setIsImageLoaded(false);

    const img = new Image();
    img.src =
      currentStep === 1
        ? `https://app.cloudjobmanager.com/cdn/upload/20250213112822_united-business-team-celebrating-success3.jpg`
        : `https://app.cloudjobmanager.com/cdn/upload/20250213112308_unrecognizable-man-woman-shaking-hands-meeting-start1.png`;

    img.onload = () => setIsImageLoaded(true);
  }, [currentStep]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const step = queryParams.get("step");
    if (step === "2") {
      setCurrentStep(2);
    }
  }, []);
  const location = useLocation();
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const step = queryParams.get("step");
    if (step === "2") {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [location.search]);

  const handleStepChange = (step) => {
    setCurrentStep(step);
    navigate(`/auth/signup?step=${step}`);
  };

  return (
    <>
      <Grid container spacing={2} className="vh-100" style={{}}>
        <Grid item xs={12} md={8}>
          <Grid className="steps">
            <Grid className="my-steps">
              <Grid className="app-logos mb-4" style={{ marginLeft: "-20px" }}>
                <Link to="/auth/login">
                  <img src={appLogo} alt="logo" />
                </Link>
              </Grid>
              <Row className="row main w-100">
                <Col
                  className="progress px-0 mx-1 mt-2 col-3"
                  style={{ height: "8px", borderRadius: "20px" }}
                  xl={3}
                >
                  <Grid
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: currentStep > 0 ? "100%" : "0%" }}
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></Grid>
                </Col>
                <Col
                  className="progress px-0 mx-1 mt-2 col-3"
                  style={{ height: "8px", borderRadius: "20px" }}
                  xl={3}
                >
                  <Grid
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: currentStep > 1 ? "100%" : "0%" }}
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></Grid>
                </Col>
              </Row>

              <Grid
                className=" mb-1 freetrialHeadFont"
                style={{
                  fontSize: "32px",
                  color: "rgba(51, 53, 71, 1)",
                  lineHeight: "60px",
                  fontWeight: "600",
                  fontFamily: "Poppins",
                  width: "316px",
                }}
              >
                {currentStep === 1 && "Your free trial is now active ! "}
                {currentStep === 2 && "Set up your business !"}
              </Grid>

              <form id="multi-step-form" onSubmit={formik.handleSubmit}>
                {currentStep === 1 && (
                  <Grid className="step step-1">
                    <Typography
                      className="heading-four mb-2"
                      style={{
                        fontSize: "16px",
                        color: "rgba(51, 53, 71, 1)",
                        lineHeight: "24px",
                        fontWeight: "400",
                        fontFamily: "Poppins",
                      }}
                    >
                      Let's get you started.
                    </Typography>
                    <FormGroup className="mb-2">
                      <FormGroup
                        style={{ width: "100%" }}
                        className="fullnemae mb-3 fullname-step"
                      >
                        <InputText
                          value={formik.values?.OwnerName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.OwnerName &&
                            Boolean(formik.errors.OwnerName)
                          }
                          helperText={
                            formik.touched.OwnerName && formik.errors.OwnerName
                          }
                          name="OwnerName"
                          placeholder="Enter full name"
                          label="Full Name "
                          type="text"
                          className="text-blue-color w-100"
                          fieldHeight="56px"
                        />
                      </FormGroup>
                      <FormGroup
                        style={{ width: "100%" }}
                        className="fullnemae phonenumber-signup"
                      >
                        <InputText
                          value={formik.values?.phoneNumber}
                          onChange={handlePhoneChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.phoneNumber &&
                            Boolean(formik.errors.phoneNumber)
                          }
                          helperText={
                            formik.touched.phoneNumber &&
                            formik.errors.phoneNumber
                          }
                          name="phoneNumber"
                          placeholder="(555) 555-1234"
                          label="Phone Number"
                          type="text"
                          className="text-blue-color w-100 trialPhoneNumberInput"
                          fieldHeight="56px"
                        />
                      </FormGroup>
                      <Grid className="Drop">
                        <Select
                          className="basic-single text-blue-color mt-2"
                          classNamePrefix="select"
                          isDisabled={false}
                          isLoading={false}
                          isClearable={true}
                          isRtl={false}
                          isSearchable={true}
                          options={industry}
                          placeholder="Select Industry type"
                          defaultValue={{
                            label:
                              "Select your team size (including yourself) here...",
                            value: "",
                          }}
                          styles={customStyles}
                          value={formik.values.Industry}
                          onChange={(selectedOption) =>
                            formik.setFieldValue(
                              "Industry",
                              selectedOption
                                ? selectedOption
                                : {
                                    label:
                                      "Select your team size (including yourself) here...",
                                    value: "",
                                  }
                            )
                          }
                        />
                      </Grid>
                      <Grid className="w-100 text-danger mt-0 pt-0">
                        {formik.touched?.Industry?.value &&
                        formik.errors?.Industry?.value
                          ? formik.errors?.Industry?.value
                          : ""}
                      </Grid>
                    </FormGroup>
                    <OrangeButton
                      type="button"
                      onClick={() => {
                        formik.handleSubmit();
                      }}
                      className="btn btn-circle arrow-button-signup bg-orange-color"
                      label={<ArrowForwardRoundedIcon />}
                      style={{
                        border: "none",
                        borderRadius: "50%",
                        padding: "12px",
                      }}
                    />
                  </Grid>
                )}

                {currentStep === 2 && (
                  <Grid className="step step-1">
                    <Typography
                      style={{
                        fontSize: "16px",
                        color: "rgba(51, 53, 71, 1)",
                        lineHeight: "24px",
                        fontWeight: "400",
                        fontFamily: "Poppins",
                        marginBottom: "15px",
                      }}
                      className="heading-five"
                    >
                      This will help us customize your experience at contractor
                      management system.
                    </Typography>
                    <FormGroup className="mb-3 mt-1">
                      <FormGroup
                        style={{ width: "100%" }}
                        className="fullnemae"
                      >
                        <InputText
                          value={formik.values.CompanyName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.CompanyName &&
                            Boolean(formik.errors.CompanyName)
                          }
                          helperText={
                            formik.touched.CompanyName &&
                            formik.errors.CompanyName
                          }
                          name="CompanyName"
                          placeholder="Enter company name"
                          label="Company Name"
                          type="text"
                          className="text-blue-color w-100"
                          fieldHeight="56px"
                        />
                      </FormGroup>
                      <Select
                        className=""
                        classNamePrefix="select"
                        isDisabled={false}
                        isLoading={false}
                        isClearable={true}
                        isRtl={false}
                        isSearchable={true}
                        options={teamSize}
                        placeholder="Select your team size (including yourself)"
                        value={formik.values.TeamSize}
                        onChange={(selectedOption) =>
                          formik.setFieldValue("TeamSize", selectedOption)
                        }
                        onBlur={() => formik.setFieldTouched("TeamSize", true)}
                        styles={customStyles}
                      />
                      {formik.touched.TeamSize && formik.errors.TeamSize && (
                        <Grid className="w-100 text-danger mt-0 pt-0">
                          {formik.errors.TeamSize.label}
                        </Grid>
                      )}
                      <Select
                        className="basic-single secondstrpMarginTOP"
                        classNamePrefix="select"
                        isDisabled={false}
                        isLoading={false}
                        isClearable={true}
                        isRtl={false}
                        isSearchable={true}
                        options={revenue}
                        placeholder="Select your estimated annual revenue "
                        value={formik.values.Revenue}
                        onChange={(selectedOption) =>
                          formik.setFieldValue("Revenue", selectedOption)
                        }
                        onBlur={() => formik.setFieldTouched("Revenue", true)}
                        styles={customStyles}
                      />
                      {formik.touched.Revenue && formik.errors.Revenue && (
                        <Grid className="w-100 text-danger mt-0 pt-0 ">
                          {formik.errors.Revenue.label}
                        </Grid>
                      )}
                    </FormGroup>
                    <BlueButton
                      type="button"
                      onClick={() => {
                        formik.handleSubmit();
                      }}
                      className="btn  btn-square bg-orange-color"
                      disabled={loader}
                      label={
                        loader ? (
                          <WhiteLoaderComponent
                            height="20"
                            width="20"
                            padding="20"
                            loader={loader}
                          />
                        ) : (
                          "Start"
                        )
                      }
                    />
                  </Grid>
                )}
              </form>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={4} className="main-imageeee img">
          <div
            className={`background-container ${
              currentStep === 1 ? "trial_img" : "trial_second"
            } ${isImageLoaded ? "loaded" : "loading"}`}
          ></div>
        </Grid>
      </Grid>
    </>
  );
};

export default Steps;
