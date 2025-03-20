import React from "react";
import logo from "../../assets/image/CMS_LOGO.svg";
import Cunstroctor from "../../assets/image/construction-worker-texting-mobile-phone 1.jpg";
import { Button, Card, CardBody, Container } from "reactstrap";
import { TextField, Typography } from "@mui/material";
import "./style.css";
import InputText from "../../components/InputFields/InputText";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";


function FirstTimeNewPassword() {
  return (
    <Container style={{ overflow: "hidden" }}>
      <Grid className="d-flex align-items-center my-5">
        <Col className="col-lg-7 col-md-12 mb-4 first-section" lg={7} md={12}>
          <Grid className="image-sectionn">
            <img src={logo} className="mb-3" alt="Logo" />
          </Grid>
          <Card
            style={{
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              borderRadius: "14px",
            }}
          >
            <CardBody>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "29px", fontWeight: 600 }}
              >
                Hello Anderson,
              </Typography>
              <Typography className="text-blue-color mb-1" style={{ fontSize: "13px" }}>
                ABC Store team has extended an invitation for you to join them
                on the Contract Management System.
              </Typography>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Get started by signing up for the Contract Management System.
              </Typography>
              <Grid className="text-boxes">
                <InputText
                  id="fullName"
                  label="Full Name"
                  placeholder="Enter full name"
                  type="text"
                  className="mb-3 text-blue-color "
                />
              </Grid>
              <Grid className="text-boxes">
                <InputText
                  id="email"
                  label="Email Address"
                  placeholder="Enter email address"
                  type="email"
                  className="mb-3 text-blue-color "
                />
              </Grid>
              <Grid className="text-boxes">
                <InputText
                  id="password"
                  label="Password"
                  placeholder="Enter password"
                  type="password"
                  className="mb-3 text-blue-color "
                />
              </Grid>
              <Grid className="text-boxes">
                <InputText
                  id="confirmPassword"
                  label="Confirm Password"
                  placeholder="Enter confirm password"
                  type="password"
                  className="mb-3 text-blue-color "
                />
              </Grid>
              <Button className="bg-blue-color">Start now</Button>
            </CardBody>
          </Card>
          <Typography className="text-blue-color my-2" style={{ fontSize: "13px" }}>
            By creating an account, you confirm your agreement to our{" "}
            <span style={{ fontWeight: 600 }}>Terms of Service</span> and{" "}
            <span style={{ fontWeight: 600 }}>Privacy Policy</span>.
          </Typography>
        </Col>
        <Col className="col-lg-5 col-md-12 new-image" lg={5} md={12}>
          <img
            src={Cunstroctor}
            style={{ width: "100%", maxWidth: "70%", marginLeft: "60px" }}
            alt="Construction Worker"
          />
        </Col>
      </Grid>
    </Container>
  );
}

export default FirstTimeNewPassword;
