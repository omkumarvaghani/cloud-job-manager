import React, { useEffect, useState } from "react";
import "./style.css";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { Grid, Typography } from "@mui/material";
import { Row, Col } from "react-bootstrap";
const Graph = ({
  invoiceData,
  graphCompanyData,
  invoiceRespopnse,
  respopnse,
  handleChangePlan,
  handleChangeCompany,
  selectedYearCompany,
  setSelectedYearCompany,
}) => {
  const CompanyCustomTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      const totalContracts = payload[0]?.value || 0;
      const totalQuotes = payload[1]?.value || 0;

      if (totalQuotes > 0 || totalContracts > 0) {
        return (
          <Grid
            style={{
              backgroundColor: "#fff",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <strong>{label}</strong>
            <Grid>Contract: {totalContracts || "0"}</Grid>
            <Grid>Quotes: {totalQuotes || "0"}</Grid>
          </Grid>
        );
      } else {
        return null;
      }
    }

    return null;
  };
  const InvoicerToolTIp = ({ payload, label }) => {
    if (payload && payload.length) {
      const totalInvoice = payload[0]?.value || 0;
      const totalAppointments = payload[1]?.value || 0;

      if (totalAppointments > 0 || totalInvoice > 0) {
        return (
          <Grid
            style={{
              backgroundColor: "#fff",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <strong>{label}</strong>
            <Grid>Invoices: {totalInvoice || "0"}</Grid>
            <Grid>Appointments: {totalAppointments || "0"}</Grid>
          </Grid>
        );
      } else {
        return null;
      }
    }

    return null;
  };

  const [selectedYearPlan, setSelectedYearPlan] = useState("This Year");
  const [dropdownOpenPlan, setDropdownOpenPlan] = useState(false);
  const [dropdownOpenCompany, setDropdownOpenComapny] = useState(false);
  const togglePlan = () => setDropdownOpenPlan((prevState) => !prevState);
  const togglePlanSecond = () =>
    setDropdownOpenComapny((prevState) => !prevState);

  useEffect(() => {
    if (
      selectedYearPlan === "This Year" ||
      selectedYearPlan === "Previous Year"
    ) {
      setSelectedYearPlan(selectedYearPlan);
    }
  }, [selectedYearPlan]);

  useEffect(() => {
    if (
      selectedYearCompany === "This Year" ||
      selectedYearCompany === "Previous Year"
    ) {
      setSelectedYearCompany(selectedYearCompany);
    }
  }, [selectedYearCompany]);

  const ComparisonGraph = ({ data, poll1, poll2 }) => {
    const [activeBar, setActiveBar] = useState(false);

    return (
      <Grid className="chartContainer">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={
              data
                ? Object.keys(data).map((month) => ({
                    month,
                    totalContracts: data[month].totalContracts || 0,
                    totalQuotes: data[month].totalQuotes || 0,
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
              content={activeBar ? <CompanyCustomTooltip /> : ""}
              active={activeBar}
            />
            <Bar
              dataKey="totalContracts"
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
              dataKey="totalQuotes"
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
  const ComparisonChartContainer = ({ poll1, poll2 }) => {
    return (
      <ComparisonGraph data={graphCompanyData} poll1={poll1} poll2={poll2} />
    );
  };
  const ComparisonGraphh = ({ data, poll1, poll2 }) => {
    const [activeBar, setActiveBar] = useState(false);

    return (
      <Grid className="chartContainer">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={
              data
                ? Object.keys(data).map((month) => ({
                    month,
                    totalInvoice: data[month].totalInvoice || 0,
                    totalAppointments: data[month].totalAppointments || 0,
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
              content={activeBar ? <InvoicerToolTIp /> : ""}
              active={activeBar}
            />
            <Bar
              dataKey="totalInvoice"
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
              dataKey="totalAppointments"
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

  const PlanComparisonChartContainer = ({ poll1, poll2 }) => {
    return <ComparisonGraphh data={invoiceData} poll1={poll1} poll2={poll2} />;
  };
  useEffect(() => {
    if (
      selectedYearCompany === "This Year" ||
      selectedYearCompany === "Previous Year"
    ) {
      setLocalSelectedYear(selectedYearCompany);
    }
  }, [selectedYearCompany]);

  const [localSelectedYear, setLocalSelectedYear] = useState("This Year");

  useEffect(() => {
    setLocalSelectedYear(selectedYearCompany);
  }, [selectedYearCompany]);

  const handleLocalChange = (year) => {
    setLocalSelectedYear(year);
    handleChangeCompany(year);
  };

  const [localSelectYearContract, setLocalSelectYearContract] = useState(
    selectedYearPlan || "This Year"
  );

  useEffect(() => {
    setLocalSelectYearContract(selectedYearPlan || "Select Year");
  }, [selectedYearPlan]);

  const handleLocalChangeQuote = (year) => {
    setLocalSelectYearContract(year);
    if (handleChangePlan) {
      handleChangePlan(year);
    }
  };

  return (
    <>
      <Grid
        className="w-100 d-flex gap-2 mb-5 plan-company-graph"
        style={{ height: "200px" }}
      >
        {invoiceRespopnse?.appointmentSummary?.length !== 0 ||
        invoiceRespopnse?.invoiceSummary?.length !== 0 ? (
          <Col xs={12} lg={6} sm={12} md={12} className="pt-3">
            <Card
              style={{
                boxShadow: "rgba(0, 0, 0, 0.35) 0px 4px 4px 0",
                border: "0.3px solid rgba(82, 84, 89, 0.5)",
                borderRadius: "12px",
              }}
            >
              <Row className="w-100 px-3 my-3">
                <Col className="d-flex justify-content-end">
                  <Dropdown
                    isOpen={dropdownOpenCompany}
                    toggle={togglePlanSecond}
                    style={{ zIndex: "9" }}
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
                </Col>
              </Row>
              <Row className="w-100 py-3 px-5">
                <PlanComparisonChartContainer
                  poll2={"#F9A146"}
                  poll1={"#063164"}
                />
              </Row>
              <Row className="w-100 px-3 my-1">
                <Col
                  lg={12}
                  className="d-flex justify-content-center align-items-center active_deactive-graph"
                >
                  <Typography
                    style={{ fontFamily: "Poppins", fontSize: "15px" }}
                    className="px-3"
                  >
                    <i className="fa-solid fa-circle px-1 text-blue-color"></i>
                    Invoices
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Poppins", fontSize: "15px" }}
                    className="px-3 inactive-para"
                  >
                    <i className="fa-solid fa-circle px-1 text-orange-color"></i>
                    Appointments
                  </Typography>
                </Col>
              </Row>
            </Card>
          </Col>
        ) : null}

        {respopnse?.contractSummary?.length !== 0 ||
        respopnse?.quoteSummary?.length !== 0 ? (
          <Col xs={12} lg={6} sm={12} md={12} className="pt-3">
            <Card
              style={{
                boxShadow: "rgba(0, 0, 0, 0.35) 0px 4px 4px 0",
                border: "0.3px solid rgba(82, 84, 89, 0.5)",
                borderRadius: "12px",
              }}
            >
              <Row className="w-100 px-3 my-3">
                <Col className="d-flex justify-content-end">
                  <Dropdown
                    isOpen={dropdownOpenPlan}
                    toggle={togglePlan}
                    style={{ zIndex: "9" }}
                    className="dropDOwnContractOth"
                  >
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
                        onClick={() => handleLocalChangeQuote("Previous Year")}
                      >
                        Previous Year
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </Col>
              </Row>
              <Row className="w-100 py-3 px-5">
                <ComparisonChartContainer poll1={"#F9A146"} poll2={"#063164"} />
              </Row>
              <Row className="w-100 px-3 my-1">
                <Col
                  lg={12}
                  className="d-flex justify-content-center align-items-center active_deactive-graph"
                >
                  <Typography
                    style={{ fontFamily: "Poppins", fontSize: "15px" }}
                    className="px-3"
                  >
                    <i className="fa-solid fa-circle px-1 text-orange-color"></i>
                    Contracts
                  </Typography>
                  <Typography
                    style={{ fontFamily: "Poppins", fontSize: "15px" }}
                    className="px-3 inactive-para"
                  >
                    <i className="fa-solid fa-circle px-1 text-blue-color"></i>
                    Quotes
                  </Typography>
                </Col>
              </Row>
            </Card>
          </Col>
        ) : null}

        {invoiceRespopnse?.appointmentSummary?.length === 0 &&
        invoiceRespopnse?.invoiceSummary?.length === 0 &&
        respopnse?.contractSummary?.length === 0 &&
        respopnse?.quoteSummary?.length === 0 ? (
          <div>No data found</div>
        ) : null}
      </Grid>
    </>
  );
};
export default Graph;
