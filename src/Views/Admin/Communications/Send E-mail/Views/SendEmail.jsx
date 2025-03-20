import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  DialogActions,
  TextField,
} from "@mui/material";
import BlueButton from "../../../../../components/Button/BlueButton";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../../components/MuiTable";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { LoaderComponent } from "../../../../../components/Icon/Index";
import InputText from "../../../../../components/InputFields/InputText";
import WhiteButton from "../../../../../components/Button/WhiteButton";
import moment from "moment";
import template from "../../../../../assets/White-sidebar-icon/Send E-Mail.svg"

const SentEmail = ({
  loader,
  search,
  setSearch,
  cellData,
  collapseData,
  page,
  setPage,
  setRowsPerPage,
  companyName,
  countData,
  rowsPerPage,
  handleDialogOpen,
  dialogData,
  handleDialogClose,
  openDialog,
  customersData,
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
            Emails
          </Typography>
          <Grid className="searchBarOfTable">
            <BlueButton
              onClick={() => {
                if (companyName) {
                  navigate(`/${companyName}/add-new-email`, {
                    state: {
                      navigats: [
                        ...location?.state?.navigats,
                        "/add-new-email",
                      ],
                    },
                  });
                } else {
                  navigate(`/staff-member/add-new-email`, {
                    state: {
                      navigats: [
                        ...location?.state?.navigats,
                        "/add-new-email",
                      ],
                    },
                  });
                }
              }}
              label="Add Email"
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
              Emails List
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
                headerData={[
                  "Sr No.",
                  "Subject ",
                  "Reply to",
                  "Body",
                  "Send date",
                  "Action",
                ]}
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
        <DialogTitle className="d-flex align-items-center gap-2">
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
          Email 
        </DialogTitle>
        {customersData && customersData.length > 0 ? (
          <DialogContent>
            <Card className="p-0" style={{ border: "none" }}>
              <CardBody className="p-0">
                <Grid className="email-logs border-color-blue">
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={customersData[0]?.Subject}
                    name="customersData[0]?.Subject"
                    label="Subject"
                    type="text"
                    className="text-blue-color mt-4 w-100 customerTopHere"
                    fieldHeight="56px"
                    disabled
                  />
                </Grid>
                <Grid className="email-logs mt-4 border-color-blue">
                  <InputText
                    onFocus={(e) => e.target.blur()}
                    value={customersData[0]?.To}
                    name="customersData[0]?.To"
                    label="Reply To"
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
                    value={customersData[0]?.Body}
                    name="dialogData[0]?.Body"
                    className="text-blue-color w-100 customerTopHere"
                    InputProps={{
                      style: { color: "#063164" },
                    }}
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

export default SentEmail;
