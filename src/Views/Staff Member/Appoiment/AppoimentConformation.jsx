import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Table } from "reactstrap";
import AxiosInstance from "../../AxiosInstance";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth";
import "../style.css";
import Swal from "sweetalert2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CallIcon from "@mui/icons-material/Call";
import { LoaderComponent } from "../../../components/Icon/Index";
import { Grid, Typography } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

function ConfirmAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(true);
  const [quotesData, setQuotesData] = useState(null);
  const [tokenDecode, setTokenDecode] = useState({});
  const [isConfirmed, setIsConfirmed] = useState(false);

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const companyId = tokenDecode.companyId;
  const ContractId = location.state.contractId;
  const WorkerId = localStorage.getItem("worker_id");
  const [isComplete, setIsComplete] = useState(false);

  const fetchVisitData = async () => {
    if (companyId && location?.state?.id && WorkerId) {
      setLoader(true);
      try {
        const response = await AxiosInstance.get(
          `/visits/workervisits/${location?.state?.id}/${WorkerId}`
        );
        if (response?.data.statusCode === 200 && response?.data?.data) {
          const visitData = response?.data?.data;
          setQuotesData(visitData);

          const isWorkerConfirmed = visitData.ConfirmWorker?.includes(WorkerId);
          setIsConfirmed(isWorkerConfirmed);

          const isWOrkerCompleted =
            visitData.ConfirmComplete?.includes(WorkerId);
          setIsComplete(isWOrkerCompleted);
        } else {
          console.error("Unexpected data structure or status code from API.");
        }
      } catch (error) {
        console.error("API error:", error);
      } finally {
        setLoader(false);
      }
    } else {
      console.error("Company ID, Visit ID, or Worker ID is not valid.");
      setLoader(false);
    }
  };

  useEffect(() => {
    if (tokenDecode.companyId && location?.state?.id) {
      const workerId = localStorage.getItem("worker_id");
      fetchVisitData(tokenDecode.companyId, location?.state?.id, workerId);
    }
  }, [tokenDecode.companyId, location?.state?.id, isComplete]);

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
        setIsConfirmed(true);
        try {
          const objact = {
            WorkerId,
            companyId,
            AddedAt: new Date(),
          };
          const response = await AxiosInstance.put(
            `/visits/ConfirmByWorker/${location?.state?.id}/${quotesData.ContractId}`,
            objact
          );
          if (response?.data && response?.data.statusCode === 200) {
            Swal.fire(
              "Confirmed!",
              "The appointment has been confirmed in the database.",
              "success"
            );
          } else {
            setIsConfirmed(true);
            Swal.fire(
              "Error!",
              "Unable to confirm the appointment in the database. Please try again.",
              "error"
            );
          }
        } catch (error) {
          setIsConfirmed(false);
          console.error("Error confirming appointment in database:", error);
          Swal.fire(
            "Error!",
            "Something went wrong. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const Completepopup = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to complete this appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, complete it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsComplete(true);
        try {
          const objact = {
            WorkerId,
            companyId,
            AddedAt: new Date(),
          };
          const response = await AxiosInstance.put(
            `/visits/ConfirmComplete/${location?.state?.id}/${quotesData.ContractId}`,
            objact
          );
          if (setIsComplete == true) {
            Completepopup(false);
          }
          if (response?.data && response?.data.statusCode === 200) {
            Swal.fire(
              "Completed!",
              "The appointment has been completed in the database.",
              "success"
            );
          } else {
            setIsComplete(false);
            Swal.fire(
              "Error!",
              "Unable to complete the appointment in the database. Please try again.",
              "error"
            );
          }
        } catch (error) {
          setIsComplete(false);
          console.error("Error completing appointment in database:", error);
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
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
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
          <Grid style={{ width: "67%" }} className="AppointmentNavigateBefore">
            <Button className="bg-blue-color" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </Button>{" "}
          </Grid>
          <Col
            className="invoice-card col-8 appointmentConfirmedBoxs"
            style={{ marginTop: "10px", padding: "20px", borderRadius: "12px" }}
            xl={8}
          >
            <CardHeader>
              <Grid className="text-end">
                {isConfirmed ? (
                  <Button
                    onClick={Completepopup}
                    className="Appointment text-blue-color"
                    style={{
                      border: "2px solid #063164",
                      background: "#DBECFF",
                      borderRadius: "20px",
                      fontWeight: 600,
                    }}
                    disabled={isComplete}
                  >
                    {isComplete ? "Complete" : "Confirmed"}{" "}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-blue-color text-white-color"
                    onClick={handleConfirmAppointment}
                  >
                    Confirm Appointment
                  </Button>
                )}
              </Grid>
            </CardHeader>
            <CardBody>
              <Grid
                className="d-flex appointmentWIdthFlex"
                style={{
                  overflowX: "auto",
                  width: "100%",
                }}
              >
                <Col
                  className="col-6 appointmnetWorkerDetail"
                  style={{
                    display: "inline-block",
                    width: "50%",
                    minWidth: "200px",
                  }}
                  xl={6}
                >
                  <Typography
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      color: "#063164",
                    }}
                  >
                    Contract #
                    {quotesData?.ContractData[0]?.ContractNumber || ""}
                  </Typography>
                  <Typography
                    style={{ fontWeight: 700 }}
                    className="text-blue-color heading-five"
                  >
                    {quotesData?.CustomerData[0]?.FirstName ||
                      "FirstName not available"}{" "}
                    {quotesData?.CustomerData[0]?.LastName ||
                      "LastName not available"}{" "}
                    - {quotesData?.ItemName || "ItemName not available"}
                  </Typography>
                  <Typography className="text-blue-color">
                    {quotesData?.LocationData?.Address ||
                      "Address not available"}{" "}
                    {quotesData?.LocationData?.City || "City not available"},{" "}
                    {quotesData?.LocationData?.State || "State not available"},{" "}
                    <br />{" "}
                    {quotesData?.LocationData?.Zip || "Zip not available"}-{" "}
                    {quotesData?.LocationData?.Country ||
                      "Country not available"}
                  </Typography>
                </Col>

                <Col
                  className="col-6 phoneNumberDetailAnddateAppoin"
                  style={{
                    display: "inline-block",
                    width: "50%",
                    minWidth: "200px",
                  }}
                  xl={6}
                >
                  <Typography
                    className="d-flex align-items-center gap-2 text-blue-color mb-3"
                    style={{ fontWeight: 600 }}
                  >
                    <CalendarMonthIcon className="text-blue-color" />{" "}
                    {moment(quotesData?.StartDate).format("YYYY-MM-DD")}
                  </Typography>
                  <Typography className="d-flex align-items-center gap-2 text-blue-color appointmentPhoneNUmber">
                    <CallIcon style={{ fontSize: "20px" }} />{" "}
                    {quotesData?.CustomerData[0]?.PhoneNumber ||
                      "Phone Number not available"}
                  </Typography>
                </Col>
              </Grid>
              <Typography></Typography>
              <hr />
              <Grid>
                <Typography
                  style={{ fontWeight: 700 }}
                  className="text-blue-color mb-0"
                >
                  Line Items
                </Typography>
                <Table className="p-0">
                  <thead>
                    <TableRow>
                      <TableCell style={{ paddingLeft: 0 }}>
                        Product/Service
                      </TableCell>
                      <TableCell className="text-end">Qty</TableCell>
                    </TableRow>
                  </thead>
                  <tbody>
                    {quotesData?.ContractItemData?.length > 0 ? (
                      quotesData?.ContractItemData.map((item) => (
                        <TableRow key={item._id}>
                          <td style={{ paddingLeft: 0 }}>
                            {item?.Name || "Materials & Labor not Available"}
                          </td>
                          <td className="text-end">
                            {item.Unit
                              ? `${item?.Unit} Units`
                              : item.Hourly
                              ? `${item?.Hourly} Hours`
                              : item.Square
                              ? `${item?.Square} SqFeet`
                              : "Unit not available"}
                          </td>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <td colSpan="2" className="text-center">
                          No items available
                        </td>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
              </Grid>
            </CardBody>
          </Col>
        </Grid>
      )}
    </>
  );
}

export default ConfirmAppointment;
