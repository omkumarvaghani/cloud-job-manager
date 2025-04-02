import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
} from "reactstrap";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../components/MuiTable";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../../components/Icon/Index";
import WhiteButton from "../../../../components/Button/WhiteButton";
import "./style.css";
import InputText from "../../../../components/InputFields/InputText";
import template from "../../../../assets/White-sidebar-icon/Template-dialog.svg";
import { NoDataFound } from "../../../../components/Contract Component/Index";

const Templates = ({
  loader,
  search,
  setSearch,
  cellData,
  collapseData,
  page,
  setPage,
  setRowsPerPage,
  CompanyName,
  countData,
  rowsPerPage,
  isEdited,
  handleDialogOpen,
  dialogData,
  handleDialogClose,
  openDialog,
  customersData,
  setSortField,
  setSortOrder,
  sortOrder,
  sortField,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3">
        <Grid className="d-flex justify-content-between mb-2 align-items-center customersAddCustomers">
          <Typography
            className="text-blue-color heading-three tableNameHead"
            style={{ fontWeight: 700 }}
          >
            Templates
          </Typography>
          <Grid className="searchBarOfTable">
            <BlueButton
              // onClick={() => {
              //   navigate(`/${CompanyName}/add-customer`, {
              //     state: {
              //       navigats: [...location.state.navigats, "/add-customer"],
              //     },
              //   });
              // }}

              onClick={() => {
                if (CompanyName) {
                  navigate(`/${CompanyName}/add-templates`, {
                    state: {
                      navigats: [
                        ...location?.state?.navigats,
                        "/add-templates",
                      ],
                    },
                  });
                } else {
                  navigate(`/staff-member/add-templates`, {
                    state: {
                      navigats: [
                        ...location?.state?.navigats,
                        "/add-templates",
                      ],
                    },
                  });
                }
              }}
              label="Add Templates"
            />
          </Grid>
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
              delete
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
                //   "Name ",
                //   "Mail Type",
                //   "Subject",
                //   "Body",
                //   "CreateAt",
                //   "Action",
                // ]}
                headerData={[
                  { label: "Sr No." },
                  { label: "Name", field: "Name" },
                  { label: "Mail Type", field: "MailType" },
                  { label: "Subject", field: "Subject" },
                  { label: "Body", field: "Body" },
                  { label: "CreateAt", field: "createdAt" },
                  { label: "Action" },
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

        <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm">
          <DialogTitle className="d-flex align-items-center gap-2 borerBommoModel">
            <Typography
              style={{
                padding: "10px 10px 10px 12px ",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              className="bg-blue-color"
            >
              <img src={template} />
            </Typography>{" "}
            Template Details
          </DialogTitle>
          <DialogContent>
            {dialogData && dialogData.length > 0 ? (
              <Grid spacing={2}>
                <Grid
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  className="templeNameHere"
                >
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={dialogData[0]?.Name}
                    name="dialogData[0]?.Name"
                    label="Name"
                    type="text"
                    className="text-blue-color w-100 customerTopHere"
                    fieldHeight="56px"
                    disabled
                  />
                </Grid>
                <Grid
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  className="templeNameHere"
                >
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={dialogData[0]?.MailType}
                    name="dialogData[0]?.MailType"
                    label="Mail Type"
                    type="text"
                    className="text-blue-color w-100 customerTopHere"
                    fieldHeight="56px"
                    disabled
                  />
                </Grid>
                <Grid
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  className="templeNameHere"
                >
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
                <Grid
                  style={{
                    marginTop: "20px",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    id="outlined-multiline-static"
                    label="Body"
                    multiline
                    rows={4}
                    onFocus={(e) => e.target.blur()}
                    value={dialogData[0]?.Body}
                    name="dialogData[0]?.Body"
                    className="text-blue-color w-100 customerTopHere"
                    InputProps={{
                      style: { color: "#063164" },
                    }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Typography className="text-blue-color">
             <NoDataFound/>
              </Typography>
            )}
          </DialogContent>
          <DialogActions style={{ paddingRight: "25px" }}>
            <WhiteButton onClick={handleDialogClose} label="Cancel" />
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
};

export default Templates;
