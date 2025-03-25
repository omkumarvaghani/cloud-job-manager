import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../AxiosInstance.jsx";
// import { Form, useFormik } from "formik";
import { Input, Button, Form } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import SettingSidebar from "../../../../components/Setting/SettingSidebar.jsx";
import moment from "moment";
import { LoaderComponent } from "../../../../components/Icon/Index.jsx";
import { FormGroup, Grid } from "@mui/material";
import { Row, Col, ToggleButton, Tabs, Tab } from "react-bootstrap";
import toast from "react-hot-toast";
import BlueButton from "../../../../components/Button/BlueButton.jsx";
import { useFormik } from "formik";
import "./Style.css"
import { handleAuth } from "../../../../components/Login/Auth.jsx";

function Surcharge() {

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
    handleAuth(navigate, location);
  }, []);



  const [loader, setLoader] = useState(false);
  let navigate = useNavigate();
  const location = useLocation();
  const getFile = process.env.REACT_APP_IMAGE_GET_URL;
  const postFile = process.env.REACT_APP_IMAGE_POST_URL;
  const [accessType, setAccessType] = useState(null);
  const [selectedOption, setSelectedOption] = useState("surcharge");
  const [submitLoader, setSubmitLoader] = useState(false);
  const [achOption, setAchOption] = useState(null);
  const [selectedSurchargAccount, setSelectedSurchargAccount] = useState("");
  const [surcharge, setsurcharge] = useState(null);
  const [surchargeId, setSurchargeId] = useState(null);
   const [tokenDecode, setTokenDecode] = useState(null);
  const CompanyId = localStorage.getItem("CompanyId");
  const companyId = tokenDecode?.companyId;


  const surchargeFormik = useFormik({
    initialValues: {
      surchargePercent: "",
      surchargePercentDebit: "",
      surchargePercentACH: "",
    },
    // validationSchema: yup.object({
    //   surchargePercent: yup.number().required("Required"),
    //   surchargeAccount: yup.string().required("Required"),
    // }),
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  useEffect(() => {
    const CompanyId = localStorage?.getItem("CompanyId");
    setLoader(true);
    AxiosInstance.get(`/surcharge/${CompanyId}`)
      .then((response) => {
        const Data = response?.data?.data[0];
        setsurcharge(Data);
        setSurchargeId(Data.surchargeId);
        setSelectedSurchargAccount(Data.surchargeAccount);
        surchargeFormik.setValues({
          surchargePercent: Data.surchargePercent || "",
          surchargePercentDebit: Data.surchargePercentDebit || "",
          surchargePercentACH: Data.surchargePercentACH || "",
          surchargeFlatACH: Data.surchargeFlatACH || "",
          surchargeAccount: Data.surchargeAccount,
        });
        if (Data.surchargePercentACH && Data.surchargeFlatACH) {
          setAchOption(3);
        } else if (Data.surchargePercentACH) {
          setAchOption(1);
        } else if (Data.surchargeFlatACH) {
          setAchOption(2);
        }
      })
      .catch((error) => {
        console.error("Error fetching property type data:", error);
      })
      .finally(() => {
        setLoader(false);
      });
  }, [accessType,CompanyId, selectedOption]);

  async function handleSubmit(values) {
    setSubmitLoader(true);
    setLoader(false);
    try {
      const object = {
        CompanyId: localStorage?.getItem("CompanyId"),
        surchargePercent: surchargeFormik.values.surchargePercent,
        surchargePercentDebit: surchargeFormik.values.surchargePercentDebit,
        surchargePercentACH:
          achOption === 1 || achOption === 3
            ? surchargeFormik.values.surchargePercentACH
            : undefined,
        surchargeFlatACH:
          achOption === 2 || achOption === 3
            ? surchargeFormik.values.surchargeFlatACH
            : undefined,
        surchargeAccount: surchargeFormik.values.surchargeAccount,
      };

      if (!surchargeId) {
        const res = await AxiosInstance.post(`/surcharge`, object);
        if (res.data.statusCode === 200) {
          toast.success("Surcharge Added", {
            position: "top-center",
            autoClose: 800,
            // onClose: () => navigate(`/${CompanyName}/surcharge`),
          });
        } else if (res.data.statusCode === 201) {
          toast.error(res.data.message, {
            position: "top-center",
            autoClose: 1000,
          });
        }
      } else {
        const editUrl = `/surcharge/${surchargeId}`;
        const res = await AxiosInstance.put(editUrl, object);
        if (res.data.statusCode === 200) {
          toast.success("Surcharge Updated", {
            position: "top-center",
            autoClose: 800,
            // onClose: () => navigate(`/${CompanyName}/surcharge`),
          });
        } else if (res.data.statusCode === 400) {
          toast.error(res.data.message, {
            position: "top-center",
            autoClose: 1000,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        console.error("Response Data:", error.response?.data);
      }
    } finally {
      setSubmitLoader(false);
      setLoader(false);
    }
  }

  // State to manage selected option
  const [selectedCard, setSelectedCard] = useState("Card-1");
  const [key, setKey] = useState("card");

  return (
    <>
      {loader ? (
        <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
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
                <Row>
                  <h1
                    className="labelfontstyle mt-5 text-blue-color textcolorblue fontfamilysty"
                    style={{
                      fontWeight: "700",
                      fontSize: "24px",
                      textDecoration: "underline"
                    }}
                  >
                    Surcharge
                  </h1>
                </Row>
                <Form onSubmit={surchargeFormik.handleSubmit}>
                  <div className="mt-3 ser">
                    <Tabs
                      id="controlled-tab-example"
                      activeKey={key}
                      onSelect={(k) => setKey(k)}
                      className="mb-3  "
                    >
                      <Tab
                        eventKey="card"
                        title={
                          <span
                            className={
                              key === "card"
                                ? "text-blue-color"
                                : "text-blue-color"
                            }
                            style={{
                              fontWeight: "600",
                              textDecoration: "underline",
                              borderRadius:"20px"
                            }}
                          >
                            Card
                          </span>
                        }
                      >
                        <Grid className="card-tab">
                          <Row>
                            <span
                              className="fontstylerentr text-blue-color titleecolor fontfamilysty  text-start"
                              style={{
                                fontWeight: "500",
                                fontSize: "16px",
                              }}
                            >
                              You can set default surcharge percentage from here
                            </span>
                          </Row>
                          <Row className="mt-3">
                            <Col lg="4">
                              <FormGroup>
                                <label
                                  className="form-control-label text-blue-color fontstylerentr textcolorblue fontfamilysty mb-3 text-start"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                  }}
                                >
                                  Credit Card Surcharge Percent
                                </label>
                                <div
                                  style={{ position: "relative", width: "70%" }}
                                >
                                  <Input
                                    style={{
                                      boxShadow: "0px 4px 4px 0px #00000040",
                                      borderRadius: "6px",
                                    }}
                                    className="form-control-alternative text-blue-color fontstylerentmodal custom-input"
                                    placeholder="Enter surcharge %"
                                    type="number"
                                    name="surchargePercent"
                                    onBlur={surchargeFormik.handleBlur}
                                    onChange={surchargeFormik.handleChange}
                                    value={
                                      surchargeFormik.values.surchargePercent
                                    }
                                    required
                                  />
                                  <span
                                    className="fontstylerentmodal text-blue-color"
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                    }}
                                  >
                                    %
                                  </span>
                                </div>
                              </FormGroup>
                            </Col>
                            <Col lg="8">
                              <FormGroup>
                                <label
                                  className="form-control-label text-blue-color fontstylerentr textcolorblue fontfamilysty mb-3 text-start"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                  }}
                                >
                                  Debit Card Surcharge Percent
                                </label>
                                <div
                                  style={{ position: "relative", width: "35%" }}
                                >
                                  <Input
                                    style={{
                                      boxShadow: "0px 4px 4px 0px #00000040",
                                      borderRadius: "6px",
                                    }}
                                    className="form-control-alternative text-blue-color fontstylerentmodal custom-input"
                                    placeholder="Enter surcharge %"
                                    type="number"
                                    name="surchargePercentDebit"
                                    onBlur={surchargeFormik.handleBlur}
                                    onChange={surchargeFormik.handleChange}
                                    value={
                                      surchargeFormik.values
                                        .surchargePercentDebit
                                    }
                                  />
                                  <span
                                    className="fontstylerentmodal"
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                    }}
                                  >
                                    %
                                  </span>
                                </div>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Grid>
                      </Tab>
                      <Tab
                        eventKey="ach"
                        title={
                          <span
                            className={
                              key === "ach"
                                ? "text-blue-color"
                                : "text-blue-color"
                            }
                            style={{ fontWeight: "600",textDecoration:"underline" }}
                          >
                            ACH
                          </span>
                        }
                      >
                        {/* <Grid className="ach-tab"> */}
                        <Row className="">
                          <span
                            className="fontstylerentr titleecolor text-blue-color fontfamilysty text-start"
                            style={{
                              fontWeight: "500",
                              fontSize: "16px",
                            }}
                          >
                            You can set default ACH percentage or ACH flat fee
                            or both from here
                          </span>
                        </Row>
                        <Row className="mt-3">
                          <Col lg="4">
                            <FormGroup check>
                              <label
                                className="form-control-label d-flex gap-1 fontstylerentr titleecolor fontfamilysty"
                                style={{
                                  fontWeight: "500",
                                  fontSize: "16px",
                                }}
                              >
                                <Input
                                  type="radio"
                                  name="achOption"
                                  checked={achOption === 1}
                                  onChange={() => setAchOption(1)}
                                />
                                Add ACH surcharge percentage
                              </label>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="mt-1">
                          <Col lg="8">
                            <FormGroup check>
                              <label
                                className="form-control-label d-flex gap-1 fontstylerentr titleecolor fontfamilysty text-start"
                                style={{
                                  fontWeight: "500",
                                  fontSize: "16px",
                                }}
                              >
                                <Input
                                  type="radio"
                                  name="achOption"
                                  checked={achOption === 2}
                                  onChange={() => setAchOption(2)}
                                />
                                Add ACH flat fee
                              </label>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row className="mt-2">
                          <Col lg="6">
                            <FormGroup check>
                              <label
                                className="form-control-label fontstylerentr titleecolor fontfamilysty text-start"
                                style={{
                                  fontWeight: "500",
                                  fontSize: "16px",
                                }}
                              >
                                <Input
                                  type="radio"
                                  name="achOption"
                                  checked={achOption === 3}
                                  onChange={() => setAchOption(3)}
                                />{" "}
                                Add both ACH surcharge percentage and flat fee
                              </label>
                            </FormGroup>
                          </Col>
                        </Row>

                        {achOption === 1 && (
                          <Row className="mt-3">
                            <Col lg="4">
                              <FormGroup>
                                <label
                                  className="form-control-label fontstylerentr textcolorblue fontfamilysty mb-3 text-start"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                  }}
                                >
                                  ACH Surcharge Percent
                                </label>
                                <div
                                  style={{
                                    position: "relative",
                                    width: "70%",
                                  }}
                                >
                                  <Input
                                    style={{
                                      boxShadow: "0px 4px 4px 0px #00000040",
                                      borderRadius: "6px",
                                    }}
                                    className="form-control-alternative fontstylerentmodal custom-input"
                                    placeholder="Enter surcharge %"
                                    type="number"
                                    name="surchargePercentACH"
                                    onBlur={surchargeFormik.handleBlur}
                                    onChange={surchargeFormik.handleChange}
                                    value={
                                      surchargeFormik.values.surchargePercentACH
                                    }
                                    required
                                  />
                                  <span
                                    className="fontstylerentmodal"
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                    }}
                                  >
                                    %
                                  </span>
                                </div>
                              </FormGroup>
                            </Col>
                          </Row>
                        )}

                        {achOption === 2 && (
                          <Row className="mt-3">
                            <Col lg="4">
                              <FormGroup>
                                <label
                                  className="form-control-label fontstylerentr textcolorblue fontfamilysty mb-3 text-start"
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                  }}
                                >
                                  ACH Flat Fee
                                </label>
                                <Input
                                  style={{
                                    width: "70%",
                                    boxShadow: "0px 4px 4px 0px #00000040",
                                    borderRadius: "6px",
                                  }}
                                  className="form-control-alternative fontstylerentmodal custom-input"
                                  placeholder="Enter flat fee"
                                  type="number"
                                  name="surchargeFlatACH"
                                  onBlur={surchargeFormik.handleBlur}
                                  onChange={surchargeFormik.handleChange}
                                  value={
                                    surchargeFormik.values.surchargeFlatACH
                                  }
                                  required
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        )}

                        {achOption === 3 && (
                          <>
                            <Row className="mt-3">
                              <Col lg="4">
                                <FormGroup>
                                  <label
                                    className="form-control-label fontstylerentr textcolorblue fontfamilysty mb-3 text-start"
                                    style={{
                                      fontWeight: "500",
                                      fontSize: "16px",
                                    }}
                                  >
                                    ACH Surcharge Percent
                                  </label>
                                  <div
                                    style={{
                                      position: "relative",
                                      width: "70%",
                                    }}
                                  >
                                    <Input
                                      style={{
                                        boxShadow: "0px 4px 4px 0px #00000040",
                                        borderRadius: "6px",
                                      }}
                                      className="form-control-alternative fontstylerentmodal custom-input"
                                      placeholder="Enter surcharge %"
                                      type="number"
                                      name="surchargePercentACH"
                                      onBlur={surchargeFormik.handleBlur}
                                      onChange={surchargeFormik.handleChange}
                                      value={
                                        surchargeFormik.values
                                          .surchargePercentACH
                                      }
                                      required
                                    />
                                    <span
                                      className="fontstylerentmodal"
                                      style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                      }}
                                    >
                                      %
                                    </span>
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col lg="8">
                                <FormGroup>
                                  <label
                                    className="form-control-label fontstylerentr textcolorblue fontfamilysty mb-3 text-start"
                                    style={{
                                      fontWeight: "500",
                                      fontSize: "16px",
                                    }}
                                  >
                                    ACH Flat Fee
                                  </label>
                                  <Input
                                    style={{
                                      width: "35%",
                                      boxShadow: "0px 4px 4px 0px #00000040",
                                      borderRadius: "6px",
                                    }}
                                    className="form-control-alternative fontstylerentmodal custom-input"
                                    placeholder="Enter flat fee"
                                    type="number"
                                    name="surchargeFlatACH"
                                    onBlur={surchargeFormik.handleBlur}
                                    onChange={surchargeFormik.handleChange}
                                    value={
                                      surchargeFormik.values.surchargeFlatACH
                                    }
                                    required
                                  />
                                </FormGroup>
                              </Col>
                            </Row>
                          </>
                        )}
                        {/* </Grid> */}
                      </Tab>
                    </Tabs>
                  </div>

                  <Grid className="mt-5 d-flex gap-2">
                    {submitLoader ? (
                      <Button
                        type="submit"
                        className="btn btn-primary bg-blue-color fontstylerentr background-colorsty bgtextwhite "
                        disabled
                      >
                        Loading...
                      </Button>
                    ) : (
                      <BlueButton
                        type="submit"
                        className="btn fontstylerentr background-colorsty bgtextwhite fontfamilysty "
                        style={{
                          fontWeight: "500",
                          fontSize: "15px",
                          marginLeft:"10px"
                        }}
                        label={surchargeId ? "Update" : "Save"}
                      />
                    )}

                    <BlueButton
                      className="btn fontstylerentr backgroundwhitesty textcolorblue fontfamilysty "
                      onClick={surchargeFormik.resetForm}
                      type="button"
                      style={{
                        border: "1px solid #152B51",
                        fontWeight: "500",
                        fontSize: "15px",
                        marginLeft:"10px"
                      }}
                      label="Reset"
                    />
                  </Grid>
                </Form>
              </Grid>
            </Col>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default Surcharge;
