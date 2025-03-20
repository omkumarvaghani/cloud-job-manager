import React, { useEffect } from "react";
import PlanCard from "../../components/Dashboard/PlanCard";
import { handleAuth } from "../../components/Login/Auth";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";


const SuperadminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  return (
    <Grid className="mt-5">
      <PlanCard />
    </Grid>
  );
};

export default SuperadminDashboard;
