import React from "react";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import client from "../../../../assets/White-sidebar-icon/Customer.svg";
import clientcontact from "../../../../assets/White-sidebar-icon/Home.svg";
import Address from "../../../../components/Address";
import InputText from "../../../../components/InputFields/InputText";
import { Row, Col } from "react-bootstrap";
import { Grid, Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import {
  LoaderComponent,
  NavigateButton,
} from "../../../../components/Icon/Index";
import { fontSize, padding } from "@mui/system";

const AddCustomer = ({
  formik,
  handleChange,
  loader,
  countries,
  selectedCountry,
  setSelectedCountry,
  handlePhoneChange,
  isEdited,
  CompanyName,
  handleZipChange,
  addPhoneNumber,
  phoneNumbers,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
      <Grid className="d-flex align-items-center text-white-color">
        <Button
          style={{
            marginRight: "10px",
            width: "50px",
            height: "40px",
            marginBottom: "10px",
            padding: "0px 0px",
            borderRadius: "4px",
          }}
          onClick={() => {
            if (formik.dirty) {
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
                  ? CompanyName + "/customer"
                  : "staff-member" + "/workercustomer"
              }`,
              {
                state: {
                  navigats: location?.state?.navigats.filter(
                    (item) => item !== "/customer"
                  ),
                },
              }
            );
          }}
          className="text-capitalize bg-button-blue-color"
        >
          <ArrowBackOutlinedIcon />
        </Button>
        <Typography
          className="text-blue-color heading-two mb-2 edit_customer_function"
          style={{ fontWeight: 700, fontSize: "30px" }}
        >
          {!location?.state?.id ? " New Customer" : " Edit Customer"}
        </Typography>
      </Grid>
      <Card
        className="my-2 col-12 p-4 border-blue-color"
        style={{ borderRadius: "20px" }}
      >
        <Grid
          style={{ display: "flex", gap: "15px" }}
          className="client-main customerSevenFlex"
        >
          <Row
            className="col-lg-6 col-md-6 CustomerRightRemove"
            style={{ paddingRight: "20px" }}
          >
            <Col>
              <CardTitle
                tag="Typography"
                className="text-blue-color"
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Grid
                  className="bg-blue-color"
                  style={{
                    borderRadius: "50%",
                    marginRight: "10px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <img src={client} alt="Client Details" />
                </Grid>
                Company settings
              </CardTitle>

              <Grid className="my-4 mb-0">
                <InputText
                  value={formik?.values?.FirstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  onBlur={formik?.handleBlur}
                  error={
                    formik?.touched?.FirstName &&
                    Boolean(formik?.errors?.FirstName)
                  }
                  helperText={
                    formik?.touched?.FirstName && formik?.errors?.FirstName
                  }
                  name="FirstName"
                  placeholder="Enter first name"
                  label="First Name"
                  type="text"
                  className="text-blue-color w-100 mb-3 "
                  fieldHeight="56px"
                />
              </Grid>

              <Grid className="my-2 mb-0 lastnametxt lastnamemb">
                <InputText
                  value={formik?.values?.LastName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  onBlur={formik?.handleBlur}
                  error={
                    formik?.touched?.LastName &&
                    Boolean(formik?.errors?.LastName)
                  }
                  helperText={
                    formik?.touched?.LastName && formik?.errors?.LastName
                  }
                  name="LastName"
                  placeholder="Enter last name"
                  label="Last Name"
                  type="text"
                  className="text-blue-color w-100 customerTopHere"
                  fieldHeight="56px"
                />
              </Grid>

              <Grid className="my-2 phonei">
                <Typography
                  className="mb-3 text-blue-color phone-number mt-4 heading-five"
                  style={{
                    fontWeight: 500,
                    fontSize: "16px",
                  }}
                >
                  Contact details
                </Typography>
              </Grid>

              <Grid className="my-4 mb-0">
                <InputText
                  value={formik?.values?.PhoneNumber}
                  onChange={handlePhoneChange}
                  onBlur={formik?.handleBlur}
                  error={
                    formik?.touched?.PhoneNumber &&
                    Boolean(formik?.errors?.PhoneNumber)
                  }
                  helperText={
                    formik?.touched?.PhoneNumber && formik?.errors?.PhoneNumber
                  }
                  name="PhoneNumber"
                  id="PhoneNumber"
                  placeholder="Enter phone number"
                  label="PhoneNumber"
                  type="text"
                  className="text-blue-color w-100 mb-3"
                  fieldHeight="56px"
                />
                {/* <BlueButton label="Add Another Number"/> */}
              </Grid>
              {/* <Grid className="my-4 mb-0">
      {phoneNumbers.map((phone, index) => (
        <InputText
          key={index}
          value={phone}
          onChange={(e) => handlePhoneChange(index, e)}
          name={`PhoneNumber${index}`}
          placeholder="Enter phone number"
          label={`Phone Number ${index + 1}`}
          type="text"
          className="text-blue-color w-100 mb-3"
          fieldHeight="56px"
        />
      ))}
      <BlueButton label="Add Another Number" onClick={addPhoneNumber} />
    </Grid> */}
              {/* <Grid className="my-4 mb-0">
                {phoneNumbers.map((PhoneNumber, index) => (
                  <InputText
                    key={index}
                    value={PhoneNumber}
                    onChange={(e) => handlePhoneChange(index, e)}
                    name={`PhoneNumber${index}`}
                    placeholder="Enter phone number"
                    label={`Phone Number`}
                    type="text"
                    className="text-blue-color w-100 mb-2"
                    fieldHeight="56px"
                  />
                ))}
                <WhiteButton
                  label="Add Another Number"
                  onClick={addPhoneNumber}
                  style={{padding:"5px",fontSize:"12px"}}
                />
              </Grid> */}

              <Grid className="my-2 mb-0 lastnametxt">
                <InputText
                  value={formik?.values?.EmailAddress}
                  onChange={handleChange}
                  onBlur={formik?.handleBlur}
                  error={
                    formik?.touched.EmailAddress &&
                    Boolean(formik?.errors?.EmailAddress)
                  }
                  helperText={
                    formik?.touched?.EmailAddress &&
                    formik?.errors?.EmailAddress
                  }
                  name="EmailAddress"
                  id="EmailAddress"
                  placeholder="Enter mail address"
                  label="Email Address"
                  type="email"
                  className="text-blue-color w-100 customerTopHere"
                  fieldHeight="56px"
                />
              </Grid>
            </Col>
          </Row>
          <Row
            className=" col-lg-6 col-md-6 CustomerRightRemove"
            style={{ paddingRight: "12px" }}
          >
            <Col>
              <CardTitle
                tag="Typography"
                className="text-blue-color heading-five"
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Grid
                  className="bg-blue-color"
                  style={{
                    borderRadius: "50%",
                    marginRight: "10px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img src={clientcontact} alt="Property Details" />
                </Grid>
                <span className="" style={{ fontSize: "16pxx" }}>
                  Property details
                </span>
              </CardTitle>
              {console.log(formik, "formik")}
              {console.log(
                formik?.values?.location?.length ?? 0,
                "formik?.values?.location?.length"
              )}
              {console.log(location?.state?.id, "location?.state?.id")}
              {!location?.state?.id ||
              (location?.state?.id && (formik?.values?.length ?? 0) <= 1) ? (
                <Grid className="my-4 mb-0 px-0">
                  <Address
                    setSelectedCountry={setSelectedCountry}
                    selectedCountry={selectedCountry}
                    countries={countries}
                    handleChange={handleChange}
                    formik={formik}
                    handleZipChange={handleZipChange}
                  />
                </Grid>
              ) : (
                <Grid
                  className="my-4 mb-0 px-0 customerAddModel"
                  style={{ width: "98%" }}
                >
                  <Card
                    style={{ backgroundColor: "rgb(216, 231, 238)" }}
                    className="w-100 d-flex flex-row justify-content-center align-items-start py-3 px-0 mx-0"
                  >
                    <Grid
                      style={{ width: "15%", minHeight: "100%" }}
                      className="d-flex align-items-start justify-content-center"
                    >
                      <LightbulbOutlinedIcon
                        style={{ color: "rgb(42, 79, 97)", height: "50px" }}
                      />
                    </Grid>
                    <Grid style={{ borderLeft: "1px solid rgb(42, 79, 97)" }}>
                      <CardHeader
                        className="border-0 d-flex align-items-center"
                        style={{
                          backgroundColor: "rgb(216, 231, 238)",
                        }}
                      >
                        This Customer has multiple properties
                      </CardHeader>
                      <CardBody>
                        Multiple properties can only be edited individually. To
                        edit a property, select it from the Customer's list of
                        properties.
                      </CardBody>
                    </Grid>
                  </Card>
                  <FormGroup className="py-3" check inline>
                    <Input
                      type="checkbox"
                      name="billing_same_property"
                      checked={formik?.values?.billing_same_property}
                      onChange={handleChange}
                    />
                    <Label
                      check
                      style={{
                        color: "rgba(6, 49, 100, 70%)",
                        fontSize: "12px",
                      }}
                    >
                      Billing address is the same as property address
                    </Label>
                  </FormGroup>
                </Grid>
              )}
            </Col>
          </Row>
        </Grid>
        <Grid
          className="d-flex justify-content-between button-responsive BlueAndWhiteBtmFlex saveBrnGap"
          style={{ marginTop: "70px" }}
        >
          <Grid>
            <WhiteButton
              onClick={() => navigate(-1)}
              label="Cancel"
              className=""
            />
          </Grid>
          {loader ? (
            <LoaderComponent
              height="20"
              width="20"
              padding="20"
              loader={loader}
            />
          ) : (
            <Grid className="gap-3 d-flex  ">
              {/* <BlueButton
                className=""
                onClick={formik?.handleSubmit}
                style={{
                  fontSize: "16px",
                  opacity: isEdited ? 1 : 0.5,
                }}
                disabled={!isEdited}
                label={
                  location?.state?.id ? "Update Customer" : "Save Customer"
                }
              /> */}

              <BlueButton
                className=""
                onClick={async () => {
                  await formik?.handleSubmit();
                }}
                style={{
                  fontSize: "16px",
                  opacity: isEdited ? 1 : 0.5,
                }}
                disabled={!isEdited}
                label={
                  location?.state?.id ? "Update Customer" : "Save Customer"
                }
              />
            </Grid>
          )}
        </Grid>
      </Card>
    </Grid>
  );
};

export default AddCustomer;
