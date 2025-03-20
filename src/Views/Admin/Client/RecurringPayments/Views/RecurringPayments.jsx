import React, { useState } from "react";
import {
  // Button,
  // Card,
  // CardBody,
  // CardFooter,
  // CardHeader,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  Table,
  TabPane,
  UncontrolledDropdown,
} from "reactstrap";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
  WhiteLoaderComponent,
} from "../../../../../components/Icon/Index";
// import "./style.css";
import { Grid } from "@mui/material";
import BlueButton from "../../../../../components/Button/BlueButton";
import { Typography } from "@mui/material";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../../components/MuiTable/index";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import InputText from "../../../../../components/InputFields/InputText";
import WhiteButton from "../../../../../components/Button/WhiteButton";
import AddCardDetailsForm from "../../../../../components/AdminViews/AddCardDetailsForm";
import { NoDataFound } from "../../../../../components/Contract Component/Index";
import DollerInput from "../../../../../components/InputFields/Doller";
import AccountRecurring from "../../RecurringCharges/AddAccount"

const RecurringPayments = ({
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
  customerCards,
  selectCardDropDown,
  togglesCard,
  loading,
  isPublicKeyAvailable,
  scriptError,
  setModalShow,
  scriptGenerating,
  modalShow,
  CustomerId,
  CompanyId,
  fetchRecurringCardData,
  submitloading,
  navigate,
  companyName,
  recurringChargeId,
  setRecurringChargeId,
  setSortField,
  setSortOrder,
  sortOrder,
  sortField,
}) => {
  const [modelOpen, setModelOpen] = useState(false);
  return (
      <>

      <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
        <Grid style={{ display: "flex", justifyContent: "end" }}>
          <BlueButton
            className="bg-button-blue-color mb-3"
            onClick={() => setPaymentOpen({ isOpen: true, propertyData: null })}
            label="Add Recurring Payments"
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
                Recurring Payments
              </Typography>
              <Grid className=" customersearch d-flex customer_searchBar searchBarOfTable">
                <JobberSearch
                  search={search}
                  setSearch={setSearch}
                  style={{
                    background: "transparant",
                    color: "white",
                  }}
                  // des
                />
              </Grid>
            </CardHeader>
            {loader ? (
              <Grid
                className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
                style={{
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <LoaderComponent height="50" width="50" loader={loader} />
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
          {/*  */}
          {recurringChargeId
            ? "Edit Recurring Payments"
            : "Add Recurring Payments"}
        </DialogTitle>
        {loading ? (
          <Grid
            className="d-flex flex-direction-row justify-content-center align-items-center Typography-5 m-5"
            style={{ height: "80vh", marginTop: "25%" }}
          >
            <LoaderComponent loader={loading} height="50" width="50" />
          </Grid>
        ) : (
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
                  isOpen={selectCardDropDown}
                  toggle={togglesCard}
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
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {formik.values.cc_number ? (
                      <>
                        <img
                          src={
                            customerCards.find(
                              (card) =>
                                card.billing_id === formik.values.billing_id
                            )?.card_logo
                          }
                          alt="Card Logo"
                          style={{ width: "24px", marginRight: "10px" }}
                        />
                        {`${formik.values.card_type} - ${formik.values.cc_number}`}
                      </>
                    ) : (
                      "Select Card"
                    )}
                  </DropdownToggle>

                  <DropdownMenu
                    className="dropdownfontsyle border-blue-color"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      overflowY: "auto",
                      boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                      border: "none",
                    }}
                  >
                    {customerCards?.length > 0 ? (
                      <>
                        <DropdownItem
                          className="fontstylerentmodal text-blue-color"
                          header
                          style={{ fontWeight: "600" }}
                        >
                          Select a Card
                        </DropdownItem>
                        {isPublicKeyAvailable && (
                          <DropdownItem
                            className="background-colorsty bgtextwhite"
                            onClick={() => setModalShow(true)}
                          >
                            Add Card
                          </DropdownItem>
                        )}
                        {customerCards.map((item) => (
                          <DropdownItem
                            key={item.billing_id}
                            onClick={() => {
                              formik.setFieldValue(
                                "billing_id",
                                item.billing_id
                              );
                              formik.setFieldValue("card_type", item.card_type);
                              formik.setFieldValue(
                                "customer_vault_id",
                                item.customer_vault_id
                              );
                              formik.setFieldValue("cc_number", item.cc_number);
                            }}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <img
                              src={item.card_logo}
                              alt={item.cc_type}
                              style={{ width: "24px", marginRight: "10px" }}
                            />
                            {`${item.cc_type} - ${item.cc_number}`}
                          </DropdownItem>
                        ))}
                      </>
                    ) : (
                      [
                        isPublicKeyAvailable ? (
                          <DropdownItem
                            key="add-card"
                            className="background-colorsty bgtextwhite"
                            onClick={() => setModalShow(true)}
                          >
                            Add Card
                          </DropdownItem>
                        ) : null,
                        <DropdownItem key="no-cards" disabled>
                          No Cards Available
                        </DropdownItem>,
                      ]
                    )}
                  </DropdownMenu>
                </Dropdown>

                {formik.errors.billing_id && formik.touched.billing_id && (
                  <div
                    className="error-message"
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    {formik.errors.billing_id}
                  </div>
                )}

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
                      if (value < 1) value = 1;
                      formik.setFieldValue("frequency_interval", value);
                    }}
                    placeholder="Enter interval"
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
                    label="Enter day of month"
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
                        className="mt-3"
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
                          mrginTop: "10px",
                          marginBottom: "10px ",
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
              {/* <Dropdown
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
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    overflowY: "auto",
                    border: "none",
                  }}
                >
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
                      {AssetAccounts?.map((item) => (
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
                    <></>
                  )}
                </DropdownMenu>
              </Dropdown> */}
              {/* <Dropdown
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
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    overflowY: "auto",
                    border: "none",
                  }}
                >
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
                            navigate(`/${companyName}/account`);
                          }}
                        >
                          Add Account
                        </Button>
                      </Grid>
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown> */}
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
                    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    overflowY: "auto",
                    border: "none",
                  }}
                >
                  {/* Always show Add Account at the top */}
                  <DropdownItem
                    className="text-blue-color"
                    style={{
                      fontWeight: "600",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onClick={() => {
                      setModelOpen(true);
                    }}
                  >
                    Add Account
                  </DropdownItem>

                  {AssetAccounts?.length > 0 && (
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
                  )}
                </DropdownMenu>
              </Dropdown>

              {formik.errors.account_id && formik.touched.account_id && (
                <div
                  className="error-message"
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
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
                    // value={
                    //   formik.values.amount
                    //     ? `$${parseFloat(formik.values.amount).toFixed(2)}`
                    //     : "$0.00"
                    // }
                    placeholder="Enter Amount"
                    value={formik.values.amount}
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
                    error={
                      formik.touched.amount && Boolean(formik.errors.amount)
                    }
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
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginTop: "10px",
                    }}
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
              {loading ? (
                <WhiteLoaderComponent
                  height="20"
                  width="20"
                  padding="20"
                  loader={loading}
                />
              ) : (
                <Grid className="gap-3 d-flex  ">
                  <BlueButton
                    className=""
                    onClick={formik?.handleSubmit}
                    style={{
                      fontSize: "16px",
                      // opacity: isEdited ? 1 : 0.5,
                    }}
                    // disabled={!isEdited}
                    label={
                      recurringChargeId
                        ? "Edit Recurring Payments"
                        : "Add Recurring Payments"
                    }
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
        )}
      </Dialog>
      <AddCardDetailsForm
        onHide={() => setModalShow(false)}
        show={modalShow}
        scriptGenerating={scriptGenerating}
        scriptError={scriptError}
        CustomerId={CustomerId}
        fetchData={fetchRecurringCardData}
        CompanyId={CompanyId}
      />
         <AccountRecurring
        fetchAccounts={fetchAccounts}
        modelOpen={modelOpen}
        setModelOpen={setModelOpen}
      />
    </>
  );
};

export default RecurringPayments;
