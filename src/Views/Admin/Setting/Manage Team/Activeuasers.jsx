import React, { useState, useEffect } from "react";
import "./style.css";
import { Grid } from "@mui/material";



const ActiveUsers = ({ totalCount, activeCount }) => {
  return (
    <Grid className="active-users d-flex justify-content-between align-items-center">
      <Grid>
        <span
          style={{ textAlign: "center", marginTop: "18px", fontWeight: "500" }}
        >
          Active Users
        </span>
      </Grid>
      <Grid className="gap-4">
        <span className="count" style={{ fontWeight: "500" }}>
          {activeCount}
        </span>{" "}
        of{" "}
        <span className="total" style={{ fontWeight: "500" }}>
          {totalCount}
        </span>
      </Grid>
    </Grid>
  );
};

export default ActiveUsers;
