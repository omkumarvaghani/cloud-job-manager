import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance";
import { Watch } from "react-loader-spinner";
import {
  Dialog,
  DialogTitle,
  Divider,
  Grid,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import Visit from "../../../assets/Blue-sidebar-icon/Appoinment-blue.svg";
import BlueButton from "../../../components/Button/BlueButton";

function Schedual() {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const navigate = useNavigate();
  const { companyName } = useParams();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkerScheduleData = async () => {
    const WorkerId = localStorage.getItem("worker_id");
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/visits/Worker_schedule/${localStorage.getItem("worker_id")}`
      );
     
      const scheduleData = res.data.data;
      
      const mappedEvents = scheduleData.map((item) => ({
        id: item.VisitId,
        WorkerId: item.WorkerId,
        VisitId: item.VisitId,
        ItemName: item.ItemName,
        Note: item.Note,
        Address: item.locationDetails.Address,
        City: item.locationDetails.City,
        State: item.locationDetails.State,
        Zip: item.locationDetails.Zip,
        Country: item.locationDetails.Country,
        start: new Date(item.StartDate),
        end: new Date(item.EndDate),
        StartTime: item.StartTime,
        EndTime: item.EndTime,
        allDay: true,
        customerName: `${item.customerDetails.FirstName} ${item.customerDetails.LastName}`,
      }));

      return mappedEvents;
    } catch (error) {
      console.error("Error:", error.message);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const workerScheduleEvents = await fetchWorkerScheduleData();
      setEvents(workerScheduleEvents);
      setLoading(false);
    };

    fetchData();
  }, []);

  const eventPropGetter = (event) => ({
    style: {
      border: "none",
      color: "black",
      backgroundColor: "#f0f0f0",
      borderRadius: "4px",
      padding: "5px",
    },
  });
  const renderEventContent = ({ event }) => (
    <Typography
      onClick={(e) => {
        e.stopPropagation();
        handleEventClick(event);
      }}
      className="event-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "6px 10px",
        borderRadius: "6px",
        backgroundColor: "#f4f4f4",
        transition: "background-color 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f4f4f4")}
    >
      <Grid
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        {event.extendedProps.VisitId && (
          <img
            src={Visit}
            alt="Visit"
            style={{
              width: 20,
              height: 15,
              marginRight: 8,
              cursor: "pointer",
            }}
          />
        )}
        <Typography
          style={{
            fontSize: "10px",
            color: "#555",
            fontWeight: "bold",
          }}
          className="text-blue-color"
        >
          Appointment
        </Typography>
      </Grid>

      <Grid
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "12px",
          color: "#333",
        }}
      >
        <Typography
          style={{ marginRight: "6px", fontWeight: "bold", fontSize: "11px" }}
        >
          {event.extendedProps.customerName || "customerName not available"}
        </Typography>
        <Typography className="text-blue-color" style={{ fontSize: "12px" }}>
          - {event.extendedProps.ItemName || "ItemName not available"}
        </Typography>
      </Grid>
    </Typography>
  );

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleClose = () => {
    setSelectedEvent(null);
  };

  return (
    <Grid
      style={{
        width: "100%",
        maxWidth: "1500px",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            style: {
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <DialogTitle
            className="borerBommoModel text-blue-color"
            style={{
              // backgroundColor: "#063164",
              // color: "#fff",
              borderRadius: "16px 16px 0 0",
              fontWeight: "600",
              // fontSize: "1.25rem",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "start",
            }}
          >
            Visit Details for{" "}
            {selectedEvent.extendedProps.customerName ||
              "Customer Name not available"}
          </DialogTitle>
          <DialogContent Grididers style={{ padding: "20px 24px" }}>
            <Typography
              className="text-orange-color"
              variant="h6"
              style={{
                fontWeight: "bold",
                marginBottom: "12px",
                textDecoration: "underline",
                textDecorationThickness: "1px",
                textUnderlineOffset: "4px",
              }}
            >
              Details
            </Typography>
            <Grid style={{ marginBottom: "5px" }}>
              <Typography className="text-blue-color" variant="body1">
                <Typography style={{ fontWeight: "bold" }}>
                  Visit Title:
                </Typography>{" "}
                {selectedEvent.extendedProps.ItemName ||
                  "Item Name not available"}
              </Typography>
            </Grid>

            <Grid container spacing={2} style={{ marginBottom: "5px" }}>
              <Grid item xs={6}>
                <Typography className="text-blue-color" variant="body1">
                  <Typography style={{ fontWeight: "bold" }}>
                    Start Date:
                  </Typography>{" "}
                  {moment(selectedEvent.extendedProps.start).format(
                    "MMMM Do YYYY"
                  )}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography className="text-blue-color" variant="body1">
                  <Typography style={{ fontWeight: "bold" }}>
                    End Date:
                  </Typography>{" "}
                  {moment(selectedEvent.extendedProps.end).format(
                    "MMMM Do YYYY"
                  )}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} style={{ marginBottom: "5px" }}>
              <Grid item xs={6}>
                <Typography className="text-blue-color" variant="body1">
                  <Typography style={{ fontWeight: "bold" }}>
                    Start Time:
                  </Typography>{" "}
                  {moment(
                    selectedEvent.extendedProps.StartTime,
                    "HH:mm:ss"
                  ).format("hh:mm A")}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography className="text-blue-color" variant="body1">
                  <Typography style={{ fontWeight: "bold" }}>
                    End Time:
                  </Typography>{" "}
                  {moment(
                    selectedEvent.extendedProps.EndTime,
                    "HH:mm:ss"
                  ).format("hh:mm A")}
                </Typography>
              </Grid>
            </Grid>

            <Grid my={2}>
              <Typography
                variant="h6"
                className="text-orange-color"
                sx={{
                  fontWeight: "bold",
                  textDecoration: "underline",
                  textDecorationThickness: "1px",
                  textUnderlineOffset: "4px",
                }}
              >
                Location
              </Typography>
              <Typography className="text-blue-color">
                {selectedEvent
                  ? `${
                      selectedEvent.extendedProps.Address
                        ? `${selectedEvent.extendedProps.Address}, `
                        : ""
                    } ${selectedEvent.extendedProps.City}, ${
                      selectedEvent.extendedProps.State
                    } ${selectedEvent.extendedProps.Zip} - ${
                      selectedEvent.extendedProps.Country
                    }`
                  : " - "}
              </Typography>
            </Grid>
          </DialogContent>
          <Divider
            style={{
              width: "100%",
              marginBottom: "5px",
              backgroundColor: "#063164",
            }}
          />
          <DialogActions>
            <BlueButton
              className="bg-button-blue-color"
              onClick={handleClose}
              style={{
                color: "#fff",
                backgroundColor: "#063164",
                borderRadius: "5px",
                padding: "8px 16px",
                fontWeight: "600",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
              label="Close"
            />
          </DialogActions>
        </Dialog>
      )}

      <Grid style={{ position: "relative" }}>
        <Box sx={{ position: "relative", maxWidth: "100%", overflowX: "auto" }}>
          <Box
            className="calender-main"
            sx={{
              position: "relative",
              minWidth: "100%",
              height: "100%",
              overflow: "auto",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin]}
              events={events}
              eventContent={renderEventContent}
              eventClick={(info) => handleEventClick(info.event)}
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "dayGridMonth,dayGridWeek,dayGridDay",
              }}
              eventPropGetter={eventPropGetter}
              dayMaxEvents={3}
            />
          </Box>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Watch height="50" width="50" color="#063164" />
            </Box>
          )}
        </Box>
        {loading && (
          <Grid
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Watch
              visible={true}
              height="50"
              width="50"
              radius="48"
              color="#063164"
              ariaLabel="watch-loading"
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

export default Schedual;
