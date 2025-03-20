import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../AxiosInstance.jsx";
import { Navbar } from "reactstrap";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import SettingSidebar from "../../../../components/Setting/SettingSidebar.jsx";
import SettingDropdown from "../Materials&Labor/SettingComponent.jsx";
import { WhiteLoaderComponent } from "../../../../components/Icon/Index.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../../components/Toast/Toster.jsx";
import { Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton.jsx";
import WhiteButton from "../../../../components/Button/WhiteButton.jsx";

function Theme() {
  const { companyName } = useParams();
  const [loader, setLoader] = useState(false);

  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const toggleDropdown = (email) => {
    setActiveDropdown(activeDropdown === email ? null : email);
  };

  const companyId = localStorage?.getItem("CompanyId");

  const [colors, setColors] = useState(undefined);

  const defaultColors = {
    "--text-blue-color": "#063164",
    "--text-white-color": "#ffffff",
    "--bg-blue-color": "#063164",
    "--bg-orange-color": "#e88c44",
    "--bg-white-color": "#ffffff",
    "--text-orange-color": "#e88c44",
    "--border-blue-color": "#063164",
    "--border-white-color": "#fffff",
  };

  const getCSSVariables = () => {
    const cssVariables = {};
    const computedStyles = getComputedStyle(document.documentElement);

    const variableNames = [
      "--text-orange-color",
      "--text-blue-color",
      "--text-white-color",
      "--bg-blue-color",
      "--bg-orange-color",
      "--bg-white-color",
      "--border-white-color",
      "--border-blue-color",
    ];

    variableNames.forEach((varName) => {
      cssVariables[varName] = computedStyles.getPropertyValue(varName).trim();
    });

    setColors(cssVariables);
  };

  useEffect(() => {
    getCSSVariables();
  }, []);

  const handleColorChange = (event, cssVar) => {
    const newColor = event.target.value;

    setColors((prevColors) => ({
      ...prevColors,
      [cssVar]: newColor,
    }));

    document.documentElement.style.setProperty(cssVar, newColor);
  };

  const setTheme = async (Colors) => {
    try {
      setLoader(true);
      const CompanyId = localStorage.getItem("CompanyId");
      const themeRes = await AxiosInstance.post(`/themes`, {
        Colors,
        CompanyId,
      });
      if (themeRes.data.statusCode === 200) {
        showToast.success("Theme colors updated!", {
          position: "top-center",
          autoClose: 800,
        });
        setColors(themeRes.data.data.colors);
      } else {
        console.log("Something Wrong!");
      }
    } catch (error) {
      console.error("Error: ", error.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <Grid>
        <Grid className="d-flex">
          <Col className="col-2 h-100 hiren" xl={2}>
            <SettingSidebar />
          </Col>
          <Col
            className="d-flex col-12 col-lg-10 col-md-12 justify-content-center manageteam-content addProductServiceSideLine"
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
            <Grid
              style={{
                width: "100%",
                marginLeft: "0%",
                justifyContent: "center",
              }}
            >
              <Grid>
                <Grid className="d-block justify-content-between">
                  <Navbar
                    className="navbar-setting"
                    style={{
                      zIndex: "9",
                      borderRadius: "5px",
                    }}
                  ></Navbar>
                  <Grid className="d-flex justify-content-between manageTeamAddWorker">
                    <Typography
                      className="text-blue-color page-heading mb-5"
                      style={{
                        fontSize: "27px",
                        fontWeight: "700",
                        lineHeight: "28px",
                        marginTop: "5%",
                        textDecoration: "underline",
                      }}
                    >
                      Manage Theme
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <SettingDropdown
                isOpenDropDown={isOpenDropDown}
                toggle={toggle}
                companyName={companyName}
              />
              <Grid className=" settings-menu  mb-3">
                <>
                  <Grid className=" mt-3 template-dropdown-select">
                    <Row style={{ justifyContent: "start" }}>
                      {colors && (
                        <Grid className="d-flex mb-3">
                          <Typography
                            className="text-blue-color"
                            style={{ width: "300px", fontWeight: 600 }}
                          >
                            Background Blue Color
                          </Typography>
                          <input
                            type="color"
                            style={{
                              border: "2px solid",
                              padding: "3px",
                              borderRadius: "3px",
                            }}
                            className="border-blue-color"
                            value={colors["--bg-blue-color"]}
                            onChange={(e) =>
                              handleColorChange(e, "--bg-blue-color")
                            }
                          />
                        </Grid>
                      )}
                      {colors && (
                        <Grid className="d-flex mb-3">
                          <Typography
                            className="text-blue-color"
                            style={{ width: "300px", fontWeight: 600 }}
                          >
                            Background Orange Color
                          </Typography>
                          <input
                            type="color"
                            style={{
                              border: "2px solid",
                              padding: "3px",
                              borderRadius: "3px",
                            }}
                            className="border-blue-color"
                            value={colors["--bg-orange-color"]}
                            onChange={(e) =>
                              handleColorChange(e, "--bg-orange-color")
                            }
                          />
                        </Grid>
                      )}
                      {colors && (
                        <Grid className="d-flex mb-3">
                          <Typography
                            className="text-blue-color"
                            style={{ width: "300px", fontWeight: 600 }}
                          >
                            Text Blue Color
                          </Typography>
                          <input
                            type="color"
                            style={{
                              border: "2px solid",
                              padding: "3px",
                              borderRadius: "3px",
                            }}
                            className="border-blue-color"
                            value={colors["--text-blue-color"]}
                            onChange={(e) =>
                              handleColorChange(e, "--text-blue-color")
                            }
                          />
                        </Grid>
                      )}
                      {colors && (
                        <Grid className="d-flex mb-3">
                          <Typography
                            className="text-blue-color"
                            style={{ width: "300px", fontWeight: 600 }}
                          >
                            Text White Color
                          </Typography>
                          <input
                            type="color"
                            style={{
                              border: "2px solid",
                              padding: "3px",
                              borderRadius: "3px",
                            }}
                            className="border-blue-color"
                            value={colors["--text-white-color"]}
                            onChange={(e) =>
                              handleColorChange(e, "--text-white-color")
                            }
                          />
                        </Grid>
                      )}
                      {colors && (
                        <Grid className="d-flex mb-3">
                          <Typography
                            className="text-blue-color"
                            style={{ width: "300px", fontWeight: 600 }}
                          >
                            Text Orange Color
                          </Typography>
                          <input
                            type="color"
                            style={{
                              border: "2px solid",
                              padding: "3px",
                              borderRadius: "3px",
                            }}
                            className="border-blue-color"
                            value={colors["--text-orange-color"]}
                            onChange={(e) =>
                              handleColorChange(e, "--text-orange-color")
                            }
                          />
                        </Grid>
                      )}
                      {colors && (
                        <Grid className="d-flex mb-3">
                          <Typography
                            className="text-blue-color"
                            style={{ width: "300px", fontWeight: 600 }}
                          >
                            Background White Color
                          </Typography>
                          <input
                            type="color"
                            style={{
                              border: "2px solid",
                              padding: "3px",
                              borderRadius: "3px",
                            }}
                            className="border-blue-color"
                            value={colors["--bg-white-color"]}
                            onChange={(e) =>
                              handleColorChange(e, "--bg-white-color")
                            }
                          />
                        </Grid>
                      )}

                      {colors && (
                        <Grid className="d-flex mb-3">
                          <Typography
                            className="text-blue-color"
                            style={{ width: "300px", fontWeight: 600 }}
                          >
                            Border Blue Color
                          </Typography>
                          <input
                            type="color"
                            style={{
                              border: "2px solid",
                              padding: "3px",
                              borderRadius: "3px",
                            }}
                            className="border-blue-color"
                            value={colors["--border-blue-color"]}
                            onChange={(e) =>
                              handleColorChange(e, "--border-blue-color")
                            }
                          />
                        </Grid>
                      )}
                      {colors && (
                        <Grid className="d-flex mb-3">
                          <Typography
                            className="text-blue-color"
                            style={{ width: "300px", fontWeight: 600 }}
                          >
                            Border White Color
                          </Typography>
                          <input
                            type="color"
                            style={{
                              border: "2px solid",
                              padding: "3px",
                              borderRadius: "3px",
                            }}
                            className="border-blue-color"
                            value={colors["--border-white-color"]}
                            onChange={(e) =>
                              handleColorChange(e, "--border-white-color")
                            }
                          />
                        </Grid>
                      )}
                    </Row>
                    <Grid className="gap-2 d-flex">
                      <BlueButton
                        className="mt-3 bg-button-blue-color"
                        type="submit"
                        style={{ color: "white" }}
                        onClick={() => setTheme(colors)}
                        label={
                          loader ? (
                            <WhiteLoaderComponent
                              height="20"
                              width="20"
                              padding="20"
                              loader={loader}
                            />
                          ) : (
                            "Save"
                          )
                        }
                      />
                      <WhiteButton
                        className="mt-3"
                        type="submit"
                        onClick={() => {
                          setColors(defaultColors);
                          for (const key in defaultColors) {
                            if (
                              Object.prototype.hasOwnProperty.call(
                                defaultColors,
                                key
                              )
                            ) {
                              const element = defaultColors[key];
                              document.documentElement.style.setProperty(
                                key,
                                element
                              );
                            }
                          }
                          setTheme(defaultColors);
                        }}
                        label={"Reset"}
                      />
                    </Grid>
                  </Grid>
                </>
              </Grid>
            </Grid>
          </Col>
        </Grid>
      </Grid>
    </>
  );
}

export default Theme;
