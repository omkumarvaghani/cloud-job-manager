import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Country } from "country-state-city";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../Client/style.css";
import AxiosInstance from "../../AxiosInstance";
import showToast from "../../../components/Toast/Toster";

import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
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
import client from "../../../../src/assets/White-sidebar-icon/Customer.svg";
import Address from "../../../components/Address";
import InputText from "../../../components/InputFields/InputText";
import { Row, Col } from "react-bootstrap";
import { Grid, Typography } from "@mui/material";
import BlueButton from "../../../components/Button/BlueButton";
import WhiteButton from "../../../components/Button/WhiteButton";
import {
  LoaderComponent,
  NavigateButton,
} from "../../../components/Icon/Index";

function AddClient() {
  const location = useLocation();
  const navigate = useNavigate();
  const { CompanyName } = useParams();
  const [loader, setLoader] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [CompanyId, setCompanyId] = useState(localStorage.getItem("CompanyId"));
  const [isEdited, setIsEdited] = useState(false);

  const fetchTokenData = async () => {
    if (!CompanyId) {
      try {
        const token =
          localStorage.getItem("adminToken") ||
          localStorage.getItem("workerToken");

        if (!token) {
          console.error("Token not found in localStorage");
          return;
        }
        const res = await AxiosInstance.post(`/company/token_data`, {
          token,
        });
        if (res?.data) {
          setCompanyId(res?.data?.data?.CompanyId);
        }
      } catch (error) {
        console.error("Error:", error?.message);
      }
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, []);

  const [userAddress, setUserAddress] = useState();

  const formik = useFormik({
    initialValues: {
      CompanyId: "",
      FirstName: "",
      LastName: "",
      City: "",
      State: "",
      Zip: "",
      Country: "",
      PhoneNumber: "",
      EmailAddress: "",
      Address: "",
      CustomerId: "",
    },
    validationSchema: Yup.object({
      FirstName: Yup.string().required("First Name Required"),
      LastName: Yup.string().required("Last Name Required"),
      PhoneNumber: Yup.string()
        .required("Phone number required")
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "Phone number must be in the format (xxx) xxx-xxxx"
        ),
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email required")
        .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
      City: Yup.string().required("City Required"),
      State: Yup.string().required("State Required"),
      Address: Yup.string().required("Address Required"),
      Zip: Yup.string().required("Zip Required"),
      Country: Yup.string().required("Country Required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoader(true);
      try {
        // If it's an update, handle PUT request
        if (location?.state?.id) {
          const response = await AxiosInstance.put(
            `/v1/user/${location?.state?.id}`,
            values
          );
          // consol.log(response, "responsess");
          if (response?.data?.statusCode === "200") {
            setLoader(false);
            showToast.success(response?.data?.message);
            // Handle navigatio n after successful update
            navigate(
              `/${
                CompanyName
                  ? CompanyName + "/customer"
                  : "staff-member" + "/workercustomer"
              }`,
              {
                state: {
                  navigats: location?.state?.navigats.filter(
                    (item) => item !== "/add-customer"
                  ),
                },
              }
            );
          } else {
            showToast.error(response?.data?.message, "error");
          }
        }
        // If it's a new customer, handle POST request
        else {
          const response = await AxiosInstance.post(`/v1/user`, {
            ...values,
            CompanyId: CompanyId,
            AddedAt: new Date(),
            Role: "Customer",
          });
          if (response?.data?.statusCode == "200") {
            setLoader(false);
            showToast.success(response?.data?.message);

            if (location?.state?.previewPage) {
              navigate(location?.state?.previewPage, {
                state: {
                  Customer: { ...response?.data.data, ...values },
                  UserId: response?.data.data?.UserId,
                  navigats: location?.state?.navigats.filter(
                    (item) => item !== "/add-customer"
                  ),
                },
              });
            } else {
              navigate(
                `/${
                  CompanyName
                    ? CompanyName + "/customer"
                    : "staff-member" + "/workercustomer"
                }`,
                {
                  state: {
                    navigats: location?.state?.navigats.filter(
                      (item) => item !== "/add-customer"
                    ),
                  },
                }
              );
            }
          } else {
            showToast.error(
              response?.data?.message || "Something went wrong!",
              "error"
            );
          }
        }
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;

          if (status === 400 && data?.errors) {
            data.errors.forEach((message) => {
              const fieldName = message.split(" ")[0];
              formik.setFieldError(fieldName, message);
              setTimeout(() => {
                showToast.warning(`${fieldName}: ${message}`);
              }, 300);
            });
          } else {
            showToast.error(data?.message || "Something went wrong!");
          }
        } else {
          console.error("Error during request:", error);
          showToast.error(
            error?.response?.data?.message || "Something went wrong!"
          );
        }
      } finally {
        setLoader(false);
      }
    },
  });

  const formatPhoneNumber = (value) => {
    const PhoneNumber = value.replace(/[^\d]/g, "");
    const limitedPhoneNumber = PhoneNumber.slice(0, 10);
    const match = limitedPhoneNumber.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (match) {
      let formattedNumber = "";
      if (match[1].length >= 3) {
        formattedNumber = `(${match[1]}) `;
      } else {
        formattedNumber = match[1];
      }
      formattedNumber += match[2];
      if (match[3]) {
        formattedNumber += `-${match[3]}`;
      }

      return formattedNumber;
    }
    return limitedPhoneNumber;
  };

  const handlePhoneChange = (e) => {
    if (formik?.values?.PhoneNumber?.length > e?.target?.value?.length) {
      formik?.setFieldValue("PhoneNumber", e?.target?.value);
    } else {
      const formattedValue = formatPhoneNumber(e.target.value);
      formik?.setFieldValue("PhoneNumber", formattedValue);
    }
    setIsEdited(true);
  };
  useEffect(() => {
    setCountries(Country.getAllCountries());
    if (formik?.values?.Country) {
      setSelectedCountry(() => {
        const country = Country.getAllCountries().find(
          (item) => item?.name === formik?.values?.Country
        );
        return country;
      });
    }
  }, [formik]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AxiosInstance.get(`/v1/user/${location?.state?.id}`);
        const userProfile = res?.data?.data?.userProfile;
        const userLocations = res?.data?.data?.locations;
        console.log(res,"resres")
        setUserAddress(userLocations); // Make sure userAddress is updated here

        if (userProfile && userLocations?.length) {
          formik.setValues({
            FirstName: userProfile?.FirstName || "",
            LastName: userProfile?.LastName || "",
            PhoneNumber: userProfile?.PhoneNumber || "",
            EmailAddress: res?.data?.data?.user?.EmailAddress || "",
            // Use the first address if available
            Address: userLocations[0]?.Address || "",
            City: userLocations[0]?.City || "",
            State: userLocations[0]?.State || "",
            Zip: userLocations[0]?.Zip || "",
            Country: userLocations[0]?.Country || "",
          });
        }
      } catch (error) {
        console.error("Error: ", error?.message);
      }
    };
          
    if (location?.state?.id) {
      fetchData();
    }
  }, [location?.state?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      formik.setFieldValue(name, value);
    } else {
      formik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
    setIsEdited(true);
  };

  const handleZipChange = (event) => {
    const { name, value } = event.target;
    const regex = /^[A-Za-z0-9]*$/;

    if (regex.test(value) || value === "") {
      formik.setFieldValue(name, value);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (formik.dirty) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formik.dirty]);

  return (
    <>
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
                      formik?.touched?.PhoneNumber &&
                      formik?.errors?.PhoneNumber
                    }
                    name="PhoneNumber"
                    id="PhoneNumber"
                    placeholder="Enter phone number"
                    label="PhoneNumber"
                    type="text"
                    className="text-blue-color w-100 mb-3"
                    fieldHeight="56px"
                  />
                </Grid>

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
                    {/* <img src={clientcontract} alt="Property Details" /> */}
                  </Grid>
                  <span className="" style={{ fontSize: "16pxx" }}>
                    Property details
                  </span>
                </CardTitle>
                {!location?.state?.id ||
                (Array.isArray(userAddress) && userAddress.length <= 1) ? (
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
                          Multiple properties can only be edited individually.
                          To edit a property, select it from the Customer's list
                          of properties.
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
    </>
  );
}

export default AddClient;
