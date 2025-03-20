import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import { Grid, Typography } from "@mui/material";
import { Row, Col } from "react-bootstrap"; // React Bootstrap components

const SettingDropdown = ({ isOpenDropDown, toggle, companyName }) => {
  const navigate = useNavigate();

  return (
    <Grid className="d-flex justify-content-between ">
      <Grid className="setting-dropdown settingsidebardrop mb-0">
        <Dropdown
          isOpen={isOpenDropDown}
          toggle={toggle}
          className="settingProfileSetting"
        >
          <DropdownToggle className="back-color" caret>
            Setting
          </DropdownToggle>
          <DropdownMenu style={{ zIndex: "9" }}>
            <DropdownItem>
              <Typography style={{ fontWeight: 600,  }}>
                BUSINESS <br /> MANAGEMENT
              </Typography>
            </DropdownItem>
            <DropdownItem
              className="dropdown-link-setting"
              onClick={(e) => {
                navigate(
                  companyName
                    ? `/${companyName}/materials&labor`
                    : "/superadmin/materials&labor",
                  {
                    state: {
                      navigats: ["/index", "/materials&labor"],
                    },
                  }
                );
              }}
              style={{
                textDecoration: "none",
                color: "#4F963B",
                display: "block",
                
              }}
            >
              Materials & Labor
            </DropdownItem>
            <DropdownItem>
              <Typography style={{ fontWeight: 600,  }}>
                TEAM <br /> ORGANIZATION
              </Typography>
            </DropdownItem>
            <DropdownItem
              style={{
                textDecoration: "none",
                color: "#4F963B",
                display: "block",
                
              }}
              className="dropdown-link-setting"
              onClick={() => {
                navigate(
                  companyName
                    ? `/${companyName}/manageteam`
                    : "/superadmin/manageteam",
                  {
                    state: { navigats: ["/index", "/manageteam"] },
                  }
                );
              }}
            >
              Manage Team
            </DropdownItem>

            <DropdownItem>
              <Typography style={{ fontWeight: 600, }}>
                MANAGE <br />
                TEMPLATES
              </Typography>
            </DropdownItem>
            <DropdownItem
              style={{
                textDecoration: "none",
                color: "#4F963B",
                display: "block",
                
              }}
              className="dropdown-link-setting"
              onClick={() => {
                navigate(
                  companyName
                    ? `/${companyName}/manage-template`
                    : "/superadmin/manage-template",
                  {
                    state: { navigats: ["/index", "/manage-template"] },
                  }
                );
              }}
            >
              Templates
            </DropdownItem>

            <DropdownItem>
              <Typography style={{ fontWeight: 600,  }}>
                MANAGE <br />
                Account
              </Typography>
            </DropdownItem>
            <DropdownItem
              style={{
                textDecoration: "none",
                color: "#4F963B",
                display: "block",
              }}
              className="dropdown-link-setting"
              onClick={() => {
                navigate(
                  companyName
                    ? `/${companyName}/account`
                    : "/superadmin/account",
                  {
                    state: { navigats: ["/index", "/account"] },
                  }
                );
              }}
            >
              Accounts
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Grid>
    </Grid>
  );
};

export default SettingDropdown;
