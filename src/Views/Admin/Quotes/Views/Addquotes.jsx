import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import {
  Button,
  Card,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
} from "reactstrap";
import { TextField } from "@mui/material";
import InputText from "../../../../components/InputFields/InputText";
import GetProducts from "../../../../components/Materials&Labor/GetMaterialsAndLabor";
import { DisplayImage } from "../../../../components/Files/DisplayFiles";
import { Files } from "../../../../components/Files";
import CustomerModal from "../CustomerModal";
import QuoteMail from "../QuoteMail";
import "./style.css";
import { Grid } from "@mui/material";
import { Col } from "react-bootstrap";

import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import { LoaderComponent } from "../../../../components/Icon/Index";
import { Typography } from "@mui/material";
import DiscountTable from "../../../../components/DiscountTable/DiscountTable";
import showToast from "../../../../components/Toast/Toster";

const Addquotes = ({
  customersData,
  formik,
  loading,
  setLoading,
  setIsCustomer,
  setTitleRef,
  propertyData,
  quotesData,
  Previous,
  isNumChange,
  setIsNumChange,
  handleQuoteNumberChange,
  lineItems,
  handleSelectChange,
  setLineItems,
  showCosts,
  setShowCosts,
  menuIsOpen,
  setMenuIsOpen,
  deleteLineItem,
  isError,
  setIsError,
  productRef,
  addLineItem,
  subTotal,
  discountAmount,
  taxAmount,
  Total,
  loader,
  setLoader,
  handleSaveQuote,
  dropdown,
  toggle,
  modal,
  setModal,
  titleRef,
  handleConvertJob,
  isCustomer,
  isProperty,
  setIsProperty,
  setPropertyData,
  setCustomersData,
  CompanyName,
  handleSubmits,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      {loader ? (
        <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid>
          <Button
            className="text-white-color bg-blue-color"
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
                    ? CompanyName + "/quotes"
                    : "staff-member" + "/workerinvoice"
                }`,
                {
                  state: {
                    navigats: location?.state?.navigats.filter(
                      (item) => item !== "/quotes"
                    ),
                  },
                }
              );
            }}
          >
            <img src={Previous} style={{ width: "20px", height: "20px" }} />
          </Button>
          <Grid>
            <Grid className="card justify-content-center align-items-center mb-3 mt-3 quotes">
              <Col
                className="my-2 col-12 p-4 border-blue-color"
                style={{ borderRadius: "20px" }}
                xl={12}
              >
                <CardTitle
                  style={{
                    fontSize: "27px",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                  }}
                  className="cardtitle text-blue-color quoteFor_customerName quoteCustomerSelect"
                >
                  Quote for
                  <Typography
                    className="d-flex align-items-center cardtitle"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsCustomer(true);
                    }}
                  >
                    <Typography
                      className="text-blue-color underline-u QuoteForCustomerName quoteUseName"
                      style={{
                        paddingLeft: "5px",
                        fontSize: "27px",
                        fontWeight: "600",
                      }}
                    >
                      {customersData?.FirstName
                        ? `${customersData?.FirstName} ${customersData?.LastName}`
                        : "Customer Name"}
                    </Typography>
                    {!Object.keys(customersData).length > 0 ? (
                      <Button
                        className="mx-3 bg-button-blue-color"
                        size="sm"
                        style={{
                          height: "20px",
                          paddingBottom: "3px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        +
                      </Button>
                    ) : null}
                  </Typography>
                </CardTitle>
                <Grid
                  className="d-flex   gap-4 job-title quoteJobTitle_number"
                  style={{ color: "rgba(6, 49, 100, 1)" }}
                >
                  <Col className="col-4 mt-3 order-1 jobinput " xl={5}>
                    <Grid>
                      <InputText
                        required
                        ref={setTitleRef}
                        value={formik?.values?.Title}
                        onChange={formik?.handleChange}
                        onBlur={formik?.handleBlur}
                        error={
                          formik?.touched?.Title &&
                          Boolean(formik?.errors?.Title)
                        }
                        helperText={
                          formik?.touched?.Title && formik?.errors?.Title
                        }
                        name="Title"
                        id="title"
                        placeholder="Enter Quote Title"
                        label="Quote Title"
                        type="text"
                        className="text-blue-color w-100"
                      />
                    </Grid>
                    {customersData?.FirstName && (
                      <Grid
                        className="d-flex mt-5 gap-3 quoteProperty_detail"
                        style={{ color: "rgba(6, 49, 100, 1)" }}
                      >
                        <Col
                          className="col-6 text-left quoteAddress quoteDetauils "
                          xl={6}
                          sm={12}
                          xs={12}
                        >
                          <Typography>
                            <Typography className=" fw-medium text-blue-color">
                              Property address{" "}
                            </Typography>
                          </Typography>
                          <Typography className="text-blue-color">
                            {console.log(propertyData,"propertyData")}
                            {propertyData?.Address ||
                              customersData?.location?.Address ||
                              "-"}{" "}
                            ,
                            <br />
                            {propertyData?.City ||
                              customersData?.location?.City ||
                              "-"}
                            ,{" "}
                            {propertyData?.State ||
                              customersData?.location?.State ||
                              "-"}{" "}
                            ,
                            {propertyData?.Zip ||
                              customersData?.location?.Zip ||
                              "-"}
                            ,
                            <br />
                            {propertyData?.Country ||
                              customersData?.location?.Country ||
                              "-"}{" "}
                            <br />
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                setIsCustomer(true);
                              }}
                              style={{ color: "green", cursor: "pointer" }}
                              href="#customer-section"
                            >
                              Change
                            </a>
                          </Typography>
                        </Col>
                        <Col className="col-6 text-left quoteDetauils" xl={6}>
                          <Typography className=" fw-medium text-blue-color">
                            Contact details
                          </Typography>
                          <Typography className="text-blue-color">
                            {customersData?.PhoneNumber || "-"}
                            <br />
                            {customersData?.EmailAddress || "-"}
                          </Typography>
                        </Col>
                      </Grid>
                    )}
                  </Col>

                  <Col
                    className="col-6 d-flex order-2 changesinput quoteNumberDoneBtn"
                    xl={6}
                  >
                    <Col
                      className="col-6 my-3 mx-3 text-left QUoteCHangeIcon"
                      xl={6}
                    >
                      {!isNumChange ? (
                        <Typography
                          style={{ fontSize: "13px", marginBottom: "16px" }}
                          className="text-blue-color fw-medium"
                        >
                          Quote number #
                          {formik?.values?.QuoteNumber ||
                            "QuoteNumber not available"}
                        </Typography>
                      ) : (
                        <InputText
                          value={formik?.values?.QuoteNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value < 0) {
                              e.target.value = 0;
                            }
                            formik.handleChange(e, "QuoteNumber");
                          }}
                          onBlur={formik?.handleBlur}
                          name="QuoteNumber"
                          id="QuoteNumber"
                          label="Quote Number"
                          type="number"
                          className="text-blue-color w-100"
                          fieldHeight="46px"
                        />
                      )}
                    </Col>
                    <Col
                      className="col-3 my-3 text-center changeText quoteNUmberTOp"
                      lg={3}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {!isNumChange ? (
                        <Typography
                          className="underline-u text-blue-color"
                          style={{ cursor: "pointer" }}
                          onClick={() => setIsNumChange(true)}
                        >
                          Change
                        </Typography>
                      ) : (
                        <BlueButton
                          onClick={handleQuoteNumberChange}
                          className="buttons outline-button-blue-color outline selectclientaddquote bg-blue-color"
                          label="Done"
                        />
                      )}
                    </Col>
                  </Col>
                </Grid>
                <hr />
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
                      maxHeight: "500px",
                      overflowY: "auto",
                      padding: "10px",
                      overflowX: "hidden",
                      scrollbarWidth: "thin",
                    }}
                  >
                    {lineItems?.length > 0 &&
                      lineItems?.map((item, index) => (
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
                            isError={isError}
                            setIsError={setIsError}
                            productRef={productRef}
                          />
                        </React.Fragment>
                      ))}
                  </Grid>
                </Card>
                <Grid className="d-flex">
                  <Col
                    className="col-5 d-flex gap-4 addlineItemProduct"
                    style={{ width: "auto" }}
                    xl={5}
                  >
                    <BlueButton
                      className="bg-button-blue-color top-button "
                      style={{
                        padding: "4px 10px",
                        fontSize: "14px",
                      }}
                      onClick={addLineItem}
                      label="+ Add Line Item"
                    />
                  </Col>
                </Grid>
                <Grid className="d-flex my-4 client-message">
                  <Col className="col-5 order-sm-1 messageinput" xl={5}>
                    <Grid>
                      <TextField
                        value={formik?.values?.CustomerMessage}
                        onChange={formik?.handleChange}
                        onBlur={formik?.handleBlur}
                        name={`CustomerMessage`}
                        id="client_message"
                        placeholder="Enter client Message"
                        label="Client Message"
                        type="text"
                        className="text-blue-color mx-0 w-100"
                        multiline
                        rows={4}
                      />
                    </Grid>
                    <Grid className="my-3">
                      <Input
                        id="ContractDisclaimer"
                        name="ContractDisclaimer"
                        placeholder="Enter contract/ disclaimer"
                        type="textarea"
                        className="text-blue-color border-blue-color contractDis"
                        style={{
                          fontSize: "14px",
                          paddingLeft: "15px",
                          height: "96px",
                        }}
                        value={formik?.values?.ContractDisclaimer}
                        onChange={formik?.handleChange}
                        onBlur={formik?.handleBlur}
                      />
                    </Grid>
                  </Col>
                  <Col className="col-7 order-sm-2 totalinput" xl={7}>
                    <DiscountTable
                      subTotal={subTotal}
                      discountAmount={discountAmount}
                      taxAmount={taxAmount}
                      Total={Total}
                      formik={formik}
                    />
                  </Col>
                </Grid>
                <Grid>
                  <Grid
                    style={{
                      border: "0.5px solid rgba(6, 49, 100, 80%)",
                      padding: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    <Typography
                      className="text-blue-color  mb-3"
                      style={{ fontWeight: 600 }}
                    >
                      Internal notes and Attachments <HelpOutlineOutlinedIcon />
                    </Typography>

                    {/* <TextField
                      value={formik?.values?.Notes}
                      onChange={formik?.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik?.touched?.Notes && Boolean(formik?.errors?.Notes)
                      }
                      helperText={
                        formik?.touched?.Notes && formik?.errors?.Notes
                      }
                      name="Notes"
                      id="outlined-multiline-static"
                      placeholder="Enter A  notes"
                      label="Enter Notes "
                      type="text"
                      className="w-100 text-blue-color border-blue-color"
                      multiline
                      rows={3}
                    /> */}
                    <TextField
                      value={formik.values.Notes}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Agar value ka first character space hai toh remove kar do
                        if (value.startsWith(" ")) {
                          value = value.trim();
                        }
                        formik.setFieldValue("Notes", value);
                      }}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.Notes && Boolean(formik.errors.Notes)
                      }
                      helperText={formik.touched.Notes && formik.errors.Notes}
                      name="Notes"
                      id="outlined-multiline-static"
                      placeholder="Enter Notes"
                      label="Enter Notes"
                      type="text"
                      className="w-100 text-blue-color border-blue-color"
                      multiline
                      rows={3}
                    />

                    <DisplayImage
                      files={formik?.values?.Attachment}
                      setFiles={(value) =>
                        formik.setFieldValue("Attachment", value)
                      }
                      IsDeleted={true}
                    />
                    <Files
                      files={formik?.values?.Attachment}
                      setFiles={(value) =>
                        formik.setFieldValue("Attachment", value)
                      }
                    />
                  </Grid>
                </Grid>
                <Grid
                  className="d-flex justify-content-between button-responsive BlueAndWhiteBtmFlex buttonQuote btnFlexQuote"
                  style={{ marginTop: "80px", gap: "10px" }}
                >
                  <Grid>
                    <WhiteButton
                      onClick={() => navigate(-1)}
                      label="Cancel"
                      className="cancelQuoteBtn"
                    />
                  </Grid>

                  {Object.keys(customersData).length > 0 ? (
                    loading ? (
                      <Grid className="d-flex flex-direction-row justify-content-center align-items-center ">
                        <LoaderComponent
                          loading={loading}
                          height="20"
                          width="20"
                        />
                      </Grid>
                    ) : (
                      <Grid className="gap-3 d-flex sec-button-section quoteUpdateCancelBtnSave">
                        <BlueButton
                          // onClick={async (e) => {
                          //   e.preventDefault();

                          //   const isValid = await formik?.validateForm();
                          //   formik?.setTouched({
                          //     Title: true,
                          //   });
                          //   if (
                          //     Object.keys(isValid)?.length === 0 &&
                          //     formik?.values?.Title
                          //   ) {
                          //     setLoading(true);
                          //     await handleSaveQuote(false);
                          //   } else {
                          //     showToast.error("Please Fill Required Fields");
                          //   }
                          // }}
                          onClick={async (e) => {
                            e.preventDefault();
                            setLoading(true);
                            await handleSaveQuote(false);
                            setLoading(false);
                          }}
                          label={
                            location?.state?.id
                              ? " Update Quote "
                              : "Save Quote"
                          }
                          disabled={
                            !(
                              formik?.values?.Title &&
                              lineItems?.length > 0 &&
                              lineItems[0]?.Name !== ""
                            )
                          }
                        />
                        <Dropdown isOpen={dropdown} toggle={toggle}>
                          {/* <DropdownToggle
                            caret
                            className="bg-blue-color updateQUote_dropdown"
                            disabled={!formik?.values?.Title}
                            style={{
                              opacity:
                                formik?.values?.Title && lineItems?.length > 0
                                  ? 1
                                  : 0.5,
                              pointerEvents:
                                formik?.values?.Title &&
                                lineItems?.length > 0 &&
                                lineItems[0]?.Name !== ""
                                  ? "auto"
                                  : "none",
                            }}
                          >
                            {location?.state?.id
                              ? "Update And..."
                              : "Save And ..."}
                          </DropdownToggle> */}
                          <DropdownToggle
                            caret
                            className="bg-blue-color updateQUote_dropdown"
                            disabled={!formik?.values?.Title}
                            // onClick={() => updateStatus("Draft")}
                            style={{
                              opacity:
                                formik?.values?.Title && lineItems?.length > 0
                                  ? 1
                                  : 0.5,
                              pointerEvents:
                                formik?.values?.Title &&
                                lineItems?.length > 0 &&
                                lineItems[0]?.Name !== ""
                                  ? "auto"
                                  : "none",
                            }}
                          >
                            {location?.state?.id
                              ? "Update And..."
                              : "Save And ..."}
                          </DropdownToggle>
                          <DropdownMenu className="mb-2">
                            {/* <DropdownItem
                              onClick={() => {
                                if (
                                  lineItems?.length > 0 &&
                                  lineItems[0]?.Name !== "" &&
                                  formik?.values?.Title
                                ) {                                 
                                  setModal(true);
                                } else if (!formik?.values?.Title) {
                                  setLoader(false);
                                  titleRef.focus();
                                } else {
                                  setLoader(false);
                                  setIsError(true);
                                  productRef.current.focus();
                                }
                              }}
                            >
                              Save and send mail
                            </DropdownItem> */}
                            {/* <DropdownItem
                              onClick={() => {
                                if (
                                  lineItems?.length > 0 &&
                                  lineItems[0]?.Name !== "" &&
                                  formik?.values?.Title
                                ) {
                                  // handleSaveQuote("Awaiting Response");
                                  formik.setFieldValue(
                                    "Status",
                                    "Awaiting Response"
                                  );
                                  setModal(true);
                                } else if (!formik?.values?.Title) {
                                  setLoader(false);
                                  titleRef.focus();
                                } else {
                                  setLoader(false);
                                  setIsError(true);
                                  productRef.current.focus();
                                }
                              }}
                            >
                              Save and send mail
                            </DropdownItem> */}

                            <DropdownItem
                              onClick={() => {
                                if (
                                  lineItems?.length > 0 &&
                                  lineItems[0]?.Name !== "" &&
                                  formik?.values?.Title
                                ) {
                                  formik.setFieldValue(
                                    "Status",
                                    "Awaiting Response"
                                  );
                                  setModal(true); // Mail send nahi hoga, sirf modal open hoga
                                } else if (!formik?.values?.Title) {
                                  setLoader(false);
                                  titleRef.focus();
                                } else {
                                  setLoader(false);
                                  setIsError(true);
                                  productRef.current.focus();
                                }
                              }}
                            >
                              Save and send mail
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                setLoader(true);
                                handleConvertJob();
                              }}
                            >
                              Convert To Contract
                            </DropdownItem>
                            {/* <DropdownItem
                              // onClick={() => {
                              //   formik.setFieldValue(
                              //     "Status",
                              //     "Awaiting Response"
                              //   );
                              //   handleSaveQuote(true);
                              // }}
                              onClick={() => {
                                handleSaveQuote("Awaiting Response")
                                formik.setFieldValue(
                                  "Status",
                                  "Awaiting Response"
                                );
                              }}
                            >
                              Mark as awaiting response
                            </DropdownItem> */}
                            <DropdownItem
                              onClick={() => {
                                formik.setFieldValue(
                                  "Status",
                                  "Awaiting Response"
                                );
                                handleSaveQuote("Awaiting Response");
                              }}
                            >
                              Mark as awaiting response
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </Grid>
                    )
                  ) : (
                    <BlueButton
                      onClick={(e) => {
                        e.preventDefault();
                        setIsCustomer(true);
                      }}
                      label="Select Customer"
                    />
                  )}
                </Grid>
              </Col>
            </Grid>
          </Grid>
        </Grid>
      )}
      <CustomerModal
        isCustomer={isCustomer}
        setIsCustomer={setIsCustomer}
        isProperty={isProperty}
        setIsProperty={setIsProperty}
        setFieldValue={formik.setFieldValue}
        values={formik.values}
        lineItems={lineItems}
        propertyData={propertyData}
        setPropertyData={setPropertyData}
        customersData={customersData}
        setCustomersData={setCustomersData}
        formik={formik}
      />
      <QuoteMail
        modal={modal}
        setModal={setModal}
        customerData={customersData}
        quotesData={quotesData}
        Total={Total}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        subTotal={subTotal}
        formik={formik.values}
        Attachment={formik?.values?.Attachment}
        handleSubmits={handleSubmits}
        handleSubmit={() => {
          handleSaveQuote(true);
        }}
      />
    </>
  );
};

export default Addquotes;
