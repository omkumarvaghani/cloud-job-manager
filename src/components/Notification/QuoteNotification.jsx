import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import "./QuoteNotification.css";
import { handleAuth } from "../Login/Auth";
import AxiosInstance from "../../Views/AxiosInstance";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Circles } from "react-loader-spinner";
import quote from "../../assets/Blue-sidebar-icon/Quote.svg";
import contract from "../../assets/Blue-sidebar-icon/Contract.svg";
import Appointment from "../../assets/Blue-sidebar-icon/Appoinment-blue.svg";
import customerIcon from "../../assets/Blue-sidebar-icon/Customer.svg";
import InvoiceIcon from "../../assets/Blue-sidebar-icon/Invoice.svg";
import ManageAccount from "../../assets/Blue-sidebar-icon/ManageAccount.svg";
import templetess from "../../assets/Blue-sidebar-icon/templetess.svg";
import RecurringCharge from "../../assets/Blue-sidebar-icon/RecurringCharge.svg";
import RecurrinPayment from "../../assets/Blue-sidebar-icon/RecurrinPayment.svg";
import signature from "../../assets/Blue-sidebar-icon/signature.svg";
import Visit from "../../assets/Blue-sidebar-icon/Visit.svg";
import { differenceInSeconds } from "date-fns";
import "./QuoteNotification.css";
import { Grid, Typography } from "@mui/material";
import { LoaderComponent } from "../Icon/Index";
import moment from "moment";

const formatTimeAgo = (AddedAt, currentAt) => {
  if (!AddedAt) return "";

  const timeDiffInSeconds = differenceInSeconds(currentAt, AddedAt);
  let formattedTime = "";

  if (timeDiffInSeconds < 60) {
    // Explicitly checking if the difference is under a minute.
    formattedTime = `${timeDiffInSeconds} second${
      timeDiffInSeconds !== 1 ? "s" : ""
    } ago`;
  } else if (timeDiffInSeconds < 3600) {
    const timeDiffInMinutes = Math.floor(timeDiffInSeconds / 60);
    formattedTime = `${timeDiffInMinutes} minute${
      timeDiffInMinutes !== 1 ? "s" : ""
    } ago`;
  } else {
    formattedTime = formatDistanceToNow(AddedAt, { addSuffix: true });
  }

  return formattedTime;
};

const formatStyle = (notification) => {
  const notificationStyle = {
    backgroundColor: notification?.IsView ? "#f5f5f5" : "#FFE9BC",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "pointer",
  };
  return notificationStyle;
};

const QuoteNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard contractNotificationImgCon"
      onClick={() =>
        onClick(notification?.QuoteId, notification?.NotificationId, "quote")
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer" style={{ cursor: "pointer" }}>
        <img src={quote} alt="Quote Icon" />
      </Grid>
      <Grid className="notificationContent" style={{ cursor: "pointer" }}>
        <Typography className="title contractNotificationBar">
          {notification?.Company?.ownerName} created a quote - $
          {`${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(notification?.Quote?.Total ?? 0)}`}
        </Typography>
        <Grid className="description">
          <Typography
            className="quoteNumber contractNotificationBar"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            Quote #{notification?.Quote?.QuoteNumber} -{" "}
            {notification?.Quote?.Title}
          </Typography>
          <Typography className="additionalInfo contractNotificationBar">
            {notification?.Customer?.FirstName}{" "}
            {notification?.Customer?.LastName}
          </Typography>
        </Grid>
        <Typography className="time contractNotificationBar">
          {formattedTime}
        </Typography>
      </Grid>
    </Grid>
  );
};

const ContractNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);
  return (
    <Grid
      className="notificationCard contractNotificationImgCon"
      onClick={() =>
        onClick(
          notification?.ContractId,
          notification?.NotificationId,
          "contract"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer" style={{ cursor: "pointer" }}>
        <img src={contract} alt="Contract Icon" />
      </Grid>
      <Grid className="notificationContent" style={{ cursor: "pointer" }}>
        <Typography className="title contractNotificationBar">
          {notification?.Company?.ownerName} created a contract - $
          {`${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(notification?.Contract?.Total ?? 0)}`}
        </Typography>
        <Grid className="description">
          <Typography
            className="quoteNumber contractNotificationBar"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            Contract #
            {notification?.Contract?.ContractNumber ||
              "ContractNumber not available"}{" "}
            - {notification?.Contract?.Title}
          </Typography>
          <Typography className="additionalInfo contractNotificationBar">
            {notification?.Customer?.FirstName || "FirstName not available"}{" "}
            {notification?.Customer?.LastName || "LastName not available"}
          </Typography>
        </Grid>
        <Typography className="time contractNotificationBar">
          {formattedTime}
        </Typography>
      </Grid>
    </Grid>
  );
};

const AppointmentConfirmNotification = ({ onClick, notification }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  const contractNumber =
    notification?.Visit?.ContractNumber || "ContractNumber not available";
  const appointmentDate =
    notification?.Visit?.StartDate || "Date not available";
  const customerName =
    `${notification?.Customer?.FirstName} ${notification?.Customer?.LastName}` ||
    "Customer Name Not Available";
  const [tokenDecode, setTokenDecode] = useState({});

  const [DateDecode, setDateDecode] = useState({});
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [DateDecode]);

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(
          notification?.ContractId,
          notification?.NotificationId,
          "contract"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer" style={{ cursor: "pointer" }}>
        <img src={Appointment} alt="Contract Icon" />
      </Grid>
      <Grid className="notificationContent" style={{ cursor: "pointer" }}>
        <Typography className="title">
          Appointment on &nbsp;
          {moment(appointmentDate || "appointmentDate not available").format(
            dateFormat
          )}{" "}
          &nbsp; for Contract #
          {contractNumber || "contractNumber not available"} {""}
          Confirmed by customer -
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            {customerName || "customerName not available"}
          </Typography>
        </Grid>
        <Typography className="time">{formattedTime}</Typography>
      </Grid>
    </Grid>
  );
};

const QuoteConfirmNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  const location = useLocation();
  const navigate = useNavigate();
  const contractNumber =
    notification?.Visit?.ContractNumber || "ContractNumber not available";
  const appointmentDate =
    notification?.Visit?.StartDate || "StartDate not available";
  const workerName = notification?.Worker?.FullName || "FullName not available";
  
  const [tokenDecode, setTokenDecode] = useState({});

  const [DateDecode, setDateDecode] = useState({});
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [DateDecode]);

  return (
    <Grid
      className="notificationCard contractNotificationImgCon"
      onClick={() =>
        onClick(
          notification?.ContractId,
          notification?.NotificationId,
          "contract"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer" style={{ cursor: "pointer" }}>
        <img src={quote} alt="Quote Icon" />
      </Grid>
      <Grid className="notificationContent" style={{ cursor: "pointer" }}>
        <Typography className="title contractNotificationBar">
          Appointment on &nbsp;
          {moment(appointmentDate || "appointmentDate not available").format(
            dateFormat
          )}
          for Contract #{contractNumber || "contractNumber not available"}{" "}
          &nbsp; Confirmed by Worker -
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote contractNotificationBar"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            {workerName || "workerName not available"}
          </Typography>
        </Grid>
        <Typography className="time contractNotificationBar">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};

const WorkerCreateNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);
  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(notification?.WorkerId, notification?.NotificationId, "worker")
      } 
      style={notificationStyle}
    >
      <Grid className="iconContainer" style={{ cursor: "pointer" }}>
        <img src={quote} alt="Quote Icon" />
      </Grid>
      <Grid className="notificationContent" style={{ cursor: "pointer" }}>
        <Typography className="title">
          {notification?.Company?.ownerName || "ownerName not available"}{" "}
          Created A Worker -
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            {`${notification?.Worker?.FirstName} ${notification?.Worker?.LastName}` || "FullName not available"}

          </Typography> 
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};
const ProductAndServiceCreateNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);
  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(
          notification?.ProductId,
          notification?.NotificationId,
          "productandservice"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer" style={{ cursor: "pointer" }}>
        <img src={quote} alt="Quote Icon" />
      </Grid>
      <Grid className="notificationContent" style={{ cursor: "pointer" }}>
        <Typography className="title">
          {notification?.Company?.ownerName || "ownerName not available"}{" "}
          Created A{" "}
          {notification?.ProductAndService?.Type || "Type not available"}
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            {notification?.ProductAndService?.Name || "Name not available"}
          </Typography>
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};
const CustomerNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard contractNotificationImgCon"
      onClick={() =>
        onClick(
          notification?.CustomerId,
          notification?.NotificationId,
          "customer"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer" style={{ cursor: "pointer" }}>
        <img src={customerIcon} alt="Customer Icon" />
      </Grid>
      <Grid className="notificationContent" style={{ cursor: "pointer" }}>
        <Typography className="title contractNotificationBar">
          {notification?.Company?.ownerName || "ownerName not available"} added
          a new customer:{" "}
        </Typography>
        <Grid className="description">
          <Typography
            className="quoteNumber contractNotificationBar"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            {notification?.Customer?.FirstName || "FirstName not available"}{" "}
            {notification?.Customer?.LastName || "LastName not available"}
          </Typography>
        </Grid>
        <Typography className="time contractNotificationBar">
          {formattedTime}
        </Typography>
      </Grid>
    </Grid>
  );
};
const InvoiceNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard contractNotificationImgCon"
      onClick={() =>
        onClick(
          notification?.InvoiceId,
          notification?.NotificationId,
          "invoice"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer" style={{ cursor: "pointer" }}>
        <img src={InvoiceIcon} alt="Invoice Icon" />
      </Grid>
      <Grid className="notificationContent" style={{ cursor: "pointer" }}>
        <Typography className="title contractNotificationBar">
          {notification?.Company?.ownerName || "ownerName not available"}{" "}
          created a invoice - $
          {`${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(notification?.Invoice?.Total ?? 0)}`}
        </Typography>
        <Grid className="description">
          <Typography
            className="quoteNumber contractNotificationBar"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            Invoice #
            {notification?.Invoice?.InvoiceNumber ||
              "InvoiceNumber not available"}{" "}
            - {notification?.Invoice?.Subject || "Subject not available"}
          </Typography>
          <Typography className="additionalInfo contractNotificationBar">
            {notification?.Invoice?.CustomerData?.FirstName ||
              "FirstName not available"}{" "}
            {notification?.Invoice?.CustomerData?.LastName ||
              "LastName not available"}
          </Typography>
        </Grid>
        <Typography className="time contractNotificationBar">
          {formattedTime}
        </Typography>
      </Grid>
    </Grid>
  );
};
const QuoteChangeRequestNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(notification?.QuoteId, notification?.NotificationId, "Chnge")
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer">
        <img src={quote} alt="Quote Change Request Icon" />
      </Grid>
      <Grid className="notificationContent">
        <Typography className="title">
          {notification?.Customer?.FirstName} {notification?.Customer?.LastName}
          {""} Requested a change to quote -
          {`${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(notification?.Quote?.Total ?? 0)}`}
        </Typography>
        <Grid className="description">
          <Typography
            className="requestquote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            Quote #
            {notification?.Quote?.QuoteNumber || "QuoteNumber not available"} -{" "}
            {""}
            {notification?.Quote?.Title || "Title not available"}
          </Typography>
          {/* <Typography className="additionalInfo">
            Request Message:{" "}
            {notification?.Request?.RequestMessage || "No message"}{" "}
          </Typography> */}
        </Grid>
        <Typography className="time">{formattedTime}</Typography>
      </Grid>
    </Grid>
  );
};
const QuoteApproveNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(notification?.QuoteId, notification?.NotificationId, "approve")
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer">
        <img src={quote} alt="Quote Approve Icon" />
      </Grid>
      <Grid className="notificationContent">
        <Typography className="title">
          {notification?.Customer?.FirstName || "FirstName not available"}{" "}
          {notification?.Customer?.LastName || "LastName not available"}{" "}
          Approved quote -{" "}
          {`${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(notification?.Quote?.Total ?? 0)}`}
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          >
            Quote #
            {notification?.Quote?.QuoteNumber || "QuoteNumber not available"} -{" "}
            {notification?.Quote?.Title || "Title not available"}
          </Typography>
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};

const ManageAccountNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(
          notification?.account_id,
          notification?.NotificationId,
          "account"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer">
        <img src={ManageAccount} alt="Manage Account Icon" />
      </Grid>
      <Grid className="notificationContent">
        <Typography className="title">
          {notification?.Company?.ownerName || "ownerName not available"}{" "}
          Created A Account -{" "}
          {notification?.Account?.account_type || "account_type not available"}{" "}
          <Typography className="quoteNumber">
            {notification?.Account?.account_name ||
              "account_name not available"}{" "}
          </Typography>
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          ></Typography>
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};

const ManageTempletes = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(
          notification?.TemplateId,
          notification?.NotificationId,
          "templates"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer">
        <img src={templetess} alt="Manage Account Icon" />
      </Grid>
      <Grid className="notificationContent">
        <Typography className="title">
          {notification?.Company?.ownerName || "ownerName not available"}{" "}
          Created A Template -{" "}
          <Typography className="quoteNumber">
            {notification?.Template?.Name || "Name not available"}{" "}
          </Typography>
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          ></Typography>
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};

const RecurringChargeNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(
          notification?.CustomerId,
          notification?.NotificationId,
          "recurring-charges"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer">
        <img src={RecurringCharge} alt="Recurring Charge Icon" />
      </Grid>
      <Grid className="notificationContent">
        <Typography className="title">
          {notification?.Company?.ownerName || "ownerName not available"}{" "}
          Created A Reccuring Charge On Customer - $
          {notification?.Customer?.FirstName || "FirstName not available"}
          {notification?.Customer?.LastName || "LastName not available"}
          <Typography className="quoteNumber">
            {notification?.Recurringcharge?.amount || "amount not available"}{" "}
          </Typography>
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          ></Typography>
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};

const RecurringPaymentNotification = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(
          notification?.CustomerId,
          notification?.NotificationId,
          "recurring-payment"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer">
        <img src={RecurrinPayment} alt="Manage Account Icon" />
      </Grid>
      <Grid className="notificationContent">
        <Typography className="title">
          {notification?.Company?.ownerName || "ownerName not available"}{" "}
          Created A Reccuring Payment On Customer - $
          {notification?.Customer?.FirstName || "FirstName not available"}
          {notification?.Customer?.LastName || "LastName not available"}
          <Typography className="quoteNumber">
            {notification?.Recurringpayment?.amount || "amount not available"}{" "}
          </Typography>
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          ></Typography>
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};

const AddVisitNotifications = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(
          notification?.VisitId,
          notification?.NotificationId,
          "visit-add"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer">
        <img src={Visit} alt="Manage Account Icon" />
      </Grid>
      <Grid className="notificationContent">
        <Typography className="title">
          {notification?.Company?.ownerName || "ownerName not available"}{" "}
          Created A Visit on Contract Number - #
          {notification?.VisitCreate?.ContractNumber ||
            "LastName not available"}{" "}
          Assing to Worker Name
          <Typography className="quoteNumber">
            { `${notification?.VisitCreate?.WorkerFirstName} ${notification?.VisitCreate?.WorkerLastName}` ||
              "FirstName not available"}
          </Typography>
        </Typography>
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          ></Typography>
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};
const Quotesignature = ({ onClick, notification }) => {
  const AddedAt = notification?.AddedAt;
  const formattedTime = AddedAt ? formatTimeAgo(AddedAt, new Date()) : "";

  const notificationStyle = formatStyle(notification);

  // Conditional message for InvoiceId, QuoteId, or ContractId
  const getMessage = () => {
    if (notification?.InvoiceId) {
      return `Invoice`;
    } else if (notification?.QuoteId) {
      return `Quote`;
    } else if (notification?.VisitCreate?.ContractNumber) {
      return `Contract`;
    } else {
      return "Signature request sent (details unavailable)";
    }
  };

  // Logic to decide which section to show
  const renderDetails = () => {
    if (notification?.Invoice) {
      return (
        <>
          <Typography className="title">
            {notification?.Company?.ownerName || "ownerName not available"}{" "}
            Created A Signature Request On Invoice For -{" "}
            {notification?.Invoice?.CustomerData?.FirstName || "No Available"}{" "}
            {notification?.Invoice?.CustomerData?.LastName || "No Available"}
          </Typography>
          <Typography className="quoteNumber">
            InvoiceNumber #
            {notification?.Invoice.InvoiceNumber || "No Available"}
            {/* {notification?.Invoice.Total || "No Available"} */}
          </Typography>
        </>
      );
    } else if (notification?.Contract) {
      return (
        <>
          <Typography className="title">
            {notification?.Company?.ownerName || "ownerName not available"}{" "}
            Created A Signature Request On Contract - Contractnumber #
            {notification?.Contract.ContractNumber || "No Available"}
          </Typography>
          <Typography className="quoteNumber">
            Total {""}${notification?.Contract.Total || "No Available"}
          </Typography>
        </>
      );
    } else if (notification?.Quote) {
      return (
        <>
          <Typography className="title">
            {notification?.Company?.ownerName || "ownerName not available"}{" "}
            Created A Signature Request On Quote - Quotenumber #
            {notification?.Quote.QuoteNumber || "No Available"}
          </Typography>
          <Typography className="quoteNumber">
            Total {""}${notification?.Quote.Total || "No Available"}
          </Typography>
        </>
      );
    } else {
      return (
        <Typography className="title">
          Signature request sent (details unavailable)
        </Typography>
      );
    }
  };

  return (
    <Grid
      className="notificationCard"
      onClick={() =>
        onClick(
          notification?.signatureRequestId,
          notification?.NotificationId,
          "dropbox-signature"
        )
      }
      style={notificationStyle}
    >
      <Grid className="iconContainer">
        <img src={signature} alt="Manage Account Icon" />
      </Grid>
      <Grid className="notificationContent">
        {renderDetails()}
        <Grid className="description">
          <Typography
            className="approvequote"
            style={{ fontWeight: notification?.IsView ? "normal" : "bold" }}
          ></Typography>
        </Grid>
        <Typography className="time">
          {formattedTime || "formattedTime not available"}
        </Typography>
      </Grid>
    </Grid>
  );
};

const NotificationsPage = ({ handleCloseNotifications, isSwitchOn }) => {
  const { companyName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loader, setLoader] = useState(true);

  const fetchNotifications = async () => {
    setLoader(true);

    try {
      const response = await AxiosInstance.get(
        `/notifications/${localStorage.getItem("CompanyId")}`
      );
      if (response?.data.statusCode === 200) {
        const filteredNotifications = response?.data?.notifications?.filter(
          (notification) =>
            notification?.Quote?.QuoteNumber ||
            notification?.Contract?.ContractNumber ||
            notification?.Customer?.FirstName ||
            notification?.Invoice?.InvoiceNumber ||
            notification?.QuoteChangeRequest ||
            notification?.QuoteApprove ||
            notification?.WorkerId ||
            notification?.ProductId ||
            notification?.account_id ||
            notification?.TemplateId ||
            notification?.recurring_charge_id ||
            notification?.recurringId ||
            notification?.VisitId ||
            notification?.signatureRequestId
        );
        setNotifications(filteredNotifications || []);
      } else {
        console.warn("No notifications found in response.");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setNotifications([]);
    } finally {
      setLoader(false);
    }
  };

  // const fetchTokenDecode = async () => {
  //   try {
  //     setLoader(true);
  //     const res = await handleAuth(navigate, location);
  //     if (res?.data?.companyId) {
  //       setTokenDecode(res.data.companyId);
  //     } else {
  //       console.error("Company ID not found in response.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching company data:", error);
  //   } finally {
  //     setLoader(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchTokenDecode();
  // }, []);

  useEffect(() => {
    // if (tokenDecode) {
    fetchNotifications();
    // }
  }, []);

  //   const fetchData = async () => {
  //     try {
  //       // setLoader(false);
  //       const res = await handleAuth(navigate, location);
  //       if (res?.data?.companyId) {
  //         setTokenDecode(res.data.companyId);
  //       } else {
  //         console.error("Company ID not found in response.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching company data:", error);
  //     }finally {
  //       setLoader(false);
  //     }
  //   };
  // useEffect(() => {
  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   if (tokenDecode) {
  //     fetchNotifications();
  //   }
  // }, [tokenDecode]);

  const handleNotificationClick = async (id, notificationId, type) => {
    try {
      await AxiosInstance.put(`/notifications/${notificationId}`);
      handleCloseNotifications();
      await fetchNotifications();

      const route =
        type === "quote"
          ? "quotes-detail"
          : type === "contract"
          ? "contractdetails"
          : type === "customer"
          ? "customerdetails"
          : type === "invoice"
          ? "invoice-details"
          : type === "Chnge"
          ? "quotes-detail"
          : type === "approve"
          ? "quotes-detail"
          : type === "worker"
          ? "add-user"
          : type === "productandservice"
          ? "product&service"
          : type === "account"
          ? "account"
          : type === "templates"
          ? "add-templates"
          : type === "recurring-payment"
          ? "customerdetails"
          : type === "recurring-charges"
          ? "customerdetails"
          : type === "visit-add"
          ? "contractdetails"
          : // : type === "dropbox-signature"
            // ? "quotes-detail"
            null;
      if (route) {
        navigate(`/${companyName}/${route}`, {
          state: { id: id, navigats: ["/index", `/${route}`] },
          replace: true,
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  return (
    <>
      {loader ? (
        <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
          <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
            <LoaderComponent loader={loader} height="50" width="50" />
          </Grid>
        </Grid>
      ) : (
        <Grid className="notificationsContainer quotes-notification">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              if (
                isSwitchOn.workers &&
                notification?.CreatedBy === "WorkerRole"
              ) {
                return (
                  <WorkerCreateNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }
              if (
                isSwitchOn.AppointmentConfirmNotification &&
                notification?.CreatedBy?.trim().toLowerCase() === "confirm"
              ) {
                return (
                  <AppointmentConfirmNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }
              if (
                isSwitchOn.QuoteChangeRequestNotification &&
                notification?.CreatedBy === "customer"
              ) {
                return (
                  <QuoteChangeRequestNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }
              if (
                isSwitchOn?.ProductAndServiceCreateNotification &&
                notification?.CreatedBy === "MaterialsAndLabor"
              ) {
                return (
                  <ProductAndServiceCreateNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }
              if (
                isSwitchOn.QuoteConfirmNotification &&
                notification?.CreatedBy === "Worker"
              ) {
                return (
                  <QuoteConfirmNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }
              if (isSwitchOn?.quotes && notification?.Quote) {
                if (notification.CreatedBy === "Customer") {
                  return (
                    <QuoteApproveNotification
                      key={notification?._id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  );
                } else {
                  return (
                    <QuoteNotification
                      key={notification?._id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  );
                }
              }

              if (
                isSwitchOn.ManageAccountNotification &&
                notification?.CreatedBy === "Account"
              ) {
                return (
                  <ManageAccountNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }

              if (
                isSwitchOn.ManageTempletes &&
                notification?.CreatedBy === "Templates"
              ) {
                return (
                  <ManageTempletes
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }
              if (
                isSwitchOn.RecurringChargeNotification &&
                notification?.recurring_charge_id
              ) {
                if (notification?.CreatedBy === "Recurringcharge") {
                  return (
                    <RecurringChargeNotification
                      key={notification?._id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  );
                }
              }

              if (
                isSwitchOn.RecurringPaymentNotification &&
                notification?.recurringId
              ) {
                if (notification?.CreatedBy === "RecurringPayment") {
                  return (
                    <RecurringPaymentNotification
                      key={notification?._id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  );
                }
              }
              if (isSwitchOn.AddVisitNotifications && notification?.VisitId) {
                if (notification?.CreatedBy === "VisitRole") {
                  return (
                    <AddVisitNotifications
                      key={notification?._id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  );
                }
              }
              if (
                isSwitchOn.Quotesignature &&
                notification?.signatureRequestId
              ) {
                if (notification?.CreatedBy === "Signature") {
                  return (
                    <Quotesignature
                      key={notification?._id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  );
                }
              }

              if (
                !isSwitchOn.RecurringChargeNotification ||
                !isSwitchOn.RecurringPaymentNotification
              ) {
                return <p style={{ diplay: "none" }}></p>;
              }

              if (isSwitchOn.contracts && notification?.Contract) {
                return (
                  <ContractNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }

              if (isSwitchOn?.customers && notification?.Customer) {
                return (
                  <CustomerNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }
              if (isSwitchOn?.invoices && notification?.Invoice) {
                return (
                  <InvoiceNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }

              if (isSwitchOn?.workers && notification?.Worker) {
                return (
                  <WorkerCreateNotification
                    key={notification?._id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                );
              }

              return null;
            })
          ) : (
            <Grid className="mt-4 text-center" style={{ color: "#063164" }}>
              No notifications available.
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
};

export default NotificationsPage;
