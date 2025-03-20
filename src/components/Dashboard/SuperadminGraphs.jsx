import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import "react-circular-progressbar/dist/styles.css";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  Col,
  Row,
} from "reactstrap";
import "./style.css";
import { Grid } from "@mui/material";
import AxiosInstance from "../../Views/AxiosInstance";
import {
  // Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

function SuperadminGraphs() {
  const [graphData, setGraphData] = useState();
  const [graphCompanyData, setGraphCompanyData] = useState();

  const getData = async (selectedYear) => {
    try {
      const res = await AxiosInstance.get(`/plan/graph`);

      const currentYear = new Date().getFullYear();
      const yearToFetch =
        selectedYear === "This Year" ? currentYear : currentYear - 1;

      // Check if the response is successful
      if (res?.data?.statusCode === 200) {
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

        // Initialize the data object with totalPlans for each month
        const data = months.reduce((acc, month) => {
          acc[month] = { totalPlans: 0 };
          return acc;
        }, {});

        // Loop through the response data (years and their months)
        res.data.data.forEach((yearData) => {
          if (yearData._id === yearToFetch) {
            // Loop through the months of the selected year
            yearData.months.forEach((monthData) => {
              const monthIndex = monthData.month - 1; // Adjust for zero-based indexing
              const monthName = months[monthIndex];

              if (data[monthName]) {
                data[monthName].totalPlans = monthData.totalPlans; // Set the totalPlans for that month
              }
            });
          }
        });

        // Set the graph data to the state
        setGraphData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // const [selectedYearCompany, setSelectedYearCompany] = useState(null);
  const handleChangeCompany = (year) => {
    setSelectedYearCompany(year);
    getData(year);
  };

  useEffect(() => {
    const defaultYear = "This Year";
    getData(defaultYear);
  }, []);

  const getCompanyData = async (selectedYear) => {
    try {
      const res = await AxiosInstance.get(
        "/company/companies-year-month-graph"
      );
      const currentYear = new Date().getFullYear();
      const yearToFetch =
        selectedYear === "This Year" ? currentYear : currentYear - 1;


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
          acc[month] = { activeCompanies: 0, inactiveCompanies: 0 };
          return acc;
        }, {});


        // Iterate over the data to populate the months with the correct values
        res.data.data.forEach((item) => {
          if (item._id === yearToFetch) {

          item.months.forEach((monthItem) => {
            const monthIndex = monthItem.month - 1; // Get the index of the month (0-based)
            const monthName = months[monthIndex];
            if (data[monthName]) {
              data[monthName].activeCompanies = monthItem.activeCompanies;
              data[monthName].inactiveCompanies = monthItem.inactiveCompanies;
            }
          });
        }
        });

        // Set the data in the state (e.g., using React's setState or similar)
        setGraphCompanyData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChangePlanChange = (year) => {
    setSelectedYearPlan(year);
    getCompanyData(year);
  };

  useEffect(() => {
    const defaultYear = "This Year";
    getCompanyData(defaultYear);
  }, []);

  // useEffect(() => {
  //   getData();
  //   getCompanyData();
  // }, []);

  const CompanyCustomTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      const activeCompanies = payload[0].value;
      const inactiveCompanies = payload[1].value;
      if (inactiveCompanies > 0 || activeCompanies > 0) {
        return (
          <Grid
            style={{
              backgroundColor: "#fff",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <strong>{label}</strong>
            <Grid>Active Companies: {activeCompanies}</Grid>
            <Grid>Inactive Companies: {inactiveCompanies}</Grid>
          </Grid>
        );
      } else {
        return "";
      }
    }

    return null;
  };

  const CompanyComparisonGraph = ({ data, poll1, poll2 }) => {
    const [activeBar, setActiveBar] = useState(false);

    return (
      <Grid className="chartContainer">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={Object.keys(data).map((month) => ({
              month,
              "Active Companies": data[month].activeCompanies,
              "Inactive Companies": data[month].inactiveCompanies,
            }))}
            barGap={-5}
          >
            <XAxis
              dataKey="month"
              axisLine={{ stroke: "transparent" }}
              tickLine={{ stroke: "transparent" }}
              tick={{ fontFamily: "Roboto", fontSize: 14 }}
            />
            <Tooltip
              content={activeBar ? <CompanyCustomTooltip /> : ""}
              active={activeBar}
            />
            <Bar
              dataKey="Active Companies"
              fill={poll1}
              shape={({ x, y, width, height }) => {
                const radius = 12;
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width * 0.8}
                      height={height}
                      fill={poll1}
                      rx={radius}
                      ry={radius}
                    />
                    <rect
                      x={x}
                      y={y + height - radius}
                      width={width * 0.8}
                      height={height ? radius : 0}
                      fill={poll1}
                    />
                  </g>
                );
              }}
              onMouseEnter={() => setActiveBar(true)}
              onMouseLeave={() => setActiveBar(false)}
            />
            <Bar
              dataKey="Inactive Companies"
              fill={poll2}
              shape={({ x, y, width, height }) => {
                const radius = 12;
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width * 0.8}
                      height={height}
                      fill={poll2}
                      rx={radius}
                      ry={radius}
                    />
                    <rect
                      x={x}
                      y={y + height - radius}
                      width={width * 0.8}
                      height={height ? radius : 0}
                      fill={poll2}
                    />
                  </g>
                );
              }}
              onMouseEnter={() => setActiveBar(true)}
              onMouseLeave={() => setActiveBar(false)}
            />
          </BarChart>
        </ResponsiveContainer>
      </Grid>
    );
  };

  const CompanyComparisonChartContainer = ({ poll1, poll2 }) => {
    return (
      <CompanyComparisonGraph
        data={graphCompanyData}
        poll1={poll1}
        poll2={poll2}
      />
    );
  };

  const PlanCustomTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      const activePlan = payload[0].value;
      if (activePlan > 0) {
        return (
          <Grid
            style={{
              backgroundColor: "#fff",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <strong>{label}</strong>
            <Grid>Active Plans: {activePlan || ""}</Grid>
          </Grid>
        );
      } else {
        return "";
      }
    }

    return null;
  };

  const PlanComparisonGraph = ({ data, poll1 }) => {
    const [activeBar, setActiveBar] = useState(false);

    return (
      <Grid className="chartContainer">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={
              data
                ? Object.keys(data).map((month) => ({
                    month,
                    totalPlans: data[month].totalPlans || 0,
                  }))
                : []
            }
            barGap={-5}
          >
            <XAxis
              dataKey="month"
              axisLine={{ stroke: "transparent" }}
              tickLine={{ stroke: "transparent" }}
              tick={{ fontFamily: "Roboto", fontSize: 14 }}
            />
            <Tooltip
              content={activeBar ? <PlanCustomTooltip /> : ""}
              active={activeBar}
            />
            <Bar
              dataKey="totalPlans"
              fill={poll1}
              shape={({ x, y, width, height }) => {
                const radius = 12;
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width * 0.8}
                      height={height}
                      fill={poll1}
                      rx={radius}
                      ry={radius}
                    />
                    <rect
                      x={x}
                      y={y + height - radius}
                      width={width * 0.8}
                      height={height ? radius : 0}
                      fill={poll1}
                    />
                  </g>
                );
              }}
              onMouseEnter={() => setActiveBar(true)}
              onMouseLeave={() => setActiveBar(false)}
            />
          </BarChart>
        </ResponsiveContainer>
      </Grid>
    );
  };

  const PlanComparisonChartContainer = ({ poll1 }) => {
    return <PlanComparisonGraph data={graphData} poll1={poll1} />;
  };

  const [selectedYearPlan, setSelectedYearPlan] = useState("This Year");
  const [selectedYearAdmin, setSelectedYearAdmin] = useState("This Year");
  const [selectedYearCompany, setSelectedYearCompany] = useState("This Year");

  const [dropdownOpenPlan, setdropdownOpenPlan] = useState(false);
  const [dropdownOpenAdmin, setdropdownOpenAdmin] = useState(false);
  const [dropdownOpenCompany, setDropdownOpenComapny] = useState(false);

  const togglePlan = () => setdropdownOpenPlan((prevState) => !prevState);
  const toggleAdmin = () => setdropdownOpenAdmin((prevState) => !prevState);
  // const handleChangePlan = (year) => setSelectedYearPlan(year);
  const handleChangeAdmin = (year) => setSelectedYearAdmin(year);
  const togglePlanSecond = () =>
    setDropdownOpenComapny((prevState) => !prevState);

  const [localSelectedYear, setLocalSelectedYear] = useState(
    selectedYearCompany || "Select Year"
  );

  const handleLocalChange = (year) => {
    setLocalSelectedYear(year);
    if (handleChangeCompany) {
      handleChangeCompany(year);
    }
  };

  const [localSelectYearContract, setLocalSelectYearContract] = useState(
    selectedYearPlan || "Select Year"
  );


  const handleLocalChangeQuote = (year) => {
    setLocalSelectYearContract(year);
    if (handleChangePlanChange) {
      handleChangePlanChange(year);
    }
  };

  // const [selectedYearPlan, setSelectedYearPlan] = useState(null);
  // const handleChangePlan = (year) => {
  //   setSelectedYearPlan(year);
  //   getCompanyData(year);
  // };

  // useEffect(() => {
  //   const defaultYear = "This Year";
  //   getCompanyData(defaultYear);
  // }, []);

  return (
    <>
      {graphData && graphCompanyData && (
        <Row className="mb-5">
          <Col xs={12} lg={6} sm={12} md={12} className="pt-3">
            <Card
              style={{
                boxShadow: "rgba(0, 0, 0, 0.35) 0px 4px 4px 0",
                border: "0.3px solid rgba(82, 84, 89, 0.5)",
                borderRadius: "12px",
              }}
            >
              <Row className="w-100 px-3 my-3" style={{ zIndex: 9 }}>
                <Col
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                  className="pl-4 text-blue-color"
                >
                  Plans
                </Col>
                <Col className="d-flex justify-content-end">
                  <Typography
                    isOpen={dropdownOpenAdmin}
                    toggle={toggleAdmin}
                    style={{
                      zIndex: "9",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      backgroundColor: "#E88C44",
                    }}
                    className=""
                  >
                    {/* <Typography style={{width:"107px",height:"36px",alignItems:"center",display:"flex",justifyContent:"center",textAlign:"center"}}>
                   
                    This Year
                   
                  </Typography> */}
                    <Dropdown
                      isOpen={dropdownOpenCompany}
                      toggle={togglePlanSecond}
                    >
                      <DropdownToggle
                        className="bg-blue-color"
                        caret
                        style={{ color: "#fff" }}
                      >
                        {localSelectedYear}
                      </DropdownToggle>
                      <DropdownMenu className="text-blue-color">
                        <DropdownItem
                          onClick={() => handleLocalChange("This Year")}
                        >
                          This Year
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => handleLocalChange("Previous Year")}
                        >
                          Previous Year
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Typography>
                </Col>
              </Row>
              <Row className="w-100 py-3 px-5 graphRemovePadding">
                <PlanComparisonChartContainer
                  poll1={"#063164"}
                  poll2={"rgba(6, 49, 100, 1)"}
                />
              </Row>
              <Row className="w-100 px-3 my-1">
                <Col
                  lg={12}
                  className="d-flex justify-content-center align-items-center"
                >
                  <Typography
                    style={{ fontFamily: "Poppins", fontSize: "15px" }}
                    className="px-3"
                  >
                    <i className="fa-solid fa-circle px-1 text-blue-color"></i>{" "}
                    Purchase Plans
                  </Typography>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={12} lg={6} sm={12} md={12} className="pt-3">
            <Card
              style={{
                boxShadow: "rgba(0, 0, 0, 0.35) 0px 4px 4px 0",
                border: "0.3px solid rgba(82, 84, 89, 0.5)",
                borderRadius: "12px",
              }}
            >
              <Row className="w-100 px-3 my-3" style={{ zIndex: 9 }}>
                <Col
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                  className="pl-4 text-orange-color"
                >
                  Company
                </Col>
                <Col className="d-flex justify-content-end">
                  <Typography
                    isOpen={dropdownOpenAdmin}
                    toggle={toggleAdmin}
                    style={{
                      zIndex: "9",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      backgroundColor: "#E88C44",
                    }}
                    className=""
                  >
                    {/* <Typography
                      style={{
                        width: "107px",
                        height: "36px",
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      This Year
                    </Typography> */}
                    <Dropdown isOpen={dropdownOpenPlan} toggle={togglePlan}>
                      <DropdownToggle
                        className="bg-blue-color"
                        caret
                        style={{ color: "#fff" }}
                      >
                        {localSelectYearContract}
                      </DropdownToggle>
                      <DropdownMenu className="text-blue-color">
                        <DropdownItem
                          onClick={() => handleLocalChangeQuote("This Year")}
                        >
                          This Year
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleLocalChangeQuote("Previous Year")
                          }
                        >
                          Previous Year
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </Typography>
                </Col>
              </Row>
              <Row className="w-100 py-3 px-5 graphRemovePadding">
                <CompanyComparisonChartContainer
                  poll1={"#F9A146"}
                  poll2={"#063164"}
                />
              </Row>
              <Row className="w-100 px-3 my-1">
                <Col
                  lg={12}
                  className="d-flex justify-content-center align-items-center"
                >
                  <Typography
                    style={{ fontFamily: "Poppins", fontSize: "15px" }}
                    className="px-3"
                  >
                    <i className="fa-solid fa-circle px-1 text-orange-color"></i>{" "}
                    Active Company
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Poppins", fontSize: "15px" }}
                    className="px-3"
                  >
                    <i className="fa-solid fa-circle px-1 text-blue-color"></i>{" "}
                    Inactive Company
                  </Typography>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
}

export default SuperadminGraphs;
