import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Form,
  FormGroup,
  Row,
} from "reactstrap";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import { useFormik } from "formik/dist";
import * as Yup from "yup";
import client from "../../../assets/White-sidebar-icon/template.svg";
import "./TemplateEditor.css";
import TemplateEditor from "./TemplateEditor";
import { ListItemText, MenuItem, Select, Grid } from "@mui/material";
import AxiosInstance from "../../AxiosInstance";
import { WhiteLoaderComponent } from "../../../components/Icon/Index";
import BlueButton from "../../../components/Button/BlueButton";
import InputText from "../../../components/InputFields/InputText";
import WhiteButton from "../../../components/Button/WhiteButton";
import showToast from "../../../components/Toast/Toster";

const AddTemplates = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [loader, setLoader] = useState(false);
  const CompanyId = localStorage.getItem("CompanyId");

  const mails = [
    { title: "Reset Password", detail: "" },
    { title: "Invitation", detail: "" },
    { title: "Quote", detail: "" },
    { title: "Contract", detail: "" },
    { title: "Invoice", detail: "" },
    { title: "Invoice Payment", detail: "" },
    { title: "Recurring Payment", detail: "" },
  ];

  const templateFormik = useFormik({
    initialValues: {
      Name: "",
      Subject: "",
      Body: "",
      Type: "E-mail",
      MailType: "",
    },
    validationSchema: Yup.object({
      Name: Yup.string().required("Name is required!"),
      Subject: Yup.string().required("Subject is required!"),
      Body: Yup.string().required("Body is required!"),
      Type: Yup.string().required("Type is required!"),
      MailType: Yup.string().required("Mail type is required!"),
    }),
    onSubmit: async (values) => {
      try {
        setLoader(true);
        if (!location?.state?.id) {
          var response = await AxiosInstance.post("/template", {
            ...values,
            CompanyId: CompanyId,
          });
        } else {
          response = await AxiosInstance.put(
            `/template/${location?.state?.id}`,
            {
              ...values,
              CompanyId: CompanyId,
            }
          );
        }

        if (response?.data.statusCode === 200) {
          showToast.success(response?.data.message, {
            position: "top-center",
            autoClose: 800,
          });

          setTimeout(() => {
            navigate(-1);
          }, 1000);
        } else {
          showToast.error(response?.data.message, {
            position: "top-center",
          });
        }
      } catch (error) {
        console.error("Error: ", error);
      } finally {
        setLoader(false);
      }
    },
  });

  const fetchData = async () => {
    if (location?.state?.id) {
      try {
        const response = await AxiosInstance.get(
          `/template/get/${location?.state?.id}`
        );

        if (response?.data.statusCode === 200) {
          templateFormik.setValues(response?.data.template);
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    }
    setLoader(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (templateFormik.dirty) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [templateFormik.dirty]);

  return (
    <>
      <Container
        className="stylecontainer pt-5"
        fluid
        style={{ marginTop: "2rem" }}
      >
        {/* <Button
          style={{
            width: "50px",
            height: "40px",
            padding: "0px 0px",
            borderRadius: "4px",
            marginLeft: "8px",
          }}
          onClick={() => {
            navigate(
              `/${
                CompanyName
                  ? CompanyName + "/templates"
                  : "staff-member" + "/workertemplates"
              }`,
              {
                state: {
                  navigats: location?.state?.navigats.filter(
                    (item) => item !== "/templates"
                  ),
                },
              }
            );
          }}
          className="text-capitalize bg-button-blue-color"
        >
          <ArrowBackOutlinedIcon />
        </Button> */}
        <Button
          style={{
            width: "50px",
            height: "40px",
            padding: "0px 0px",
            borderRadius: "4px",
            marginLeft: "8px",
          }}
          onClick={() => {
            if (templateFormik.dirty) {
              const confirmLeave = window.confirm(
                "You have unsaved changes. Are you sure you want to leave?"
              );
              if (!confirmLeave) {
                return; 
              }
            }
            navigate(
              `/${
                CompanyName
                  ? CompanyName + "/templates"
                  : "staff-member" + "/workertemplates"
              }`,
              {
                state: {
                  navigats: location?.state?.navigats.filter(
                    (item) => item !== "/templates"
                  ),
                },
              }
            );
          }}
          className="text-capitalize bg-button-blue-color"
        >
          <ArrowBackOutlinedIcon />
        </Button>
        <div className="mt-3">
          <Row className="">
            <Col className="order-xl-1" xl="12">
              <Card
                className="mx-2 mb-3"
                style={{
                  borderRadius: "10px",
                  border: "1px solid #324567",
                  boxShadow: "0px 4px 4px 0px #00000040",
                }}
              >
                <CardTitle
                  tag="Typography"
                  className="text-blue-color"
                  style={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    padding: "20px",
                  }}
                >
                  <Grid
                    className="bg-blue-color"
                    style={{
                      borderRadius: "50%",
                      marginRight: "10px",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <img src={client} alt="Client Details" />
                  </Grid>
                  Add Templates
                </CardTitle>
                <CardBody>
                  <Form onSubmit={templateFormik.handleSubmit}>
                    <Row>
                      <Col lg="4" xl="4" md="5" sm="5" xs="12">
                        <FormGroup>
                          <InputText
                            className="form-control-alternative w-100 fontstylerentmodal titleecolor"
                            id="template-name"
                            type="text"
                            name="Name"
                            autoComplete="off"
                            placeholder="Enter name"
                            label="Name"
                            onBlur={templateFormik.handleBlur}
                            onChange={templateFormik.handleChange}
                            value={templateFormik.values.Name}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="4" xl="4" md="5" sm="5" xs="12">
                        <FormGroup>
                          <InputText
                            className="form-control-alternative w-100 fontstylerentmodal titleecolor"
                            id="template-name"
                            type="text"
                            name="Subject"
                            autoComplete="off"
                            placeholder="Enter subject"
                            label="Subject"
                            onBlur={templateFormik.handleBlur}
                            onChange={templateFormik.handleChange}
                            value={templateFormik.values.Subject}
                          />
                        </FormGroup>
                      </Col>
                      {templateFormik.values.Type === "E-mail" ? (
                        <Col lg="4" xl="4" md="5" sm="5" xs="12">
                          <FormGroup className="d-flex flex-column text-blue-color">
                            <Select
                              labelId="user-select-label"
                              id="user-select"
                              value={templateFormik.values.MailType}
                              onChange={(e) => {
                                if (e.target.value) {
                                  templateFormik.setFieldValue(
                                    "MailType",
                                    e.target.value
                                  );
                                }
                              }}
                              className="text-blue-color"
                              sx={{
                                height: "38px",
                                display: "flex",
                                alignItems: "center",
                              }}
                              displayEmpty
                              renderValue={(selected) => {
                                return selected || "Select Event";
                              }}
                            >
                              {mails?.length > 0 &&
                                mails?.map((item, index) => (
                                  <MenuItem
                                    className="text-blue-color"
                                    key={index}
                                    value={item.title}
                                  >
                                    <ListItemText primary={item?.title || ""} />
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormGroup>
                        </Col>
                      ) : (
                        <Col lg="4" xl="4" md="5" sm="5" xs="12">
                          <FormGroup>
                            <label
                              className="form-control-label fontstylerentr titleecolor fontfamilysty"
                              htmlFor="sms-type"
                              style={{
                                fontWeight: "500",
                                fontSize: "16px",
                              }}
                            >
                              SMS Type
                            </label>
                          </FormGroup>
                        </Col>
                      )}
                    </Row>

                    <Row className="mt-3">
                      <Col>
                        <TemplateEditor
                          data={templateFormik.values.Body}
                          setData={(value) => {
                            templateFormik.setFieldValue("Body", value);
                          }}
                          setLoader={setLoader}
                          isToolTip={true}
                          type={templateFormik.values.MailType}
                        />
                      </Col>
                    </Row>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "space-between",
                      }}
                      className="mt-3"
                    >
                      <WhiteButton
                        style={{
                          height: "38px",
                          marginTop: "13px",
                        }}
                        onClick={() => {
                          navigate(-1);
                        }}
                        variant="outline"
                        label="Cancel"
                      />
                      <BlueButton
                        className="mt-3 bg-button-blue-color"
                        id="payButton"
                        type="submit"
                        style={{ color: "white" }}
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
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
};

export default AddTemplates;
