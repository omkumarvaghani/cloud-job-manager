import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../../../components/Icon/Index";
// import "./style.css";
import { Grid, TextField } from "@mui/material";
import BlueButton from "../../../../../components/Button/BlueButton";
import { Typography } from "@mui/material";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../../components/MuiTable/index";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import InputText from "../../../../../components/InputFields/InputText";
import WhiteButton from "../../../../../components/Button/WhiteButton";
import { NoDataFound } from "../../../../../components/Contract Component/Index";
import DollerInput from "../../../../../components/InputFields/Doller";
import Accounts from "../../../../Admin/Setting/Accounts/Account";
import AccountRecurring from "../AddAccount";
const RecurringCharge = ({
  loader,
  setPaymentOpen,
  search,
  setSearch,
  cellData,
  CollapseData,
  page,
  setRowsPerPage,
  countData,
  rowsPerPage,
  setPage,
  formik,
  paymentOpen,
  setSelectedAccountId,
  setSelectedFrequency,
  addBankAccountDialogOpen,
  setAddBankAccountDialogOpen,
  accountTypeName,
  AssetAccounts,
  toggles1,
  selectChargeDropDown,
  toggleWeekdayDropdown,
  weekdayDropdownOpen,
  toggleFrequencyDropdown,
  frequencyDropdownOpen,
  fetchAccounts,
  loading,
  location,
  navigate,
  companyName,
  // modelOpen,
  // setModelOpen,
  setModelAccOpen,
  handleCloseDialog,
  handleSubmit,
  handleAccSubmit,
  formData,
  handleInputChange,
  setFormData,
  AccountsRecurring,
  modelAccOpen,
  recurringChargeId,
  setRecurringChargeId,
  setSortField,
  setSortOrder,
  sortOrder,
  sortField,
}) => {
  const calendarRef = React.useRef(null);
  const [modelOpen, setModelOpen] = useState(false);

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 client">
        <Grid style={{ display: "flex", justifyContent: "end" }}>
          <BlueButton
            className="bg-button-blue-color mb-3"
            onClick={() => setPaymentOpen({ isOpen: true, propertyData: null })}
            label="Add Recurring Charge"
          />
        </Grid>

        <Grid>
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
                Recurring Charges
              </Typography>
              <Grid className=" customersearch d-flex customer_searchBar searchBarOfTable">
                <JobberSearch
                  search={search}
                  setSearch={setSearch}
                  style={{
                    background: "transparant",
                    color: "white",
                  }}
                />
              </Grid>
            </CardHeader>
            {loader ? (
              <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
                <LoaderComponent loader={loader} height="50" width="50" />
              </Grid>
            ) : (
              <CardBody style={{ padding: "10px 0px" }}>
                <JobberTable
                  style={{ whiteSpace: "nowrap" }}
                  // headerData={[
                  //   "Sr No.",
                  //   "Cycle",
                  //   "Account",
                  //   "Amount",
                  //   "Description",
                  //   "CreateAt",
                  //   "Next Due Date",
                  //   "Action",
                  // ]}
                  headerData={[
                    { label: "Sr No." },
                    { label: "Cycle", field: "frequency" },
                    { label: "Account", field: "account_name" },
                    { label: "Amount", field: "amount" },
                    { label: "Description", field: "description" },
                    { label: "CreateAt", field: "createdAt" },
                    { label: "Next Due Date", field: "nextDueDate" },
                    { label: "Action" },
                  ]}
                  setSortField={setSortField}
                  setSortOrder={setSortOrder}
                  sortOrder={sortOrder}
                  sortField={sortField}
                  cellData={cellData}
                  isCollapse={true}
                  page={page}
                  CollapseComponent={(data) => CollapseData(data)}
                  isNavigate={true}
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
      </Grid>

      <Dialog
        fullWidth
        open={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          formik.resetForm();
          setSelectedAccountId("");
          setSelectedFrequency("");
          setRecurringChargeId(null);
        }}
        addBankAccountDialogOpen={addBankAccountDialogOpen}
        setAddBankAccountDialogOpen={setAddBankAccountDialogOpen}
        accountTypeName={accountTypeName}
        fetchAccounts={fetchAccounts}
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
          style={{
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {/* Add Recurring Charge */}

          {recurringChargeId ? "Edit Recurring Charge" : "Add Recurring Charge"}
        </DialogTitle>
        <DialogContent
          dividers
          style={{
            padding: "30px",
            borderTop: "4px solid #E88C44",
          }}
        >
          <Grid>
            <Grid>
              <Dropdown
                className="mb-3"
                isOpen={frequencyDropdownOpen}
                toggle={toggleFrequencyDropdown}
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
                  {formik.values.frequency || "Select Frequency"}
                </DropdownToggle>
                <DropdownMenu
                  className="dropdownfontsyle"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    border: "none",
                  }}
                  name="frequency"
                >
                  {[
                    "Yearly",
                    "Monthly",
                    "Every n Months",
                    "Weekly",
                    "Every n Weeks",
                    "Quarterly",
                  ].map((option) => (
                    <DropdownItem
                      key={option}
                      onClick={() => {
                        formik.setFieldValue("frequency", option);
                        formik.setFieldValue("frequency_interval", "");
                      }}
                    >
                      {option}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              {(formik.values.frequency === "Every n Months" ||
                formik.values.frequency === "Every n Weeks") && (
                <InputText
                  className="mb-3 border-blue-color text-blue-color"
                  type="number"
                  name="frequency_interval"
                  value={formik.values.frequency_interval}
                  onChange={(e) => {
                    let value = parseInt(e.target.value, 10) || "";
                    let maxValue =
                      formik.values.frequency === "Every n Months" ? 12 : 4;
                    if (value > maxValue) value = maxValue;
                    // if (value < 1) value = 1;
                    formik.setFieldValue("frequency_interval", value);
                  }}
                  placeholder="Enter interval"
                  // placeholder="Enter month"
                  style={{ width: "100%" }}
                  label="Enter interval"
                />
              )}

              {(formik.values.frequency === "Monthly" ||
                formik.values.frequency === "Every n Months") && (
                <InputText
                  className="mb-3 border-blue-color text-blue-color"
                  type="number"
                  name="day_of_month"
                  value={formik.values.day_of_month}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (value >= 1 && value <= 28)) {
                      formik.setFieldValue("day_of_month", value);
                    }
                  }}
                  placeholder="Enter day of the month(1-28)"
                  min="1"
                  max="28"
                  style={{ width: "100%" }}
                  label="Enter days of the month"
                />
              )}

              {(formik.values.frequency === "Every n Weeks" ||
                formik.values.frequency === "Weekly") && (
                <Dropdown
                  className="mb-3"
                  isOpen={weekdayDropdownOpen}
                  toggle={toggleWeekdayDropdown}
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
                    {formik.values.weekday || "Select Day of the Week"}
                  </DropdownToggle>
                  <DropdownMenu
                    className="dropdownfontsyle"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      overflowY: "auto",
                      boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                      border: "none",
                    }}
                  >
                    {[
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day) => (
                      <DropdownItem
                        key={day}
                        onClick={() => formik.setFieldValue("weekday", day)}
                      >
                        {day}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}

              {formik.values.frequency === "Yearly" && (
                <>
                  <Grid>
                    <InputText
                      type="number"
                      name="day_of_year"
                      value={formik.values.day_of_year || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (value >= 1 && value <= 28)) {
                          formik.setFieldValue("day_of_year", value);
                        }
                      }}
                      placeholder="Enter day"
                      min="1"
                      max="28"
                      style={{ width: "100%" }}
                      label="Enter day"
                    />
                  </Grid>
                  <Grid>
                    <InputText
                      className=""
                      type="number"
                      name="month"
                      value={formik.values.month || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (value >= 1 && value <= 12)) {
                          formik.setFieldValue("month", value);
                        }
                      }}
                      placeholder="Enter month (1-12)"
                      min="1"
                      max="12"
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        marginBottom: "10px",
                      }}
                      label="Enter month"
                    />
                  </Grid>
                </>
              )}

              {formik.values.frequency === "Quarterly" && (
                <InputText
                  type="number"
                  name="days_after_quarter"
                  value={formik.values.days_after_quarter || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (value >= 0 && value <= 90)) {
                      formik.setFieldValue("days_after_quarter", value);
                    }
                  }}
                  placeholder="Enter days after quarter start"
                  min="0"
                  max="90"
                  className="pb-3"
                  style={{ width: "100%" }}
                  label="Enter days after quarter start"
                />
              )}
            </Grid>
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
                {formik.values.account_name || "Select Account"}
              </DropdownToggle>
              <DropdownMenu
                className="dropdownfontsyle"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  overflowY: "auto",
                  boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                  border: "none",
                }}
              >
                <DropdownItem
                  onClick={() => {
                    setModelOpen(true);
                  }}
                  style={{
                    fontWeight: "600",
                    color: "#007bff",
                  }}
                >
                  Add Account
                </DropdownItem>

                {AssetAccounts?.length > 0 ? (
                  <>
                    <DropdownItem
                      className="fontstylerentmodal text-blue-color"
                      header
                      style={{
                        fontWeight: "600",
                      }}
                    >
                      Asset
                    </DropdownItem>
                    {AssetAccounts.map((item) => (
                      <DropdownItem
                        key={item.account_id}
                        onClick={() => {
                          formik.setFieldValue("account_id", item.account_id);
                          formik.setFieldValue(
                            "account_name",
                            item.account_name
                          );
                        }}
                      >
                        {item.account_name}
                      </DropdownItem>
                    ))}
                  </>
                ) : (
                  // If no AssetAccounts, show a message with the "Add Account" button
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
                    </Grid>
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>

            {formik.errors.account_id && formik.touched.account_id && (
              <div
                className="error-message"
                style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}
              >
                {formik.errors.account_id}
              </div>
            )}
            <Grid>
              {/* <InputText
                value={
                  formik.values.amount
                    ? `$${parseFloat(formik.values.amount).toFixed(2)}`
                    : "$0.00"
                }
                onChange={(e) => {
                  let rawValue = e.target.value.replace(/[^0-9.]/g, "");

                  if ((rawValue.match(/\./g) || []).length > 1) {
                    rawValue = rawValue.slice(0, rawValue.lastIndexOf("."));
                  }

                  formik.setFieldValue("amount", rawValue);
                }}
                onBlur={() => {
                  let finalValue = parseFloat(
                    formik.values.amount || "0"
                  ).toFixed(2);
                  formik.setFieldValue("amount", finalValue);
                }}
                name="amount"
                placeholder="$0.00"
                label="Amount"
                type="text"
                className="text-blue-color w-100 mb-3"
                fieldHeight="56px"
              /> */}
              <Grid>
                <DollerInput
                  value={formik.values.amount}
                  placeholder="Enter Amount"
                  onChange={(e) => {
                    let rawValue = e.target.value.replace(/[^0-9.]/g, "");

                    if ((rawValue.match(/\./g) || []).length > 1) {
                      rawValue = rawValue.slice(0, rawValue.lastIndexOf("."));
                    }

                    formik.setFieldValue("amount", rawValue);
                  }}
                  onBlur={() => {
                    let finalValue = parseFloat(
                      formik.values.amount || "0"
                    ).toFixed(2);
                    formik.setFieldValue("amount", finalValue);
                  }}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  name="amount"
                  label="Amount"
                  type="text"
                />
              </Grid>
              {formik.errors.amount && formik.touched.amount && (
                <div
                  className="error-message"
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                >
                  {formik.errors.amount}
                </div>
              )}
            </Grid>
            <Grid>
              <TextField
                className="note-details mt-1 text-blue-color border-blue-color"
                name="description"
                label="Description"
                type="text"
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Enter A description"
                multiline
                rows={3}
              />
              {formik.errors.description && formik.touched.description && (
                <div
                  className="error-message"
                  style={{ color: "red", fontSize: "12px", marginTop: "10px" }}
                >
                  {formik.errors.description}
                </div>
              )}
            </Grid>
          </Grid>

          <Grid className="mt-3 d-flex justify-content-between chargeModelBt">
            <WhiteButton
              className="text-blue-color border-blue-color nogoback"
              onClick={() => {
                formik.resetForm();
                setPaymentOpen(false);
                setRecurringChargeId(null);
              }}
              label="Cancel"
            />

            {/* <BlueButton
              className="text-blue-color border-blue-color nogoback"
              onClick={formik.handleSubmit}
              label={
                loading ? (
                  <WhiteLoaderComponent
                    height="20"
                    width="20"
                    padding="20"
                    loader={loading}
                  />
                ) : (
                  "Add Charge"
                )
              }
            /> */}
            <Grid className="gap-3 d-flex  ">
              {/* <BlueButton
                  className=""
                  onClick={formik?.handleSubmit}
                  style={{
                    fontSize: "16px",
                    // opacity: isEdited ? 1 : 0.5,
                  }}
                  // disabled={!isEdited}
                  label={recurringChargeId ? "Edit Charge" : "Add Charge"}
                /> */}
              <BlueButton
                className=""
                onClick={formik?.handleSubmit}
                style={{
                  fontSize: "16px",
                }}
                label={
                  loading ? (
                    <WhiteLoaderComponent
                      height="20"
                      width="20"
                      padding="20"
                      loader={loading}
                    />
                  ) : recurringChargeId ? (
                    "Edit Recurring Charge"
                  ) : (
                    "Add Recurring Charge"
                  )
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <AccountRecurring
        fetchAccounts={fetchAccounts}
        modelOpen={modelOpen}
        setModelOpen={setModelOpen}
      />
    </>
  );
};

export default RecurringCharge;
