import React from "react";
import { Grid } from "@mui/material";
import { Typography } from "@mui/material";
import "./style.css";

const FooterDetails = ({
  quotesData,
  contractData,
  invoicedata,
  requestData,
  options,
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const data = quotesData || contractData || invoicedata;
  return (
    <Grid
      className="p-3 my-4 border-blue-color"
      style={{ border: "1px solid", borderRadius: "12px" }}
    >
      <Grid>
        <Grid className="d-flex align-items-center">
          <Typography
            className="bg-blue-color text-white-color"
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            {data?.customerData?.FirstName?.charAt(0)?.toUpperCase() ||
              data?.customer?.FirstName?.charAt(0)?.toUpperCase()}
            {data?.customerData?.LastName?.charAt(0)?.toUpperCase() ||
              data?.customer?.LastName?.charAt(0)?.toUpperCase()}
          </Typography>
          <Grid className="mx-2">
            <Typography className="mb-0" style={{ fontSize: "12px" }}>
              <b className="text-blue-color">
                {data?.customerData?.FirstName ||
                  data?.customer?.FirstName ||
                  ""}
                {data?.customerData?.LastName || data?.customer?.LastName || ""}
              </b>
            </Typography>
            <Typography
              style={{ fontSize: "12px" }}
              className="text-blue-color mt-3"
            >
              Created: {data?.updatedAt && formatDate(data?.updatedAt)}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default FooterDetails;
