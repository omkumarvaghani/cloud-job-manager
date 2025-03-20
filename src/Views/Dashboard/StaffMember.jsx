import React from "react";
import { useEffect, useState } from "react";
import { useAuthAdmin } from "../../components/Login/Auth";
import axios from "axios";
import AxiosInstance from "../../Views/AxiosInstance";
import Quotes from "../../../src/assets/White-sidebar-icon/Quote.svg";
import Contract from "../../../src/assets/White-sidebar-icon/Contract.svg";
import Invoice from "../../../src/assets/White-sidebar-icon/Invoice.svg";
import Appoinment from "../../../src/assets/White-sidebar-icon/Appoinments.svg";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { handleAuth } from "../../components/Login/Auth";
import { useLocation, useNavigate } from "react-router-dom";
import { Circles } from "react-loader-spinner";
import "./style.css";
import { LoaderComponent } from "../../components/Icon/Index";
import Graph from "../../components/Graph/Graph";

import { Grid, Typography } from "@mui/material";
import { Row, Col } from "react-bootstrap";

const CustomerDashboard = () => {
  const [data, setData] = useState({});
  const [loader, setloader] = useState(true);
  const currentHour = new Date().getHours();
  const navigate = useNavigate();
  const location = useLocation();
  let welcomeMessage;
  if (currentHour < 12) {
    welcomeMessage = "Good Morning";
  } else if (currentHour < 18) {
    welcomeMessage = "Good Afternoon";
  } else {
    welcomeMessage = "Good Evening";
  }

  const [tokenDecode, setTokenDecode] = useState({});
  const companyId = tokenDecode.companyId;
  const WorkerId = tokenDecode.WorkerId;
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
    } catch (error) {
      console.error("Error fetching token decode data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [graphCompanyData, setGraphCompanyData] = useState();
  const [invoiceData, setinvoiceData] = useState();
  const [respopnse, setReponse] = useState(0);
  const [invoiceRespopnse, setInvoiceReponse] = useState(0);

  const getCompanyData = async (selectedYear) => {
    try {
      const companyId =
        localStorage.getItem("CompanyId") || tokenDecode?.companyId;
      const currentYear = new Date().getFullYear();

      const yearToFetch =
        selectedYear === "This Year" ? currentYear : currentYear - 1;
      const res = await AxiosInstance.get(`/admingraph/${companyId}`);
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
  }, [tokenDecode?.companyId, WorkerId]);

  const getInvoiceData = async (selectedYear) => {
    try {
      const companyId =
        localStorage.getItem("CompanyId") || tokenDecode?.companyId;
      // const object = { WorkerId };
      const currentYear = new Date().getFullYear();

      const yearToFetch =
        selectedYear === "This Year" ? currentYear : currentYear - 1;
      const res = await AxiosInstance.get(`/admingraph/graphss/${companyId}`, {
        params: { WorkerId: WorkerId },
      });
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
    }
  };
  const [selectedYearCompany, setSelectedYearCompany] = useState("This Year"); // Default to "This Year"
  const handleChangeCompany = (year) => {
    setSelectedYearCompany(year); // Update selected year
    getInvoiceData(year); // Fetch data for the selected year
  };

  useEffect(() => {
    // Ensure that we are fetching data when the component is mounted
    getInvoiceData(selectedYearCompany);
  }, [tokenDecode?.companyId, WorkerId]);

  // useEffect(() => {
  //   getInvoiceData();
  //   getCompanyData();
  // }, [tokenDecode?.companyId, WorkerId]);
  useEffect(() => {
    if (WorkerId && companyId) {
      const fetchData = async () => {
        try {
          const response = await AxiosInstance.get(
            `/worker/worker-dashboard/${WorkerId}/${companyId}`
          );
          if (response.status === 200) {
            setData(response?.data?.data);
          } else {
            console.error("Error fetching data:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setloader(false);
        }
      };

      fetchData();
    }
  }, [WorkerId, companyId]); // Ensure both WorkerId and companyId are present

  const handleQuotesNavigation = () => {
    navigate(`/staff-member/WorkerQuotes`, {
      state: { navigats: ["/index", "/WorkerQuotes"] },
    });
  };
  const handlecontractNavigation = () => {
    navigate(`/staff-member/workercontract`, {
      state: { navigats: ["/index", "/workercontract"] },
    });
  };
  const handleinvoiceNavigation = () => {
    navigate(`/staff-member/workerinvoice`, {
      state: { navigats: ["/index", "/workerinvoice"] },
    });
  };
  const handleappoinmentsNavigation = () => {
    navigate(`/staff-member/WorkerAppoinments`, {
      state: { navigats: ["/index", "/WorkerAppoinments"] },
    });
  };
  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center "
          style={{ height: "80vh" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid>
          <Grid className="px-0">
            <Typography
              className="px-1 welcomeMessage_staffMember text-blue-color Good Morning heading-one"
              style={{
                fontSize: "35px",
                fontWeight: "700",
                fontFamily: "Poppins",
                lineHeight: "28.8px",
              }}
            >
              {welcomeMessage + ","}{" "}
              {tokenDecode?.FirstName || "full name not available"} &nbsp;
              {tokenDecode?.LastName || "full name not available"}
            </Typography>
          </Grid>

          <Row className="main-customer row mt-3">
            <Col
              className="col-3 staffmemberTopMargin"
              lg={3}
              md={6}
              sm={12}
              xs={12}
            >
              <Grid class="card " style={{ borderRadius: "15px" }}>
                <Grid class="card-body p-0 content">
                  <Grid
                    className="card-body  bg-blue-color"
                    style={{
                      borderTopLeftRadius: "15px",
                      borderTopRightRadius: "15px",
                      height: "150px",
                    }}
                  >
                    <Grid className="text-end d-flex justify-content-end">
                      <Typography
                        className="card-text text-end first-card-clientt logo"
                        style={{ backgroundColor: "#e88c44 " }}
                      >
                        <img
                          src={Quotes}
                          className="border-orange-color logo staffmemberLOgo"
                          style={{
                            height: "30px",
                            backgroundColor: "#e88c44 ",
                          }}
                        />
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography
                        className="mx-1  card-title   text-white-color mt-4 staffmemberHeadHere"
                        style={{ fontSize: "28px" }}
                      >
                        {data?.quotes || "0"}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid
                    onClick={handleQuotesNavigation}
                    className="card-footer worker-footer bg-orange-color text-white-color mb-0 staffmemberHeadHere"
                    style={{
                      cursor: "pointer",
                      borderBottomLeftRadius: "15px",
                      borderBottomRightRadius: "15px",
                      fontSize: "21px",
                    }}
                  >
                    Quotes{" "}
                    <ArrowRightIcon
                      style={{ fontSize: "30px" }}
                      className="aerrowofRight"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Col>
            <Col
              className="col-3 staffmemberTopMargin"
              lg={3}
              md={6}
              sm={12}
              xs={12}
            >
              <Grid class="card " style={{ borderRadius: "15px" }}>
                <Grid class="card-body p-0 ">
                  <Grid
                    className="card-body  bg-blue-color"
                    style={{
                      borderTopLeftRadius: "15px",
                      borderTopRightRadius: "15px",
                      height: "150px",
                    }}
                  >
                    <Grid className="text-end d-flex justify-content-end">
                      <Typography
                        className="card-text text-end first-card-clientt "
                        style={{ backgroundColor: "#e88c44 " }}
                      >
                        ``
                        <img
                          src={Contract}
                          className="border-orange-color staffmemberLOgo"
                          style={{
                            height: "30px",
                            backgroundColor: "#e88c44 ",
                            marginLeft: "-11px",
                          }}
                        />
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography
                        className="mx-1 card-title  text-white-color mt-4 staffmemberHeadHere"
                        style={{ fontSize: "28px" }}
                      >
                        {data?.contracts || "0"}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid
                    onClick={handlecontractNavigation}
                    className="card-footer worker-footer bg-orange-color text-white-color mb-0 staffmemberHeadHere"
                    style={{
                      cursor: "pointer",
                      borderBottomLeftRadius: "15px",
                      borderBottomRightRadius: "15px",
                      fontSize: "21px",
                    }}
                  >
                    Contract{" "}
                    <ArrowRightIcon
                      style={{ fontSize: "38px" }}
                      className="aerrowofRight"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Col>
            <Col
              className="col-3 staffmemberTopMargin"
              lg={3}
              md={6}
              sm={12}
              xs={12}
            >
              <Grid class="card " style={{ borderRadius: "15px" }}>
                <Grid class="card-body p-0 ">
                  <Grid
                    className="card-body  bg-blue-color"
                    style={{
                      borderTopLeftRadius: "15px",
                      borderTopRightRadius: "15px",
                      height: "150px",
                    }}
                  >
                    <Grid className="text-end d-flex justify-content-end">
                      <Typography
                        className="card-text text-end first-card-clientt "
                        style={{ backgroundColor: "#e88c44 " }}
                      >
                        <img
                          src={Invoice}
                          className="border-orange-color staffmemberLOgo"
                          style={{ height: "30px" }}
                        />
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography
                        className="mx-1 card-title  text-white-color mt-4 staffmemberHeadHere"
                        style={{ fontSize: "28px" }}
                      >
                        {data?.invoices || "0"}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid
                    onClick={handleinvoiceNavigation}
                    className="card-footer worker-footer bg-orange-color text-white-color mb-0 staffmemberHeadHere"
                    style={{
                      cursor: "pointer",
                      borderBottomLeftRadius: "15px",
                      borderBottomRightRadius: "15px",
                      fontSize: "21px",
                    }}
                  >
                    Invoices{" "}
                    <ArrowRightIcon
                      style={{ fontSize: "38px" }}
                      className="aerrowofRight"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Col>
            <Col
              className="col-3 staffmemberTopMargin"
              lg={3}
              md={6}
              sm={12}
              xs={12}
            >
              <Grid class="card " style={{ borderRadius: "15px" }}>
                <Grid class="card-body p-0 ">
                  <Grid
                    className="card-body  bg-blue-color"
                    style={{
                      borderTopLeftRadius: "15px",
                      borderTopRightRadius: "15px",
                      height: "150px",
                    }}
                  >
                    <Grid className="text-end d-flex justify-content-end">
                      <Typography
                        className="card-text text-end first-card-clientt "
                        style={{ backgroundColor: "#e88c44 " }}
                      >
                        <img
                          src={Appoinment}
                          className="border-orange-color staffmemberLOgo"
                          style={{ height: "30px" }}
                        />
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography
                        className="mx-1 card-title  text-white-color mt-4 staffmemberHeadHere"
                        style={{ fontSize: "28px" }}
                      >
                        {data?.visits || "0"}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid
                    onClick={handleappoinmentsNavigation}
                    className="card-footer worker-footer bg-orange-color text-white-color mb-0 staffmemberHeadHere"
                    style={{
                      cursor: "pointer",
                      borderBottomLeftRadius: "15px",
                      borderBottomRightRadius: "15px",
                      fontSize: "21px",
                    }}
                  >
                    Appointment{" "}
                    <ArrowRightIcon
                      style={{ fontSize: "38px" }}
                      className="aerrowofRight"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Col>
          </Row>

          <Graph
            invoiceData={invoiceData}
            graphCompanyData={graphCompanyData}
            invoiceRespopnse={invoiceRespopnse}
            respopnse={respopnse}
            selectedYearPlan={selectedYearPlan}
            handleChangePlan={handleChangePlan}
            handleChangeCompany={handleChangeCompany}
            selectedYearCompany={selectedYearCompany}
            setSelectedYearCompany={setSelectedYearCompany}
            sclitSelectedYearPlan={setSelectedYearPlan}
          />
        </Grid>
      )}
    </>
  );
};

export default CustomerDashboard;
