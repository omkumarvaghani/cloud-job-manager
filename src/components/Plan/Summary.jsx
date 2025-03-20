import { Box, CircularProgress, FormControlLabel, Radio } from "@mui/material";
import React from "react";
import { Button } from "reactstrap";
import "./style.css";
import { Grid } from "@mui/material";
import { Typography } from "@mui/material";

const Summary = ({ formik, plan, loading }) => {
  function getPlanFrequencyDisplay(monthFrequency) {
    if (monthFrequency === "12 (Annually)") {
      return "year";
    } else if (monthFrequency === "1") {
      return `month`;
    } else {
      return `${monthFrequency?.split(" ")[0]} month`;
    }
  }

  function formatDate(date) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  return (
    <Grid className=" h-auto second-card">
      <Box
        sx={{ border: "1px solid ", borderRadius: "4px" }}
        className="space p-3 h-100 border-blue-color"
      >
        <Grid className="d-flex justify-content-between summary-main side summaryPlanNamePayment">
          <Typography
            style={{ fontSize: "23px", fontWeight: 600 }}
            className="paymentInfoLike heading-four text-blue-color"
          >
            Summary{" "}
          </Typography>
          <Typography
            style={{ fontSize: "25px", fontWeight: 600 }}
            className="paymentInfoLikheading-foure text-blue-color"
          >
            {plan?.PlanName || "PlanName not available"}
          </Typography>
        </Grid>
        <hr
          style={{ background: "#2A4F61", color: "#2A4F61", height: "1px" }}
          className="mt-1"
        />
        <Grid className="">
          <Grid className="bill d-flex align-items-center justify-content-between">
            <Typography
              style={{ fontSize: "16px", fontWeight: 600 }}
              className="paymentInfoLike text-blue-color"
            >
              Bill Date
            </Typography>
            <Typography
              style={{ fontSize: "16px", fontWeight: 600 }}
              className="paymentInfoLike text-blue-color"
            >
              {formatDate(new Date())}
            </Typography>
          </Grid>
        </Grid>
        <hr
          style={{ background: "#2A4F61", color: "#2A4F61", height: "1px" }}
          className="mt-1"
        />
        <Grid className="bill d-flex align-items-center justify-content-between">
          <Typography
            style={{ fontSize: "20px", fontWeight: 600 }}
            className="paymentInfoLike text-blue-color"
          >
            Monthly Bill
          </Typography>
          <Typography
            style={{ fontSize: "20px", fontWeight: 600 }}
            className="paymentInfoLike mb-2 text-blue-color"
          >
            ${Number(plan?.PlanPrice).toFixed(2)}/
            {getPlanFrequencyDisplay(plan?.MonthFrequency)}
          </Typography>
        </Grid>
        <Grid className="bill d-flex align-items-center justify-content-end">
          <Typography
            style={{ fontSize: "15px", color: "#06316499" }}
            className="paymentInfoLike "
          >
            All prices are in $USD
          </Typography>
        </Grid>
        <hr />
        <Grid className="d-flex justify-content-start note">
          <Typography style={{ fontSize: "10px", color: "#06316499" }}>
            Payments are non-refundable and will automatically renew unless
            canceled prior to the end of the current billing cycle via your
            Account and Billing page.
          </Typography>
        </Grid>
        <Grid className="d-flex justify-content-center mt-md-4">
          <Button
            className="bg-blue-color btn"
            color="white"
            style={{ fontSize: "18px", color: "white", marginBottom: "10px" }}
            onClick={formik.handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Add Subscription"
            )}
          </Button>
        </Grid>
      </Box>
    </Grid>
  );
};

export default Summary;
