import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, CardText, Row } from "reactstrap";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
import AxiosInstance from "../../AxiosInstance";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import "./style.css";
import { LoaderComponent } from "../../../components/Icon/Index";
import { Grid, Typography } from "@mui/material";
import Contract from "../../../assets/Blue-sidebar-icon/Contract.svg";
import BlueButton from "../../../components/Button/BlueButton";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function Quotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(true);
  const [quotesData, setQuotesData] = useState([]);
  const [tokenDecode, setTokenDecode] = useState({});
  const [visibleCounts, setVisibleCounts] = useState({
    todayVisits: 5,
    upcomingVisits: 5,
    pastVisits: 5,
  });

  const fetchData = async () => {
    setLoader(true);
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

  const CompanyId = tokenDecode?.CompanyId;
  const CustomerId = tokenDecode?.CustomerId;

  useEffect(() => {
    if (CompanyId && CustomerId) {
      setLoader(true);
      AxiosInstance.get(`/visits/customer_visits/${CompanyId}/${CustomerId}`)
        .then((response) => {
          if (response?.data?.statusCode === 200) {
            setQuotesData(response?.data?.data);
          } else {
            console.error("Error fetching visits data");
          }
        })
        .catch((error) => {
          console.error("API error:", error);
        })
        .finally(() => {
          setLoader(false);
        });
    }
  }, [CompanyId, CustomerId]);

  const categorizeVisits = (visits) => {
    const today = moment().startOf("day");
    const todayVisits = [];
    const upcomingVisits = [];
    const pastVisits = [];

    visits.forEach((visit) => {
      const visitDate = moment(visit?.StartDate);
      if (visitDate?.isSame(today, "day")) {
        todayVisits?.push(visit);
      } else if (visitDate?.isAfter(today)) {
        upcomingVisits?.push(visit);
      } else {
        pastVisits?.push(visit);
      }
    });

    return {
      todayVisits,
      upcomingVisits,
      pastVisits,
    };
  };

  const { todayVisits, upcomingVisits, pastVisits } =
    categorizeVisits(quotesData);

  const handleReadMore = (category) => {
    setVisibleCounts((prevCounts) => ({
      ...prevCounts,
      [category]: prevCounts[category] + 5,
    }));
  };

  const renderVisitCards = (visits, category) => {
    const visibleVisits = visits.slice(0, visibleCounts[category]);
    const allShown = visibleVisits.length === visits.length;

    return (
      <Grid
        className="visit-card-container"
        style={{ flexDirection: "column" }}
      >
        {visibleVisits.map((quote) => (
          <Card
            style={{ cursor: "pointer" }}
            key={quote._id}
            className="invoice-card mb-2"
            onClick={() =>
              navigate(`/customers/appointment-confirm`, {
                state: {
                  id: quote?.VisitId,
                  contractId: quote?.ContractId,
                  navigats: [
                    ...location?.state?.navigats,
                    "/appointment-confirm",
                  ],
                },
              })
            }
          >
            <CardHeader className="invoice-card-header text-end customerAppointmentTable appintmentfontDate">
              <CalendarMonthOutlinedIcon className="invoice-icon" />{" "}
              Appointment: &nbsp;
              {moment(quote?.StartDate).format("MM-DD-YYYY")}
            </CardHeader>
            <CardBody>
              <Grid className="text-end mb-2">
                {quote?.IsConfirm && (
                  <Button
                    className="Appoiment text-blue-color"
                    style={{
                      border: "none",
                      background: "#FFCDD2",
                      borderRadius: "20px",
                      fontWeight: 400,
                    }}
                  >
                    Confirmed
                  </Button>
                )}
              </Grid>
              <CardText className="invoice-card-text text-blue-color">
                <img
                  src={Contract}
                  alt="img"
                  style={{
                    height: "20px",
                    marginRight: "7px",
                    marginLeft: "3px",
                  }}
                />
                Contract #
                {quote?.ContractData?.ContractNumber ||
                  "Contract Number not available"}
              </CardText>
              <CardText className="invoice-card-text text-start text-blue-color">
                <AccessTimeIcon
                  className="map-icon"
                  style={{ marginRight: "5px" }}
                />
                {quote?.StartTime
                  ? moment(quote.StartTime, "HH:mm").format("hh:mm A")
                  : "Time is not available"}
              </CardText>
              <CardText className="invoice-card-text text-start text-blue-color">
                <MyLocationOutlinedIcon
                  className="map-icon"
                  style={{ marginRight: "5px" }}
                />
                {quote?.Location?.Address || "Address not available"}{" "}
                {quote?.Location?.City || "City not available"} <br />
                {quote?.Location?.State || "State not available"},{" "}
                {quote?.Location?.Country || "Country not available"}
              </CardText>
            </CardBody>
          </Card>
        ))}
        {!allShown && (
          <BlueButton
            className="read-more-button"
            label="Read More"
            onClick={() => handleReadMore(category)}
          />
        )}
      </Grid>
    );
  };

  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : quotesData?.length > 0 ? (
        <Row className="row appoitmentListUpPast">
          <Typography
            className="invoice-header mb-4 customerAppointmentTable cstpmerAppointmentYour"
            style={{ fontWeight: "bold" }}
          >
            Your Appointment{" "}
          </Typography>
          {todayVisits?.length > 0 && (
            <Grid
              className="col text-center appointment-status-section "
              style={{ flexDirection: "column" }}
            >
              <Typography className="appointment-status-header mb-3">
                Today
              </Typography>
              {renderVisitCards(todayVisits, "todayVisits")}
            </Grid>
          )}

          {upcomingVisits?.length > 0 && (
            <Grid
              className="col text-center appointment-status-section"
              style={{ flexDirection: "column" }}
            >
              <Typography className="appointment-status-header mb-3">
                Upcoming
              </Typography>
              {renderVisitCards(upcomingVisits, "upcomingVisits")}
            </Grid>
          )}

          {pastVisits?.length > 0 && (
            <Grid
              className="col text-center appointment-status-section"
              style={{ flexDirection: "column" }}
            >
              <Typography className="appointment-status-header mb-3">
                Past
              </Typography>
              {renderVisitCards(pastVisits, "pastVisits")}
            </Grid>
          )}
        </Row>
      ) : (
        <Grid className="text-start">
          <Typography>Appointment Not Available.</Typography>
        </Grid>
      )}
    </>
  );
}

export default Quotes;
