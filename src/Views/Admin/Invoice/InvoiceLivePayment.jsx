import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useFormik } from "formik";
import * as Yup from "yup";

import dayjs from "dayjs";

import InputDropdown from "../../../components/InputFields/InputDropdown";
import InputText from "../../../components/InputFields/InputText";
// import { handleAuth } from "../../../components/Login/Auth";
import sendToast from "../../../components/Toast/sendToast";
import AxiosInstance from "../../AxiosInstance";
import CardPayment from "./Payment/CardPayment";
import AchPayment from "./Payment/AchPayment";
import { Circles, ColorRing } from "react-loader-spinner";
import { Button, CardBody, CardFooter, CardHeader } from "reactstrap";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { LoaderComponent } from "../../../components/Icon/Index";
import showToast from "../../../components/Toast/Toster";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";
import AppLogo from "../../../assets/image/CMS_LOGO.svg";
import Payment from "../../../assets/image/Payment.png";
import ContactImage from "../../../assets/White-sidebar-icon/MOBILE.svg";
import CustomerEmail from "../../../assets/White-sidebar-icon/EMAIL.svg";
import DollerInput from "../../../components/InputFields/Doller";

const InvoiceLivePayment = () => {
  const queryParams = new URLSearchParams(window.location.search);

  const { token } = {
    token: queryParams.get("token"),
  };
  const [invoiceData, setInvoiceData] = useState();
  const [selectedCard, setSelectedCard] = useState(undefined);
  const [loader, setLoader] = useState(true);

  let paymentMethods = [
    // "Cash",
    // "ACH bank payment",
    // "Check",
    "Credit/debit card",
  ];
  // const [searchParams] = useSearchParams();
  // const token = searchParams.get("token");
  const [tokenData, setTokenData] = useState();


  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Missing token");
        // setLoading(false);
        return;
      }
      try {
        // const response = await AxiosInstance.get(
        //   `/InvoicePayment?token=${token}`
        // );

        const response = await AxiosInstance.get(`/invoice/InvoicePayment`, {
          params: {
            token: token,
          },
        });

        // setMessage(response.data.message);
        setTokenData(response.data.data);

      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        // setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const [buttonLoader, setButtonLoader] = useState(false);
  const sendMail = async () => {
    try {
      const mailRes = await AxiosInstance.post(
        `/invoice-payment/send_mail/${tokenData?.invoice?.InvoiceId}`
      );
      if (mailRes?.data?.statusCode === 200) {
        showToast.success(mailRes?.data?.message);
      } else {
        sendToast(mailRes?.data?.message);
      }
    } catch (error) {
      sendToast(error?.response?.data?.error);
    } finally {
      setSentMail(false);
    }
  };

  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit/debit card");
  const [sentMail, setSentMail] = useState(false);
  const paymentFormik = useFormik({
    initialValues: {
      method: "Credit/debit card",
      amount: tokenData?.invoice?.invoiceAccount,
      date: dayjs(new Date()).format("MM-DD-YYYY"),
      customer_vault_id: "",
      billing_id: "",
      cheque_number: "",
    },
    validationSchema: Yup.object({
      method: Yup.string().required("This field is required."),
      cheque_number: Yup.string().test(
        "conditional-required",
        "This field is required.",
        function (value) {
          const { method } = this.parent;
          return method !== "Cheque" || (value && value?.trim().length > 0);
        }
      ),
      amount: Yup.number()
        .required("This field is required.")
        .min(1, "The amount must be at least 1.")
        .max(
          invoiceData?.invoiceAccount,
          `The amount must be less than or equal to ${invoiceData?.invoiceAccount}.`
        ),
    }),
    onSubmit: async (values) => {
      setButtonLoader(true);
      if (!values?.date) {
        setError("Please select date");
      } else {
        if (paymentMethod === "Credit/debit card") {
          if (!values?.billing_id) {
            setError("Please select card");
            setButtonLoader(false);
            return;
          } else {
            setError("");
          }

          try {
            const object = {
              paymentDetails: {
                billing_id: Number(values?.billing_id),
                customer_vault_id: Number(values?.customer_vault_id),
                date: values?.date,
                company: tokenData?.company?.CompanyName,
                amount: values?.amount,
                CompanyId: localStorage?.getItem("CompanyId"),
                Total: invoiceData?.Total,
                CustomerId: invoiceData?.CustomerId,
                InvoiceId: invoiceData?.InvoiceId,
                method: "Card",
              },
            };

            const res = await AxiosInstance.post(
              "/invoice-payment/card-payment",
              object
            );
            if (res?.data?.statusCode === 100) {
              showToast.success(res?.data?.message);
              if (sentMail) {
                await sendMail();
              }
              fetchData();
            } else {
              sendToast(res?.data?.error || res?.data?.message);
            }
          } catch (error) {
            sendToast(error?.response?.data?.error);
          }
        } else if (paymentMethod === "ACH bank payment") {
          if (!values?.billing_id) {
            setError("Please select ACH account");
            setButtonLoader(false);
            return;
          } else {
            setError("");
          }
          try {
            const object = {
              paymentDetails: {
                billing_id: Number(values?.billing_id),
                customer_vault_id: Number(values?.customer_vault_id),
                date: values?.date,
                company: tokenData?.company?.CompanyName,
                amount: values?.amount,
                CompanyId: localStorage?.getItem("CompanyId"),
                Total: invoiceData?.Total,
                CustomerId: invoiceData?.CustomerId,
                InvoiceId: invoiceData?.InvoiceId,
                method: "ACH",
              },
            };

            const res = await AxiosInstance.post(
              "/invoice-payment/ach-payment",
              object
            );

            if (res?.data?.statusCode === 100) {
              showToast.success(res?.data?.message);
              if (sentMail) {
                await sendMail();
              }
              fetchData();
            } else {
              sendToast(res?.data?.error);
            }
          } catch (error) {
            sendToast(error?.response?.data?.error);
          }
        } else {
          try {
            if (paymentFormik?.values?.method === "Cash") {
              var object = {
                paymentDetails: {
                  date: values?.date,
                  company: tokenData?.company?.CompanyName,
                  amount: values?.amount,
                  CompanyId: localStorage?.getItem("CompanyId"),
                  Total: invoiceData?.Total,
                  CustomerId: invoiceData?.CustomerId,
                  InvoiceId: invoiceData?.InvoiceId,
                  method: "Cash",
                },
              };
            } else {
              object = {
                paymentDetails: {
                  date: values?.date,
                  cheque_number: values?.cheque_number,
                  company: tokenData?.company?.CompanyName,
                  amount: values?.amount,
                  CompanyId: localStorage?.getItem("CompanyId"),
                  Total: invoiceData?.Total,
                  CustomerId: invoiceData?.CustomerId,
                  InvoiceId: invoiceData?.InvoiceId,
                  method: "Cheque",
                },
              };
            }

            const res = await AxiosInstance.post(
              "/invoice-payment/payment",
              object
            );

            if (res?.data?.statusCode === 100) {
              showToast.success(res?.data?.message);
              if (sentMail) {
                await sendMail();
              }
              fetchData();
            } else {
              sendToast(res?.data?.error);
            }
          } catch (error) {
            sendToast(error?.response?.data?.error);
          }
        }
      }
      setButtonLoader(false);
    },
  });

  const fetchData = async () => {
    try {
      if (tokenData?.invoice?.InvoiceId) {
        const invoiceRes = await AxiosInstance.get(
          `/invoice-payment/${tokenData?.invoice?.InvoiceId}`
        );
        if (invoiceRes?.status === 200) {
          setInvoiceData(invoiceRes?.data?.invoiceData);
          paymentFormik.setFieldValue(
            "amount",
            invoiceRes?.data?.invoiceData?.invoiceAccount
          );
        } else {
        }
      }
    } catch (error) {
      console.error("Error:", error?.message);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (tokenData) {
      fetchData();
    }
  }, [tokenData]);

  useEffect(() => {
    const updateError = () => {
      if (error) {
        if (
          paymentFormik?.values?.date &&
          (paymentFormik?.values?.method === "ACH bank payment" ||
            paymentFormik?.values?.method === "Credit/debit card") &&
          paymentFormik?.values?.billing_id
        ) {
          setError("");
        } else {
          if (paymentFormik?.values?.method === "Credit/debit card") {
            setError("Plase select card");
          } else if (paymentFormik?.values?.method === "ACH bank payment") {
            setError("Plase select ACH account");
          } else {
            setError("");
          }
        }
      }
    };
    updateError();
  }, [paymentFormik]);

  const [open, setOpen] = useState(false);
  const [payment, setPayment] = useState({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (loader)
    return (
      <Grid
        className="d-flex flex-direction-row justify-content-center align-items-center Typography-5 m-5"
        style={{ height: "80vh", marginTop: "25%" }}
      >
        <LoaderComponent loader={loader} height="50" width="50" />
      </Grid>
    );
  else
    return (
      <>
        <Grid
          style={{
            height: "100vh",
            backgroundColor: "#f5f5f5",
            overflowY: "scroll",
          }}
        >
          <Grid
            style={{
              width: "100%",
              background: "#063164",
              padding: "10px",
            }}
          >
            <Grid
              className="d-flex justify-content-between align-items-center payment-header"
              style={{
                width: "100%",
                background: "#063164",
                padding: "10px",
              }}
            >
              {/* Logo Section */}
              <div className="d-flex align-items-center payment-header-sub">
                <img
                  src={AppLogo}
                  alt="Company Logo"
                  style={{ width: "200px", marginRight: "20px" }}
                />
              </div>

              <div className="customer-detail-sec d-flex flex-column payment-header-sub align-items-end">
                <Typography
                  className="text-white flex-grow-1 mb-2"
                  style={{
                    fontWeight: 700,
                    fontSize: "18px",
                  }}
                >
                  {invoiceData?.CompanyData?.CompanyName || "Company Name"}
                </Typography>

                <Typography className="mb-0 d-flex align-items-center">
                  {invoiceData?.CompanyData?.PhoneNumber ? (
                    <a
                      className="text-white"
                      style={{
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: 400,
                      }}
                      href={`tel:${invoiceData?.CompanyData?.PhoneNumber}`}
                    >
                      {invoiceData?.CompanyData?.PhoneNumber}
                    </a>
                  ) : (
                    "-"
                  )}
                  <img
                    src={ContactImage}
                    alt="Phone Icon"
                    style={{ height: "15px", paddingLeft: "5px" }}
                  />
                </Typography>
                <Typography className="d-flex align-items-center">
                  {invoiceData?.CompanyData?.EmailAddress ? (
                    <a
                      className="text-white"
                      style={{
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: 400,
                      }}
                      href={`mailto:${invoiceData?.CompanyData?.EmailAddress}`}
                    >
                      {invoiceData?.CompanyData?.EmailAddress}
                    </a>
                  ) : (
                    "-"
                  )}
                  <img
                    src={CustomerEmail}
                    alt="Email Icon"
                    style={{ height: "15px", paddingLeft: "5px" }}
                  />
                </Typography>
              </div>
            </Grid>
          </Grid>

          <Grid className="container mt-4">
            {invoiceData?.invoiceAccount !== "0.00" && (
              <Card
                style={{
                  borderRadius: "10px",
                  boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                }}
              >
                <CardBody>
                  <Grid
                    style={{
                      display: "flex",
                      // flexDirection: "column",
                      gap: "20px",
                      justifyContent: "space-between",
                    }}
                    className="Payment-main"
                  >
                    <Col
                      lg={7}
                      xl={7}
                      style={{
                        padding: "10px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      className="payment-section"
                    >
                      <Grid
                        className="p-2 text-blue-color h-100"
                        style={{ fontSize: "18px", fontWeight: 700 }}
                      >
                        Payment applied to invoice for{" "}
                        {invoiceData?.customer?.FirstName}{" "}
                        {invoiceData?.customer?.LastName}: Invoice #
                        {invoiceData?.InvoiceNumber} - {invoiceData?.Subject}
                        <Grid></Grid>
                        <Grid className="mt-3">
                          <Grid style={{ display: "none" }}>
                            <InputDropdown
                              options={paymentMethods}
                              onTextFieldChange={(event, newValue) => {
                                paymentFormik.setFieldValue("method", newValue);
                                setPaymentMethod(newValue);
                              }}
                              inputValue={paymentFormik?.values?.method}
                              value={paymentFormik?.values?.method || null}
                              onChange={(event, newValue) => {
                                paymentFormik?.setFieldValue(
                                  "method",
                                  newValue
                                );
                                setPaymentMethod(newValue);
                              }}
                              getOptionLabel={(option) => option || ""}
                              filterOptions={(options, state) => {
                                return options?.filter((option) =>
                                  option
                                    ?.toLowerCase()
                                    ?.includes(
                                      state?.inputValue?.toLowerCase() || ""
                                    )
                                );
                              }}
                              error={
                                paymentFormik?.touched?.method &&
                                Boolean(paymentFormik?.errors?.method)
                              }
                              helperText={
                                paymentFormik?.touched?.method &&
                                paymentFormik?.errors?.method
                              }
                              defaultValue="Cash"
                              name="method"
                              label="Payment Method"
                              type="text"
                            />
                          </Grid>

                          <Grid
                            spacing={2}
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {/* Amount Input */}
                            <Grid item style={{ width: "100%" }}>
                              <DollerInput
                                value={paymentFormik?.values?.amount}
                                onChange={paymentFormik?.handleChange}
                                onBlur={paymentFormik?.handleBlur}
                                error={
                                  paymentFormik?.touched?.amount &&
                                  Boolean(paymentFormik?.errors?.amount)
                                }
                                helperText={
                                  paymentFormik?.touched?.amount &&
                                  paymentFormik?.errors?.amount
                                }
                                InputLabelProps={{
                                  shrink:
                                    Boolean(paymentFormik?.values?.amount) ||
                                    paymentFormik?.touched?.amount,
                                }}
                                name="amount"
                                label="Remain Amount"
                                type="text"
                                className="text-blue-color w-100 mt-2 mb-3 paymentApplied_amout"
                                fieldHeight="56px"
                                placeholder="Enter Amount"
                                defaultValue={invoiceData?.invoiceAccount}
                              />
                            </Grid>

                            {/* Payment Date Picker */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              className="mb-3 paymentApplied_paymentDate paymentDateBottmSetHera"
                              style={{ display: "none" }}
                            >
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={["DatePicker"]}>
                                  <DatePicker
                                    label="Payment Date"
                                    className="w-100"
                                    views={["year", "month", "day"]}
                                    value={
                                      paymentFormik?.values?.date
                                        ? dayjs(paymentFormik?.values?.date)
                                        : null
                                    }
                                    onChange={(value) =>
                                      paymentFormik?.setFieldValue(
                                        "date",
                                        value
                                          ? dayjs(value).format("MM-DD-YYYY")
                                          : null
                                      )
                                    }
                                    name="date"
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderColor: "#063164",
                                        borderRadius: "0px",
                                        "& fieldset": {
                                          borderColor: "#063164",
                                        },
                                        "&:hover fieldset": {
                                          borderColor: "#063164",
                                        },
                                        "&.Mui-focused fieldset": {
                                          borderColor: "#063164",
                                        },
                                      },
                                    }}
                                  />
                                </DemoContainer>
                              </LocalizationProvider>
                            </Grid>
                          </Grid>

                          {paymentMethod === "Credit/debit card" && (
                            <CardPayment
                              paymentFormik={paymentFormik}
                              selectedCard={selectedCard}
                              setSelectedCard={setSelectedCard}
                              CustomerId={tokenData?.customer?.CustomerId}
                              CompanyId={tokenData?.company?.companyId}
                            />
                          )}

                          {error && (
                            <Grid style={{ color: "red" }}>{error}</Grid>
                          )}
                        </Grid>
                      </Grid>
                      <Grid className="d-flex justify-content-between align-items-end mt-4 p-2 cancel_emailReceipt_save">
                        <Grid className="payment-third">
                          {buttonLoader ? (
                            <Grid className="d-flex justify-content-end">
                              <ColorRing
                                height="30"
                                width="30"
                                colors={[
                                  "#000",
                                  "#000",
                                  "#000",
                                  "#000",
                                  "#000",
                                ]}
                                ariaLabel="circles-loading"
                                wrapperStyle={{}}
                                wrapperClass=""
                                visible={true}
                              />
                            </Grid>
                          ) : (
                            <Grid className="d-flex gap-3 saveEmail_savePay">
                              <WhiteButton
                                className="svaeBtnInVoicce"
                                onClick={() => {
                                  setSentMail(true);
                                  paymentFormik?.handleSubmit();
                                }}
                                label={
                                  <Typography className="text-blue-color full-sentence">
                                    Pay & Email Receipt
                                  </Typography>
                                }
                              />

                              <BlueButton
                                onClick={paymentFormik?.handleSubmit}
                                label={
                                  <Typography className="full-sentence">
                                    Pay
                                  </Typography>
                                }
                              />
                            </Grid>
                          )}
                        </Grid>
                        <Grid className="payment-fourth">
                          <Grid className="d-flex flex-md-row justify-content-between my-2 gap-2 ">
                            <Typography
                              className="text-blue-color"
                              style={{ fontWeight: 600, fontSize: "16px" }}
                            >
                              Total
                            </Typography>
                            <Typography
                              style={{
                                color: "#063164B2",
                                fontWeight: 600,
                                fontSize: "16px",
                              }}
                            >
                              {`$${new Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(invoiceData?.Total ?? 0)}`}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Col>

                    <Col
                      lg={5}
                      xl={5}
                      className="payment-section payment-section-last"
                    >
                      <img
                        src={Payment}
                        style={{ width: "100%", height: "auto" }}
                      />
                    </Col>
                  </Grid>
                </CardBody>
                <CardFooter></CardFooter>
              </Card>
            )}
          </Grid>

          {invoiceData?.invoiceAccount == "0.00" && (
            <Grid
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Card
                className={`p-4 mx-3 bg-transparent  leftSideMargin ${
                  invoiceData?.invoiceAccount !== "0.00"
                    ? "w-100"
                    : "w-50 bg-label-paid customer_detailPaid"
                }`}
                style={{
                  borderRadius: "20px",
                  border: "0.5px solid #063164",
                }}
              >
                <Typography
                  className="text-blue-color"
                  style={{ fontWeight: 600, fontSize: "22px" }}
                >
                  Customer Details
                </Typography>
                <Grid className="d-flex flex-column flex-md-row justify-content-between my-2 gap-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 500, fontSize: "16px" }}
                  >
                    Customer Name
                  </Typography>
                  <Typography
                    style={{
                      color: "#063164B2",
                      fontWeight: 400,
                      fontSize: "14px",
                    }}
                  >
                    {`${invoiceData?.customer?.FirstName || ""} 
              ${invoiceData?.customer?.LastName || ""}` || "-"}
                  </Typography>
                </Grid>
                <Grid className="d-flex flex-column flex-md-row justify-content-between my-2 gap-2">
                  <Typography
                    style={{ fontWeight: 500, fontSize: "16px" }}
                    className="w-100 text-blue-color"
                  >
                    Property Address
                  </Typography>
                  <Typography
                    style={{
                      color: "#063164B2",
                      fontWeight: 400,
                      fontSize: "14px",
                    }}
                    className="text-right w-100"
                  >
                    {invoiceData?.location &&
                      Object.entries(invoiceData?.location)
                        .map(([key, value]) => value || "")
                        .join(", ")}
                  </Typography>
                </Grid>
                <Grid className="d-flex flex-column flex-md-row justify-content-between my-2 gap-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 500, fontSize: "16px" }}
                  >
                    Invoice Number
                  </Typography>
                  <Typography
                    style={{
                      color: "#063164B2",
                      fontWeight: 400,
                      fontSize: "14px",
                    }}
                  >
                    #{invoiceData?.InvoiceNumber}
                  </Typography>
                </Grid>
                <Grid className="d-flex flex-column flex-md-row justify-content-between my-2 gap-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 500, fontSize: "16px" }}
                  >
                    Invoice Title
                  </Typography>
                  <Typography
                    style={{
                      color: "#063164B2",
                      fontWeight: 400,
                      fontSize: "14px",
                    }}
                  >
                    {invoiceData?.Subject || "Subject not available"}
                  </Typography>
                </Grid>
                <Divider style={{ background: "#063164" }} className="my-3" />
                <Grid className="d-flex flex-column flex-md-row justify-content-between my-2 gap-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 600, fontSize: "16px" }}
                  >
                    Total
                  </Typography>
                  <Typography
                    style={{
                      color: "#063164B2",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    {`$${new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(invoiceData?.Total ?? 0)}`}
                  </Typography>
                </Grid>
                <Grid style={{ maxHeight: "130px", overflowY: "auto" }}>
                  {invoiceData?.paymentHistory &&
                    invoiceData?.paymentHistory.length > 0 &&
                    invoiceData?.paymentHistory?.map((item, index) => (
                      <Grid>
                        <Grid
                          className="d-flex  flex-md-row justify-content-between my-1 gap-2"
                          key={index}
                        >
                          <Typography
                            style={{
                              color: "#089F57",
                              fontWeight: 600,
                              fontSize: "16px",
                              cursor: "pointer",
                            }}
                            className="w-100"
                          >
                            <Typography
                              style={{ borderBottom: "1px solid #089F57" }}
                            >
                              Payment
                            </Typography>
                          </Typography>
                          <Typography
                            style={{
                              fontWeight: 400,
                              fontSize: "14px",
                            }}
                            className="w-100 text-center text-blue-color"
                          >
                            {item?.date}
                          </Typography>
                          <Typography
                            style={{
                              color: "#063164B2",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                            className="w-100 text-end"
                          >
                            {`$${new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(item?.amount ?? 0)}`}
                          </Typography>
                        </Grid>
                      </Grid>
                    ))}
                </Grid>
                <Divider className="bg-blue-color my-3" />
                <Grid className="d-flex flex-md-row justify-content-between my-2 gap-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 600, fontSize: "16px" }}
                  >
                    Customer Balance
                  </Typography>
                  <Typography
                    style={{
                      color: "#063164B2",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {`$${new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(invoiceData?.customerAccount ?? 0)}`}
                  </Typography>
                </Grid>
                <Grid className="d-flex flex-column flex-md-row justify-content-between my-2 gap-2">
                  <Typography
                    className="text-blue-color"
                    style={{ fontWeight: 600, fontSize: "16px" }}
                  >
                    Account Balance
                  </Typography>
                  <Typography
                    style={{
                      color: "#063164B2",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {`$${new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(invoiceData?.invoiceAccount ?? 0)}`}
                  </Typography>
                </Grid>
                <Grid className="label-paid">Paid</Grid>
              </Card>
            </Grid>
          )}
        </Grid>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle style={{ fontWeight: 700, fontSize: "30px" }}>
            Payment
          </DialogTitle>
          <DialogContent>
            <Grid className="my-3">
              <InputText
                name="Title"
                placeholder="Invoice #1..."
                label="Applied to"
                type="Title"
                className="text-blue-color w-100"
                fieldHeight="56px"
                disable={true}
                defaultValue={`${invoiceData?.Subject}`}
              />
            </Grid>
            <Grid className="my-3">
              <InputText
                name="Title"
                placeholder="09 Sept, 2024..."
                label="Transaction Date"
                type="Title"
                className="text-blue-color w-100"
                fieldHeight="56px"
                disable={true}
                defaultValue={`${paymentFormik?.values?.date}`}
              />
            </Grid>
            <Grid className="my-3">
              <InputText
                name="Title"
                placeholder="Cash..."
                label="Method"
                type="Title"
                className="text-blue-color w-100"
                fieldHeight="56px"
                disable={true}
                defaultValue={`${payment?.method}`}
              />
            </Grid>
            <Typography className="text-blue-colo heading-fourr">
              Info
            </Typography>
            <Grid className="my-3">
              <InputText
                name="Title"
                placeholder="80.00..."
                label="Amount"
                type="Title"
                className="text-blue-color w-100"
                fieldHeight="56px"
                disable={true}
                defaultValue={`${payment?.amount}`}
              />
            </Grid>
            <Grid className="my-3">
              <InputText
                name="Title"
                placeholder="Payment applied to invoice #1..."
                label="Details"
                type="Title"
                className="text-blue-color w-100"
                fieldHeight="56px"
                disable={true}
                defaultValue={`Payment applied to invoice #${invoiceData?.InvoiceNumber}`}
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} outline className="btn">
              Cancel
            </Button>
            <Button outline>Download Pdf</Button>
            <Button outline className="bg-blue-color text-white-color">
              Email Receipt
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
};

export default InvoiceLivePayment;
