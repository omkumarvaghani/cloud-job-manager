import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance.jsx";
import { Input } from "reactstrap";
import SettingSidebar from "../../../../components/Setting/SettingSidebar.jsx";
import moment from "moment";
import { Grid } from "@mui/material";
import { Col } from "react-bootstrap";
import showToast from "../../../../components/Toast/Toster.jsx";
import { Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton.jsx";
import WhiteButton from "../../../../components/Button/WhiteButton.jsx";

function DateFormat() {
  const [selectedFormat, setSelectedFormat] = useState("MM/DD/YYYY");
  const [customInputValue, setCustomInputValue] = useState("DD/MMM/YYYY");
  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  const handleCustomDateChange = (event) => {
    const inputValue = event.target.value;
    const filteredValue = inputValue.replace(/[^a-zA-Z/-]/g, "");
    setCustomInputValue(filteredValue.toUpperCase());
  };

  const fetchDateFormat = async () => {
    try {
      const CompanyId = localStorage.getItem("CompanyId");
      const response = await AxiosInstance.get(`/themes/${CompanyId}`, {
        // params: { CompanyId },
      });
      if (response?.data?.statusCode === 200) {
        const format = response?.data?.data?.Format;
        setSelectedFormat(format || "MM/DD/YYYY");

        if (format === "custom") {
          setSelectedFormat(
            response?.data?.customFormat || "DD/MMM/YYYY"
          );
        }
      } else {
        console.error("Failed to fetch date format.");
      }
    } catch (error) {
      console.error("Error fetching date format:", error.message);
    }
  };

  const setDateFormat = async (Format) => {
    try {
      const CompanyId = localStorage.getItem("CompanyId");
      const response = await AxiosInstance.post(`/themes/date-format`, {
        Format,
        CompanyId,
      });

      if (response?.data.statusCode === 200) {
        showToast.success("Date format updated!", {
          position: "top-center",
          autoClose: 800,
        });
      } else {
        console.error("Failed to update date format.");
      }
    } catch (error) {
      console.error("Error updating date format:", error.message);
    }
  };

  useEffect(() => {
    fetchDateFormat();
  }, []);

  return (
    <>
      <Grid>
        <Grid className="d-flex">
          <Col className="col-2 h-100 hiren" xl={2}>
            <SettingSidebar />
          </Col>
          <Col
            className="d-flex col-12 col-lg-10 col-md-12  manageteam-content addProductServiceSideLine"
            style={{
              position: "relative",
              zIndex: "9",
              borderLeft: "0.5px solid rgba(6, 49, 100, 30%)",
              paddingLeft: "20px",
              marginTop: "-30px",
            }}
            xl={10}
            lg={10}
            md={12}
          >
            <Grid className="mt-5" style={{ marginLeft: "5%" }}>
              <Typography
                className="d-flex heading-three mb-3 text-blue-color justify-content-start textcolorblue"
                style={{ textDecoration: "underline", fontWeight: 600 }}
              >
                Select Date Format
              </Typography>
              <Grid className="settings-menu">
                <Grid>
                  <Typography className="text-blue-color">
                    <Input
                      type="radio"
                      id="checked"
                      name="dateFormat"
                      value="MM/DD/YYYY"
                      className="mb-3 text-blue-color"
                      checked={selectedFormat === "MM/DD/YYYY"}
                      onChange={handleFormatChange}
                    />
                    &nbsp; MM/DD/YYYY
                  </Typography>
                  <Input
                    className="mb-3 mx-4 text-blue-color"
                    type="text"
                    style={{ width: "200px" }}
                    value={moment(new Date()).format("MM/DD/YYYY")}
                    disabled={selectedFormat !== "MM/DD/YYYY"}
                    readOnly
                  />
                </Grid>

                <Grid>
                  <Typography className="settings-menu text-blue-color">
                    <Input
                      type="radio"
                      id="checked"
                      name="dateFormat"
                      value="YYYY-MM-DD"
                      className="mb-3 text-blue-color"
                      checked={selectedFormat === "YYYY-MM-DD"}
                      onChange={handleFormatChange}
                    />
                    &nbsp; YYYY-MM-DD
                  </Typography>
                  <Input
                    className="mb-3 mx-4 text-blue-color"
                    type="text"
                    style={{ width: "200px" }}
                    value={moment(new Date()).format("YYYY-MM-DD")}
                    disabled={selectedFormat !== "YYYY-MM-DD"}
                    readOnly
                  />
                </Grid>

                <Grid>
                  <Typography className="settings-menu text-blue-color">
                    <Input
                      type="radio"
                      id="checked"
                      name="dateFormat"
                      value="YYYY-MMM-DD"
                      className="mb-3 text-blue-color"
                      checked={selectedFormat === "YYYY-MMM-DD"}
                      onChange={handleFormatChange}
                    />
                    &nbsp; YYYY-MMM-DD
                  </Typography>
                  <Input
                    className="mb-3 mx-4 text-blue-color"
                    type="text"
                    style={{ width: "200px" }}
                    value={moment(new Date()).format("YYYY-MMM-DD")}
                    disabled={selectedFormat !== "YYYY-MMM-DD"}
                    readOnly
                  />
                </Grid>

                <Grid>
                  <Typography className="settings-menu text-blue-color">
                    <Input
                      type="radio"
                      id="checked"
                      name="dateFormat"
                      value="custom"
                      className="mb-3"
                      checked={selectedFormat === "custom"}
                      onChange={handleFormatChange}
                    />
                    &nbsp; Custom (DD/MMM/YYYY)
                  </Typography>
                  <Input
                    type="text"
                    style={{ width: "200px" }}
                    value={customInputValue}
                    disabled={selectedFormat !== "custom"}
                    onChange={handleCustomDateChange}
                    className="mx-4 text-blue-color"
                  />
                </Grid>

                {selectedFormat === "custom" && customInputValue?.length > 0 ? (
                  <Grid style={{ marginTop: "20px", marginLeft: "20px" }}>
                    <Typography className="heading-four text-blue-color">
                      Formatted Date:
                    </Typography>
                    <Typography className="text-blue-color">
                      <>{moment(new Date()).format(customInputValue)} </>
                    </Typography>
                  </Grid>
                ) : (
                  " "
                )}

                <Grid
                  style={{ display: "flex", gap: "10px" }}
                  className="mt-3 mx-4"
                >
                  <BlueButton
                    id="payButton"
                    type="submit"
                    disabled={false}
                    Typography="Save"
                    onClick={() =>
                      setDateFormat(
                        selectedFormat === "custom"
                          ? customInputValue
                          : selectedFormat
                      )
                    }
                    label={"Save"}
                  />
                  <WhiteButton
                    onClick={() => {
                      setDateFormat("YYYY-MM-DD");
                    }}
                    variant="outline"
                    // Typography="Reset"
                    type="button"
                    label={"Reset"}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Col>
        </Grid>
      </Grid>
    </>
  );
}

export default DateFormat;
