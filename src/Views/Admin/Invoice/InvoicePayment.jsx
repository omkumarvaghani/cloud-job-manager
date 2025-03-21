import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
import { handleAuth } from "../../../components/Login/Auth";
import sendToast from "../../../components/Toast/sendToast";
import AxiosInstance from "../../AxiosInstance";
import CardPayment from "./Payment/CardPayment";
import AchPayment from "./Payment/AchPayment";
import { Circles, ColorRing } from "react-loader-spinner";
import { Button } from "reactstrap";
import "./style.css";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { LoaderComponent } from "../../../components/Icon/Index";
import showToast from "../../../components/Toast/Toster";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";
import DollerInput from "../../../components/InputFields/Doller";

const InvoicePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { CompanyName } = useParams();
  const [invoiceData, setInvoiceData] = useState();

  let paymentMethods = [
    "Cash",
    "ACH bank payment",
    "Check",
    "Credit/debit card",
  ];

  if (invoiceData?.planData === "Trial Plan") {
    paymentMethods = paymentMethods.filter(
      (method) => !["ACH bank payment", "Credit/debit card"].includes(method)
    );
  }
  const [buttonLoader, setButtonLoader] = useState(false);
  const sendMail = async () => {
    try {
      const mailRes = await AxiosInstance.post(
        `/invoice-payment/send_mail/${location?.state?.id}`
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
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [sentMail, setSentMail] = useState(false);
  const paymentFormik = useFormik({
    initialValues: {
      method: "Cash",
      amount: invoiceData?.invoiceAccount,
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
                company: CompanyName,
                amount: values?.amount,
                CompanyId: localStorage?.getItem("CompanyId"),
                Total: invoiceData?.Total,
                CustomerId: invoiceData?.CustomerId,
                InvoiceId: invoiceData?.InvoiceId,
                account_id: invoiceData?.account_id,
                InvoiceNumber: invoiceData?.InvoiceNumber,
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
                company: CompanyName,
                amount: values?.amount,
                CompanyId: localStorage?.getItem("CompanyId"),
                Total: invoiceData?.Total,
                CustomerId: invoiceData?.CustomerId,
                InvoiceId: invoiceData?.InvoiceId,
                InvoiceNumber: invoiceData?.InvoiceNumber,
                account_id: invoiceData?.account_id,
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
                  company: CompanyName,
                  amount: values?.amount,
                  CompanyId: localStorage?.getItem("CompanyId"),
                  Total: invoiceData?.Total,
                  CustomerId: invoiceData?.CustomerId,
                  InvoiceId: invoiceData?.InvoiceId,
                  InvoiceNumber: invoiceData?.InvoiceNumber,
                  account_id: invoiceData?.account_id,
                  method: "Cash",
                },
              };
            } else {
              object = {
                paymentDetails: {
                  date: values?.date,
                  cheque_number: values?.cheque_number,
                  company: CompanyName,
                  amount: values?.amount,
                  CompanyId: localStorage?.getItem("CompanyId"),
                  Total: invoiceData?.Total,
                  CustomerId: invoiceData?.CustomerId,
                  InvoiceId: invoiceData?.InvoiceId,
                  InvoiceNumber: invoiceData?.InvoiceNumber,
                  account_id: invoiceData?.account_id,
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

  const [selectedCard, setSelectedCard] = useState(undefined);
  const [companyData, setCompanyData] = useState(undefined);
  const [loader, setLoader] = useState(true);

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setCompanyData(res?.data);
      if (location?.state?.id) {
        const invoiceRes = await AxiosInstance.get(
          `/invoice-payment/${location?.state?.id}`
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
    fetchData();
  }, []);

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

  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid
          className={`d-flex flex-column flex-lg-row w-auto gap-2 mx-2 paymentAppliedSlip ${
            invoiceData?.invoiceAccount !== "0.00"
              ? ""
              : "justify-content-center"
          }`}
        >
          {invoiceData?.invoiceAccount !== "0.00" && (
            <Card
              className="p-4 mx-3 w-100 border-blue-color leftSideMargin"
              style={{ borderRadius: "20px", border: "0.5px solid " }}
            >
              <Grid className="d-flex flex-column justify-content-between h-100 text-blue-color">
                <Grid>
                  <Typography
                    style={{
                      fontWeight: 600,
                      fontSize: "22px",
                    }}
                  >
                    Payment applied to Invoice #{invoiceData?.InvoiceNumber}
                  </Typography>
                  <Grid className="mt-5">
                    <Grid>
                      <InputDropdown
                        options={paymentMethods}
                        onTextFieldChange={(event, newValue) => {
                          paymentFormik.setFieldValue("method", newValue);
                          setPaymentMethod(newValue);
                        }}
                        inputValue={paymentFormik?.values?.method}
                        value={paymentFormik?.values?.method || null}
                        onChange={(event, newValue) => {
                          paymentFormik?.setFieldValue("method", newValue);
                          setPaymentMethod(newValue);
                        }}
                        getOptionLabel={(option) => option || ""}
                        filterOptions={(options, state) => {
                          return options?.filter((option) =>
                            option
                              ?.toLowerCase()
                              ?.includes(state?.inputValue?.toLowerCase() || "")
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
                    <Grid>
                      <DollerInput
                        placeholder="Enter Amount"
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
                        name="amount"
                        label="Amount"
                        type="text"
                        className="text-blue-color w-100 m-0 mb-3 paymentApplied_amout"
                        // fieldHeight="56px"
                        defaultValue={invoiceData?.invoiceAccount}
                      />
                    </Grid>
                    <Grid className="mb-3 paymentApplied_paymentDate paymentDateBottmSetHera">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer
                          components={[
                            "DatePicker",
                            "DatePicker",
                            "DatePicker",
                          ]}
                        >
                          <DatePicker
                            label="Payment Date"
                            views={["year", "month", "day"]}
                            value={
                              paymentFormik?.values?.date
                                ? dayjs(paymentFormik?.values?.date)
                                : null
                            }
                            onChange={(value) =>
                              paymentFormik?.setFieldValue(
                                "date",
                                value ? dayjs(value).format("MM-DD-YYYY") : null
                              )
                            }
                            name="date"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderColor: "#063164",
                                borderRadius: "8px",
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
                    {paymentMethod === "Credit/debit card" && (
                      <CardPayment
                        paymentFormik={paymentFormik}
                        selectedCard={selectedCard}
                        setSelectedCard={setSelectedCard}
                        CustomerId={invoiceData?.CustomerId}
                      />
                    )}
                    {paymentMethod === "ACH bank payment" && (
                      <AchPayment
                        paymentFormik={paymentFormik}
                        selectedAccount={selectedCard}
                        setSelectedAccount={setSelectedCard}
                        companyData={companyData}
                        CustomerId={invoiceData?.CustomerId}
                      />
                    )}
                    {paymentMethod === "Check" && (
                      <InputText
                        value={paymentFormik?.values?.cheque_number}
                        onChange={paymentFormik?.handleChange}
                        onBlur={paymentFormik?.handleBlur}
                        error={
                          paymentFormik?.touched?.cheque_number &&
                          Boolean(paymentFormik?.errors?.cheque_number)
                        }
                        helperText={
                          paymentFormik?.touched?.cheque_number &&
                          paymentFormik?.errors?.cheque_number
                        }
                        name="cheque_number"
                        label="Check Number"
                        type="text"
                        className="text-blue-color w-100 m-0 mb-3 accountInformationInputTop checkNumberInputPayment chechNumberDropDOwn"
                        fieldHeight="56px"
                      />
                    )}
                    {error && <Grid style={{ color: "red" }}>{error}</Grid>}
                  </Grid>
                </Grid>
                <Grid className="d-flex justify-content-between align-items-end mt-4 cancel_emailReceipt_save">
                  <Grid className="cancelinvoiceGrid">
                    <WhiteButton
                      className="cancelBtnInVoicce eui"
                      onClick={() => navigate(-1)}
                      label={
                        <>
                          <Typography className="text-blue-color full-sentence ">
                            Cancel
                          </Typography>
                        </>
                      }
                    />
                  </Grid>
                  {buttonLoader ? (
                    <Grid className="d-flex justify-content-end">
                      <ColorRing
                        height="30"
                        width="30"
                        colors={["#000", "#000", "#000", "#000", "#000"]}
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
                            Save & Email Receipt
                          </Typography>
                        }
                      />

                      <BlueButton
                        onClick={paymentFormik?.handleSubmit}
                        label={
                          <Typography className="full-sentence">
                            Save
                          </Typography>
                        }
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Card>
          )}
          <Card
            className={`p-4 mx-3 bg-transparent leftSideMargin ${
              invoiceData?.invoiceAccount !== "0.00"
                ? "w-100"
                : "w-50 bg-label-paid customer_detailPaid"
            }`}
            style={{ borderRadius: "20px", border: "0.5px solid #063164" }}
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
                {invoiceData?.Subject || invoiceData?.account_name}
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
            {invoiceData?.paymentHistory?.length > 0 && (
              <Grid>
                <Grid
                  className="d-flex flex-md-row justify-content-between my-2 gap-2 bg-orange-color text-white-color  text-center"
                  style={{
                    // backgroundColor: "#E6F4FF",
                    padding: "9px 12px",
                    borderRadius: "5px",
                    fontWeight: 700,
                  }}
                >
                  <Typography
                    style={{
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                    className="w-100  "
                  >
                    Payment
                  </Typography>
                  <Typography
                    style={{
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                    className="w-100 "
                  >
                    Method
                  </Typography>
                  <Typography
                    style={{
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                    className="w-100 "
                  >
                    TransactionID
                  </Typography>
                  <Typography
                    style={{
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                    className="w-100 "
                  >
                    Date
                  </Typography>
                  <Typography
                    style={{
                      // color: "#063164",
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                    className="w-100 "
                  >
                    Amount
                  </Typography>
                </Grid>
                <Grid
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                  }}
                >
                  {invoiceData?.paymentHistory &&
                    invoiceData?.paymentHistory.length > 0 &&
                    invoiceData?.paymentHistory?.map((item, index) => (
                      <Grid>
                        <Grid
                          className="d-flex  flex-md-row justify-content-between my-3 gap-2  text-center"
                          key={index}
                        >
                          <Typography
                            style={{
                              color: "#089F57",
                              fontWeight: 600,
                              fontSize: "16px",
                              cursor: "pointer",
                              marginLeft: "10px",
                            }}
                            className="w-100 "
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
                            className="w-100  text-blue-color"
                          >
                            {item?.method}
                          </Typography>
                          <Typography
                            style={{
                              fontWeight: 400,
                              fontSize: "14px",
                            }}
                            className="w-100  text-blue-color"
                          >
                            {item?.transactionid || "-"}
                          </Typography>
                          <Typography
                            style={{
                              fontWeight: 400,
                              fontSize: "14px",
                            }}
                            className="w-100  text-blue-color"
                          >
                            {item?.date}
                          </Typography>
                          <Typography
                            style={{
                              color: "#063164B2",
                              fontWeight: 500,
                              fontSize: "14px",
                            }}
                            className="w-100 "
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
              </Grid>
            )}
            <Divider className="bg-blue-color my-3" />
            <Grid className="d-flex flex-column flex-md-row justify-content-between my-2 gap-2">
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
            <Grid className="label-paid " style={{ zIndex: "1" }}>
              Paid
            </Grid>
          </Card>

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
        </Grid>
      )}
    </>
  );
};

export default InvoicePayment;
