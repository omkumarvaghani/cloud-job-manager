import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardText,
  Row,
  Col,
} from "reactstrap";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MyLocationOutlinedIcon from "@mui/icons-material/MyLocationOutlined";
import AxiosInstance from "../../AxiosInstance";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import "../style.css";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Swal from "sweetalert2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlueButton from "../../../components/Button/BlueButton";
import { LoaderComponent } from "../../../components/Icon/Index";
import { CardContent, Grid, Typography } from "@mui/material";
import Contract from "../../../assets/Blue-sidebar-icon/Contract.svg";

function Quotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(true);
  const [quotesData, setQuotesData] = useState([]);
  const [tokenDecode, setTokenDecode] = useState({});
  const [isConfirmed, setIsConfirmed] = useState(null);

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const CompanyId = tokenDecode.CompanyId;
  useEffect(() => {
    handleAuth(navigate, location);

    if (CompanyId && location?.state?.id) {
      setLoader(true);
      AxiosInstance.get(
        `/visits/customervisits/${location?.state?.id}/${location?.state?.contractId}`
      )
        .then((response) => {
          if (response?.data?.statusCode === 200) {
            setQuotesData(response?.data?.data);
            const apiConfirmStatus = response?.data?.data[0]?.IsConfirm;
            if (apiConfirmStatus !== undefined) {
              setIsConfirmed(apiConfirmStatus);
            } else {
              const savedStatus = localStorage.getItem("isConfirmed");
              setIsConfirmed(savedStatus === "true");
            }
          } else {
            console.error("Error fetching data");
          }
        })
        .catch((error) => {
          console.error("API error:", error);
        })
        .finally(() => {
          setLoader(false);
        });
    } else {
      console.error("CompanyId or Visit ID is not valid.");
      setLoader(false);
    }
  }, [navigate, location, CompanyId]);

  const handleConfirmAppointment = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to confirm this appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, confirm it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { LocationId, ContractId, CustomerId, CompanyId, VisitId } =
          quotesData[0] || {};

        const dataToSend = {
          LocationId,
          ContractId,
          CustomerId,
          CompanyId,
          VisitId,
          AddedAt: new Date(),
        };

        try {
          await AxiosInstance.put(
            `/visits/confirm/${location?.state?.id}/${location.state.contractId}`,
            dataToSend
          );
          setIsConfirmed(true);
          localStorage.setItem("isConfirmed", "true");
          Swal.fire(
            "Confirmed!",
            "The appointment has been confirmed.",
            "success"
          );
        } catch (error) {
          console.error("Error confirming appointment:", error);
          Swal.fire(
            "Error!",
            "Something went wrong. Please try again.",
            "error"
          );
        }
      }
    });
  };

  return (
    <>
      {/* {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Row
          className="justify-content-center"
          style={{ marginTop: "10px", width: "100%" }}
        >
          <Col xs="12" className="text-start" >
            <Button className="bg-blue-color mb-2"  style={{ marginLeft:"25.5%"}} onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </Button>
          </Col>
          <Col xs="12" sm="8" md="6" lg="5" style={{width:"50%"}}>
            <Card className="invoice-card customerConfirmAppointment">
              <CardHeader>
                <Grid className="text-end">
                  {isConfirmed !== null && (
                    <>
                      {isConfirmed ? (
                        <Button
                          className="Appoiment text-blue-color border-blue-color"
                          style={{
                            border: "2px solid ",
                            background: "#DBECFF",
                            borderRadius: "20px",
                            fontWeight: 600,
                          }}
                        >
                          Confirmed
                        </Button>
                      ) : (
                        <BlueButton
                          size="sm"
                          className="bg-blue-color text-white-color"
                          onClick={handleConfirmAppointment}
                          label="Confirm Appointment"
                        />
                      )}
                    </>
                  )}
                </Grid>
              </CardHeader>
              <CardBody>
                <CardText className="invoice-card-text text-blue-color">
                  <AccessTimeIcon className="invoice-icon" />
                  {quotesData[0]?.StartTime
                    ? moment(quotesData[0].StartTime, "HH:mm").isValid()
                      ? moment(quotesData[0].StartTime, "HH:mm").format(
                          "hh:mm A"
                        )
                      : "Invalid Time"
                    : "N/A"}
                </CardText>
                <CardText className="invoice-card-text text-blue-color">
                  <CalendarMonthOutlinedIcon className="invoice-icon" />{" "}
                  <Typography className="bold-text">Appointment On : </Typography>&nbsp;
                  <Typography className="bold-text">
                    {moment(quotesData[0]?.StartDate).format(
                      "dddd, MM-DD-YYYY"
                    )}
                  </Typography>
                </CardText>
                <CardText className="invoice-card-text text-blue-color">
                  <MyLocationOutlinedIcon className="invoice-icon" />{" "}
                  {quotesData[0]?.Location?.Address}{" "}
                  {quotesData[0]?.Location?.City},
                  {quotesData[0]?.Location?.State}
                  , <br /> {quotesData[0]?.Location?.Zip}-{" "}
                  {quotesData[0]?.Location?.Country}
                </CardText>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )} */}
      {loader ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          style={{ height: "80vh" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            alignItems: "center",
          }}
        >
          {/* Card Section */}
          <Grid style={{ width: "67%" }} className="AppointmentNavigateBefore">
            {/* <Grid item > */}
            <Button
              className="bg-blue-color mb-2"
              style={{
                display: "flex",
                alignItems: "center",
              }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon />
            </Button>
            {/* </Grid> */}
            <Card className="invoice-card customerConfirmAppointment">
              <CardHeader>
                <Grid container justifyContent="flex-end">
                  {isConfirmed !== null && (
                    <>
                      {isConfirmed ? (
                        <Button
                          className="Appoiment text-blue-color border-blue-color"
                          style={{
                            border: "2px solid",
                            background: "#DBECFF",
                            borderRadius: "20px",
                            fontWeight: 600,
                          }}
                        >
                          Confirmed
                        </Button>
                      ) : (
                        // Hide button if the date is before today
                        moment(quotesData[0]?.StartDate).isSameOrAfter(
                          moment(),
                          "day"
                        ) && (
                          <Button
                            size="small"
                            className="bg-blue-color text-white-color"
                            onClick={handleConfirmAppointment}
                          >
                            Confirm Appointment
                          </Button>
                        )
                      )}
                    </>
                  )}
                </Grid>
              </CardHeader>

              <CardContent>
                <Typography
                  variant="body1"
                  className="invoice-card-text appoinment-on text-blue-color"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <span className="appoinment-on-date">
                    <img
                      src={Contract}
                      alt="img"
                      style={{
                        height: "20px",
                        marginRight: "12px",
                        marginLeft: "3px",
                      }}
                    />
                  </span>
                  <span className="day-appoinment">
                    Contract #
                    {quotesData[0]?.ContractNumber ||
                      "Contract number not available"}
                  </span>
                </Typography>
                <Typography
                  variant="body1"
                  className="invoice-card-text text-blue-color"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <AccessTimeIcon style={{ marginRight: "8px" }} />
                  {quotesData[0]?.StartTime
                    ? moment(quotesData[0].StartTime, "HH:mm").isValid()
                      ? moment(quotesData[0].StartTime, "HH:mm").format(
                          "hh:mm A"
                        )
                      : "Time Not Available"
                    : "Time Not Available"}
                </Typography>

                {/* Date */}
                <Typography
                  variant="body1"
                  className="invoice-card-text appoinment-on text-blue-color"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <span className="appoinment-on-date">
                    <CalendarMonthOutlinedIcon style={{ marginRight: "8px" }} />
                    <strong>Appointment On : </strong>&nbsp;
                  </span>
                  <span className="day-appoinment">
                    {moment(quotesData[0]?.StartDate)?.format(
                      "dddd, MM-DD-YYYY"
                    )}
                  </span>
                </Typography>

                {/* Location */}
                <Typography
                  variant="body1"
                  className="invoice-card-text text-blue-color"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <MyLocationOutlinedIcon style={{ marginRight: "8px" }} />
                  {quotesData[0]?.Location?.Address ||
                    "Address not available"}{" "}
                  {quotesData[0]?.Location?.City || "City not available"},{" "}
                  {quotesData[0]?.Location?.State || "State not available"}
                  <br />
                  {quotesData[0]?.Location?.Zip || "Zip not available"} -{" "}
                  {quotesData[0]?.Location?.Country || "Country not available"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default Quotes;
