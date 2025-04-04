import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Quotes from "../../../src/assets/Blue-sidebar-icon/Quote.svg";
import Contract from "../../../src/assets/Blue-sidebar-icon/Contract.svg";
import Invoice from "../../../src/assets/Blue-sidebar-icon/Invoice.svg";
import Appoinment from "../../../src/assets/Blue-sidebar-icon/Appoinment-blue.svg";
import "./style.css";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import AxiosInstance from "../AxiosInstance";
import { handleAuth } from "../../components/Login/Auth";
import { Grid, Typography } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import Graph from "../../components/Graph/Graph";

import { LoaderComponent } from "../../components/Icon/Index";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState({});
  const [loader, setLoader] = useState(true);
  
  const [tokenDecode, setTokenDecode] = useState({});
  console.log(tokenDecode, "tokenDecode");
  const CompanyId = tokenDecode.CompanyId;
  const CustomerId = tokenDecode.CustomerId;
  console.log(tokenDecode, "tokenDecode");
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      console.log(res, "resresresres");
      setTokenDecode(res.data);
      console.log(res.data, "res.data");
    } catch (error) {
      console.error("Error fetching token decode data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AxiosInstance.get(
          `/customer/customer-dashboard/${CustomerId}/${CompanyId}`
        );
        setData(response?.data?.data);
      } catch (error) {
        console.error("Error fetching customer dashboard data:", error);
        navigate("/login");
      }
    };

    if (CustomerId && CompanyId) {
      fetchData();
    }
  }, [CustomerId, CompanyId, navigate, location]);
  const [graphCompanyData, setGraphCompanyData] = useState();
  const [respopnse, setReponse] = useState(0);
  const [invoiceRespopnse, setInvoiceReponse] = useState(0);
  const [invoiceData, setinvoiceData] = useState();
  const getCompanyData = async (selectedYear) => {
    try {
      const companyId = tokenDecode?.CompanyId;
      const customerId = localStorage.getItem("CustomerId");

      const currentYear = new Date().getFullYear();

      const yearToFetch =
        selectedYear === "This Year" ? currentYear : currentYear - 1;

      const res = await AxiosInstance.get(
        `/admingraph/${companyId}/${customerId}?year=${yearToFetch}`
      );
      setReponse(res.data.data);

      if (res.data.statusCode === 200) {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const data = months.reduce((acc, month) => {
          acc[month] = { totalContracts: 0, totalQuotes: 0 };
          return acc;
        }, {});

        const contractSummary = res.data.data.contractSummary.find(
          (item) => item._id === yearToFetch
        );
        const quoteSummary = res.data.data.quoteSummary.find(
          (item) => item._id === yearToFetch
        );

        contractSummary?.months.forEach((item) => {
          const monthIndex = item.month - 1;
          const monthName = months[monthIndex];
          if (data[monthName]) {
            data[monthName].totalContracts = item.totalContracts;
          }
        });

        quoteSummary?.months.forEach((item) => {
          const monthIndex = item.month - 1;
          const monthName = months[monthIndex];
          if (data[monthName]) {
            data[monthName].totalQuotes = item.totalQuotes;
          }
        });

        setGraphCompanyData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };
  const [selectedYearPlan, setSelectedYearPlan] = useState(null);
  const handleChangePlan = (year) => {
    setSelectedYearPlan(year);
    getCompanyData(year);
  };

  useEffect(() => {
    const defaultYear = "This Year";
    getCompanyData(defaultYear);
  }, [tokenDecode?.CompanyId]);

  const getInvoiceData = async (selectedYear) => {
    try {
      const companyId = tokenDecode?.CompanyId;
      const customerId = localStorage.getItem("CustomerId");

      const currentYear = new Date().getFullYear();

      const yearToFetch =
        selectedYear === "This Year" ? currentYear : currentYear - 1;

      const res = await AxiosInstance.get(
        `/admingraph/customergraph/${companyId}/${customerId}?year=${yearToFetch}`
      );
      setInvoiceReponse(res.data.data);

      if (res.data.statusCode === 200) {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const data = months.reduce((acc, month) => {
          acc[month] = { totalInvoice: 0, totalAppointments: 0 };
          return acc;
        }, {});

        const invoiceSummary = res.data.data.invoiceSummary.find(
          (item) => item._id === yearToFetch
        );
        const appointmentSummary = res.data.data.appointmentSummary.find(
          (item) => item._id === yearToFetch
        );

        invoiceSummary?.months.forEach((item) => {
          const monthIndex = item.month - 1;
          const monthName = months[monthIndex];
          if (data[monthName]) {
            data[monthName].totalInvoice = item.totalInvoice;
          }
        });

        appointmentSummary?.months.forEach((item) => {
          const monthIndex = item.month - 1;
          const monthName = months[monthIndex];
          if (data[monthName]) {
            data[monthName].totalAppointments = item.totalAppointments;
          }
        });

        setinvoiceData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  const [selectedYearCompany, setSelectedYearCompany] = useState("This Year");
  const handleChangeCompany = (year) => {
    setSelectedYearCompany(year);
    getInvoiceData(year);
  };

  useEffect(() => {
    const defaultYear = "This Year";
    getInvoiceData(defaultYear);
  }, [tokenDecode?.CompanyId]);

  // useEffect(() => {
  //   getInvoiceData();
  //   getCompanyData();
  // }, [tokenDecode?.CompanyId]);

  const currentHour = new Date().getHours();
  let welcomeMessage =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
      ? "Good Afternoon"
      : "Good Evening";

  const handleQuotesNavigation = () => {
    navigate(`/customers/quotes`, {
      state: { navigats: ["/index", "/quotes"] },
    });
  };
  const handlecontractNavigation = () => {
    navigate(`/customers/contract`, {
      state: { navigats: ["/index", "/contract"] },
    });
  };
  const handleinvoiceNavigation = () => {
    navigate(`/customers/invoice`, {
      state: { navigats: ["/index", "/invoice"] },
    });
  };
  const handleappoinmentsNavigation = () => {
    navigate(`/customers/appointment`, {
      state: { navigats: ["/index", "/appointment"] },
    });
  };
  return (
    <Grid>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{
            textAlign: "center",
            alignItems: "center",
            marginTop: "25%",
            height: "70vh",
          }}
        >
          <LoaderComponent height="50" width="50" loader={loader} />
        </Grid>
      ) : (
        <Grid>
          <Grid className="px-0 mb-3">
            <Typography
              className="px-1 welcomeMessage_staffMember staffDashboard heading-three"
              style={{
                fontSize: "35px",
                fontWeight: "700",
                fontFamily: "Poppins",
                lineHeight: "28.8px",
                color: "#063164 ",
              }}
            >
              {welcomeMessage}, {tokenDecode?.FirstName} {tokenDecode?.LastName}
              {console.log(tokenDecode, "tokenDecode123")}
            </Typography>
          </Grid>

          <Grid className="dashboard-customer">
            <Row className="main-customer row">
              <Col
                className="card client-footer mb-3 col-lg-3 col-md-6 col-sm-12"
                lg={3}
                md={6}
                sm={12}
              >
                <Grid className="card-header bg-orange-color"></Grid>
                <Grid className="card-body bg-blue-color">
                  <Typography className="card-text first-card-client bg-white-color">
                    <img src={Quotes} className="border-orange-color " />
                  </Typography>
                  <Typography className="mx-1 card-title text-white-color mt-5 heading-three">
                    {data.quotes || 0}
                  </Typography>
                </Grid>
                <Grid
                  className="card-footer bg-orange-color text-white-color mb-0"
                  onClick={handleQuotesNavigation}
                  style={{ cursor: "pointer" }}
                >
                  Quotes <ArrowRightIcon style={{ fontSize: "38px" }} />
                </Grid>
              </Col>

              <Col
                className="card client-footer mb-3 col-lg-3 col-md-6 col-sm-12"
                lg={3}
                md={6}
                sm={12}
              >
                <Grid className="card-header bg-orange-color"></Grid>
                <Grid className="card-body bg-blue-color">
                  <Typography className="card-text first-card-client bg-white-color">
                    <img src={Contract} className="border-orange-color " />
                  </Typography>
                  <Typography className="mx-1 card-title text-white-color mt-5 heading-three">
                    {data.contracts || 0}
                  </Typography>
                </Grid>
                <Grid
                  className="card-footer bg-orange-color text-white-color mb-0"
                  onClick={handlecontractNavigation}
                  style={{ cursor: "pointer" }}
                >
                  Contract <ArrowRightIcon style={{ fontSize: "38px" }} />
                </Grid>
              </Col>

              <Col
                className="card client-footer mb-3 col-lg-3 col-md-6 col-sm-12"
                lg={3}
                md={6}
                sm={12}
              >
                <Grid className="card-header bg-orange-color"></Grid>
                <Grid className="card-body bg-blue-color">
                  <Typography className="card-text first-card-client bg-white-color">
                    <img src={Invoice} className="border-orange-color " />
                  </Typography>
                  <Typography className="mx-1 card-title text-white-color mt-5 heading-three">
                    {data.invoices || 0}
                  </Typography>
                </Grid>
                <Grid
                  className="card-footer bg-orange-color text-white-color mb-0"
                  onClick={handleinvoiceNavigation}
                  style={{ cursor: "pointer" }}
                >
                  Invoices <ArrowRightIcon style={{ fontSize: "38px" }} />
                </Grid>
              </Col>

              <Col
                className="card client-footer mb-3 col-lg-3 col-md-6 col-sm-12"
                lg={3}
                md={6}
                sm={12}
              >
                <Grid className="card-header bg-orange-color"></Grid>
                <Grid className="card-body bg-blue-color">
                  <Typography className="card-text first-card-client bg-white-color">
                    <img src={Appoinment} className="border-orange-color " />
                  </Typography>
                  <Typography className="mx-1 heading-three card-title text-white-color mt-5">
                    {data.visits || 0}
                  </Typography>
                </Grid>
                <Grid
                  className="card-footer bg-orange-color text-white-color mb-0"
                  onClick={handleappoinmentsNavigation}
                  style={{ cursor: "pointer" }}
                >
                  Appointment <ArrowRightIcon style={{ fontSize: "38px" }} />
                </Grid>
              </Col>
            </Row>
          </Grid>
          <Graph
            graphCompanyData={graphCompanyData}
            invoiceData={invoiceData}
            respopnse={respopnse}
            invoiceRespopnse={invoiceRespopnse}
            selectedYearPlan={selectedYearPlan}
            handleChangePlan={handleChangePlan}
            handleChangeCompany={handleChangeCompany}
            selectedYearCompany={selectedYearCompany}
            setSelectedYearCompany={setSelectedYearCompany}
            setSelectedYearPlan={setSelectedYearPlan}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ClientDashboard;
