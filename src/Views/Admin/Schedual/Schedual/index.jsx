import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Quote from "../../../../assets/Blue-sidebar-icon/Quote.svg";
import Contract from "../../../../assets/Blue-sidebar-icon/Contract.svg";
import Invoice from "../../../../assets/Blue-sidebar-icon/Invoice.svg";
import Appointment from "../../../../assets/Blue-sidebar-icon/Appoinment-blue.svg";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import moment from "moment";
import { Watch } from "react-loader-spinner";
import "./style.css";
import WhiteButton from "../../../../components/Button/WhiteButton";
import BlueButton from "../../../../components/Button/BlueButton";

const CustomEvent = () => {
  const [events, setEvents] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const calendarRef = React.useRef(null);
  const [clickedDate, setClickedDate] = useState(null);

  const fetchScheduleData = async () => {
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/quote/shedule/${localStorage.getItem("CompanyId")}`
      );
      const scheduleData = res?.data?.data;
      const mappedEvents = scheduleData?.map((item) => ({
        id: item?._id,
        QuoteId: item?.QuoteId,
        Title: item?.Title,
        QuoteNumber: item?.QuoteNumber,
        FirstName: item?.FirstName,
        LastName: item?.LastName,
        Address: item?.Address,
        City: item?.City,
        State: item?.State,
        Country: item?.Country,
        Zip: item?.Zip,
        start: new Date(item?.sheduleDate),
        end: new Date(item?.sheduleDate),
        allDay: true,
      }));
      return mappedEvents;
    } catch (error) {
      console.error("Error:", error?.message);
      return [];
    }
  };
  const fetchContractScheduleData = async () => {
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/contract/contract-schedule/${localStorage.getItem(
          "CompanyId"
        )}`
      );
      const contractData = res?.data?.data;
      const mappedContractEvents = contractData.map((contract) => ({
        ContractId: contract?.ContractId,
        Title: contract?.Title,
        ContractNumber: contract?.ContractNumber,
        FirstName: contract?.FirstName,
        LastName: contract?.LastName,
        Address: contract?.Address,
        City: contract?.City,
        State: contract?.State,
        Country: contract?.Country,
        Zip: contract?.Zip,
        Status: contract?.Status,
        start: new Date(),
        end: new Date(),
      }));

      return mappedContractEvents;
    } catch (error) {
      console.error("Error fetching contract schedule:", error?.message);
      return [];
    }
  };
  const fetchVisitScheduleData = async () => {
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/visits/visit-schedule/${localStorage?.getItem("CompanyId")}`
      );
      const visitData = res?.data?.data;
      const mappedVisitEvents = visitData?.map((visit) => {
        return {
          VisitId: visit?.VisitId,
          VisitContractId: visit?.ContractId,
          Title: visit?.ItemName,
          Note: visit?.Note,
          FirstName: visit?.FirstName,
          LastName: visit?.LastName,
          Address: visit?.Address,
          City: visit?.City,
          State: visit?.State,
          Zip: visit?.Zip,
          Country: visit?.Country,
          start: new Date(visit?.StartDate),
          end: new Date(visit?.EndDate),
          IsConfirm: visit?.IsConfirm,
          IsConfirmByWorker: visit?.IsConfirmByWorker,
          IsDelete: visit?.IsDelete,
        };
      });

      return mappedVisitEvents;
    } catch (error) {
      console.error("Error fetching visit schedule:", error?.message);
      return [];
    }
  };
  const fetchInvoiceScheduleData = async () => {
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/invoice/invoiceShedule/${localStorage?.getItem(
          "CompanyId"
        )}`
      );
      const invoiceData = res.data.data;
      const mappedInvoiceEvents = invoiceData.map((item) => ({
        id: item?._id,
        InvoiceId: item?.InvoiceId,
        FirstName: item?.FirstName,
        LastName: item?.LastName,
        Address: item?.Address,
        City: item?.City,
        State: item?.State,
        Zip: item?.Zip,
        Country: item?.Country,
        Title: item?.Title,
        InvoiceNumber: item?.InvoiceNumber,
        start: new Date(item?.sheduleDate),
        end: new Date(item?.sheduleDate),
        allDay: true,
      }));
      return mappedInvoiceEvents;
    } catch (error) {
      console.error("Error fetching invoice schedule:", error?.message);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [scheduleEvents, contractEvents, invoiceEvents, visitEvents] =
        await Promise.all([
          fetchScheduleData(),
          fetchContractScheduleData(),
          fetchInvoiceScheduleData(),
          fetchVisitScheduleData(),
        ]);
      setEvents([
        ...scheduleEvents,
        ...contractEvents,
        ...invoiceEvents,
        ...visitEvents,
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const eventIcons = [];

    if (event.extendedProps.QuoteId)
      eventIcons.push(
        <img src={Quote} alt="Quote" className="icon-style-schedule" />
      );
    if (event.extendedProps.ContractId)
      eventIcons.push(
        <img src={Contract} alt="Contract" className="icon-style-schedule" />
      );
    if (event.extendedProps.InvoiceId)
      eventIcons.push(
        <img src={Invoice} alt="Invoice" className="icon-style-schedule" />
      );
    if (event.extendedProps.VisitId)
      eventIcons.push(
        <img
          src={Appointment}
          alt="Appointment"
          className="icon-style-schedule"
        />
      );

    return (
      <div
        className="event-container"
        onMouseEnter={(e) => {
          e.currentTarget.classList.add("hover");
        }}
        onMouseLeave={(e) => {
          e.currentTarget.classList.remove("hover");
        }}
      >
        <div
          className="event-header text-blue-color "
          title={`${event?.extendedProps?.FirstName || "-"} } ${
            event?.extendedProps?.LastName || "-"
          } } - ${event?.extendedProps?.Title || "-"} }`}
        >
          {eventIcons && <div className="event-icon">{eventIcons}</div>}
          <span>
            {event?.extendedProps?.QuoteNumber &&
              `(Quote #${event?.extendedProps?.QuoteNumber}) `}
            {event?.extendedProps?.ContractNumber &&
              `(Contract #${event?.extendedProps?.ContractNumber}) `}
            {event?.extendedProps?.InvoiceNumber &&
              `(Invoice #${event?.extendedProps?.InvoiceNumber}) `}
            {event?.extendedProps?.VisitContractId && (
              <span className="visit-label text-blue-color">( Visit )</span>
            )}
          </span>
        </div>
        <div
          className="event-details text-blue-color"
          title={`${
            event?.extendedProps?.FirstName || "User is not Available"
          } } ${event?.extendedProps?.LastName || ""} } - ${
            event?.extendedProps?.Title || "Title is not Available"
          } }`}
        >
          {event?.extendedProps?.FirstName || "User is not Available"}{" "}
          {event?.extendedProps?.LastName || ""} -{" "}
          {event?.extendedProps?.Title || "Title is not Availables"}
        </div>
      </div>
    );
  };

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleSlotClick = ({ start }) => {
    const hasEvent = events.some((event) =>
      moment(event.start).isSame(start, "day")
    );

    if (!hasEvent) {
      setClickedDate(start);
      const { x, y } = mousePosition;
      setAnchorPosition({ top: y, left: x });
    }
  };

  const eventPropGetter = (event) => ({
    style: {
      border: "none",
      color: "black",
      display: "block",
    },
  });
  const handleEventClick = (event) => {
    if (event) {
      setSelectedEvent(event?.extendedProps);
      setOpen(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const handlePopoverClose = () => {
    setAnchorPosition(null);
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        width: "100%",
        maxWidth: "1500px",
        margin: "0 auto",
        padding: { xs: "10px", md: "20px" },
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box
        sx={{ position: "relative", maxWidth: "100%", overflowX: "auto" }}
        ref={calendarRef}
      >
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
            dayMaxEvents={2}
            height="auto"
            contentHeight="auto"
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box sx={{ padding: "16px" }} className="borerBommoModel">
          <Typography
            variant="h6"
            sx={{
              display: "inline",
              fontSize: "18px",
              fontWeight: "bold",
            }}
            className="text-blue-color"
          >
            {selectedEvent
              ? moment(selectedEvent?.start).isSame(moment(), "day")
                ? "Today"
                : moment(selectedEvent?.start).isAfter(moment(), "day")
                ? "Upcoming Reminder"
                : "Past Reminder"
              : ""}
          </Typography>
          <Typography
            className="text-white-color"
            variant="h8"
            sx={{
              display: "inline",
              marginLeft: "8px",
            }}
          >
            {/* {selectedEvent
              ? `(${moment(selectedEvent?.start).format(
                  "MMMM Do YYYY, h:mm A"
                )})`
              : ""} */}
          </Typography>
        </Box>
        <DialogContent dividers>
          <Box my={2}>
            <Typography
              className="text-blue-color"
              variant="h6"
              sx={{
                fontWeight: "bold",
                textDecoration: "underline",
                textDecorationThickness: "1px",
                textUnderlineOffset: "4px",
              }}
            >
              Details
            </Typography>
            <Typography
              className="text-orange-color"
              sx={{ fontWeight: "bold" }}
            >
              {selectedEvent
                ? selectedEvent?.QuoteId
                  ? `${selectedEvent?.FirstName || "User is not Available"}  ${
                      selectedEvent?.LastName || ""
                    }  - Quote #${selectedEvent?.QuoteNumber}`
                  : selectedEvent?.ContractId
                  ? `${selectedEvent?.FirstName || "User is not Available"} ${
                      selectedEvent?.LastName || ""
                    } - Contract #${selectedEvent?.ContractNumber}`
                  : selectedEvent?.VisitId
                  ? `${selectedEvent?.FirstName || "User is not Available"} ${
                      selectedEvent?.LastName || ""
                    } - ${selectedEvent?.Title || "-"}`
                  : `${selectedEvent?.FirstName || "User is not Available"} ${
                      selectedEvent?.LastName || ""
                    } - Invoice #${selectedEvent?.InvoiceNumber}`
                : ""}
            </Typography>
            <Typography className="text-blue-color">
              {selectedEvent
                ? selectedEvent?.QuoteId
                  ? `Quote was sent on ${moment(selectedEvent?.start).format(
                      "MMMM Do YYYY"
                    )} but no job has been generated yet`
                  : selectedEvent?.ContractId
                  ? `Contract was created on ${moment(
                      selectedEvent?.start
                    ).format("MMMM Do YYYY")}`
                  : selectedEvent?.VisitId
                  ? `Visit was created on ${moment(selectedEvent?.start).format(
                      "MMMM Do YYYY"
                    )}`
                  : `Invoice was issued on ${moment(
                      selectedEvent?.start
                    ).format("MMMM Do YYYY")}`
                : ""}
            </Typography>
          </Box>
          <Box my={2}>
            <Typography
              className="text-blue-color"
              variant="h6"
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
                    selectedEvent?.Address
                      ? `${selectedEvent?.Address || "-"} `
                      : ""
                  } ${selectedEvent?.City || "-"}, ${
                    selectedEvent?.State || "-"
                  } ${selectedEvent?.Zip || "-"} - ${
                    selectedEvent?.Country || "-"
                  }`
                : ""}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "space-between", padding: "10px" }}
        >
          <Grid>
            <WhiteButton
              onClick={() => setOpen(false)}
              label="Cancel"
              className=""
            />
          </Grid>
          <Grid>
            {!selectedEvent?.VisitId && (
              <WhiteButton
                onClick={() => {
                  const id =
                    selectedEvent?.QuoteId ||
                    selectedEvent?.ContractId ||
                    selectedEvent?.InvoiceId;
                  const navigateTo = selectedEvent?.QuoteId
                    ? `/${CompanyName}/add-quotes`
                    : selectedEvent?.ContractId
                    ? `/${CompanyName}/add-contract`
                    : `/${CompanyName}/addinvoice`;

                  navigate(navigateTo, {
                    state: {
                      ...(selectedEvent?.InvoiceId ? {} : { id: id }),
                      invoiceId: selectedEvent?.InvoiceId,
                      navigats: [
                        ...(location?.state?.navigats || []),
                        navigateTo,
                      ],
                    },
                  });
                }}
                // sx={{
                //   textTransform: "capitalize",
                //   borderRadius: "5px",
                //   border: "1px solid ",
                //   color: "#063164",
                //   marginRight: "8px",
                //   "&:hover": {
                //     backgroundColor: "#063164",
                //     color: "#fff",
                //   },
                // }}
                label="Edit"
              />
            )}

            <BlueButton
              onClick={() => {
                const id =
                  selectedEvent?.VisitContractId ||
                  selectedEvent?.QuoteId ||
                  selectedEvent?.ContractId ||
                  selectedEvent?.InvoiceId;

                const navigateTo = selectedEvent?.VisitContractId
                  ? `/${CompanyName}/contractdetails`
                  : selectedEvent?.QuoteId
                  ? `/${CompanyName}/quotes-detail`
                  : selectedEvent?.ContractId
                  ? `/${CompanyName}/contractdetails`
                  : selectedEvent?.InvoiceId
                  ? `/${CompanyName}/invoice-details`
                  : "";

                navigate(navigateTo, {
                  state: {
                    id: id,
                    navigats: [...(location.state?.navigats || []), navigateTo],
                  },
                });
              }}
              // sx={{
              //   textTransform: "capitalize",
              //   borderRadius: "5px",
              //   border: "1px solid",
              //   backgroundColor: "#063164",
              //   color: "#fff",
              //   "&:hover": {
              //     backgroundColor: "#fff",
              //     color: "#063164",
              //   },
              // }}
              label=" View Details"
              className="mx-2"
            />
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default CustomEvent;
