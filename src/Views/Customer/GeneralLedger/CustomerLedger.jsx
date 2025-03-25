import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
} from "reactstrap";
import moment from "moment";
import "./style.css";
import { LoaderComponent } from "../../../components/Icon/Index";
import { handleAuth } from "../../../components/Login/Auth";
import AxiosInstance from "../../AxiosInstance";
import * as XLSX from "xlsx";

import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../components/MuiTable";
import { Card } from "react-bootstrap";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import BlueButton from "../../../components/Button/BlueButton";
import Swal from "sweetalert";
import WhiteButton from "../../../components/Button/WhiteButton";

function CustomerLedger() {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  const location = useLocation();
  const navigate = useNavigate();
  const [DateDecode, setDateDecode] = useState({});
  const [data, setData] = useState();
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  useEffect(() => {
    handleAuth(navigate, location);
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const isEdited = true;
  const { CompanyName } = useParams();
  const [sortField, setSortField] = useState("asc");

  const [sortOrder, setSortOrder] = useState("desc");

  const fetchTransactions = async (companyId) => {
    try {
      setLoader(true);
      const id = location.state?.id || localStorage.getItem("CustomerId");
      const encodedId = encodeURIComponent(id);
      const res = await AxiosInstance.get(
        `/general_ledger/charges_payments/${encodedId}`,
        {
          params: {
            pageSize: rowsPerPage,
            pageNumber: page,
            search: search || "",
            selectedStartDate: selectedStartDate,
            selectedEndDate: selectedEndDate,
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
        // `${item?.amount || "-"} `,
        `${
          item?.type === "payment" ? "-" : item?.type === "charge" ? "+" : ""
        }$${
          new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(item?.amount || 0.0) ?? "amount not available"
        }`,
        `$${
          new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(item?.balance || 0.0) ?? "balance not available"
        }`,
      ],
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [collectSignatureLoader, setCollectSignatureLoader] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [csvData, setCsvData] = useState(null);
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

    // Ensure that the format is PDF and the start and end dates are selected
    if (format === "PDF" && (!selectedStartDate || !selectedEndDate)) {
      Swal({
        title: "Error",
        text: "Please select both start and end dates to download the PDF.",
        icon: "error",
        button: "Ok",
      });
      setIsLoading(false);
      return;
    }

    // Prepare request data for PDF download
    const requestData = {
      ispdf: format === "PDF",
      iscsv: format === "CSV",
      isexcel: format === "Excel",
      startDate: selectedStartDate, // Send the selected start date
      endDate: selectedEndDate, // Send the selected end date
    };

    try {
      const willDelete = await Swal({
        title: "Are you sure?",
        text: "You want to download the report for the selected dates!",
        icon: "warning",
        buttons: ["Cancel", "Process"],
        dangerMode: true,
      });

      if (willDelete) {
        setCollectSignatureLoader(true);
        setProgress(0);
        simulateProgress();

        // Send the request to generate the report
        const res = await AxiosInstance.post(
          `/general_ledger/charges_payments/report/${
            data?.CustomerId || localStorage.getItem("CustomerId")
          }`,
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

          // Set the preview file URL to show the file
          setPreviewFile(fileUrl);

          // If PDF, just set the preview
          if (format === "PDF") {
            setPreviewFile(fileUrl);
          } else {
            // For CSV/Excel, fetch the file as a blob
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

  return (
    <>
      <Grid className="justify-content-center align-items-center client ">
        <>
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
            <Grid className="d-flex gap-2 justify-content-end align-items-center mb-3">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {/* Start Date Picker */}
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="Start Date"
                    value={selectedStartDate ? dayjs(selectedStartDate) : null}
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

              <Grid>
                <BlueButton
                  onClick={() => {
                    setSelectedStartDate(null);
                    setSelectedEndDate(null);
                  }}
                  label="Clear"
                  style={{ height: "44px", marginTop: "10px" }}
                />
              </Grid>
              <Grid>
                <Dropdown isOpen={dropdownOpens} toggle={toggle} style={{marginTop:"10px"}}>
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
          )}
        </>
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
    </>
  );
}

export default CustomerLedger;
