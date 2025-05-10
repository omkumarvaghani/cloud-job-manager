import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Auth from "./components/Layouts/Auth";
import SuperAdmin from "./components/Layouts/SuperAdmin";
import Admin from "./components/Layouts/Admin";
import Client from "./components/Layouts/Client";
import StaffMember from "./components/Layouts/StaffMember";
import Plan from "./Views/Admin/Plan/Index";
import PlanPurchase from "./Views/Admin/Plan/PlanPurchase";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import InvoicePayment from "./Views/Admin/Invoice/InvoiceLivePayment";

// Import your StaffProvider
import { StaffProvider } from "./components/StaffData/Staffdata"; // Adjust the import path as per your file structure

const theme = createTheme({
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
    },
    h2: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 500,
    },
    body1: {
      fontFamily: "'Poppins', sans-serif",
    },
  },
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <StaffProvider>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/superadmin/*" element={<SuperAdmin />} />
          <Route path="/customers/*" element={<Client />} />
          <Route path="/staff-member/*" element={<StaffMember />} />
          <Route path="/:CompanyName/*" element={<Admin />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/plan-purchase" element={<PlanPurchase />} />
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/InvoicePayment" element={<InvoicePayment />} />
        </Routes>
        <Toaster />
        <ToastContainer />
      </ThemeProvider>
    </StaffProvider>
  </BrowserRouter>
);

console.error = () => {};
console.warn = () => {};
