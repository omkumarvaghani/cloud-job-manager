import React, { useEffect } from "react";
import AxiosInstance from "../../Views/AxiosInstance";
import "./QuoteNotification.css";
import { Button } from "@mui/material";
import BlueButton from "../Button/BlueButton";
import showToast from "../Toast/Toster";

const Notifications = ({ fetchNotifications }) => {
  const handleViewAll = async () => {
    try {
      const companyId = localStorage.getItem("CompanyId");

      if (!companyId) {
        console.error("An error occurred. Please try again.");
        return;
      }
      const response = await AxiosInstance.put(
        `/notifications/view-all/${companyId}`
      );

      if (response.status === 200) {
        showToast.success("All notifications marked as viewed!");

        window.location.reload();
      }
    } catch (error) {
      showToast.error("Error updating notifications");
      console.error(error);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <BlueButton
      className="border-blue-color text-white-color outline-button-blue-color"
      style={{
        fontSize: "10px",
        border: " 1px solid",
        cursor: "pointer",
        backgroundColor: "rgb(6, 49, 100)",
      }}
      onClick={handleViewAll}
      label="View All"
    />
  );
};

export default Notifications;
