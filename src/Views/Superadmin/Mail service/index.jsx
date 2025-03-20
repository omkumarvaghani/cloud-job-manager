import React, { useState, useEffect } from "react";
import {
  Box,
  Divider,
  FormGroup,
  InputAdornment,
  Typography,
} from "@mui/material";
import "./style.css";
import { Card, CardBody, CardHeader, CardTitle, Col, Label } from "reactstrap";
import { Circles } from "react-loader-spinner";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as Yup from "yup";
import swal from "sweetalert";
import InputText from "../../../components/InputFields/InputText.jsx";
import AxiosInstance from "../../AxiosInstance.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InputDropdown from "../../../components/InputFields/InputDropdown.jsx";
import {
  DeleteIcone,
  DeleteIconeWhite,
  EditIcon,
  EditIconWhite,
} from "../../../components/Icon/Index.jsx";
import BlueButton from "../../../components/Button/BlueButton.jsx";
import WhiteButton from "../../../components/Button/WhiteButton.jsx";
import { Grid } from "@mui/material";
import showToast from "../../../components/Toast/Toster.jsx";

const MailService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toMail, setToMail] = useState();
  useState(() => {
    const fetchTokenData = async () => {
      try {
        const data = await handleAuth(navigate, location);
        if (data.data) {
          setToMail(data?.data?.EmailAddress);
        }
      } catch (error) {
        console.error("Error: ", error.message);
      }
    };
    fetchTokenData();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittings, setIsSubmittings] = useState(false);

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    mailFormik.resetForm();
    setOpen(false);
  };

  const mailFormik = useFormik({
    initialValues: {
      Secure: false,
      ToMail: "",
      Host: "",
      Port: "",
      User: "",
      Password: "",
      Mail: "",
      Verify: false,
    },
    validationSchema: Yup.object({
      Host: Yup.string().required("Host required."),
      Port: Yup.string().required("Port required."),
      User: Yup.string().required("User required."),
      Password: Yup.string().required("Pass required."),
      Mail: Yup.string().required("Mail required."),
      Verify: Yup.boolean()
        .oneOf([true], "Mail service is not verified.")
        .required("Mail service is not verified."),
    }),
    onSubmit: async (values) => {
      try {
        const requestData = { ...values, Secure: values.Secure === "true" };

        if (values.id) {
          const response = await AxiosInstance.put(
            `/mailconfiguration/${values.id}`,
            requestData
          );

          if (response?.data.statusCode === 200) {
            handleClose();
            setTimeout(() => {
              showToast.success(response?.data.message);
            }, 500);
          } else {
            setTimeout(() => {
              showToast.error(response?.data.message);
            }, 500);
          }
        } else {
          const response = await AxiosInstance.post(
            `/mailconfiguration`,
            requestData
          );
          if (response?.data.statusCode === 201) {
            setTimeout(() => {
              showToast.success(response?.data.message);
            }, 500);
            handleClose();
            fetchMailConfigurations();
          } else {
            setTimeout(() => {
              showToast.error(response?.data.message);
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error: ", error.message);
        setTimeout(() => {
          showToast.error("An error occurred while processing your request.");
        }, 500);
      }
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  const verifyEmail = async () => {
    setIsSubmitting(true);
    try {
      mailFormik.values["ToMail"] = toMail;
      const response = await AxiosInstance.post(
        `/mailconfiguration/test_mail`,
        { ...mailFormik?.values, Secure: mailFormik?.values?.Secure === "true" }
      );
      if (response?.data.statusCode === 200 && response?.data.info.verified) {
        mailFormik.setFieldValue("Verify", true);
        setTimeout(() => {
          showToast.success(response?.data.info.message);
        }, 500);
      } else {
        setTimeout(() => {
          // showToast.error(response?.data.info.message);
          showToast.error(
            "Something went wrong. Please check your credentials."
          );
        }, 500);
      }
    } catch (error) {
      console.error("Error: ", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [mailConfigs, setMailConfigs] = useState([]);

  const fetchMailConfigurations = async () => {
    try {
      const response = await AxiosInstance.get("/mailconfiguration");
      if (response?.data.statusCode === 200) {
        setMailConfigs(response?.data?.result);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchMailConfigurations();
  }, []);
  const handleEditConfig = async (id) => {
    try {
      const response = await AxiosInstance.get(`/mailconfiguration/${id}`);

      if (response?.data.statusCode === 200) {
        const config = response?.data.result;
        mailFormik.setValues({
          Host: config.Host,
          Port: config.Port,
          User: config.User,
          Password: config.Password,
          Mail: config.Mail,
          Secure: config.Secure.toString(),
          Verify: config.Verify,
          id: config.MailConfigurationId,
        });

        setOpen(true);
      } else {
        console.error("Failed to fetch mail configuration details.");
      }
    } catch (error) {
      console.error("Error fetching mail configuration details:", error);
    }
  };
  const handleDelete = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover!",
      icon: "warning",

      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Delete",
          closeModal: true,
          value: true,
          className: "bg-orange-color",
        },
      },
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await AxiosInstance.delete(
            `/mailconfiguration/${id}`
          );
          if (response?.data.statusCode === 200) {
            setMailConfigs((prevData) =>
              prevData.filter((item) => item?.MailConfigurationId !== id)
            );
            setTimeout(() => {
              showToast.success(response?.data.message);
            }, 500);
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

  return (
    <Grid className="mail">
      <Grid className="justify-content-center align-items-center mb-3 ">
        <Grid className="d-flex justify-content-between mb-2 align-items-center"></Grid>

        <Card
          className="border-blue-color"
          style={{
            borderRadius: "20px",
            border: "2px solid ",
            padding: 0,
            marginBottom: "20px",
            height: "100%",
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
            <Typography className="custe text-light p-4 heading-five fw-medium">
              Mail Service{" "}
            </Typography>{" "}
          </CardHeader>
          <CardBody style={{ padding: "10px 0px" }}>
            <Typography
              className="text-blue-color"
              style={{
                fontWeight: 600,
                fontSize: "18px",
                paddingLeft: "40px",
                paddingTop: "30px",
              }}
            >
              Set your SMTP Mail Configuration settings from here
            </Typography>
            <Grid>
              <Grid
                style={{ paddingLeft: "40px", paddingTop: "20px" }}
                className="mailBtnSuperadmin"
              >
                <button
                  onClick={handleClickOpen}
                  label="Add New Configuration"
                  className="text-capitalize bg-blue-color text-white-color "
                  style={{
                    padding: "5px",
                    border: "2px solid #063164",
                    borderRadius: "5px",
                  }}
                >
                  Add New Configuration
                </button>
              </Grid>
              <Grid
                className="configuration-box"
                style={{
                  paddingLeft: "40px",
                  paddingTop: "20px",
                  paddingRight: "40px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {mailConfigs &&
                  mailConfigs?.length > 0 &&
                  mailConfigs?.map((config, index) => (
                    <Card
                      className="my-2 mail-card"
                      style={{
                        flex: "0 0 calc(50% - 10px)",
                      }}
                      key={index}
                    >
                      <CardHeader className="d-flex justify-content-between align-items-center bg-blue-color mail-header config-head">
                        <Typography
                          className="mb-0 text-white-color "
                          style={{ fontSize: "18px", fontWeight: 600 }}
                        >
                          Configuration Details
                        </Typography>
                        <Grid className="">
                          <Grid
                            className=""
                            style={{
                              display: "flex",
                              background: "rgba(255, 255, 255, 0.2)",
                              borderRadius: "7px",
                            }}
                          >
                            <Grid
                              className="mx-3"
                              style={{
                                cursor: "pointer",
                                color: "#FFFF",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <EditIcon
                                onClick={() =>
                                  handleEditConfig(config?.MailConfigurationId)
                                }
                              />
                            </Grid>

                            <Divider
                              orientation="vertical"
                              flexItem
                              style={{
                                height: "20px",
                                border: "2px solid #FFFF",
                                alignItems: "center",
                                margin: "5px",
                                marginTop: "8px",
                              }}
                            />
                            <Grid
                              className="mx-3"
                              style={{
                                cursor: "pointer",
                                color: "#FFFF",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <DeleteIcone
                                onClick={() =>
                                  handleDelete(config?.MailConfigurationId)
                                }
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardHeader>
                      <CardBody
                        style={{
                          maxHeight: "200px",
                          overflowX: "auto",
                          overflowY: "clip",
                        }}
                      >
                        <Grid style={{}}>
                          <Grid style={{ minWidth: "300px" }}>
                            <Grid className="host-mail-port">
                              <CardTitle
                                tag="Typography"
                                className="text-blue-color"
                              >
                                Host :
                              </CardTitle>
                              <Typography
                                className="mb-3 text-blue-color mail-section"
                                style={{ opacity: 0.5, fontWeight: 500 }}
                              >
                                {config?.Host || "Host not available"}
                              </Typography>
                            </Grid>
                            <Grid className="host-mail-port">
                              <CardTitle
                                tag="Typography"
                                className="text-blue-color"
                              >
                                Port :
                              </CardTitle>
                              <Typography
                                className="text-blue-color"
                                style={{ opacity: 0.5, fontWeight: 500 }}
                              >
                                {config?.Port}
                              </Typography>
                            </Grid>
                            <Grid className="host-mail-port">
                              <CardTitle
                                tag="Typography"
                                className="text-blue-color"
                              >
                                User :
                              </CardTitle>
                              <Typography
                                className="mb-3 text-blue-color"
                                style={{ opacity: 0.5, fontWeight: 500 }}
                              >
                                {config?.User}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardBody>
                    </Card>
                  ))}
              </Grid>
            </Grid>
          </CardBody>
        </Card>
      </Grid>

      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        className="new_confi"
      >
        <DialogTitle
          sx={{ m: 0, p: 2, fontWeight: 600, fontSize: "18px" }}
          className="text-blue-color borerBommoModel"
          id="customized-dialog-title"
        >
          Add New Configuration
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <CardTitle tag="h6" className="text-blue-color">
            Set your SMTP Mail Configuration settings from here
          </CardTitle>
          <Grid className="my-4 d-flex gap-3 mail-modal-main">
            <Col className="col-6" xl={6}>
              <FormGroup
                row
                className="gap-2 align-items-center mb-3 formgroups add-confi-host"
              >
                <Label
                  for="Host"
                  className="mb-0 host-title"
                  style={{ fontSize: "16px" }}
                >
                  Host* :
                </Label>
                <Col
                  className="inputs-maill host-user-input"
                  style={{ marginLeft: "8px" }}
                >
                  <InputText
                    name="Host"
                    label="Host"
                    fieldHeight="54px"
                    id="Host"
                    type="text"
                    className="text-blue-color w-100"
                    value={mailFormik.values?.Host}
                    onChange={mailFormik.handleChange}
                    onBlur={mailFormik.handleBlur}
                    error={
                      mailFormik.touched.Host && Boolean(mailFormik.errors.Host)
                    }
                    helperText={
                      mailFormik.touched.Host && mailFormik.errors.Host
                    }
                  />
                </Col>
              </FormGroup>
              <FormGroup
                row
                className="gap-2 align-items-center mb-3 formgroups add-confi-host"
              >
                <Label
                  for="User"
                  className="mb-0 host-title"
                  style={{ fontSize: "16px" }}
                >
                  User* :
                </Label>
                <Col
                  className="inputs-maill host-user-input"
                  style={{ marginLeft: "8px" }}
                >
                  <InputText
                    name="User"
                    label="User"
                    fieldHeight="54px"
                    id="User"
                    type="text"
                    className="text-blue-color w-100"
                    value={mailFormik.values?.User}
                    onChange={mailFormik.handleChange}
                    onBlur={mailFormik.handleBlur}
                    error={
                      mailFormik.touched.User && Boolean(mailFormik.errors.User)
                    }
                    helperText={
                      mailFormik.touched.User && mailFormik.errors.User
                    }
                  />
                </Col>
              </FormGroup>
              <FormGroup
                row
                className="gap-2 align-items-center mb-3 formgroups add-confi-host"
              >
                <Label
                  for="Secure"
                  className="mb-0 host-title"
                  style={{ fontSize: "16px" }}
                >
                  Secure :
                </Label>
                <Col className="inputs-mail">
                  <InputDropdown
                    options={["true", "false"]}
                    value={mailFormik.values?.Secure || null}
                    inputValue={mailFormik.values?.Secure || null}
                    onChange={(e, value) =>
                      mailFormik.setFieldValue("Secure", value)
                    }
                    label="Secure"
                    name="Secure"
                    type="text"
                    getOptionLabel={(option) => option || ""}
                    filterOptions={(options, state) => {
                      return options.filter((option) =>
                        option
                          ?.toLowerCase()
                          ?.includes(state?.inputValue?.toLowerCase())
                      );
                    }}
                    error={
                      mailFormik.touched.Secure &&
                      Boolean(mailFormik.errors.Secure)
                    }
                    helperText={
                      mailFormik.touched.Secure && mailFormik.errors.Secure
                    }
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col className="col-6" xl={6}>
              <FormGroup
                row
                className="gap-2 align-items-center mb-3 formgroups add-confi-host"
                style={{ marginRight: "12px" }}
              >
                <Label
                  for="Port"
                  className="mb-0 host-title"
                  style={{ fontSize: "16px" }}
                >
                  Port* :
                </Label>
                <Col style={{ marginLeft: "52px" }} className="port-input">
                  <InputText
                    name="Port"
                    label="Port"
                    fieldHeight="54px"
                    id="Port"
                    type="text"
                    className="text-blue-color w-100"
                    value={mailFormik.values?.Port}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        mailFormik.handleChange({
                          target: {
                            name: "Port",
                            value: Math.max(0, Number(value)),
                          },
                        });
                      }
                    }}
                    onBlur={mailFormik.handleBlur}
                    error={
                      mailFormik.touched.Port && Boolean(mailFormik.errors.Port)
                    }
                    helperText={
                      mailFormik.touched.Port && mailFormik.errors.Port
                    }
                  />
                </Col>
              </FormGroup>
              <FormGroup
                row
                className="gap-2 align-items-center mb-3 formgroups add-confi-host"
                style={{ marginRight: "12px" }}
              >
                <Label
                  for="Pass"
                  className="mb-0 host-title"
                  style={{ fontSize: "16px" }}
                >
                  Password* :
                </Label>
                <Col style={{ marginLeft: "8px" }} className="port-input">
                  <InputText
                    value={mailFormik.values?.Password}
                    onChange={mailFormik.handleChange}
                    onBlur={mailFormik.handleBlur}
                    autoComplete="new-password"
                    error={
                      mailFormik.touched.Password &&
                      Boolean(mailFormik.errors.Password)
                    }
                    helperText={
                      mailFormik.touched.Password && mailFormik.errors.Password
                    }
                    name="Password"
                    label="Password"
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
                </Col>
              </FormGroup>
              <FormGroup
                row
                className="gap-2 align-items-center mb-3 formgroups add-confi-host "
                style={{ marginRight: "12px" }}
              >
                <Label
                  for="Mail"
                  className="mb-0 host-title mail-top"
                  style={{ fontSize: "16px" }}
                >
                  Mail* :
                </Label>
                <Col
                  style={{ marginLeft: "52px" }}
                  className="port-input mail_per"
                >
                  <InputText
                    name="Mail"
                    label="Mail"
                    fieldHeight="54px"
                    id="Mail"
                    type="text"
                    className="text-blue-color w-100"
                    value={mailFormik.values?.Mail}
                    onChange={mailFormik.handleChange}
                    onBlur={mailFormik.handleBlur}
                    error={
                      mailFormik.touched.Mail && Boolean(mailFormik.errors.Mail)
                    }
                    helperText={
                      mailFormik.touched.Mail && mailFormik.errors.Mail
                    }
                  />
                </Col>
              </FormGroup>
            </Col>
          </Grid>
        </DialogContent>
        <DialogActions
          style={{ justifyContent: "space-between" }}
          className="cancel-email-btn"
        >
          <Box className="email-blue">
            {isSubmitting ? (
              <Box display="flex" justifyContent="right" color="#063164">
                <Circles
                  height="20"
                  width="20"
                  color="#063164"
                  ariaLabel="circles-loading"
                  visible={isSubmitting}
                />
              </Box>
            ) : (
              <Grid className="email-blue">
                {mailFormik.touched?.Verify && mailFormik.errors?.Verify && (
                  <Grid style={{ color: "red" }}>
                    {mailFormik.errors?.Verify}
                  </Grid>
                )}
                <BlueButton
                  onClick={verifyEmail}
                  label="Verify Email"
                  className="email-blue-button"
                />
              </Grid>
            )}
          </Box>

          <Grid className="gap-2 d-flex calcel-email">
            <WhiteButton onClick={handleClose} type="button" label="Cancel" />
            <Box>
              {isSubmittings ? (
                <Box display="flex" justifyContent="right" color="#063164">
                  <Circles
                    height="20"
                    width="20"
                    color="#063164"
                    ariaLabel="circles-loading"
                    visible={isSubmittings}
                  />
                </Box>
              ) : (
                <BlueButton
                  onClick={mailFormik.handleSubmit}
                  label="Add Email"
                  className="email-blue-button configurationAddMail"
                />
              )}
            </Box>
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default MailService;
