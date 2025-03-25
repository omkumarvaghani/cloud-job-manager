import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import { Grid } from "@mui/material";
import BlueButton from "../../../components/Button/BlueButton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dateFormat from "../Setting/Date Format/DateFormat.jsx";

import {
  JobberPagination,
  JobberSearch,
  JobberSorting,
  JobberTable,
} from "../../../components/MuiTable";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance";
import Report from "./Views/Financial.jsx";
import { LoaderComponent } from "../../../components/Icon/Index";
import dayjs from "dayjs";
import swal from "sweetalert";
import showToast from "../../../components/Toast/Toster";
import { handleAuth } from "../../../components/Login/Auth.jsx";

const Financial = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedStartDate, setSelectedStartDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  const [paymentMethod, setPaymentMethod] = useState("");
  const [format, setFormat] = useState("");
  const [tokenDecode, setTokenDecode] = useState({});
  const [collectSignatureLoader, setCollectSignatureLoader] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [fileData, setFileData] = useState(null);
  const [countData, setCountData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

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

  const [DateDecode, setDateDecode] = useState({});
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

  const fetchReportData = async () => {
    setLoader(true);
    try {
      // Get the companyId
      const companyId =
        localStorage?.getItem("CompanyId") || tokenDecode?.companyId;

      if (!companyId) {
        console.error("Company ID is missing!");
        setLoader(false);
        return;
      }

      // API call to fetch report data with pagination params
      const getRes = await AxiosInstance.get(
        `/report/get_payment_data/${companyId}`,
        {
          params: {
            pageSize: rowsPerPage,
            pageNumber: page,
            selectedStartDate: selectedStartDate,
            selectedEndDate: selectedEndDate,
            method: paymentMethod,
          },
        }
      );

      if (getRes?.data?.statusCode === 200) {
        // Assuming the API response provides data in a format like this:
        // { statusCode: 200, data: { reportData: [], totalPages: number, totalCount: number } }
        setReportData(getRes.data.data);
        setTotalPages(getRes.data.totalPages); // Set total pages based on the response
        setCountData(getRes.data.totalCount || 0);
      } else {
        console.error("API Response error:", getRes.data);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    fetchReportData();
  }, [page, rowsPerPage, selectedStartDate, selectedEndDate, paymentMethod]); // Properly include selectedStartDate and selectedEndDate

  const cdnUrl = process.env.REACT_APP_CDN_API;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStartDate || !selectedEndDate || !paymentMethod || !format) {
      alert("Please fill in all required fields.");
      return;
    }

    const formattedStartDate = moment(selectedStartDate).format("YYYY-MM-DD");
    const formattedEndDate = moment(selectedEndDate).format("YYYY-MM-DD");

    const requestData = {
      selectedStartDate: formattedStartDate,
      selectedEndDate: formattedEndDate,
      method: paymentMethod,
      ispdf: format === "pdf",
      iscsv: format === "csv",
      isexcel: format === "excel",
    };

    try {
      const willDelete = await swal({
        title: "Are you sure?",
        text: "You want to download!",
        icon: "warning",
        buttons: {
          cancel: "Cancel",
          confirm: {
            text: "Process",
            value: true,
            visible: true,
            className: "bg-orange-color",
            closeModal: true,
          },
        },
        dangerMode: true,
      });
      if (willDelete) {
        setCollectSignatureLoader(true);
        setProgress(0);
        simulateProgress();
        try {
          const res = await AxiosInstance.post(
            `/report/generate-report/${
              localStorage?.getItem("CompanyId") || tokenDecode?.companyId
            }`,
            requestData
          );

          if (res.data.statusCode === 200) {
            const fileName = res?.data?.fileName;
            const url = `${cdnUrl}/upload/${fileName}`;

            fetch(url)
              .then((response) => {
                if (!response.ok)
                  throw new Error("Network response was not ok");
                return response.blob();
              })
              .then((blob) => {
                setFileData(blob);
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download =
                  format === "csv"
                    ? "output.csv"
                    : format === "pdf"
                    ? "payment_document.pdf"
                    : "quotes_document.xlsx";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              })
              .catch((error) =>
                console.error(
                  "There was a problem with the fetch operation:",
                  error
                )
              );
          } else {
            console.error("Failed to generate report:", res.data);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error("Failed to send the PDF. Please try again.");
        } finally {
          setCollectSignatureLoader(false);
          setProgress(0);
        }
      }
    } catch (error) {
      console.error("Error processing the request:", error);
    }
  };
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

  const cellData = reportData?.map((item, index) => ({
    key: item?.EmailId || index,
    value: [
      page * rowsPerPage + index + 1,
      item?.method || "method not available",
      item?.amount || "amount not available",
      // typeof item?.date === "string"
      //   ? item?.date
      //   : item?.date?.toString() || "() not available",
      moment(item.date).format(dateFormat),
      typeof item?.cc_type === "string"
        ? item?.cc_type
        : "cc Type not available",
      // Ensure date is a valid string (if it's an object, fallback to "fallback not available")

      `${
        item?.first_name && typeof item.first_name === "string"
          ? item.first_name
          : item.getCustomerDetails?.FirstName || "FirstName not available"
      } 
     ${
       item?.last_name && typeof item.last_name === "string"
         ? item.last_name
         : item.getCustomerDetails?.LastName || ""
     }`,
    ],
  }));

  const collapseData = reportData?.map((item) => ({
    createdAt: item?.createdAt || "No details provided",
  }));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Report
        loader={loader}
        // search={search}
        // setSearch={setSearch}
        cellData={cellData}
        collapseData={collapseData}
        // page={page}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        rowsPerPage={rowsPerPage}
        // CompanyName={CompanyName}
        // countData={countData}
        selectedEndDate={selectedEndDate}
        selectedStartDate={selectedStartDate}
        // isEdited={isEdited}
        // handleDialogOpen={handleDialogOpen}
        // handleDialogClose={handleDialogClose}
        // openDialog={openDialog}
        // dialogData={dialogData}
        // customersData={customersData}
        // dateFormat={dateFormat}
        reportData={reportData}
        setFormat={setFormat}
        setPaymentMethod={setPaymentMethod}
        format={format}
        page={page}
        totalPages={totalPages}
        handleSubmit={handleSubmit}
        setSelectedStartDate={setSelectedStartDate}
        setSelectedEndDate={setSelectedEndDate}
        paymentMethod={paymentMethod}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        countData={countData}
        setCountData={setCountData}
        collectSignatureLoader={collectSignatureLoader}
        progress={progress}
      />
    </>
  );
};

export default Financial;
