import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, CardFooter, CardHeader, Col, Input } from "reactstrap";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../../../components/Icon/Index";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../../components/MuiTable";
import BlueButton from "../../../../../components/Button/BlueButton";
import SettingSidebar from "../../../../../components/Setting/SettingSidebar";
import WhiteButton from "../../../../../components/Button/WhiteButton";
import { width } from "@mui/system";
import InputText from "../../../../../components/InputFields/InputText";
import AxiosInstance from "../../../../AxiosInstance";
import "./style.css";
import SettingDropdown from "../../../Setting/Materials&Labor/SettingComponent";

const Account = ({
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
  modelOpen,
  CollapseData,
  setModelOpen,
  handleSubmit,
  formData,
  handleInputChange,
  handleEditClick,
  handleOpenDialog,
  handleCloseDialog,
  setFormData,
  formik,

  setSortField,
  setSortOrder,
  sortOrder,
  sortField,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  return (
    <>
      <Grid className="d-flex">
        <Col className=" col-2 h-100 hiren" xl={2}>
          <SettingSidebar />
        </Col>
        <Col
          className=" product-service-table col-10  addProductServiceSideLine productRemove"
          style={{
            borderLeft: "0.5px solid rgba(6, 49, 100, 30%)",
            paddingLeft: "20px",
            marginTop: "-30px",
          }}
          xl={10}
        >
          <Grid className="justify-content-center align-items-center mb-3">
            <Grid>
              <Typography
                className="text-blue-color mt-5 mb-3 heading-three tableNameHead"
                style={{ fontWeight: 700, textDecoration: "underline" }}
              >
                Manage Accounts
              </Typography>
              <SettingDropdown
                isOpenDropDown={isOpenDropDown}
                toggle={toggle}
                CompanyName={CompanyName}
              />
            </Grid>
            <Grid className="d-flex justify-content-end mb-2 align-items-center customersAddCustomers">
              <Grid className="searchBarOfTable">
                <BlueButton
                  onClick={() => {
                    setModelOpen(true);
                  }}
                  label="Add account"
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
                  Accounts List
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
                    headerData={[
                      { field: "sr_no", label: "Sr No." },
                      { field: "account", label: "Account" },
                      { field: "type", label: "Type" },
                      { field: "description", label: "Description" },
                      { field: "action", label: "Action" },
                    ]}
                    setSortField={setSortField}
                    setSortOrder={setSortOrder}
                    sortOrder={sortOrder}
                    sortField={sortField}
                    cellData={cellData}
                    page={page}
                    isNavigate={true}
                    isCollapse={false}
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
        </Col>
      </Grid>
      <Dialog fullWidth open={modelOpen} onClose={handleCloseDialog}>
        <DialogTitle className="text-blue-color borerBommoModel">
          Select Account
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            className="text-blue-color mb-3"
            style={{ fontWeight: 500, textDecoration: "underline" }}
          >
            Select Account Type
          </Typography>
          <Grid>
            <Input
              className=" border-blue-color text-blue-color"
              style={{ fontSize: "15px", height: "46px", marginBottom: "10px" }}
              type="select"
              name="account_type"
              value={formik.values.account_type}
              onChange={formik.handleChange}
            >
              <option value="">Select Account Type</option>
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Revenue">Revenue</option>
              <option value="Expense">Expense</option>
            </Input>
            {formik.touched.account_type && formik.errors.account_type && (
              <Typography color="error" style={{ marginTop: "-5px" }}>
                {formik.errors.account_type}
              </Typography>
            )}
          </Grid>
          <Input
            placeholder="Enter title"
            label="account_name"
            name="account_name"
            type="text"
            value={formik.values.account_name}
            onChange={formik.handleChange}
            className="text-blue-color border-blue-color w-100"
            style={{ fieldHeight: "56px", margin: 0 }}
          />
          {formik.touched.account_name && formik.errors.account_name && (
            <Typography color="error">{formik.errors.account_name}</Typography>
          )}
          <TextField
            className="note-details mt-3 text-blue-color border-blue-color"
            name="notes"
            label="Description"
            value={formik.values.notes}
            onChange={formik.handleChange}
            placeholder="Enter A description"
            multiline
            rows={3}
          />
        </DialogContent>
        <Grid
          style={{
            paddingLeft: "20px",
            display: "flex",
            justifyContent: "space-between",
            paddingRight: "20px",
          }}
          className="managebuttonModel"
        >
          <WhiteButton
            className="my-2 text-blue-color border-blue-color"
            onClick={() => {
              setModelOpen(false);
              handleCloseDialog();
              setFormData({
                account_id: null,
                // account_type: "",
                // account_name: "",
                // notes: "",
              });
            }}
            // style={{ width: "20%" }}
            label="Cancel"
          />

          <BlueButton
            className="my-2 text-blue-color border-blue-color"
            onClick={() => {
              // setModelOpen(false);
              formik.handleSubmit();
              // setFormData({
              //   account_id: "",
              //   account_type: "",
              //   account_name: "",
              //   notes: "",
              // });
            }}
            style={{ width: "20%" }}
            label={
              loader ? (
                <WhiteLoaderComponent
                  height="20"
                  width="20"
                  padding="20"
                  loader={loader}
                />
              ) : (
                "Add"
              )
            }
          />
        </Grid>
      </Dialog>
    </>
  );
};

export default Account;
