import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import moment from "moment";
import InvoiceBlue from "../../../assets/Blue-sidebar-icon/Invoice.svg";
import PaymentBlue from "../../../assets/Orange-icons/payment.svg";
import CustomerPayment from "../../../assets/orange-icon/customerPayment.svg"
import PaymentChargw from "../../../assets/Blue-sidebar-icon/paymentCharge.svg"
import "./style.css";
import { Box, CircularProgress } from "@mui/material";
import swal from "sweetalert";
import * as XLSX from "xlsx";
import BlueButton from "../../Button/BlueButton";
import WhiteButton from "../../Button/WhiteButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import showToast from "../../Toast/Toster";
import InputText from "../../InputFields/InputText";
import { LoaderComponent } from "../../Icon/Index";
import AxiosInstance from "../../../Views/AxiosInstance";
import { handleAuth } from "../../Login/Auth";

function BillingHistory({ data, getData }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tokenDecode, setTokenDecode] = useState({});
  const [totalBalance, settotalBalance] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [DateDecode, setDateDecode] = useState({});

  useEffect(() => {
    handleAuth(navigate, location);
  }, []);

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [DateDecode]);


  const fetchTransactions = async () => {
    try {
      const id = location.state?.id || localStorage.getItem("CustomerId");
      const encodedId = encodeURIComponent(id);

      const response = await AxiosInstance.get(
        `/general_ledger/charges_payments/${encodedId}`
      );

      if (Array.isArray(response.data.data)) {
        setTransactions(response.data.data);
        settotalBalance(response.data);
      } else {
        console.error("API response is not an array:", response.data.data);
        setError("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(
        `Error: ${error.response ? error.response.data : error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const [collectSignatureLoader, setCollectSignatureLoader] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedReport, setSelectedReport] = useState("Select Report Type");
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [addChargeOpen, setAddChargeOpen] = useState(false);
  const [dropdownOpens, setDropdownOpens] = useState(false);
  const toggle = () => setDropdownOpens((prevState) => !prevState);

  const simulateProgress = () => {
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 5;
      setProgress(simulatedProgress);

      if (simulatedProgress >= 100) {
        clearInterval(interval);
      }
    }, 100);
  };

  const handleDownload = async (format, e) => {
    setIsLoading(true);
    setSelectedFormat(format);

    const requestData = {
      ispdf: format === "PDF",
      iscsv: format === "CSV",
      isexcel: format === "Excel",
    };

    try {
      const willDelete = await swal({
        title: "Are you sure?",
        text: "You want to download!",
        icon: "warning",
        buttons: ["Cancel", "Process"],
        dangerMode: true,
      });
      if (willDelete) {
        setCollectSignatureLoader(true);
        setProgress(0);
        simulateProgress();
        const res = await AxiosInstance.post(
          `/general_ledger/charges_payments/report/${data?.CustomerId}`,
          requestData
        );

        if (res.data.statusCode === 200) {
          const fileName = res?.data?.fileName;
          const fileUrl = `http://localhost:9278/cdn/upload/${fileName}`;

          setPreviewFile(fileUrl);

          if (format === "PDF") {
            setPreviewFile(fileUrl);
          } else {
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            if (format === "CSV") {
              parseCSV(blob);
            } else {
              parseExcel(blob);
            }
          }

          setShowPreview(true);
        } else {
          console.error("Failed to generate report:", res.data);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setCollectSignatureLoader(false);
      setProgress(0);
    }
  };

  const parseCSV = async (blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").map((row) => row.split(","));
      setCsvData(rows);
    };
    reader.readAsText(blob);
  };

  const parseExcel = async (blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setCsvData(jsonData);
    };
    reader.readAsArrayBuffer(blob);
  };

  const downloadFile = async () => {
    if (!previewFile) {
      console.error("No file URL available for download.");
      return;
    }

    try {
      const response = await fetch(previewFile);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download =
        selectedFormat === "CSV"
          ? "output.csv"
          : selectedFormat === "PDF"
          ? "payment_document.pdf"
          : "quotes_document.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
    setCsvData(null);
  };

  const [customerCardsModal, setCustomerCardsModal] = useState(false);

  const cardToggle = () => setCustomerCardsModal(!customerCardsModal);
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);

  const toggleFrequencyDropdown = () =>
    setFrequencyDropdownOpen(!frequencyDropdownOpen);

  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedChargeAccountId, setSelectedChargeAccountId] = useState("");

  const [selectChargeDropDown, setSelectChargetDropDown] = useState(false);
  const [selectCard, setSelectCard] = useState(false);
  const [selectDayOfMonth, setSelectDayOfMonth] = useState(false);
  const [accountTypeName, setAccountTypeName] = useState("");
  const [addBankAccountDialogOpen, setAddBankAccountDialogOpen] =
    useState(false);
  const [weekdayDropdownOpen, setWeekdayDropdownOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const [openRecurringDialog, setOpenRecurringDialog] = useState(false);
  const [LiabilityAccounts, setLiabilityAccounts] = useState([]);
  const [AssetAccounts, setAssetAccounts] = useState([]);
  const [EquityAccounts, setEquityAccounts] = useState([]);
  const [RevenueAccounts, setRevenueAccounts] = useState([]);
  const [ExpenseAccounts, setExpenseAccounts] = useState([]);
  const [recAccounts, setRecAccounts] = useState([]);
  const [oneTimeAccounts, setoneTimeAccounts] = useState([]);
  const handleClose = () => {
    setOpenRecurringDialog(false);
    setOpenRecurringDialog(false);
  };

  const toggles1 = () => setSelectChargetDropDown(!selectChargeDropDown);
  const AddNewAccountName = async (accountName) => {
    toggleAddBankDialog();
    setAccountTypeName(accountName);
  };
  const toggleWeekdayDropdown = () =>
    setWeekdayDropdownOpen(!weekdayDropdownOpen);

  const handleEditClick = (id) => {
    setPaymentOpen({ isOpen: true, propertyData: null });
  };

  const toggleAddBankDialog = () => {
    setAddBankAccountDialogOpen((prevState) => !prevState);
  };
  const [selectedAccount, setSelectedAccount] = useState("");

  const CompanyId = localStorage?.getItem("CompanyId");
  const CustomerId = location?.state?.id;

  const handleAddButtonClick = () => {
    setPaymentOpen(false);
  };
  const handleAddChargeButtonClick = () => {
    setAddChargeOpen(false);
  };

  const handleConfigClick = () => {
    setConfigOpen(false);
  };
  const chargeFormik = useFormik({
    initialValues: {
      CompanyId: CompanyId,
      CustomerId: CustomerId,
      account_id: selectedChargeAccountId || "",
      description: "",
      amount: "",
    },
    validationSchema: Yup.object({
      account_id: Yup.string().required("Account is required"),
      amount: Yup.number()
        .typeError("Amount must be a number")
        .required("Amount is required")
        .positive("Amount must be greater than zero"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const chargedataToPost = {
          CompanyId: CompanyId,
          CustomerId: CustomerId,
          ...values,
        };
        const res = await AxiosInstance.post(`/charge`, chargedataToPost);
        if (res.data.statusCode === 200) {
          showToast.success("Charge Added Successfully");
          resetForm();
          setSelectedChargeAccountId("");
          setAddChargeOpen(false);
          fetchTransactions();
        } else {
          showToast.error(res.data.message);
        }
      } catch (error) {
        console.error("Error: ", error.message);
      } finally {
        getData();
        fetchTransactions();
      }
    },
  });
  const fetchAccounts = async () => {
    if (localStorage.getItem("CompanyId")) {
      try {
        const res = await AxiosInstance.get(
          `/account/accounts/${localStorage.getItem("CompanyId")}`
        );
        if (res.data.statusCode === 200) {
          const filteredData1 = res.data.data.filter(
            (item) => item.account_type === "Asset"
          );
          const filteredData2 = res.data.data.filter(
            (item) => item.account_type === "Liability"
          );
          const filteredData3 = res.data.data.filter(
            (item) => item.account_type === "Equity"
          );
          const filteredData4 = res.data.data.filter(
            (item) => item.account_type === "Revenue"
          );
          const filteredData5 = res.data.data.filter(
            (item) => item.account_type === "Expense"
          );
          setAssetAccounts(filteredData1);
          setLiabilityAccounts(filteredData2);
          setEquityAccounts(filteredData3);
          setRevenueAccounts(filteredData4);
          setExpenseAccounts(filteredData5);
        } else if (res.data.statusCode === 201) {
          setRecAccounts();
          setoneTimeAccounts();
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };
  useEffect(() => {
    fetchAccounts();
  }, [localStorage.getItem("CompanyId")]);

  return (
    <>
      <Grid className="justify-content-center align-items-center client ">
        <Grid>
          {/* Loader container */}
          {collectSignatureLoader ? (
            <Grid
              container
              className="d-flex justify-content-center align-items-center"
              style={{ height: "50vh", position: "relative" }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={90}
                  thickness={2}
                  sx={{
                    color: "#E88C44",
                  }}
                />
                <Typography
                  className="text-blue-color"
                  variant="caption"
                  component="div"
                  color="textSecondary"
                  style={{
                    position: "absolute",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  {`${progress}%`}
                </Typography>
              </Box>
            </Grid>
          ) : (
            <Grid
              container
              className="d-flex justify-content-end gap-2 mb-2 justify-contentRemove"
            >
              <BlueButton
                label="Add Charge"
                onClick={() => setAddChargeOpen(true)}
              />

              <Grid>
                <Dropdown isOpen={dropdownOpens} toggle={toggle}>
                  <DropdownToggle className="bg-blue-color">
                    {isLoading ? "Downloading..." : "Select Report Format"}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleDownload("CSV")}>
                      CSV
                    </DropdownItem>
                    <DropdownItem onClick={() => handleDownload("PDF")}>
                      PDF
                    </DropdownItem>
                    <DropdownItem onClick={() => handleDownload("Excel")}>
                      Excel
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </Grid>
            </Grid>
          )}
        </Grid>
        <Grid
          style={{
            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            borderRadius: "8px",
            border: "0.5px solid ",
          }}
          className=" border-blue-color general-ledger-table"
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center p-1 Typography-2 general-ledger-tableData"
            style={{ border: "none" }}
          >
            <Typography
              className="text-blue-color billing_history heading-five"
              style={{
                fontWeight: 600,
                fontSize: "26px",
                paddingLeft: "12px",
              }}
            >
              General Ledger
            </Typography>
            <Grid className="d-flex" style={{ paddingRight: "17px" }}>
              <Typography
                className="text-blue-color billing_history "
                style={{
                  fontWeight: 600,
                  fontSize: "17px",
                  paddingLeft: "12px",
                }}
              >
                Amount
              </Typography>{" "}
              <Typography
                className="text-blue-color billing_history "
                style={{
                  fontWeight: 600,
                  fontSize: "17px",
                  paddingLeft: "12px",
                }}
              >
                Balance
              </Typography>
            </Grid>
          </CardHeader>

          <CardBody
            style={{
              padding: "10px 0px",
              maxHeight: "300px",
              overflowY: "auto",
              scrollbarWidth: "thin",
            }}
            className="d-flex flex-column mx-3 general-ledger-tableData"
          >
            {loading && (
              <Grid
                className="d-flex flex-direction-row justify-content-center align-items-center Typography-5 m-5"
                style={{ height: "80vh", marginTop: "25%" }}
              >
                <LoaderComponent loader={loading} height="50" width="50" />
              </Grid>
            )}
            {error && <Typography>{error}</Typography>}
            {!loading && !error ? (
              transactions.length > 0 ? (
                transactions.map((item, index) => (
                  <Grid
                    key={index}
                    className="d-flex justify-content-between my-2"
                  >
                    <Grid className="d-flex">
                      <Grid
                        style={{
                          backgroundColor: "rgba(6, 49, 100, 10%)",
                          borderRadius: "50%",
                          height: "50px",
                          width: "50px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={
                            item.type === "payment"
                              ? item.InvoiceId
                                ? PaymentBlue
                                : CustomerPayment
                              : item.InvoiceId
                              ? InvoiceBlue
                              : PaymentChargw
                          }
                          alt="Transaction Icon"
                        />
                      </Grid>

                      <Grid className="mx-2">
                        <Typography
                          className="mb-0 my-2 text-blue-color"
                          style={{ fontSize: "16px", fontWeight: 600 }}
                        >
                          {moment(item?.createdAt).format(dateFormat)}
                        </Typography>
                        <Typography
                          className="text-blue-color"
                          style={{ fontSize: "14px" }}
                        >
                          {item.type === "payment" ? (
                            item.InvoiceNumber ? (
                              `Payment For Invoice #${item.InvoiceNumber}`
                            ) : (
                              <>
                                Payment received
                                {item.account_name && (
                                  <>
                                    {" "}
                                    For : <strong>{item.account_name}</strong>
                                  </>
                                )}
                              </>
                            )
                          ) : item.InvoiceNumber ? (
                            `Invoice Created - Invoice #${item.InvoiceNumber}`
                          ) : item.IsRecurring ? (
                            <>
                              Recurring Charge Applied
                              {item.account_name && (
                                <>
                                  For : <strong>{item.account_name}</strong>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              Charge applied
                              {item.account_name && (
                                <>
                                  For : <strong>{item.account_name}</strong>
                                </>
                              )}
                            </>
                          )}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid className="d-flex align-items-end">
                      <Typography
                        className="text-blue-color"
                        style={{ fontSize: "14px", paddingRight: "35px" }}
                      >
                        {item.type === "payment"
                          ? `-$${item.amount.toFixed(2)}`
                          : `+$${item.amount.toFixed(2)}`}
                      </Typography>
                      <Typography
                        className="text-blue-color"
                        style={{ fontSize: "14px" }}
                      >
                        ${item.balance.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                ))
              ) : (
                <Typography>No transactions found</Typography>
              )
            ) : null}
          </CardBody>

          <CardFooter
            className="d-flex border-blue-color justify-content-between bg-orange-color text-white-color general-ledger-tableData"
            style={{
              borderTop: "1px solid",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              alignItems: "center",
              padding: "6px 10px 7px",
            }}
          >
            <Typography>Current Balance</Typography>
            <Typography>${totalBalance?.totalBalance}</Typography>
          </CardFooter>
        </Grid>
      </Grid>

      <Modal
        isOpen={showPreview}
        toggle={closePreview}
        style={{ maxWidth: "800px", overflowY: "auto" }}
      >
        <ModalHeader
          toggle={closePreview}
          className="text-blue-color border-orange-color"
          style={{ borderBottom: "3px solid" }}
        >
          Preview - {selectedFormat}
        </ModalHeader>
        <ModalBody
          style={{ overflowX: "auto", overflowY: "auto", maxHeight: "500px" }}
        >
          {selectedFormat === "PDF" && previewFile ? (
            <iframe
              src={previewFile}
              width="100%"
              height="400px"
              style={{ border: "none" }}
            ></iframe>
          ) : (selectedFormat === "CSV" || selectedFormat === "Excel") &&
            csvData ? (
            <table border="1" width="100%" style={{ padding: "10px" }}>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ padding: "10px" }}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="text-blue-color"
                        style={{ padding: "8px", fontSize: "12px" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Loading preview...</p>
          )}
        </ModalBody>
        <ModalFooter>
          <BlueButton onClick={downloadFile} label="Download" />
          <WhiteButton onClick={closePreview} label="Cancel" />
        </ModalFooter>
      </Modal>

      <Dialog
        fullWidth
        open={addChargeOpen}
        onClose={() => {
          setAddChargeOpen(false);
          chargeFormik.resetForm();
        }}
        PaperProps={{
          style: {
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          className="text-blue-color"
          style={{ fontSize: "18px", fontWeight: "bold" }}
        >
          Add Charge
        </DialogTitle>

        <DialogContent
          dividers
          style={{ padding: "30px", borderTop: "4px solid #e88c44" }}
        >
          <form onSubmit={chargeFormik.handleSubmit}>
            <Grid>
              <Dropdown
                className="mb-3"
                isOpen={selectChargeDropDown}
                toggle={toggles1}
              >
                <DropdownToggle
                  className="border-blue-color text-blue-color"
                  caret
                  style={{
                    width: "100%",
                    border: "1px solid",
                    backgroundColor: "transparent",
                    height: "50px",
                    textAlign: "start",
                  }}
                >
                  {chargeFormik.values.account_name || "Select Account"}
                </DropdownToggle>
                <DropdownMenu
                  className="dropdownfontsyle"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {AssetAccounts?.length > 0 && (
                    <>
                      <DropdownItem
                        className="fontstylerentmodal text-blue-color"
                        header
                        style={{ fontWeight: "600" }}
                      >
                        Asset Accounts
                      </DropdownItem>
                      {AssetAccounts.map((item) => (
                        <DropdownItem
                          style={{ fontSize: "12px" }}
                          className="text-blue-color"
                          key={item._id}
                          onClick={() => {
                            chargeFormik.setFieldValue(
                              "account_id",
                              item.account_id
                            );
                            chargeFormik.setFieldValue(
                              "account_name",
                              item.account_name
                            );
                          }}
                        >
                          {item.account_name}
                        </DropdownItem>
                      ))}
                    </>
                  )}
                  {ExpenseAccounts?.length > 0 && (
                    <>
                      <DropdownItem
                        className="fontstylerentmodal text-blue-color"
                        header
                        style={{ fontWeight: "600" }}
                      >
                        Expense Accounts
                      </DropdownItem>
                      {ExpenseAccounts.map((item) => (
                        <DropdownItem
                          style={{ fontSize: "12px" }}
                          className="text-blue-color"
                          key={item._id}
                          onClick={() => {
                            chargeFormik.setFieldValue(
                              "account_id",
                              item.account_id
                            );
                            chargeFormik.setFieldValue(
                              "account_name",
                              item.account_name
                            );
                          }}
                        >
                          {item.account_name}
                        </DropdownItem>
                      ))}
                    </>
                  )}
                  {RevenueAccounts?.length > 0 && (
                    <>
                      <DropdownItem
                        className="fontstylerentmodal text-blue-color"
                        header
                        style={{ fontWeight: "600" }}
                      >
                        Revenue Accounts
                      </DropdownItem>
                      {RevenueAccounts.map((item) => (
                        <DropdownItem
                          style={{ fontSize: "12px" }}
                          className="text-blue-color"
                          key={item._id}
                          onClick={() => {
                            chargeFormik.setFieldValue(
                              "account_id",
                              item.account_id
                            );
                            chargeFormik.setFieldValue(
                              "account_name",
                              item.account_name
                            );
                          }}
                        >
                          {item.account_name}
                        </DropdownItem>
                      ))}
                    </>
                  )}
                  {EquityAccounts?.length > 0 && (
                    <>
                      <DropdownItem
                        className="fontstylerentmodal text-blue-color"
                        header
                        style={{ fontWeight: "600" }}
                      >
                        Equity Accounts
                      </DropdownItem>
                      {EquityAccounts.map((item) => (
                        <DropdownItem
                          style={{ fontSize: "12px" }}
                          className="text-blue-color"
                          key={item._id}
                          onClick={() => {
                            chargeFormik.setFieldValue(
                              "account_id",
                              item.account_id
                            );
                            chargeFormik.setFieldValue(
                              "account_name",
                              item.account_name
                            );
                          }}
                        >
                          {item.account_name}
                        </DropdownItem>
                      ))}
                    </>
                  )}
                  {LiabilityAccounts?.length > 0 && (
                    <>
                      <DropdownItem
                        className="fontstylerentmodal text-blue-color"
                        header
                        style={{ fontWeight: "600" }}
                      >
                        Liability Accounts
                      </DropdownItem>
                      {LiabilityAccounts.map((item) => (
                        <DropdownItem
                          style={{ fontSize: "12px" }}
                          className="text-blue-color"
                          key={item._id}
                          onClick={() => {
                            chargeFormik.setFieldValue(
                              "account_id",
                              item.account_id
                            );
                            chargeFormik.setFieldValue(
                              "account_name",
                              item.account_name
                            );
                          }}
                        >
                          {item.account_name}
                        </DropdownItem>
                      ))}
                    </>
                  )}
                </DropdownMenu>
              </Dropdown>
              {chargeFormik.errors.account_id &&
                chargeFormik.touched.account_id && (
                  <div
                    className="error-message"
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    {chargeFormik.errors.account_id}
                  </div>
                )}

              <Grid>
                <InputText
                  value={
                    chargeFormik.values.amount
                      ? `$${parseFloat(chargeFormik.values.amount).toFixed(2)}`
                      : "$0.00"
                  }
                  onChange={(e) => {
                    let rawValue = e.target.value.replace(/[^0-9.]/g, "");

                    if ((rawValue.match(/\./g) || []).length > 1) {
                      rawValue = rawValue.slice(0, rawValue.lastIndexOf("."));
                    }

                    chargeFormik.setFieldValue("amount", rawValue);
                  }}
                  onBlur={(e) => {
                    let finalValue = parseFloat(
                      chargeFormik.values.amount || "0"
                    ).toFixed(2);
                    chargeFormik.setFieldValue("amount", finalValue);
                  }}
                  name="amount"
                  placeholder="$0.00"
                  label="Amount"
                  type="text"
                  className="text-blue-color w-100 mb-3"
                  fieldHeight="56px"
                />

                {chargeFormik.errors.amount && chargeFormik.touched.amount && (
                  <div
                    className="error-message"
                    style={{ color: "red", fontSize: "12px" }}
                  >
                    {chargeFormik.errors.amount}
                  </div>
                )}
              </Grid>

              <Grid>
                <TextField
                  className="note-details mt-1 text-blue-color border-blue-color"
                  name="description"
                  label="Description"
                  type="text"
                  value={chargeFormik.values.description}
                  onChange={chargeFormik.handleChange}
                  onBlur={chargeFormik.handleBlur}
                  placeholder="Enter A Description"
                  multiline
                  rows={3}
                />
                {chargeFormik.errors.description &&
                  chargeFormik.touched.description && (
                    <div
                      className="error-message"
                      style={{ color: "red", fontSize: "12px" }}
                    >
                      {chargeFormik.errors.description}
                    </div>
                  )}
              </Grid>
            </Grid>

            <Grid className="mt-3 d-flex justify-content-between chargeModelBt">
              <WhiteButton
                className="text-blue-color border-blue-color nogoback"
                onClick={() => {
                  setAddChargeOpen(false);
                  chargeFormik.resetForm();
                }}
                label="Cancel"
              />
              <BlueButton
                className="text-blue-color border-blue-color nogoback"
                onClick={chargeFormik.handleSubmit}
                label="Add"
              />
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BillingHistory;