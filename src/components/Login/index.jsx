import {
  Button,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import AppLogo from "../../assets/image/CMS_LOGO.svg";
import "./style.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../../Views/AxiosInstance";
import { Link, useLocation, useNavigate } from "react-router-dom";
import InputText from "../InputFields/InputText";
import sendToast from "../Toast/sendToast";
import { WhiteLoaderComponent } from "../Icon/Index";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import showToast from "../Toast/Toster";

const getToken = () => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) return adminToken;
  const workerToken = localStorage.getItem("workerToken");
  if (workerToken) return workerToken;
  const customerToken = localStorage.getItem("customerToken");
  if (customerToken) return customerToken;
  return null;
};

const Login = () => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("");

  const formik = useFormik({
    initialValues: {
      Password: "",
      EmailAddress: "",
      CompanyId: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object().shape({
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email is required")
        .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
      Password: Yup.string().when("isSubmit", {
        is: true,
        then: Yup.string().required("Password is required"),
      }),
    }),
    onSubmit: (values) => {
      if (!isSubmit) {
        handleCheckEmail(values);
      } else {
        handleSubmit(values);
      }
    },
  });

  const handleCheckEmail = async (values) => {
    try {
      setIsLoading(true);
      const res = await AxiosInstance.post(`${baseUrl}/v1/auth/check-email`, {
        EmailAddress: values.EmailAddress,
      });

      if (res.data.statusCode === "200") {
        setLoginData(res.data.data.companies);
        setIsSubmit(true);
      } else if (res.data.statusCode === "201") {
        toast.error("Email not found", {
          autoClose: 1000,
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error(error.response?.data.message || "Something went wrong", {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoader(true);
      const res = await AxiosInstance.post(`${baseUrl}/v1/auth/login`, {
        ...values,
      });
      if (res.data.statusCode == "200") {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("CompanyId", res.data.data.UserId);
        showToast.success(res.data.message, {
          autoClose: 3000,
        });
        setTimeout(() => {
          navigate(`/${res.data.data.CompanyName}/index`, {
            state: { navigats: ["/index"] },
          });
        }, 1000);
      } else if (res.data.statusCode == "300") {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("admin_id", res.data.data.UserId);
        setTimeout(() => {
          navigate("/superadmin/index", {
            state: { navigats: ["/index"] },
          });
        }, 1000);
        showToast.success(res.data.message);
      } else if (res.data.statusCode == "302") {
        localStorage.setItem("workerToken", res.data.token);
        localStorage.setItem("worker_id", res.data.data.UserId);
        setTimeout(() => {
          navigate("/staff-member/index", {
            state: { navigats: ["/index"] },
          });
        }, 1000);
        showToast.success(res.data.message);
      } else if (res.data.statusCode == "303") {
        localStorage.setItem("customerToken", res.data.token);
        localStorage.setItem("CustomerId", res.data.data.UserId);
        setTimeout(() => {
          navigate("/customers/index", {
            state: { navigats: ["/index"] },
          });
        }, 1000);
        showToast.success(res.data.message);
      } else if (res.data.statusCode == "201") {
        sendToast(res.data.message);
      } else if (res.data.statusCode == "202") {
        sendToast(res.data.message);
      } else if (res.data.statusCode == "204") {
        sendToast(res.data.message);
      }
    } catch (error) {
      if (error.response) {
        sendToast(error.response?.data.message || "An error occurred");
      } else {
        sendToast("Something went wrong. Please try again later.");
      }
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await AxiosInstance.post(`/v1/auth/token_data`, {
            token,
          });
          if (res.data.statusCode !== "200") {
            // localStorage.clear();
            // navigate("/auth/login");
          } else {
            if (
              res.data.data.Role == "Superadmin" &&
              !location.pathname.includes("/superadmin")
            ) {
              localStorage.setItem("admin_id", res.data.data.superAdminId);
              navigate("/superadmin/index", {
                state: { navigats: ["/index"] },
              });
            } else if (
              res.data.data.Role == "client" &&
              !location.pathname.includes("/customers")
            ) {
              localStorage.setItem("CustomerId", res.data.data.CustomerId);
              navigate("/customers/index", {
                state: { navigats: ["/index"] },
              });
            } else if (
              res.data.data.Role == "Company" &&
              !location.pathname.includes(`/${res.data.data.CompanyName}`)
            ) {
              localStorage.setItem("CompanyId", res.data.data.companyId);
              navigate(`/${res.data.data.CompanyName}/index`, {
                state: { navigats: ["/index"] },
              });
            } else if (
              res.data.data.Role == "worker" &&
              !location.pathname.includes(`/staff-member`)
            ) {
              localStorage.setItem("worker_id", res.data.data.WorkerId);
              navigate(`/staff-member/index`, {
                state: { navigats: ["/index"] },
              });
            }
          }
        } catch (err) {
          if (err.response) {
            if (err.response.status == 401) {
              sendToast("Session has expired. Please log in again.");
              localStorage.clear();
            } else if (err.response.status == 404) {
              sendToast("Session not found. Please log in again.");
              localStorage.clear();
            } else {
              sendToast("Unauthorized access. Please log in again.");
            }
          } else {
            sendToast(
              "Unable to connect to the server. Please try again later."
            );
            localStorage.clear();
          }
        }
      }
    };
    fetchData();
  }, [navigate, location.pathname]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const imageLoaded = sessionStorage.getItem("imageLoaded");
    setIsLoaded(imageLoaded === "true");
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    sessionStorage.setItem("imageLoaded", "true");
  };

  const handleInputChange = (e) => {
    formik.handleChange(e);
    if (isSubmit) {
      setIsSubmit(false);
      setLoginData(null);
      setSelectedCompany("");
    }
  };

  return (
    <div className="login">
      <Grid container spacing={2} className="vh-100">
        <Grid item xs={12} md={6} className="d-flex flex-direction-column pt-3">
          <Typography
            className="app-logo"
            style={{
              paddingRight: "22px",
              paddingLeft: "0px",
              paddingTop: "20px",
              paddingBottom: "0px",
              cursor: "pointer",
            }}
          >
            <img
              src={AppLogo || "/placeholder.svg"}
              alt="logo"
              onLoad={handleImageLoad}
            />
          </Typography>

          <div
            style={{
              width: "100%",
              height: "90%",
              paddingTop: "40px",
              paddingRight: "50px",
              paddingLeft: "50px",
            }}
            className="d-flex align-items-center loginformcontent"
          >
            <form
              style={{ width: "90%", height: "90%", marginLeft: "12%" }}
              onSubmit={formik.handleSubmit}
              className="loginform loginFormFirst"
            >
              <Typography className="text text-blue-color">Login</Typography>
              <Typography className="text2">
                Please login to access your account.
              </Typography>
              <FormGroup
                className="text-boxes"
                style={{ width: "100%", marginTop: "24px" }}
              >
                <InputText
                  value={formik.values.EmailAddress}
                  onChange={handleInputChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.EmailAddress &&
                    Boolean(formik.errors.EmailAddress)
                  }
                  helperText={
                    formik.touched.EmailAddress && formik.errors.EmailAddress
                  }
                  name="EmailAddress"
                  label="Primary Email"
                  type="text"
                  className="text-blue-color w-100"
                  fieldHeight="56px"
                  disabled={isSubmit}
                />
              </FormGroup>

              {isSubmit && (
                <>
                  <FormGroup
                    className="text-boxes"
                    style={{ width: "100%", marginTop: "24px" }}
                  >
                    <InputText
                      id="password"
                      value={formik.values.Password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.Password &&
                        Boolean(formik.errors.Password)
                      }
                      helperText={
                        formik.touched.Password && formik.errors.Password
                      }
                      name="Password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      className="text-blue-color w-100 m-0 mb-3"
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
                          <div style={{ pointerEvents: "none" }} tabIndex="-1">
                            <Tooltip title="Password must be at least 8 characters long" />
                          </div>
                        </InputAdornment>
                      }
                    />
                  </FormGroup>

                  {loginData && loginData.length > 1 && (
                    <FormGroup
                      className="text-boxes"
                      style={{ width: "100%", marginTop: "24px" }}
                    >
                      <Typography
                        style={{ marginBottom: "10px", fontWeight: "500" }}
                      >
                        Select Company to Login
                      </Typography>
                      <div
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          padding: "10px",
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {loginData.map((company) => (
                          <div
                            key={company.CompanyId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 0",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <input
                              type="radio"
                              id={`company-${company.CompanyId}`}
                              name="companySelection"
                              value={company.CompanyId}
                              checked={selectedCompany === company.CompanyId}
                              onChange={(e) =>
                                setSelectedCompany(e.target.value)
                              }
                              style={{ marginRight: "10px" }}
                            />
                            <label
                              htmlFor={`company-${company.CompanyId}`}
                              style={{
                                cursor: "pointer",
                                fontWeight:
                                  selectedCompany === company.CompanyId
                                    ? "600"
                                    : "normal",
                                color:
                                  selectedCompany === company.CompanyId
                                    ? "rgba(51, 53, 71, 1)"
                                    : "inherit",
                              }}
                            >
                              {company.CompanyName} ({company.Role})
                            </label>
                          </div>
                        ))}
                      </div>
                      {!selectedCompany && (
                        <Typography
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginTop: "5px",
                          }}
                        >
                          Please select a company to continue
                        </Typography>
                      )}
                    </FormGroup>
                  )}
                </>
              )}

              <FormGroup style={{ width: "100%", marginTop: "15px" }}>
                <Button
                  style={{
                    backgroundColor: "rgba(51, 53, 71, 1)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    lineHeight: "21px",
                    borderRadius: "4px",
                    gap: "4px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  type="submit"
                  disabled={
                    isLoading ||
                    (isSubmit && loginData?.length > 1 && !selectedCompany) ||
                    (!isSubmit &&
                      (!formik.values.EmailAddress ||
                        formik.errors.EmailAddress))
                  }
                >
                  {isLoading ? (
                    <WhiteLoaderComponent
                      height="20"
                      width="20"
                      padding="20"
                      loader={true}
                    />
                  ) : isSubmit ? (
                    "Login"
                  ) : (
                    "Continue"
                  )}
                </Button>
              </FormGroup>

              <Typography
                className="text-orange-color"
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "21px",
                  textAlign: "right",
                  marginTop: "13px",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/auth/forgot-password")}
              >
                Forgot Password?
              </Typography>

              <Typography
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "21px",
                  textAlign: "center",
                  marginTop: "13px",
                }}
              >
                Do you not have an account?{" "}
                <span
                  className="text-orange-color"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/auth/signup")}
                >
                  Sign up
                </span>
              </Typography>
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
                "This website is safeguarded by reCAPTCHA, and your use is
                subject to Google's{" "}
                <Link
                  to="https://cloudjobmanager.com/privacy-policy/"
                  target="_blank"
                >
                  <span style={{ fontWeight: "600" }}>Privacy Policy</span>
                </Link>{" "}
                and{" "}
                <Link
                  to="https://cloudjobmanager.com/terms-and-conditions/"
                  target="_blank"
                >
                  <span style={{ fontWeight: "600" }}>Terms of Service."</span>
                </Link>
              </Typography>
            </form>
          </div>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          className="d-flex justify-content-center align-items-center img leftsidebvo imageHeightRemove"
        >
          <div className="login-image"></div>
        </Grid>
      </Grid>
    </div>
  );
};
export default Login;
