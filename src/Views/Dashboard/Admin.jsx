import React, { useEffect, useState } from "react";
import { handleAuth } from "../../components/Login/Auth";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import Customer from "../../assets/image/dashboard/Customer.svg";
import Quote from "../../assets/image/dashboard/Quote.svg";
import contract from "../../assets/image/dashboard/Contract.svg";
import invoice from "../../assets/image/dashboard/Invoice.svg";
import AxiosInstance from "../../Views/AxiosInstance";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Grid, Typography } from "@mui/material";
import "./style.css";
import Graph from "../../components/Graph/Graph";
import { LoaderComponent } from "../../components/Icon/Index";

const AdminDashboard = () => {
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  // const companyId = tokenDecode.companyId;

  const location = useLocation();
  const navigate = useNavigate();
  const { companyName } = useParams();

  const currentHour = new Date().getHours();

  let welcomeMessage;
  if (currentHour < 12) {
    welcomeMessage = "Good Morning";
  } else if (currentHour < 18) {
    welcomeMessage = "Good Afternoon";
  } else {
    welcomeMessage = "Good Evening";
  }

  const [data, setData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = process.env.REACT_APP_BASE_API;
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("clientToken");

      if (!token) {
        console.error("Token not found in localStorage");
        return;
      }

      try {
        const res = await AxiosInstance.post(`${baseUrl}/company/token_data`, {
          token,
        });

        setData(res.data.data);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    fetchData();
  }, []);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [tokenDecode, setTokenDecode] = useState(null);

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
    handleAuth(navigate, location);
  }, []);

  const CompanyId = localStorage.getItem("CompanyId");
  const companyId = tokenDecode?.companyId;

  const getData = async () => {
    setLoader(true);
    try {
      const activeCompanyId = CompanyId || companyId;

      if (!activeCompanyId) {
        console.error("Company ID is not available.");
        return;
      }

      const res = await AxiosInstance.get(
        `/company/admincounts/${activeCompanyId}`,
        {}
      );

      if (res?.data) {
        setcustomersData(res.data.data || []);
      } else {
        console.error("No data received from the server.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (CompanyId || companyId) {
      getData();
    }
  }, [CompanyId, companyId]);

  const [graphCompanyData, setGraphCompanyData] = useState();
  const [invoiceData, setinvoiceData] = useState();
  const [respopnse, setReponse] = useState(0);
  const [invoiceRespopnse, setInvoiceReponse] = useState(0);

  const getCompanyData = async (selectedYear) => {
    try {
      const companyId =
        localStorage.getItem("CompanyId") || tokenDecode?.companyId;
      const res = await AxiosInstance.get(`/admingraph/${companyId}`);
      const currentYear = new Date().getFullYear();
      const yearToFetch =
        selectedYear === "This Year" ? currentYear : currentYear - 1;
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
  }, [tokenDecode?.CompanyId]);

  const getInvoiceData = async (selectedYear) => {
    try {
      const companyId =
        localStorage.getItem("CompanyId") || tokenDecode?.companyId;
      const currentYear = new Date().getFullYear();

      const yearToFetch =
        selectedYear === "This Year" ? currentYear : currentYear - 1;

      const res = await AxiosInstance.get(`/admingraph/graphss/${companyId}`);
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

  const [selectedYearCompany, setSelectedYearCompany] = useState("This Year");
  const handleChangeCompany = (year) => {
    setSelectedYearCompany(year);
    getInvoiceData(year);
  };

  useEffect(() => {
    getInvoiceData(selectedYearCompany);
  }, []);

  const cardData = [
    {
      title: "Customer",
      logo: Customer,
      customer: customersData?.Customer || 0,
      desc: "Record new service requests from your Customer.",
      option: "Create a Customer",
      onClick: () => {
        navigate(`/${companyName}/add-customer`, {
          state: { navigats: ["/index", "/add-customer"] },
        });
      },
    },

    {
      title: "Quotes",
      // Quotes:Quotes,
      customer: customersData?.quotes || 0,
      logo: Quote,
      desc: "Send your Customer professional quotes they can approve online.",
      option: "Create a quote",
      onClick: () => {
        navigate(`/${companyName}/add-quotes`, {
          state: { navigats: ["/index", "/add-quotes"] },
        });
      },
      // {customersData?.Customer || 0}
    },
    {
      title: "Contracts",
      customer: customersData?.contracts || 0,
      logo: contract,
      desc: "Schedule contract with all the details you need to get them done.",
      option: "Create a contract",
      onClick: () => {
        navigate(`/${companyName}/add-contract`, {
          state: { navigats: ["/index", "/add-contract"] },
        });
      },
    },
    {
      title: "Invoices",
      customer: customersData?.invoices || 0,
      logo: invoice,
      desc: "Send your Customer professional invoices they can pay online",
      option: "Create an invoice",
      onClick: () => {
        navigate(`/${companyName}/invoice`, {
          state: { navigats: ["/index", "/invoice"] },
        });
      },
    },
  ];

  return (
    <Grid className="admin">
      {loader ? (
        <Grid
          className="d-flex justify-content-center align-items-center"
          style={{
            height: "70vh", // Full viewport height for centering
            textAlign: "center",
            alignItems:"center",
            display:"flex",
            justifyContent:"center",
            margin: "0", // Reset unnecessary margin
            padding: "0", // Reset unnecessary padding
          }}
        >
          <LoaderComponent height="50" width="50" loader={loader} />
        </Grid>
      ) : (
        <Grid className="px-0">
          <h4
            className="px-1 text-blue-color welcom_message_admin Good Morning"
            style={{
              fontSize: "35px",
              fontWeight: "700",
              fontFamily: "Poppins",
              lineHeight: "28.8px ",
            }}
          >
            {data?.full_name
              ? welcomeMessage + ", " + data?.full_name
              : welcomeMessage}
          </h4>
          <Grid className="grid-container py-3 pb-5">
            {cardData &&
              cardData.map((item, index) => (
                <Grid className="grid-item bg-blue-color" key={index}>
                  <Grid className="content ">
                    <Grid className="title">
                      <Grid className="logo bg-orange-color">
                        <img
                          src={item.logo}
                          alt={item.title}
                          width={34}
                          height={34}
                        />
                      </Grid>
                      <h4 className="name">{item.title || "title not available"}</h4>
                    </Grid>
                    <Grid className="desc">{item.desc || "desc not available"}</Grid>
                  </Grid>
                  <Grid
                    className="options bg-orange-color text-white-color"
                    onClick={item.onClick}
                  >
                    <Typography>{item.option || "option not available"}</Typography>
                    <Typography>
                      <EastRoundedIcon />
                    </Typography>
                  </Grid>
                  <Grid className="circle">
                    <span className="bg-orange-color">
                      <Typography className="countNumberAdmin">
                        {item.customer || 0}
                      </Typography>
                    </span>
                  </Grid>
                </Grid>
              ))}
          </Grid>

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
          />
        </Grid>
      )}
    </Grid>
  );
};
export default AdminDashboard;
