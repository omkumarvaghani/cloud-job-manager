import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormGroup,
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
// import CardPayment from "./Payment/CardPayment";
// import AchPayment from "./Payment/AchPayment";
import { Circles, ColorRing } from "react-loader-spinner";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Table,
} from "reactstrap";
// import "./style.css";
import "../Invoice/style.css";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { LoaderComponent } from "../../../components/Icon/Index";
import showToast from "../../../components/Toast/Toster";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";
import CardPayment from "../Invoice/Payment/CardPayment";
import AchPayment from "../Invoice/Payment/AchPayment";
import { CleaningServicesOutlined, X } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

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

  const [buttonLoader, setButtonLoader] = useState(false);

  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
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
                method: "ACH",
              },
            };

            const res = await AxiosInstance.post(
              "/invoice-payment/ach-payment",
              object
            );

            if (res?.data?.statusCode === 100) {
              showToast.success(res?.data?.message);

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

  const invoiceId = "1737637905702";

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setCompanyData(res?.data);
      if (invoiceId) {
        const invoiceRes = await AxiosInstance.get(
          `/invoice-payment/${invoiceId}`
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

  const [rows, setRows] = useState([
    { id: 1, account: "Select", amount: "", balance: "", dropdownOpen: false },
  ]);

  // Toggle Dropdown
  const toggleDropdown = (id) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, dropdownOpen: !row.dropdownOpen } : row
      )
    );
  };

  // Handle Dropdown Selection
  const handleSelect = (id, item) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, account: item, dropdownOpen: false } : row
      )
    );
  };

  // Handle Amount Change
  const handleAmountChange = (id, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, amount: value } : row))
    );
  };

  // Calculate Total Amount
  const totalAmount = rows.reduce(
    (sum, row) => sum + (parseFloat(row.amount) || 0),
    0
  );

  // Add New Row
  const handleAddRow = () => {
    const newRow = {
      id: rows.length + 1,
      account: "Select",
      amount: "",
      balance: "",
      dropdownOpen: false,
    };
    setRows([...rows, newRow]);
  };

  // Delete Row
  const handleDeleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
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
                    <Grid className="d-flex gap-2">
                      <Col lg={4} md={6} sm={12} style={{ paddingTop: "8px" }}>
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
                      </Col>
                      <Col lg={4} md={6} sm={12} style={{ paddingTop: "8px" }}>
                        <InputText
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
                           placeholder="Enter Amount"
                          className="text-blue-color w-100 m-0 mb-3 paymentApplied_amout"
                          fieldHeight="56px"
                          defaultValue={invoiceData?.invoiceAccount}
                        />
                      </Col>
                      <Col
                        lg={4}
                        md={6}
                        sm={12}
                        className="mb-3 paymentApplied_paymentDate paymentDateBottmSetHera my-0 mt-0"
                      >
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
                                  value
                                    ? dayjs(value).format("MM-DD-YYYY")
                                    : null
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
                      </Col>
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
                <Grid>
                  <Row className="mt-3">
                    <Col lg="12">
                      <FormGroup>
                        <label
                          className="form-control-label fontstylerentr titleecolor fontfamilysty"
                          style={{ fontWeight: "500", fontSize: "16px" }}
                        >
                          Apply Payment to Balances
                        </label>
                        <br />
                        <label
                          className="form-control-label fontstylerentr titleecolor fontfamilysty"
                          style={{ fontWeight: "500", fontSize: "16px" }}
                        >
                          Current Balance:
                        </label>
                        <div className="table-responsive mt-3">
                          <Table
                            className="table table-bordered"
                            style={{
                              borderCollapse: "collapse",
                              border: "1px solid #152B51",
                            }}
                          >
                            <thead>
                              <tr
                                className="fontstylerentr textcolorblue fontfamilysty"
                                style={{ fontSize: "16px", fontWeight: "500" }}
                              >
                                <th>Account</th>
                                <th>Amount</th>
                                <th>Balance</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row) => (
                                <tr key={row.id}>
                                  <td>
                                    <Dropdown
                                      isOpen={row.dropdownOpen}
                                      toggle={() => toggleDropdown(row.id)}
                                    >
                                      <DropdownToggle
                                        caret
                                        style={{
                                          width: "100%",
                                          backgroundColor: "transparent",
                                          height: "50px",
                                          borderRadius: "4px",
                                        }}
                                        className="text-blue-color"
                                      >
                                        {row.account}
                                      </DropdownToggle>
                                      <DropdownMenu
                                        style={{
                                          zIndex: 999,
                                          maxHeight: "200px",
                                          overflowY: "auto",
                                        }}
                                      >
                                        <DropdownItem
                                          className="text-blue-color"
                                          onClick={() =>
                                            handleSelect(
                                              row.id,
                                              "Add new account"
                                            )
                                          }
                                        >
                                          Add new account
                                        </DropdownItem>
                                        <DropdownItem
                                          className="text-blue-color"
                                          onClick={() =>
                                            handleSelect(row.id, "Hey")
                                          }
                                        >
                                          Hey
                                        </DropdownItem>
                                      </DropdownMenu>
                                    </Dropdown>
                                  </td>
                                  <td>
                                    <Input
                                      className="mb-3 border-blue-color text-blue-color"
                                      style={{
                                        fontSize: "15px",
                                        height: "46px",
                                        width: "100%",
                                      }}
                                      type="number"
                                      placeholder="Enter Amount"
                                      value={row.amount}
                                      onChange={(e) =>
                                        handleAmountChange(
                                          row.id,
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Input
                                      className="mb-3 border-blue-color text-blue-color"
                                      style={{
                                        fontSize: "15px",
                                        height: "46px",
                                        width: "100%",
                                      }}
                                      type="number"
                                      placeholder="$0.00"
                                      disabled
                                    />
                                  </td>
                                  <td>
                                    <CloseIcon
                                      onClick={() => handleDeleteRow(row.id)}
                                      style={{
                                        cursor: "pointer",
                                        color: "red",
                                      }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <th
                                  className="fontstylerentmodal textcolorblue fontfamilysty"
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    border: "1px solid #152B51",
                                  }}
                                >
                                  Total
                                </th>
                                <th
                                  className="fontstylerentmodal textcolorblue fontfamilysty"
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    border: "1px solid #152B51",
                                  }}
                                >
                                  $ {totalAmount.toFixed(2)}
                                </th>
                                <th colSpan="2"></th>
                              </tr>
                              <tr>
                                <td colSpan="4">
                                  <Button
                                    className="btn fontstylerentmodal backgroundwhitesty textcolorblue fontfamilysty"
                                    style={{
                                      border: "0.5px solid #152B51",
                                      fontSize: "16px",
                                      fontWeight: "500",
                                    }}
                                    onClick={handleAddRow}
                                  >
                                    Add Row
                                  </Button>
                                </td>
                              </tr>
                            </tfoot>
                          </Table>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
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
        </Grid>
      )}
    </>
  );
};

export default InvoicePayment;
