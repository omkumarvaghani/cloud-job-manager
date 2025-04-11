// =====================================================================
import React from "react";
import "./style.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Divider, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import WhiteButton from "../Button/WhiteButton";

function SettingSidebar() {
  const { CompanyUrl } = useParams();
  const navigate = useNavigate();

  return (
    <Grid>
      <Grid className="setting-sidebar-main">
        <Grid
          className=""
          style={{
            marginRight: "10px",
            height: "100vh",
          }}
        >
          <Typography
            className="heading-three text-blue-color"
            style={{ paddingTop: "40px" }}
          >
            Setting
          </Typography>
          <Typography
            className="text-blue-color heading-six"
            style={{ fontWeight: 600 }}
          >
            BUSINESS <br /> MANAGEMENT
          </Typography>
          <Grid className="d-flex flex-column">
            {/* <Grid
              className="sidebar-link-setting"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(
                  CompanyUrl
                    ? `/${CompanyUrl}/company-setting`
                    : "/superadmin/company-setting",
                  {
                    state: { navigats: ["/index", "/company-setting"] },
                  }
                );
              }}
            >
              Company Setting
            </Grid> */}
            <Grid
              className="sidebar-link-setting"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(
                  CompanyUrl
                    ? `/${CompanyUrl}/materials&labor`
                    : "/superadmin/materials&labor",
                  {
                    state: { navigats: ["/index", "/materials&labor"] },
                  }
                );
              }}
            >
              Materials & Labor
            </Grid>
            <Typography
              className="text-blue-color"
              style={{ fontWeight: 600, marginTop: "16px" }}
            >
              TEAM <br /> ORGANIZATION
            </Typography>
            <Grid
              className="sidebar-link-setting"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(
                  CompanyUrl
                    ? `/${CompanyUrl}/manageteam`
                    : "/superadmin/manageteam",
                  {
                    state: { navigats: ["/index", "/manageteam"] },
                  }
                );
              }}
            >
              Manage Team
            </Grid>
            <Typography
              className="text-blue-color"
              style={{ fontWeight: 600, marginTop: "16px" }}
            >
              MANAGE <br /> TEMPLATES
            </Typography>
            <Grid
              className="sidebar-link-setting"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(
                  CompanyUrl
                    ? `/${CompanyUrl}/manage-template`
                    : "/superadmin/manage-template",
                  {
                    state: { navigats: ["/index", "/manage-template"] },
                  }
                );
              }}
            >
              Templates
            </Grid>
            {/* <Typography
              className="text-blue-color"
              style={{ fontWeight: 600, marginTop: "16px" }}
            >
              MANAGE <br /> THEME
            </Typography>
            <Grid
              className="sidebar-link-setting"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(
                  CompanyUrl ? `/${CompanyUrl}/theme` : "/superadmin/theme",
                  {
                    state: { navigats: ["/index", "/theme"] },
                  }
                );
              }}
            >
              Manage Theme
            </Grid>
            <Typography
              className="text-blue-color"
              style={{ fontWeight: 600, marginTop: "16px" }}
            >
              MANAGE <br /> DATE FORMAT
            </Typography>
            <Grid
              className="sidebar-link-setting"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(
                  CompanyUrl
                    ? `/${CompanyUrl}/date-format`
                    : "/superadmin/date-format",
                  {
                    state: { navigats: ["/index", "/date-format"] },
                  }
                );
              }}
            >
              Date Format
            </Grid>
            <Typography
              className="text-blue-color"
              style={{ fontWeight: 600, marginTop: "16px" }}
            >
              MANAGE <br /> Surcharge
            </Typography>
            <Grid
              className="sidebar-link-setting"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(
                  CompanyUrl
                    ? `/${CompanyUrl}/Surcharge`
                    : "/superadmin/Surcharge",
                  {
                    state: { navigats: ["/index", "/Surcharge"] },
                  }
                );
              }}
            >
              Surcharge
            </Grid> */}
            <Typography
              className="text-blue-color"
              style={{ fontWeight: 600, marginTop: "16px" }}
            >
              MANAGE <br /> Account
            </Typography>
            <Grid
              className="sidebar-link-setting"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(
                  CompanyUrl
                    ? `/${CompanyUrl}/account`
                    : "/superadmin/account",
                  {
                    state: { navigats: ["/index", "/account"] },
                  }
                );
              }}
            >
              Accounts
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default SettingSidebar;
