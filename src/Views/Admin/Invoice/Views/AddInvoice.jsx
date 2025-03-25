import { CardContent, FormGroup, TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import React from "react";
import {
  Button,
  Card,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
} from "reactstrap";
import InputText from "../../../../components/InputFields/InputText";
import { InternalNotes } from "../../../../components/Contract Component/Index";
import InvoiceMail from "../InvoiceMail";
import invoice from "../../../../assets/White-sidebar-icon/Invoice.svg";
import GetProducts from "../../../../components/Materials&Labor/GetMaterialsAndLabor";
import Previous from "../../../../assets/image/icons/Previous.png";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import { LoaderComponent } from "../../../../components/Icon/Index";
import DiscountTable from "../../../../components/DiscountTable/DiscountTable";
import showToast from "../../../../components/Toast/Toster";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
const AddInvoice = ({
  invoiceData,
  subTotal,
  formik,
  isNumChange,
  loader,
  setIsNumChange,
  handleInvoiceNumberChange,
  IssueDate,
  setIssueDate,
  setDueDate,
  DueDate,
  handlePaymentDueChange,
  lineItems,
  handleSelectChange,
  setLineItems,
  menuIsOpen,
  setMenuIsOpen,
  deleteLineItem,
  showCosts,
  setShowCosts,
  addLineItem,
  discountAmount,
  taxAmount,
  Total,
  dropdownOpen,
  setLoader,
  toggle,
  mail,
  setMail,
  setIsCollect,
  CompanyName,
  loading,
  setLoading,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "70vh" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid style={{ overflow: "hidden" }}>
          {/* <Button
            style={{
              marginRight: "10px",
              width: "50px",
              height: "40px",
              padding: "0px 0px",
              borderRadius: "4px",
            }}
            onClick={() => {
              // navigate(-1);
              navigate(
                `/${
                  CompanyName
                    ? CompanyName + "/invoice"
                    : "staff-member" + "/workerinvoice"
                }`,
                {
                  state: {
                    navigats: location?.state?.navigats.filter(
                      (item) => item !== "/invoice"
                    ),
                  },
                }
              );
            }}
            className="text-capitalize bg-button-blue-color back-button text-white-color "
          >
            <img
              src={Previous}
              alt="img"
              style={{ width: "20px", height: "20px" }}
            />
          </Button> */}
          <Button
            style={{
              marginRight: "10px",
              width: "50px",
              height: "40px",
              padding: "0px 0px",
              borderRadius: "4px",
            }}
            onClick={() => {
              if (formik.dirty || lineItems.some((item) => item.isNew)) {
                const confirmLeave = window.confirm(
                  "You have unsaved changes. Are you sure you want to leave?"
                );
                if (!confirmLeave) {
                  return; 
                }
              }
              navigate(
                `/${
                  CompanyName
                    ? CompanyName + "/invoice"
                    : "staff-member" + "/workerinvoice"
                }`,
                {
                  state: {
                    navigats: location?.state?.navigats.filter(
                      (item) => item !== "/invoice"
                    ),
                  },
                }
              );
            }}
            className="text-capitalize bg-button-blue-color back-button text-white-color "
          >
            <img
              src={Previous}
              alt="Back"
              style={{ width: "20px", height: "20px" }}
            />
          </Button>
          <Card
            className="my-2 col-12 border-rgba-blue"
            style={{ borderRadius: "20px" }}
          >
            <CardHeader
              className="invoice-header"
              style={{
                background: "transparent",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                style={{
                  borderRadius: "50%",
                  padding: "11px 2px 13px 15px",
                  width: "51px",
                }}
                className="invoiceNameHolder_icon bg-blue-color"
              >
                <img
                  src={invoice}
                  alt="Invoice Icon"
                  className="invoiceInerImg"
                />
              </Typography>{" "}
              <Grid className="invoice-name invoiceHolder_person">
                &nbsp;{" "}
                <span
                  style={{ fontSize: "27px", fontWeight: "700" }}
                  className="invoiceHolderName text-blue-color"
                >
                  {" "}
                  Invoice for{" "}
                  {invoiceData?.customer?.FirstName ||
                    "FirstName not available"}{" "}
                  {invoiceData?.customer?.LastName || "LastName not available"}{" "}
                </span>
              </Grid>
            </CardHeader>
            <Grid className="first-invoice text-blue-color">
              <Card
                style={{
                  border: "none",
                }}
              >
                <CardContent>
                  <Grid
                    className="d-flex invoice-first invoiceAllDetails"
                    style={{ borderBottom: "1px solid rgba(6, 49, 100, 30%)" }}
                  >
                    <Col className="col-lg-6 invoiceSubject_part" md={6} xl={6}>
                      <p className="mb-5head invoiceMainSubjectNav text-blue-color">
                        Invoice Subject{" "}
                      </p>
                      <InputText
                        value={formik.values?.Subject}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.Subject &&
                          Boolean(formik.errors.Subject)
                        }
                        helperText={
                          formik.touched.Subject && formik.errors.Subject
                        }
                        name="Subject"
                        placeholder="Enter for service rendered..."
                        label="Subject"
                        type="text"
                        className="text-blue-color w-100 mb-3 subject-invoice invoiceSubject_input"
                        fieldHeight="56px"
                        required
                      />
                      <Row className="row mt-3 invoice-detail-address">
                        <Col className="col">
                          <Typography className="titleAdress text-blue-color fw-medium">
                            {" "}
                            Billing Address
                          </Typography>
                          <Typography className="subAddress text-blue-color">
                            {invoiceData?.location?.Address} ,
                            {invoiceData?.location?.City},
                            {invoiceData?.location?.State} ,
                            {invoiceData?.location?.Country},
                            {invoiceData?.location?.Zip}
                          </Typography>
                        </Col>
                        <Col className="col">
                          <Typography className="titleAdress text-blue-color fw-medium">
                            Service Address
                          </Typography>
                          <Typography className="subAddress text-blue-color ">
                            (Same as Billing Address)
                          </Typography>
                        </Col>
                        <Col className="col">
                          <Typography className="titleAdress text-blue-color fw-medium">
                            Contact Details
                          </Typography>
                          <Typography className="subAddress text-blue-color">
                            {invoiceData?.customer?.PhoneNumber ||
                              "PhoneNumber not available"}
                            <br />
                            <a href="mailto:abc@gmail.com">
                              {invoiceData?.customer?.EmailAddress ||
                                "EmailAddress not available"}
                            </a>
                          </Typography>
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      className="col-2 p-0"
                      style={{
                        height: "auto",
                        background: "rgba(6, 49, 100, 30%)",
                        width: "1px",
                      }}
                      xl={2}
                      md={2}
                    ></Col>
                    <Col
                      className="col-lg-6  second-section-invoice invoiceNumber_detailDate"
                      xl={6}
                      md={6}
                      // xs={12}
                      // xl={6}
                      sm={6}
                      xs={12}
                    >
                      <Typography
                        style={{ fontSize: "10px", fontWeight: 400 }}
                        className="mx-5 invoiceInvoiceNumber heading-four invoiceInputBoxes"
                      >
                        <Row className="row">
                          <Grid
                            className="d-flex  my-3 incoiceNumber_auto justify-content-end"
                            style={{ paddingRight: "50px" }}
                          >
                            <Grid className="text-end invoiceNumberStart">
                              {!isNumChange ? (
                                <Typography
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                  className="text-blue-color"
                                >
                                  Invoice number #
                                  {formik.values.InvoiceNumber ||
                                    "InvoiceNumber not available"}
                                </Typography>
                              ) : (
                                <InputText
                                  value={formik.values.InvoiceNumber}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value < 0) {
                                      e.target.value = 0;
                                    }
                                    formik.handleChange(e, "InvoiceNumber");
                                  }}
                                  onBlur={formik.handleBlur}
                                  name="InvoiceNumber"
                                  id="InvoiceNumber"
                                  label="Invoice Number"
                                  type="number"
                                  className="text-blue-color w-100"
                                  fieldHeight="46px"
                                />
                              )}
                            </Grid>
                            <Col
                              className="col-2  text-end  changeText invoiceChangeBtn"
                              xl={2}
                              md={2}
                            >
                              {!isNumChange ? (
                                <Typography
                                  style={{
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                  onClick={() => setIsNumChange(true)}
                                  className="text-blue-color underline-u"
                                >
                                  Change
                                </Typography>
                              ) : (
                                <BlueButton
                                  onClick={handleInvoiceNumberChange}
                                  className="buttons outline-button-blue-color outline selectclientaddquote bg-blue-color"
                                  label="Done"
                                />
                              )}
                            </Col>
                          </Grid>

                          <Col className="col-left">
                            <Typography className="mb-3 invoice-head head text-blue-color  fw-medium">
                              Invoice details
                            </Typography>

                            <Grid className="form-group invoice-form-group issuedDate_dueDate_paymentDue issueDateFlex">
                              <label
                                htmlFor="issuedDate head"
                                className="text-blue-color"
                              >
                                Issued Date
                              </label>
                              <Grid className="invoice-date payDueRange2">
                                <Grid
                                  className="mx-5 issueDate_select issuedateReponsiveDate"
                                  style={{ width: "60%" }}
                                >
                                  <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                  >
                                    <DatePicker
                                      className="datPicherInvoice"
                                      label="Start Date"
                                      value={
                                        // If IssueDate exists and is valid, convert it into a dayjs object (without time)
                                        formik?.values?.IssueDate
                                          ? dayjs(
                                              formik?.values?.IssueDate
                                            ).startOf("day") // Set time to 00:00:00
                                          : null // Default to null if IssueDate is invalid or empty
                                      }
                                      onChange={(value) => {
                                        // If value is valid, convert to 'yyyy-mm-dd' format and update both Formik and local state
                                        const startDate =
                                          value && dayjs(value).isValid()
                                            ? value.format("YYYY-MM-DD")
                                            : null;

                                        // Update Formik field with the selected date (only date, no time)
                                        formik.setFieldValue(
                                          "IssueDate",
                                          startDate
                                        );

                                        // Also update the local state (IssueDate)
                                        setIssueDate(startDate); // This will store the selected date in the local state
                                      }}
                                      onBlur={formik?.handleBlur}
                                      sx={{
                                        "& .MuiInputBase-root": {
                                          borderRadius: "8px",
                                        },
                                        "& .MuiInputBase-input": {
                                          color: "#063164",
                                        },
                                        "& .MuiInputLabel-root": {
                                          color: "#063164",
                                        },
                                        "& .MuiSvgIcon-root": {
                                          color: "#063164",
                                        },
                                      }}
                                    />

                                    {/* Show error if IssueDate has an error in Formik */}
                                    {formik?.touched?.IssueDate &&
                                      formik?.errors?.IssueDate && (
                                        <Typography
                                          style={{
                                            color: "red",
                                            marginLeft: "10px",
                                            fontSize: "13px",
                                          }}
                                        >
                                          {formik?.errors?.IssueDate}
                                        </Typography>
                                      )}
                                  </LocalizationProvider>
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid className="form-group invoice-form-group mt-2 issuedDate_dueDate_paymentDue issueDateFlex">
                              <label
                                htmlFor="dueDate head "
                                className="text-blue-color"
                              >
                                Due Date
                              </label>
                              <Grid
                                className="d-flex gap-1 invoice-date dueDate_invoice payDueRange2"
                                style={{ marginLeft: "20px" }}
                              >
                                <Grid
                                  className="mx-5 issueDate_select issuedateReponsiveDate"
                                  style={{ width: "232px" }}
                                >
                                  <Input
                                    type="date"
                                    className="text-blue-color p-3 "
                                    value={DueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    name="DueDate"
                                    style={{
                                      height: "40px",
                                      fontSize: "14px",
                                    }}
                                    disabled
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid className="form-group issuedDate_dueDate_paymentDue issueDateFlex">
                              <label
                                htmlFor="paymentDue"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                className="text-blue-color"
                              >
                                Payment Due
                              </label>
                              <Grid
                                className=" my-2 d-flex gap-2 mx-3 payDueRange"
                                style={{ marginLeft: "40px" }}
                              >
                                <FormGroup
                                  style={{
                                    width: "231px",
                                    marginLeft: "22px",
                                    height: "40px",
                                  }}
                                  className="payDueRange"
                                >
                                  <Input
                                    style={{ height: "20px", fontSize: "12px" }}
                                    id="paymentDueSelect"
                                    name="PaymentDue"
                                    type="select"
                                    className="text-blue-color border-blue-color"
                                    value={formik.values.PaymentDue}
                                    onChange={(e) => {
                                      formik.handleChange(e);
                                      handlePaymentDueChange(e);
                                    }}
                                  >
                                    <option value="Upon Receipt">
                                      Upon Receipt
                                    </option>
                                    <option value="15 Days">15 Days</option>
                                    <option value="30 Days">30 Days</option>
                                    <option value="45 Days">45 Days</option>
                                  </Input>
                                </FormGroup>
                              </Grid>
                            </Grid>
                          </Col>
                        </Row>
                      </Typography>
                    </Col>
                  </Grid>
                </CardContent>
              </Card>
              <Grid className="p-3">
                <Card
                  className="p-3 my-4 border-blue-color"
                  style={{
                    paddingRight: "30px",
                    border: "1px solid ",
                    marginBottom: "15px",
                  }}
                >
                  <Typography
                    className="text-blue-color heading-four"
                    style={{ fontWeight: 600 }}
                  >
                    Line Items
                  </Typography>
                  <Grid
                    className="getproduct-mamin"
                    style={{
                      // maxHeight: "500px",
                      // overflowY: "auto",
                      padding: "10px",
                      // overflowX: "hidden",
                      // scrollbarWidth: "thin",
                    }}
                  >
                    {lineItems.map((item, index) => (
                      <React.Fragment key={index}>
                        <GetProducts
                          item={item}
                          index={index}
                          handleSelectChange={handleSelectChange}
                          lineItems={lineItems}
                          setLineItems={setLineItems}
                          showCosts={showCosts}
                          setShowCosts={setShowCosts}
                          menuIsOpen={menuIsOpen}
                          setMenuIsOpen={setMenuIsOpen}
                          deleteLineItem={deleteLineItem}
                        />
                      </React.Fragment>
                    ))}
                  </Grid>

                  <Grid
                    className="d-flex justify-content-between align-items-center mb-0 pb-0 newlineitem"
                    style={{
                      marginTop: "20px",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <BlueButton
                      className="bg-button-blue-color addnewline mx-0 text-white-color "
                      onClick={addLineItem}
                      label="+ New Line Item"
                    />
                    <Grid>
                      <Grid className="d-flex align-items-center mb-0 gap-3 line-items-total ">
                        <Typography
                          style={{ fontWeight: 600 }}
                          className="mb-0 text-blue-color"
                        >
                          Total price
                        </Typography>
                        <Typography
                          className="mb-0 text-blue-color"
                          style={{ fontWeight: 600 }}
                        >
                          {`$${new Intl.NumberFormat("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(subTotal ?? 0)}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid className="d-flex my-4 client-message">
                    <Col
                      className="col-5 order-sm-1 messageinput"
                      xl={5}
                      md={5}
                    >
                      <FormGroup>
                        <TextField
                          value={formik.values.Message}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          name={`Message`}
                          id="client_message"
                          placeholder="Enter client message"
                          label="Client Message"
                          type="text"
                          className="text-blue-color mx-0 w-100"
                          multiline
                          rows={4}
                        />
                      </FormGroup>
                      <FormGroup rmGroup>
                        <Input
                          id="ContractDisclaimer"
                          name="ContractDisclaimer"
                          placeholder="Enter contract/disclaimer"
                          type="textarea"
                          className="text-blue-color border-blue-color contractDis mt-3"
                          style={{
                            fontSize: "14px",
                            paddingLeft: "15px",
                            height: "96px",
                          }}
                          value={formik.values.ContractDisclaimer}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="col-6 order-sm-2 totalinput" xl={7} md={7}>
                      <DiscountTable
                        subTotal={subTotal}
                        discountAmount={discountAmount}
                        taxAmount={taxAmount}
                        Total={Total}
                        formik={formik}
                      />
                    </Col>
                  </Grid>
                </Card>
              </Grid>
              <Grid className="p-3">
                <InternalNotes
                  Total={0}
                  notes={formik.values.Notes}
                  setNotes={(value) => formik.setFieldValue("Notes", value)}
                  attachments={formik.values.Attachment}
                  setAttachments={(value) =>
                    formik.setFieldValue("Attachment", value)
                  }
                />
              </Grid>

              <Grid
                className="d-flex justify-content-between button-responsive p-4 updateSaveBtnNaviGate"
                style={{ marginTop: "80px", gap: "10px" }}
              >
                <Grid className="footer-buttons">
                  <WhiteButton
                    className="cancelInvoiceBtn"
                    onClick={() => navigate(-1)}
                    label="Cancel"
                  />
                </Grid>
                {loading ? (
                  <LoaderComponent loading={loading} height="20" width="20" />
                ) : (
                  <Grid className="d-flex gap-2 updateSaveBtnNaviGate">
                    <BlueButton
                      disabled={
                        !(
                          formik?.values?.Subject &&
                          lineItems?.length > 0 &&
                          lineItems.every((item) => !!item?.Name)
                        )
                      }
                      // onClick={async (e) => {
                      //   e.preventDefault();

                      //   const isValid = await formik.validateForm();
                      //   formik.setTouched({
                      //     Subject: true,
                      //   });

                      //   if (
                      //     Object.keys(isValid).length === 0 &&
                      //     formik.values.Subject
                      //   ) {
                      //     setLoading(true);
                      //     formik.handleSubmit();
                      //   } else {
                      //     showToast.error("Please Fill Required Fields");
                      //   }
                      // }}
                      onClick={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        await formik.handleSubmit();                     
                        setLoading(false);
                      }}
                      label={
                        location.state?.invoiceId
                          ? "Update Invoice"
                          : "Save"
                      }
                    />

                    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                      <DropdownToggle
                        className="bg-blue-color saveBtnInvoiceChange"
                        caret
                        disabled={
                          !(
                            formik?.values?.Subject &&
                            lineItems?.length > 0 &&
                            lineItems.every((item) => !!item?.Name)
                          )
                        }
                      >
                        Save &{" "}
                      </DropdownToggle>
                      <DropdownMenu>
                        {/* <DropdownItem
                          className="text-blue-color"
                          onClick={() => setMail(true)}
                        >
                          Send As Email
                        </DropdownItem> */}
                        {CompanyName && (
                          <DropdownItem
                            className="text-blue-color"
                            onClick={() => {
                              setIsCollect(true);
                              formik.handleSubmit();
                            }}
                          >
                            Collect Payment
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    </Dropdown>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Card>
          <InvoiceMail
            modal={mail}
            setModal={setMail}
            customerData={invoiceData?.customer}
            Total={Total}
            invoiceData={invoiceData}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            subTotal={subTotal}
            formik={formik.values}
            handleSubmit={formik?.handleSubmit}
            DueDate={DueDate}
          />
        </Grid>
      )}
    </>
  );
};

export default AddInvoice;
