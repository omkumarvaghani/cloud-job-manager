import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import WhiteCompany from "../../assets/White-sidebar-icon/Superadmin-Company.svg";
import SuperadminGraphs from "./SuperadminGraphs";
import "./style.css";
import { Grid } from "@mui/material";
import { LoaderComponent } from "../Icon/Index";
import AxiosInstance from "../../Views/AxiosInstance";

const BASE_URL = process.env.REACT_APP_BASE_API;

const PlanCard = () => {
  const [data, setData] = useState({
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalCompanies: 0,
    totalPlans: 0,
  });
  const [loader, setloader] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await AxiosInstance.get(
          `${BASE_URL}/superadmin/counts`
        );

        const result = response.data;

        if (result?.statusCode === 200) {
          setData(result.data);
        } else {
          throw new Error(result?.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setloader(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <Grid>
      {loader ? (
        <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
          <Grid
            className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
            style={{ height: "50vh" }}
          >
            <LoaderComponent loader={loader} height="50" width="50" />
          </Grid>
        </Grid>
      ) : (
        <Grid className="d-flex gap-3 plan-company superAdminCompany">
          <Paper
            elevation={3}
            sx={{
              width: "30%",
              height: "195px",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="plan_company bg-blue-color planBoxSuperaAdmin plan_company"
          >
            <Typography
              variant="h6"
              sx={{ color: "#ffffff", fontSize: "24px", fontWeight: "bold" }}
              className="company_box"
            >
              Plan
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
              }}
            >
              <Typography
                variant="body1"
                className="text-blue-color"
                sx={{
                  fontSize: "18px",
                  background: "#fff",
                  borderRadius: "10px",
                  padding: "5px 8px",
                }}
              >
                Total : {data?.totalPlans || ""}
              </Typography>
              <DescriptionIcon sx={{ color: "#ffffff", fontSize: "60px" }} />
            </Box>
          </Paper>
          <Paper
            className="bg-orange-color active_deactive"
            elevation={3}
            sx={{
              width: "30%",
              height: "195px",
              borderRadius: "12px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Grid>
              <Typography
                variant="h6"
                sx={{ color: "#ffffff", fontSize: "24px", fontWeight: "bold" }}
              >
                Company
              </Typography>
              <Typography
                className="text-white-color mb-0"
                style={{ opacity: "70%" }}
              >
                Active Company : {data?.activeCompanies || ""}
              </Typography>
              <Typography
                className="text-white-color mb-0"
                style={{ opacity: "70%" }}
              >
                Inactive Company : {data?.inactiveCompanies || ""}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "end",
                  marginBottom: "20px",
                }}
                className="active_box"
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "18px",
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "5px 8px",
                    marginBottom: "1px",
                  }}
                  className="active_box text-blue-color"
                >
                  Total : {data?.totalCompanies || ""}
                </Typography>
                <img
                  alt="img"
                  src={WhiteCompany}
                  sx={{ color: "#ffffff", fontSize: "60px" }}
                />
              </Box>
            </Grid>
          </Paper>
        </Grid>
      )}
      <SuperadminGraphs />
    </Grid>
  );
};

export default PlanCard;
