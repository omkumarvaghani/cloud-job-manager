import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
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
import BlueButton from "../../../../components/Button/BlueButton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  JobberPagination,
  JobberSearch,
  JobberSorting,
  JobberTable,
} from "../../../../components/MuiTable";
import { Card, CardBody, CardFooter, CardHeader, Input } from "reactstrap";
import moment from "moment";
import AxiosInstance from "../../../AxiosInstance";
import { LoaderComponent } from "../../../../components/Icon/Index";

const Financial = ({
  loader,
  setPage,
  setRowsPerPage,
  rowsPerPage,
  collapseData,
  // companyName,
  // countData,
  // dateFormat,
  reportData,
  selectedEndDate,
  selectedStartDate,
  cellData,
  setFormat,
  setPaymentMethod,
  format,
  page,
  progress,
  collectSignatureLoader,
  totalPages,
  handleSubmit,
  countData,
  setCountData,
  setSelectedStartDate,
  setSelectedEndDate,
  paymentMethod,
  handleChangePage,
  handleChangeRowsPerPage,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      {/* {collectSignatureLoader ? ( */}

      <>
        <Typography
          gutterBottom
          className="text-blue-color customer_para heading-three tableNameHead"
          style={{
            fontWeight: "700",
            fontSize: "1.6rem",
            color: "#063164",
            // marginBottom: "20px",
          }}
        >
          Generate Report
        </Typography>
        {collectSignatureLoader ? (
          <Grid
            className="d-flex flex-direction-row justify-content-center align-items-center"
            style={{ height: "80vh" }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              o
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
            className="d-flex"
            style={{
              // padding: "25px",
              // backgroundColor: "#fff",
              // borderColor: "#063164",  // Border color set to the dark blue shade
              // borderWidth: "1px",      // Ensure the border is visible
              // borderStyle: "solid",    // Solid border
              // borderRadius: "12px",
              // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              // boxShadow: "0 4px 12px rgba(34, 193, 56, 0.3)",  // Green color with opacity
              marginTop: "20px",
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="d-flex justify-content-between align-items-center" // Correct class name
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between", // Distribute items across the full width
                alignItems: "center", // Ensure all items are aligned horizontally
              }}
            >
              {/* Left aligned fields: Start Date, End Date, Payment Method, and Report Type */}
              <div
                className="d-flex gap-4 align-items-center"
                style={{ flex: 1 }}
              >
                {/* Start Date Picker */}
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  className="startEndDateCol"
                >
                  <DemoContainer
                    components={["DatePicker"]}
                    className="startEndDateCol"
                  >
                    <DatePicker
                      className="ContrcatWidthDateFormat statDateFormat"
                      label="Start Date"
                      value={
                        selectedStartDate ? dayjs(selectedStartDate) : null
                      }
                      onChange={(newDate) =>
                        setSelectedStartDate(
                          newDate ? newDate.format("YYYY-MM-DD") : null
                        )
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

                {/* End Date Picker */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      className="ContrcatWidthDateFormat"
                      label="End Date"
                      value={selectedEndDate ? dayjs(selectedEndDate) : null}
                      onChange={(newDate) =>
                        setSelectedEndDate(
                          newDate ? newDate.format("YYYY-MM-DD") : null
                        )
                      }
                      minDate={
                        selectedStartDate
                          ? dayjs(selectedStartDate)
                          : undefined
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

                {/* Payment Method Selector */}
                <Grid style={{ marginTop: "8px" }}>
                  <Input
                    className="border-blue-color text-blue-color"
                    style={{
                      fontSize: "15px",
                      height: "45px",
                      borderRadius: "8px",
                      padding: "0 14px",
                      width: "13rem",
                      backgroundColor: "#f7f8fa",
                    }}
                    type="select"
                    name="method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="">Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="ACH">ACH</option>
                    <option value="Cheque">Cheque</option>
                  </Input>
                </Grid>

                {/* Report Type Selector */}
                <Grid style={{ marginTop: "8px" }}>
                  <Input
                    className="border-blue-color text-blue-color"
                    style={{
                      fontSize: "15px",
                      height: "45px",
                      borderRadius: "8px",
                      padding: "0 14px",
                      width: "13rem",
                      backgroundColor: "#f7f8fa",
                    }}
                    type="select"
                    name="account_type"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="">Select Report Type</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </Input>
                </Grid>
              </div>

              {/* Generate Report Button */}
              <BlueButton
                className="bg-blue-color text-white-color"
                outline
                type="submit"
                style={{
                  padding: "0 14px",
                  fontSize: "16px",
                  marginTop: "6px",
                  height: "45px",
                  borderRadius: "8px",
                  width: "160px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease-in-out",
                  backgroundColor: "#063164", // Blue button
                  border: "none",
                }}
                label="Generate Report"
              />
            </form>
          </Grid>
        )}

        {/* Display the table of report data */}

        <>
          <Grid
            className="justify-content-center align-items-center mb-3"
            style={{ marginTop: "30px" }}
          >
            {/* <Grid className="d-flex justify-content-between mb-2 align-items-center customer_addCustomer_Grid customersAddCustomers"></Grid> */}

            <Card
              className="border-blue-color"
              style={{
                borderRadius: "20px",
                border: "2px solid ",
                padding: 0,
              }}
            >
              <CardHeader
                className="d-flex justify-content-between align-items-center table-header bg-blue-color customerList_searchbar customersAddCustomers"
                style={{
                  borderBottom: "2px solid ",
                  borderTopLeftRadius: "15px",
                  borderTopRightRadius: "15px",
                }}
              >
                <Typography className="contrac text-light customerList_head heading-five tableNameHead fw-medium">
                  Payment Report
                </Typography>
                <Grid className="customer d-flex gap-2 customer_searchBar searchBarOfTable">
                  {/* <JobberSorting
                      dropdownItems={dropdownOptions}
                      placeholder="Select method"
                      onSelect={handleDropdownSelect}
                    />
                    <JobberSearch
                      search={search}
                      setSearch={setSearch}
                      style={{ background: "transparent", color: "white" }}
                    /> */}
                </Grid>
              </CardHeader>
              {loader ? (
                <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
                  <LoaderComponent loader={loader} height="50" width="50" />
                </Grid>
              ) : (
                <CardBody style={{ padding: "10px 0px" }}>
                  <JobberTable
                    headerData={[
                      "Sr No.",
                      "Payment Method",
                      "Amount",
                      "Date",
                      "CC_TYPE",
                      "Customer Name",
                    ]}
                    cellData={cellData}
                    collapseData={collapseData}
                    isCollapse={false}
                    page={page}
                    //   isNavigate={false}
                    //   isDialog={true}
                    //   onDialogOpen={handleDialogOpen}
                  >
                    {/* <TableBody>
                        {reportData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.method}</TableCell>
                            <TableCell>{row.amount}</TableCell>
                            <TableCell>
                              {moment(row.date).format("YYYY-MM-DD")}
                            </TableCell>
                            <TableCell>
                              {typeof row?.cc_number === "string"
                                ? row.cc_number
                                : row?.check_account || "N/A"}
                            </TableCell>
                            <TableCell>
                              {typeof row?.first_name === "string"
                                ? row?.first_name
                                : row?.getCustomerDetails?.FirstName ||
                                  "N/A"}{" "}
                              {typeof row?.last_name === "string"
                                ? row?.last_name
                                : row?.getCustomerDetails?.LastName || ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody> */}
                  </JobberTable>
                </CardBody>
              )}

              {/* Footer with Pagination */}
              <CardFooter
                className="bg-orange-color border-blue-color"
                style={{
                  borderTop: "2px solid ",
                  borderBottomLeftRadius: "20px",
                  borderBottomRightRadius: "20px",
                }}
              >
                <JobberPagination
                  // totalData={totalPages * rowsPerPage}
                  // currentData={rowsPerPage}
                  // dataPerPage={rowsPerPage}
                  // pageItems={[10, 25, 50]}
                  // page={page}
                  // setPage={setPage}
                  // setRowsPerPage={setRowsPerPage}
                  totalData={countData}
                  currentData={rowsPerPage}
                  dataPerPage={rowsPerPage}
                  pageItems={[10, 25, 50]}
                  page={page}
                  setPage={setPage}
                  setRowsPerPage={setRowsPerPage}
                  // onPageChange={handleChangePage}
                  // onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </CardFooter>
            </Card>
          </Grid>
        </>
      </>
    </>
  );
};

export default Financial;
