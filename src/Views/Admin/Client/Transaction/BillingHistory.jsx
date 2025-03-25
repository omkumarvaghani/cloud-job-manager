import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import {
  Button,
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
  Table,
} from "reactstrap";
import moment from "moment";
import "./style.css";
import { Box, CircularProgress } from "@mui/material";
import swal from "sweetalert";
import * as XLSX from "xlsx";
import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import showToast from "../../../../components/Toast/Toster";
import {
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../../components/Icon/Index";
import { handleAuth } from "../../../../components/Login/Auth";
import AxiosInstance from "../../../AxiosInstance";
import DollerInput from "../../../../components/InputFields/Doller";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../components/MuiTable";
import { Card } from "react-bootstrap";
import { NoDataFound } from "../../../../components/Contract Component/Index";
import dayjs from "dayjs";
import sendToast from "../../../../components/Toast/sendToast";

import InputDropdown from "../../../../components/InputFields/InputDropdown";
import InputText from "../../../../components/InputFields/InputText";
import CardPayment from "../../Invoice/Payment/CardPayment";
import AchPayment from "../../Invoice/Payment/AchPayment";
import { ColorRing } from "react-loader-spinner";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";

function BillingHistory({ data, getData }) {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  const location = useLocation();
  const navigate = useNavigate();
  const [DateDecode, setDateDecode] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  // const [selectedStartDate, setSelectedStartDate] = useState(
  //   dayjs().format("YYYY-MM-DD")
  // );
  // const [selectedEndDate, setSelectedEndDate] = useState(
  //   dayjs().format("YYYY-MM-DD")
  // );
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  useEffect(() => {
    handleAuth(navigate, location);
  }, []);

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setDateDecode(res.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY HH:MM:ss");

  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY HH:MM:ss");
      }
    };

    handleDateFormat();
  }, [DateDecode]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const { CompanyName } = useParams();
  const [sortField, setSortField] = useState("asc");

  const [sortOrder, setSortOrder] = useState("desc");

  const fetchTransactions = async () => {
    setLoader(true);
    try {
      const id = location.state?.id || localStorage.getItem("CustomerId");
      const encodedId = encodeURIComponent(id);
      const res = await AxiosInstance.get(
        `/general_ledger/charges_payments/${encodedId}`,
        {
          params: {
            pageSize: rowsPerPage,
            pageNumber: page,
            selectedStartDate: selectedStartDate,
            selectedEndDate: selectedEndDate,
            search: search || "",
            sortField: sortField,
            sortOrder: sortOrder,
          },
        }
      );
      if (res?.data) {
        setcustomersData(res.data.data || []);
        setCountData(res.data.totalCount || 0);
      } else {
        console.error("No data received from the server.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [
    search,
    page,
    rowsPerPage,
    selectedStartDate,
    selectedEndDate,
    sortField,
    sortOrder,
  ]);

  const [collectSignatureLoader, setCollectSignatureLoader] = useState(false);
  const [progress, setProgress] = useState(0);
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
          requestData,
          {
            params: {
              selectedStartDate: selectedStartDate,
              selectedEndDate: selectedEndDate,
            },
          }
        );
        if (res.data.statusCode === 200) {
          const fileName = res?.data?.fileName;
          const fileUrl = `${cdnUrl}/upload/${fileName}`;

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

  const [selectChargeDropDown, setSelectChargetDropDown] = useState(false);
  const [LiabilityAccounts, setLiabilityAccounts] = useState([]);
  const [AssetAccounts, setAssetAccounts] = useState([]);
  const [EquityAccounts, setEquityAccounts] = useState([]);
  const [RevenueAccounts, setRevenueAccounts] = useState([]);
  const [ExpenseAccounts, setExpenseAccounts] = useState([]);
  const [recAccounts, setRecAccounts] = useState([]);
  const [oneTimeAccounts, setoneTimeAccounts] = useState([]);

  const toggles1 = () => setSelectChargetDropDown(!selectChargeDropDown);

  const CompanyId = localStorage?.getItem("CompanyId");
  const CustomerId = location?.state?.id;

  const chargeFormik = useFormik({
    initialValues: {
      CompanyId: CompanyId,
      CustomerId: CustomerId,
      account_id: "",
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
        setIsLoading(true);
        const chargedataToPost = {
          CompanyId: CompanyId,
          CustomerId: CustomerId,
          LocationId: data?.location?.[0]?.LocationId || null,
          ...values,
        };
        const res = await AxiosInstance.post(`/charge`, chargedataToPost);
        if (res.data.statusCode === 200) {
          showToast.success("Charge Added Successfully");
          resetForm();
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
        setIsLoading(false);
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

  const cellData = customersData?.map((item, index) => {
    return {
      key: item?.CustomerId,
      value: [
        page * rowsPerPage + index + 1,

        moment(item?.createdAt).format(dateFormat),
        `${item?.type || "-"} `,
        `${item?.account_name || "Contract Invoice"} `,
        <Grid>
          {item?.type === "payment" ? (
            <>
              <span style={{ color: "#089F57", fontWeight: 700 }}>
                Manual Payment SUCCESS
              </span>
              <br />
              for {item?.method}{" "}
              {item?.transactionid ? `( #${item.transactionid} )` : ""}
            </>
          ) : item?.description ? (
            <span>{item?.description}</span>
          ) : item?.ContractNumber ? (
            <span>Invoice For Contract Number: #{item?.ContractNumber}</span>
          ) : (
            <span>-</span>
          )}
        </Grid>,
        `${
          item?.type === "payment" ? "-" : item?.type === "charge" ? "+" : ""
        }$${
          new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(item?.amount || 0.0) ?? "N/A"
        }`,
        `$${
          new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(item?.balance || 0.0) ?? "N/A"
        }`,
      ],
    };
  });

  //make payment
  const [makePaymentOpen, setMakePaymentOpen] = useState(false);
  const [paymentsData, setPaymentsData] = useState();

  let paymentMethods = [
    "Cash",
    "ACH bank payment",
    "Check",
    "Credit/debit card",
  ];

  if (paymentsData?.planData === "Trial Plan") {
    paymentMethods = paymentMethods.filter(
      (method) => !["ACH bank payment", "Credit/debit card"].includes(method)
    );
  }

  const [buttonLoader, setButtonLoader] = useState(false);

  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const paymentFormik = useFormik({
    initialValues: {
      method: "Cash",
      date: dayjs(new Date()).format("MM-DD-YYYY"),
      customer_vault_id: "",
      billing_id: "",
      cheque_number: "",
      account_id: "",
      description: "",
      amount: "",
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
      account_id: Yup.string().required("Account is required"),
      amount: Yup.string().required("Amount is required"),
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
                Total: paymentsData?.Total,
                CustomerId: paymentsData?.CustomerId,
                account_id: paymentsData?.account_id || values.account_id,
                method: "Card",
              },
            };

            const res = await AxiosInstance.post(
              "/invoice-payment/card-payment",
              object
            );
            if (res?.data?.statusCode === 100) {
              showToast.success(res?.data?.message);
              fetchTransactions();
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
                Total: paymentsData?.Total,
                CustomerId: paymentsData?.CustomerId,
                account_id: paymentsData?.account_id || values.account_id,
                method: "ACH",
              },
            };

            const res = await AxiosInstance.post(
              "/invoice-payment/ach-payment",
              object
            );

            if (res?.data?.statusCode === 100) {
              showToast.success(res?.data?.message);

              fetchTransactions();
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
                  Total: paymentsData?.Total,
                  CustomerId: paymentsData?.CustomerId,
                  account_id: paymentsData?.account_id || values.account_id,
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
                  Total: paymentsData?.Total,
                  CustomerId: paymentsData?.CustomerId,
                  account_id: paymentsData?.account_id || values.account_id,
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

              fetchTransactions();
            } else {
              sendToast(res?.data?.error);
            }
          } catch (error) {
            sendToast(error?.response?.data?.error);
          }
        }
      }
      setButtonLoader(false);
      setMakePaymentOpen(false);
      paymentFormik.resetForm();
      setPaymentMethod("Cash");
    },
  });

  const [selectedCard, setSelectedCard] = useState(undefined);
  const [companyData, setCompanyData] = useState(undefined);
  const [paymentloader, setPaymentLoader] = useState(true);

  const fetchPaymentData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setCompanyData(res?.data);
      if (location?.state?.id) {
        const invoiceRes = await AxiosInstance.get(
          `/customer/${location?.state?.id}`
        );
        if (invoiceRes?.status === 200) {
          setPaymentsData(invoiceRes?.data?.data);
        } else {
        }
      }
    } catch (error) {
      console.error("Error:", error?.message);
    } finally {
      setPaymentLoader(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
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
              <Grid className="d-flex gap-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {/* Start Date Picker */}
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      label="Start Date"
                      value={
                        selectedStartDate ? dayjs(selectedStartDate) : null
                      }
                      onChange={(newDate) => {
                        const formattedStartDate = newDate
                          ? newDate.format(dateFormat)
                          : null;
                        setSelectedStartDate(formattedStartDate);

                        // Reset End Date if it's earlier than Start Date
                        if (
                          formattedStartDate &&
                          selectedEndDate &&
                          new Date(formattedStartDate) >=
                            new Date(selectedEndDate)
                        ) {
                          setSelectedEndDate(null);
                        }
                      }}
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: "8px",
                          width: "13rem",
                          backgroundColor: "#f7f8fa",
                        },
                        "& .MuiInputBase-input": {
                          color: "#063164",
                          fontSize: "14px",
                        },
                        "& .MuiInputLabel-root": {
                          color: "#063164",
                          fontSize: "14px",
                        },
                        "& .MuiSvgIcon-root": { color: "#063164" },
                        "& .MuiInputBase-root:hover": {
                          borderColor: "#063164",
                        },
                      }}
                    />
                  </DemoContainer>

                  {/* End Date Picker */}
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      label="End Date"
                      value={selectedEndDate ? dayjs(selectedEndDate) : null}
                      onChange={(newDate) => {
                        const formattedEndDate = newDate
                          ? newDate.format(dateFormat)
                          : null;
                        setSelectedEndDate(formattedEndDate);

                        // Reset Start Date if it's later than End Date
                        if (
                          formattedEndDate &&
                          selectedStartDate &&
                          new Date(formattedEndDate) <=
                            new Date(selectedStartDate)
                        ) {
                          setSelectedStartDate(null);
                        }
                      }}
                      minDate={
                        selectedStartDate
                          ? dayjs(selectedStartDate).add(1, "day")
                          : null
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: "8px",
                          width: "13rem",
                          backgroundColor: "#f7f8fa",
                        },
                        "& .MuiInputBase-input": {
                          color: "#063164",
                          fontSize: "14px",
                        },
                        "& .MuiInputLabel-root": {
                          color: "#063164",
                          fontSize: "14px",
                        },
                        "& .MuiSvgIcon-root": { color: "#063164" },
                        "& .MuiInputBase-root:hover": {
                          borderColor: "#063164",
                        },
                      }}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
              <Grid className="d-flex gap-2 mt-2 preffered-format">
                <Grid>
                  <BlueButton
                    onClick={() => {
                      setSelectedStartDate(null);
                      setSelectedEndDate(null);
                    }}
                    label="Clear"
                    style={{ height: "44px" }}
                  />
                </Grid>
                <Grid>
                  <BlueButton
                    style={{ height: "44px" }}
                    label="Make Payment"
                    onClick={() => setMakePaymentOpen(true)}
                  />
                </Grid>
                <Grid>
                  <BlueButton
                    style={{ height: "44px" }}
                    label="Add Charge"
                    onClick={() => setAddChargeOpen(true)}
                  />
                </Grid>
                <Grid>
                  <Dropdown isOpen={dropdownOpens} toggle={toggle}>
                    <DropdownToggle
                      className="bg-blue-color"
                      style={{ height: "44px" }}
                      disabled={
                        !cellData.length && selectedStartDate && selectedEndDate
                      }
                    >
                      {isLoading
                        ? "Downloading..."
                        : "Select Your Preferred Report"}
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
            </Grid>
          )}
        </Grid>
        <Card
          className="border-blue-color"
          style={{
            borderRadius: "20px",
            border: "1px solid",
            padding: 0,
          }}
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header border-blue-color bg-blue-color customerList_searchbar customersAddCustomers"
            style={{
              borderBottom: "1px solid",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="quot text-light customerList_head heading-five tableNameHead fw-medium">
              General Ledger
            </Typography>
            <Grid className=" customersearch d-flex customer_searchBar searchBarOfTable">
              <JobberSearch
                search={search}
                setSearch={setSearch}
                style={{ background: "transparant", color: "white" }}
              />
            </Grid>
          </CardHeader>
          {loader ? (
            <Grid
              className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
              style={{ justifyContent: "center", textAlign: "center" }}
            >
              <LoaderComponent height="50" width="50" loader={loader} />
            </Grid>
          ) : (
            <CardBody style={{ padding: "10px 0px" }}>
              <JobberTable
                style={{ whiteSpace: "nowrap" }}
                // headerData={[
                //   "Sr No.",
                //   "Date ",
                //   "Type",
                //   "Account Name",
                //   "Description",
                //   "Amount",
                //   "Balance",
                //   // "Action",
                // ]}
                headerData={[
                  { label: "Sr No." },
                  { label: "Date", field: "createdAt" },
                  { label: "Type", field: "type" },
                  { label: "Account Name", field: "account_name" },
                  { label: "Description", field: "transactionid" },
                  { label: "Amount", field: "amount" },
                  { label: "Balance", field: "balance" },
                ]}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
                cellData={cellData}
                isCollapse={false}
                page={page}
                isNavigate={false}
              />
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color border-blue-color text-blue-color "
            style={{
              borderTop: "1px solid",
              borderBottomLeftRadius: "20px",
              borderBottomRightRadius: "20px",
            }}
          >
            <JobberPagination
              totalData={countData}
              currentData={rowsPerPage}
              dataPerPage={rowsPerPage}
              pageItems={[10, 25, 50]}
              page={page}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          </CardFooter>
        </Card>
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
                  <DropdownItem
                    onClick={() => {
                      navigate(`/${CompanyName}/account`);
                    }}
                    style={{
                      fontWeight: "600",
                      color: "#007bff",
                      fontSize: "12px",
                    }}
                  >
                    Add Account
                  </DropdownItem>

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

                  {AssetAccounts?.length === 0 &&
                    ExpenseAccounts?.length === 0 &&
                    RevenueAccounts?.length === 0 &&
                    EquityAccounts?.length === 0 &&
                    LiabilityAccounts?.length === 0 && (
                      <DropdownItem>
                        <Grid
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "20px",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <NoDataFound />
                          <Button
                            className="text-blue-color border-blue-color"
                            style={{
                              backgroundColor: "#fff",
                              border: "1px solid ",
                              borderRadius: "5px",
                              fontSize: "12px",
                              marginLeft: "30px",
                            }}
                            onClick={() => {
                              navigate(`/${CompanyName}/account`);
                            }}
                          >
                            Add Account
                          </Button>
                        </Grid>
                      </DropdownItem>
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
                <DollerInput
                  value={chargeFormik.values.amount}
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
                  placeholder="Enter Amount"
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
                // label="Add"
                label={
                  isLoading ? (
                    <WhiteLoaderComponent
                      height="20"
                      width="20"
                      padding="20"
                      loader={isLoading}
                    />
                  ) : (
                    "Add"
                  )
                }
              />
            </Grid>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        fullWidth
        open={makePaymentOpen}
        onClose={() => {
          setMakePaymentOpen(false);
          paymentFormik.resetForm();
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
          Make Payment
        </DialogTitle>

        <DialogContent
          dividers
          style={{ padding: "30px", borderTop: "4px solid #e88c44" }}
        >
          <form onSubmit={paymentFormik.handleSubmit}>
            <>
              {paymentloader ? (
                <Grid
                  className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
                  style={{ height: "80vh", marginTop: "25%" }}
                >
                  <LoaderComponent loader={loader} height="50" width="50" />
                </Grid>
              ) : (
                <Grid className="d-flex flex-column justify-content-between h-100 text-blue-color">
                  <Grid>
                    <Grid>
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
                      {paymentMethod === "Credit/debit card" && (
                        <CardPayment
                          paymentFormik={paymentFormik}
                          selectedCard={selectedCard}
                          setSelectedCard={setSelectedCard}
                          CustomerId={paymentsData?.CustomerId}
                        />
                      )}
                      {paymentMethod === "ACH bank payment" && (
                        <AchPayment
                          paymentFormik={paymentFormik}
                          selectedAccount={selectedCard}
                          setSelectedAccount={setSelectedCard}
                          companyData={companyData}
                          CustomerId={paymentsData?.CustomerId}
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
                      <Grid>
                        <DollerInput
                          placeholder="Enter Amount"
                          value={paymentFormik?.values?.amount}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                            paymentFormik.setFieldValue("amount", numericValue);
                          }}
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
                          className="text-blue-color w-100 m-0 paymentApplied_amout"
                          defaultValue={paymentsData?.invoiceAccount}
                        />

                        {paymentFormik.errors.amount &&
                          paymentFormik.touched.amount && (
                            <div
                              className="error-message"
                              style={{ color: "red", fontSize: "12px" }}
                            >
                              {paymentFormik.errors.amount}
                            </div>
                          )}
                      </Grid>
                      <Grid>
                        <Dropdown
                          className="mb-3 mt-3"
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
                            {paymentFormik.values.account_name ||
                              "Select Account"}
                          </DropdownToggle>
                          <DropdownMenu
                            className="dropdownfontsyle"
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              overflowY: "auto",
                            }}
                          >
                            <DropdownItem
                              onClick={() => {
                                navigate(`/${CompanyName}/account`);
                              }}
                              style={{
                                fontWeight: "600",
                                color: "#007bff",
                                fontSize: "12px",
                              }}
                            >
                              Add Account
                            </DropdownItem>

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
                                      paymentFormik.setFieldValue(
                                        "account_id",
                                        item.account_id
                                      );
                                      paymentFormik.setFieldValue(
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
                                      paymentFormik.setFieldValue(
                                        "account_id",
                                        item.account_id
                                      );
                                      paymentFormik.setFieldValue(
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
                                      paymentFormik.setFieldValue(
                                        "account_id",
                                        item.account_id
                                      );
                                      paymentFormik.setFieldValue(
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
                                      paymentFormik.setFieldValue(
                                        "account_id",
                                        item.account_id
                                      );
                                      paymentFormik.setFieldValue(
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
                                      paymentFormik.setFieldValue(
                                        "account_id",
                                        item.account_id
                                      );
                                      paymentFormik.setFieldValue(
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

                            {AssetAccounts?.length === 0 &&
                              ExpenseAccounts?.length === 0 &&
                              RevenueAccounts?.length === 0 &&
                              EquityAccounts?.length === 0 &&
                              LiabilityAccounts?.length === 0 && (
                                <DropdownItem>
                                  <Grid
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      padding: "20px",
                                      gap: "10px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <NoDataFound />
                                    <Button
                                      className="text-blue-color border-blue-color"
                                      style={{
                                        backgroundColor: "#fff",
                                        border: "1px solid ",
                                        borderRadius: "5px",
                                        fontSize: "12px",
                                        marginLeft: "30px",
                                      }}
                                      onClick={() => {
                                        navigate(`/${CompanyName}/account`);
                                      }}
                                    >
                                      Add Account
                                    </Button>
                                  </Grid>
                                </DropdownItem>
                              )}
                          </DropdownMenu>
                        </Dropdown>
                        {paymentFormik.errors.account_id &&
                          paymentFormik.touched.account_id && (
                            <div
                              className="error-message"
                              style={{
                                color: "red",
                                fontSize: "12px",
                                marginBottom: "10px",
                              }}
                            >
                              {paymentFormik.errors.account_id}
                            </div>
                          )}
                      </Grid>
                      <Grid>
                        <Grid>
                          <TextField
                            className="note-details mt-1 text-blue-color border-blue-color"
                            name="description"
                            label="Description"
                            type="text"
                            value={paymentFormik.values.description}
                            onChange={paymentFormik.handleChange}
                            onBlur={paymentFormik.handleBlur}
                            placeholder="Enter A Description"
                            multiline
                            rows={3}
                          />
                          {paymentFormik.errors.description &&
                            paymentFormik.touched.description && (
                              <div
                                className="error-message"
                                style={{ color: "red", fontSize: "12px" }}
                              >
                                {paymentFormik.errors.description}
                              </div>
                            )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid className="d-flex justify-content-between align-items-end mt-4 cancel_emailReceipt_save">
                    <Grid className="cancelinvoiceGrid">
                      <WhiteButton
                        className="cancelBtnInVoicce eui"
                        // onClick={() => navigate(-1)}
                        onClick={() => {
                          setMakePaymentOpen(false);
                          paymentFormik.resetForm();
                        }}
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
              )}
            </>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BillingHistory;
