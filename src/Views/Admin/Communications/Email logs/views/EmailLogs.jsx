import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../../components/MuiTable";
import { LoaderComponent } from "../../../../../components/Icon/Index";
import WhiteButton from "../../../../../components/Button/WhiteButton";
import template from "../../../../../assets/White-sidebar-icon/E-mail-Logs.svg";
import moment from "moment";
import InputText from "../../../../../components/InputFields/InputText";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CloseIcon from "@mui/icons-material/Close";
const EmailLogs = ({
  loader,
  search,
  setSearch,
  cellData,
  collapseData,
  page,
  setPage,
  setRowsPerPage,
  countData,
  rowsPerPage,
  handleDialogOpen,
  dialogData,
  handleDialogClose,
  openDialog,
  dateFormat,
  setSortField,
  setSortOrder,
  sortOrder,
  sortField,
}) => {
  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3">
        <Grid className="d-flex justify-content-between mb-2 align-items-center customersAddCustomers">
          <Typography
            className="text-blue-color heading-three tableNameHead"
            style={{ fontWeight: 700 }}
          >
            Email Logs
          </Typography>
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
              Email Logs List
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
            <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
              <LoaderComponent height="50" width="50" loader={loader} />
            </Grid>
          ) : (
            <CardBody style={{ padding: "10px 0px" }}>
              <JobberTable
                style={{ whiteSpace: "nowrap" }}
                // headerData={[
                //   "Sr No.",
                //   "Full Name ",
                //   "Address",
                //   "Subject",
                //   "Sent",
                //   "Opened",
                // ]}
                headerData={[
                  { label: "Sr No." },
                  { label: "Full Name", field: "FirstName" },
                  { label: "Email", field: "email" },
                  { label: "Subject", field: "Subject" },
                  { label: "createdAt", field: "createdAt" },
                  { label: "Opened", field: "openedAt" },
                ]}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
                cellData={cellData}
                collapseData={collapseData}
                isCollapse={false}
                page={page}
                isNavigate={false}
                isDialog={true}
                onDialogOpen={handleDialogOpen}
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
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle className="d-flex text-blue-color align-items-center gap-2 borerBommoModel">
          <Typography
            style={{
              padding: "10px ",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="bg-blue-color"
          >
            <img src={template} />
          </Typography>
          Email Logs Details
        </DialogTitle>
        {dialogData && dialogData.length > 0 ? (
          <DialogContent>
            <Card className="p-0" style={{ border: "none" }}>
              <CardBody className="p-0">
                <Grid className="email-logs p-2 border-color-blue d-flex justify-content-between">
                  <span
                    className="d-flex justify-content-between text-blue-color textcolorblue fontfamilysty labelfontstyle"
                    style={{
                      fontWeight: "500",
                    }}
                  >
                    Open Status:{" "}
                  </span>
                  <div className="status-icon-container">
                    {dialogData[0]?.isOpened && dialogData[0]?.isAccepted ? (
                      <DoneAllIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )}
                  </div>
                </Grid>
                <Grid className="email-logs p-2 border-color-blue">
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={dialogData[0]?.Subject}
                    name="dialogData[0]?.Subject"
                    label="Subject"
                    type="text"
                    className="text-blue-color w-100 customerTopHere"
                    fieldHeight="56px"
                    disabled
                  />
                </Grid>
                <Grid className="email-logs p-2 border-color-blue">
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={dialogData[0]?.email}
                    name="dialogData[0]?.email"
                    label="Email"
                    type="text"
                    className="text-blue-color w-100 customerTopHere"
                    fieldHeight="56px"
                    disabled
                  />
                </Grid>
                <Grid className="email-logs p-2 border-color-blue">
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={dialogData[0]?.From}
                    name="dialogData[0]?.From"
                    label="From"
                    type="text"
                    className="text-blue-color w-100 customerTopHere"
                    fieldHeight="56px"
                    disabled
                  />
                </Grid>
                <Grid className="email-logs p-2 border-color-blue">
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={
                      dialogData[0]?.createdAt
                        ? moment(dialogData[0]?.createdAt).format(dateFormat)
                        : ""
                    }
                    name="dialogData[0]?.createdAt"
                    label="Created Time"
                    type="text"
                    className="text-blue-color w-100 customerTopHere"
                    fieldHeight="56px"
                    disabled
                  />
                </Grid>
                <Grid
                  className="email-logs  p-2 border-color-blue email-logs-title"
                  style={{ border: "none" }}
                >
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={
                      dialogData?.[0]?.openedAt
                        ? moment(Number(dialogData[0].openedAt)).format(
                            "MM-DD-YYYY HH:mm:ss"
                          )
                        : "Not Opened"
                    }
                    name="dialogData[0]?.createdAt"
                    label="Open Time"
                    type="text"
                    className="text-blue-color w-100 customerTopHere"
                    fieldHeight="56px"
                    disabled
                    style={{ color: "black", backgroundColor: "white" }}
                  />
                </Grid>
              </CardBody>
            </Card>
          </DialogContent>
        ) : (
          <Typography className="text-blue-color">No Data Available</Typography>
        )}
        <DialogActions style={{ paddingRight: "27px" }}>
          <WhiteButton onClick={handleDialogClose} label="Cancel" />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmailLogs;
