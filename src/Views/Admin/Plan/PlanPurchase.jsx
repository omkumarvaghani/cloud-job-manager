import { Card, CardContent, Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PaymentInfo from "../../../components/Plan/PaymentInfo";
import Address from "../../../components/Address";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Country } from "country-state-city";
import Summary from "../../../components/Plan/Summary";
import { handleAuth } from "../../../components/Login/Auth";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../components/Toast/Toster";
import { Typography } from "@mui/material";

const PlanPurchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName } = useParams();

  const [companyData, setCompanyData] = useState(undefined);
  const [customerVault, setCustomerVault] = useState(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyData && !location?.state?.card) {
        const data = await handleAuth(navigate, location);
        if (data && data?.data) {
          setCompanyData(data.data);
          planFormik.setValues({
            CompanyId: data?.data?.companyId,
            FirstName: "",
            LastName: "",
            CardNumber: "",
            ExpireMonth: "",
            ExpireYear: "",
            CVVNumber: "",
            Address: data?.data?.Address,
            City: data?.data?.City,
            State: data?.data?.State,
            Country: data?.data?.Country,
            Zip: data?.data?.Zip,
          });
        }
        try {
          const res = await AxiosInstance.get(
            `/nmi/customer_vault/${data?.data?.companyId}`
          );
          if (res.status === 200) {
            setCustomerVault(res?.data?.data);
          }
        } catch (error) {
          console.error("Error: ", error?.message);
        }
      } else if (location?.state?.card) {
        const data = location?.state?.card;
        setCompanyData(data);
        planFormik?.setValues((prevValues) => ({
          ...prevValues,
          CompanyId: data?.CompanyId,
          FirstName: data?.first_name,
          LastName: data?.last_name,
          CardNumber: data?.cc_number,
          ExpireYear: "20" + data?.cc_exp?.slice(2, 4),
          ExpireMonth: data?.cc_exp?.slice(0, 2),
          CVVNumber: data?.CVVNumber,
          Address: data?.address_1,
          City: data?.city,
          State: data?.state,
          Country: data?.country,
          Zip: data?.postal_code,
        }));
      }
    };

    fetchData();
  }, []);
  const plan = location?.state?.plan;
  const planFormik = useFormik({
    initialValues: {
      CompanyId: "",
      FirstName: "",
      LastName: "",
      CardNumber: "",
      ExpireMonth: "",
      ExpireYear: "",
      CVVNumber: "",
      Address: "",
      City: "",
      State: "",
      Country: "",
      Zip: "",
    },
    validationSchema: Yup.object().shape({
      FirstName: Yup.string().required("First name is required"),
      LastName: Yup.string().required("Last name is required"),
      CardNumber:
        !location?.state?.card &&
        Yup.number()
          .required("Card number is required")
          .test(
            "len",
            "Card number must be between 14 and 19 digits",
            (val) =>
              val && val.toString().length >= 14 && val.toString().length <= 19
          )
          .min(0, "Card number cannot be less than 0"),
      ExpireMonth: Yup.string().required("Expire month is required"),
      ExpireYear: Yup.string().required("Expire year is required"),
      Address: Yup.string().required("Address is required"),
      City: Yup.string().required("City is required"),
      State: Yup.string().required("State is required"),
      Country: Yup.string().required("Country is required"),
      Zip: Yup.string().required("Zip code is required"),
      CVVNumber: Yup.string()
        .required("CVV number is required")
        .matches(/^\d{3,4}$/, "CVV must be exactly 3 or 4 digits"),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      try {
        var vaultRes = "";
        if (!location?.state?.card) {
          const object = {
            first_name: values?.FirstName,
            last_name: values?.LastName,
            ccnumber: values?.CardNumber,
            ccexp: `${values?.ExpireMonth}${values?.ExpireYear?.slice(2, 4)}`,
            address1: values?.Address,
            city: values?.City,
            state: values?.State,
            zip: values?.Zip,
            country: values?.Country,
            company: companyName,
            CompanyId: values?.CompanyId,
            customer_vault_id: customerVault?.customer_vault_id
              ? Number(customerVault?.customer_vault_id)
              : "",
            type: "card",
          };
          var url = "";
          if (customerVault?.customer_vault_id) {
            url = "/nmi/create-customer-billing";
          } else {
            url = "/nmi/create-customer-vault";
          }
          vaultRes = await AxiosInstance.post(url, object);
        }

        const object = {
          paymentDetails: {
            billing_id: !location?.state?.card
              ? Number(vaultRes?.data?.data?.billing_id)
              : location?.state?.card["@attributes"].id,
            customer_vault_id: !location?.state?.card
              ? Number(vaultRes?.data?.data?.customer_vault_id)
              : location?.state?.card?.customer_vault_id,
            CardExp: `${values?.ExpireMonth}${values?.ExpireYear?.slice(2, 4)}`,
            BillingDate: moment(new Date()).format("MM-DD-YYYY"),
            address1: values?.Address,
            city: values?.City,
            state: values?.State,
            zip: values?.Zip,
            country: values?.Country,
            FirstName: values?.FirstName,
            LastName: values?.LastName,
            company: companyName,
            amount: plan?.PlanPrice,
            PlanId: plan?.PlanId,
            first_name: values?.FirstName,
            last_name: values?.LastName,
            CompanyId: values?.CompanyId,
            BillingDate: moment()
              .add(1, "months")
              .date(plan.DayOfMonth)
              .format("MM-DD-YYYY"),
          },
        };

        const res = await AxiosInstance.post("/nmi/card-payment", object);
        if (res?.data?.statusCode === 100) {
          showToast.success(res?.data?.message || "Payment successful!");
          localStorage.setItem("adminToken", res?.data?.token);
          navigate(
            companyName
              ? `/${companyName}/index`
              : `/${companyData?.companyName}/index`,
            { state: { navigats: ["/index"] } }
          );
        } else {
          showToast.error(res?.data?.message || "Payment failed!");
        }
      } catch (error) {
        const errorMessage =
          error?.response?.data?.data?.error ||
          error?.response?.data?.message ||
          "Something went wrong, try again later.";

        if (error?.response?.status === 403) {
          showToast.error(errorMessage);
        } else {
          showToast.error("Please add NmiSecretKey, Try again after some time!");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    setCountries(Country?.getAllCountries());
    if (planFormik?.values?.Country) {
      setSelectedCountry(() => {
        const country = Country?.getAllCountries().find(
          (item) => item?.name === planFormik?.values?.Country
        );
        return country;
      });
    }
  }, [planFormik]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      planFormik?.setFieldValue(name, value);
    } else if (name === "ExpireYear") {
      if (parseInt(value) === currentYear) {
        setExpireMonth(
          Array.from(
            { length: 12 - currentMonth + 1 },
            (_, i) => i + currentMonth
          )
        );
      } else {
        setExpireMonth(Array.from({ length: 12 }, (_, i) => i + 1));
      }
      planFormik.setFieldValue(name, value);
    } else {
      planFormik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [expireMonth, setExpireMonth] = useState([]);
  const [expireYear, setExpireYear] = useState([]);

  useEffect(() => {
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    setExpireYear(years);
    updateMonths(currentYear);
  }, [currentYear, currentMonth]);

  const updateMonths = (selectedYear) => {
    const startMonth =
      selectedYear === currentYear && !location?.state?.card ? currentMonth : 1;
    const months = Array.from({ length: 12 - startMonth + 1 }, (_, i) =>
      String(i + startMonth).padStart(2, "0")
    );
    setExpireMonth(months);
  };

  const handleYearChange = (value) => {
    const selectedYear = parseInt(value, 10);
    updateMonths(selectedYear);
  };

  const handleZipChange = (event) => {
    const { name, value } = event.target;
    const regex = /^[A-Za-z0-9]*$/;

    if (regex.test(value) || value === "") {
      planFormik.setFieldValue(name, value);
    }
  };

  return (
    <Grid className="">
      <Container className="my-4 palnCheckoutSub">
        <Typography className="my-3 heading-two text-blue-color">
          Checkout
        </Typography>
        <Card
          style={{
            boxShadow:
              "3px 3px 4px 0px #2A4F614D, -3px -3px 4px 0px #2A4F614D, 4px -3px 3px 0px #2A4F614D, -3px 3px 4px 0px #2A4F614D",
          }}
        >
          <CardContent>
            <Row className="row">
              <Col
                className="col-lg-7 px-4"
                style={{ borderRight: "1px solid #2A4F61" }}
                lg={7}
              >
                <Typography className="paymentInfoLike heading-four two text-blue-color">
                  Payment Information
                </Typography>
                <PaymentInfo
                  formik={planFormik}
                  handleChange={handleChange}
                  expireMonth={expireMonth}
                  expireYear={expireYear}
                  handleYearChange={handleYearChange}
                  disabled={!!location?.state?.card}
                />
                <Typography className="paymentInfoLike heading-four mb-4 text-blue-color">
                  Billing Address
                </Typography>
                <Address
                  formik={planFormik}
                  setSelectedCountry={setSelectedCountry}
                  selectedCountry={selectedCountry}
                  countries={countries}
                  handleChange={handleChange}
                  handleZipChange={handleZipChange}
                />
              </Col>
              <Col
                className="col-lg-5 px-4 d-flex flex-column align-items-ceter justify-content-center gap-3"
                lg={5}
              >
                <Summary formik={planFormik} plan={plan} loading={loading} />

                <Typography
                  style={{
                    fontSize: "10px",
                    color: "#06316499",
                    fontWeight: 400,
                  }}
                >
                  By proceeding, you agree to our Privacy Policy and Terms of
                  Service.
                </Typography>
              </Col>
            </Row>
          </CardContent>
        </Card>
      </Container>
    </Grid>
  );
};

export default PlanPurchase;
