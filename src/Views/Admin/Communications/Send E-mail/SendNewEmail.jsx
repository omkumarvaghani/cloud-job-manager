import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Row,
} from "reactstrap";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import * as Yup from "yup";
import "./style.css";
import { Checkbox, ListItemText, MenuItem, Select, Grid } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import AxiosInstance from "../../../AxiosInstance";
import client from "../../../../assets/White-sidebar-icon/Send E-Mail.svg";
import TemplateEditor from "../TemplateEditor";
import InputText from "../../../../components/InputFields/InputText";
import WhiteButton from "../../../../components/Button/WhiteButton";
import BlueButton from "../../../../components/Button/BlueButton";
import { WhiteLoaderComponent } from "../../../../components/Icon/Index";
import showToast from "../../../../components/Toast/Toster";

const eventTypes = {
  "Reset Password": [
    { "${Url}": "Reset password link" },
    { "${EmailAddress}": "E-mail Address" },
  ],
  Invitation: [
    { "${FirstName}": "Receiver FirstName Name" },
    { "${LastName}": "Receiver LastName Name" },
    { "${EmailAddress}": "Receiver Email Address" },
    { "${PhoneNumber}": "Receiver Phone Number" },
    { "${CompanyName}": "Company Name" },
    { "${EmailAddress}": "Company E-mail Address" },
    { "${companyPhoneNumber}": "Company Phone Number" },
    { "${Url}": "Set Password Link" },
  ],
  Quote: [
    { "${FirstName}": "Receiver FirstName Name" },
    { "${LastName}": "Receiver LastName Name" },
    { "${EmailAddress}": "Receiver Email Address" },
    { "${PhoneNumber}": "Receiver Phone Number" },
    { "${CompanyName}": "Company Name" },
    { "${EmailAddress}": "Company E-mail Address" },
    { "${companyPhoneNumber}": "Company Phone Number" },
    { "${Title}": "Quote Title" },
    { "${QuoteNumber}": "Quote Number" },
    { "${SubTotal}": "Quote Sub Total" },
    { "${Discount}": "Quote Discount" },
    { "${Tax}": "Quote Tax" },
    { "${Total}": "Quote Total" },
  ],
  Contract: [
    { "${FirstName}": "Receiver FirstName Name" },
    { "${LastName}": "Receiver LastName Name" },
    { "${EmailAddress}": "Receiver Email Address" },
    { "${PhoneNumber}": "Receiver Phone Number" },
    { "${CompanyName}": "Company Name" },
    { "${EmailAddress}": "Company E-mail Address" },
    { "${companyPhoneNumber}": "Company Phone Number" },
    { "${Title}": "Contract Title" },
    { "${ContractNumber}": "Contract Number" },
    { "${SubTotal}": "Contract Sub Total" },
    { "${Discount}": "Contract Discount" },
    { "${Tax}": "Contract Tax" },
    { "${Total}": "Contract Total" },
  ],
  Invoice: [
    { "${FirstName}": "Receiver FirstName Name" },
    { "${LastName}": "Receiver LastName Name" },
    { "${EmailAddress}": "Receiver Email Address" },
    { "${PhoneNumber}": "Receiver Phone Number" },
    { "${CompanyName}": "Company Name" },
    { "${EmailAddress}": "Company E-mail Address" },
    { "${companyPhoneNumber}": "Company Phone Number" },
    { "${Subject}": "Invoice Title" },
    { "${InvoiceNumber}": "Invoice Number" },
    { "${SubTotal}": "Invoice Sub Total" },
    { "${Discount}": "Invoice Discount" },
    { "${Tax}": "Invoice Tax" },
    { "${Total}": "Invoice Total" },
  ],
  "Invoice Payment": [
    { "${FirstName}": "Receiver FirstName Name" },
    { "${LastName}": "Receiver LastName Name" },
    { "${EmailAddress}": "Receiver Email Address" },
    { "${PhoneNumber}": "Receiver Phone Number" },
    { "${CompanyName}": "Company Name" },
    { "${EmailAddress}": "Company E-mail Address" },
    { "${companyPhoneNumber}": "Company Phone Number" },
    { "${Total}": "Total Amount" },
    { "${Amount}": "Paid Amount" },
    { "${Method}": "Paid Method" },
  ],
};

const Sendmails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const CompanyId = localStorage.getItem("CompanyId");

  const [loader, setLoader] = useState(false);
  const [customerData, setCustomerData] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      if (location.state?.EmailId) {
        try {
          const response = await AxiosInstance.get(
            `/emails/get/${location.state.EmailId}`
          );
          if (response?.data.statusCode === 200) {
            emailFormik.setValues(response?.data.email);
          }
        } catch (error) {
          console.error("Error fetching email: ", error);
        }
      }

      if (location.state?.selectedCustomers) {
        setSelectedCustomers(location.state.selectedCustomers);
      }

      if (localStorage.getItem("CompanyId")) {
        try {
          const response = await AxiosInstance.get(
            `/customer/get-all/${localStorage.getItem("CompanyId")}`
          );
          if (response?.data.statusCode) {
            if (location.state?.selectedCustomers) {
              setCustomerData(
                response?.data?.data?.filter((item) =>
                  location.state.selectedCustomers.includes(item.CustomerId)
                )
              );
            } else {
              setCustomerData(response?.data?.data);
            }
          }
        } catch (error) {
          console.error("Error fetching customers data: ", error);
        }
      }
    };

    fetchData();
  }, [location.state?.EmailId, location.state?.selectedCustomers]);

  const emailFormik = useFormik({
    initialValues: {
      Subject: "",
      Body: "",
      attachment: "",
      MailType: "",
      CompanyId: localStorage.getItem("CompanyId"),
    },
    validationSchema: Yup.object({
      Subject: Yup.string().required("Subject is required!"),
      Body: Yup.string().required("Body is required!"),
    }),
    onSubmit: async (values) => {
      setLoader(true);

      try {
        var response = await AxiosInstance.post("/email-log", {
          ...values,
          CompanyId,
          CustomerId: selectedCustomers[0] || null,
          customers: selectedCustomers,
        });
        if (response?.data.statusCode === 200) {
          showToast.success(response?.data.message, {
            position: "top-center",
            autoClose: 800,
          });
          navigate(navigate(-1));
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

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;

    if (value.includes("select-all")) {
      if (selectedCustomers.length === customerData.length) {
        setSelectedCustomers([]);
      } else {
        setSelectedCustomers(
          customerData.map((customer) => customer.CustomerId)
        );
      }
    } else {
      setSelectedCustomers(
        typeof value === "string" ? value.split(",") : value
      );
    }
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customerData.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customerData.map((customer) => customer.CustomerId));
    }
  };

  const fetchTemplate = async () => {
    if (emailFormik.values.MailType) {
      try {
        const response = await AxiosInstance.get(
          `/template/get/${localStorage.getItem("CompanyId")}/${
            emailFormik.values.MailType
          }`
        );

        if (response?.data.statusCode === 200) {
          emailFormik.setFieldValue("Subject", response?.data.template.Subject);
          emailFormik.setFieldValue("Body", response?.data.template.Body);
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [emailFormik.values.MailType]);

  return (
    <>
      <Container
        className="stylecontainer pt-5"
        fluid
        style={{ marginTop: "2rem" }}
      >
        <Button
          style={{
            width: "50px",
            height: "40px",
            padding: "0px 0px",
            borderRadius: "4px",
            marginLeft: "8px",
          }}
          onClick={() => {
            navigate(-1);
          }}
          className="text-capitalize bg-button-blue-color"
        >
          <ArrowBackOutlinedIcon />
        </Button>
        <Row className="mt-3">
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
                    padding: "12px 10px 9px 10px",

                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <img src={client} alt="Client Details" />
                </Grid>
                Add New E-mail
              </CardTitle>
              <CardBody>
                <Form onSubmit={emailFormik.handleSubmit}>
                  <Grid className="mt-3 d-flex gap-2 send-mail">
                    <Col
                      lg="4"
                      xl="4"
                      md="5"
                      sm="12"
                      xs="12"
                      className="send-mail-input"
                    >
                      <FormGroup className="d-flex flex-column">
                        <Select
                          labelId="user-select-label"
                          id="user-select"
                          multiple
                          value={selectedCustomers}
                          onChange={handleChange}
                          displayEmpty
                          renderValue={(selected) => {
                            if (selected.length === 0) {
                              return "Select Customers";
                            }
                            return selected
                              ?.map((id) => {
                                const user = customerData.find(
                                  (user) => user.CustomerId === id
                                );
                                return user
                                  ? `${user?.FirstName || ""} ${
                                      user?.LastName || ""
                                    }`
                                  : "";
                              })
                              .join(", ");
                          }}
                          className="text-blue-color"
                          sx={{
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #063164",
                            borderRadius: "4px",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#063164",
                              border: "none",
                            },
                          }}
                        >
                          <MenuItem
                            key="select-all"
                            value="select-all"
                            className="text-blue-color"
                            onClick={handleSelectAll}
                          >
                            <Checkbox
                              checked={
                                selectedCustomers.length === customerData.length
                              }
                              className="text-blue-color"
                            />
                            <ListItemText primary="Select All" />
                          </MenuItem>

                          {customerData.length > 0 &&
                            customerData.map((item) => (
                              <MenuItem
                                className="text-blue-color"
                                key={item.CustomerId}
                                value={item.CustomerId}
                              >
                                <Checkbox
                                  checked={
                                    selectedCustomers.indexOf(item.CustomerId) >
                                    -1
                                  }
                                  className="text-blue-color"
                                />
                                <ListItemText
                                  primary={`${item?.FirstName || ""} ${
                                    item?.LastName || ""
                                  }`}
                                />
                              </MenuItem>
                            ))}
                        </Select>
                      </FormGroup>
                    </Col>
                    <Col
                      lg="4"
                      xl="4"
                      md="5"
                      sm="5"
                      xs="12"
                      className="send-mail-input"
                    >
                      <FormGroup>
                        <InputText
                          className="form-control-alternative w-100 text-blue-color fontstylerentmodal titleecolor"
                          id="template-name"
                          type="text"
                          name="Subject"
                          autoComplete="off"
                          placeholder="Enter subject"
                          label="Subject"
                          onBlur={emailFormik.handleBlur}
                          onChange={emailFormik.handleChange}
                          value={emailFormik.values.Subject}
                        />
                      </FormGroup>
                    </Col>
                    {!location.state?.lease_id ? (
                      <Col
                        lg="4"
                        xl="4"
                        md="5"
                        sm="5"
                        xs="12"
                        className="send-mail-input"
                      >
                        <FormGroup
                          className="d-flex third-input-mail flex-column border-blue-color"
                          style={{ paddingRight: "15px" }}
                        >
                          <Select
                            labelId="user-select-label"
                            id="user-select"
                            value={emailFormik.values.MailType}
                            onChange={(e) => {
                              if (e.target.value) {
                                emailFormik.setFieldValue(
                                  "MailType",
                                  e.target.value
                                );
                              } else {
                                emailFormik.setFieldValue("MailType", "");
                              }
                            }}
                            displayEmpty
                            renderValue={(selected) => {
                              return selected || "Select Event";
                            }}
                            className="text-blue-color"
                            sx={{
                              height: "48px",
                              display: "flex",
                              alignItems: "center",
                              border: "1px solid #063164",
                              borderRadius: "4px",
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#063164",
                                  border: "none",
                                },
                            }}
                          >
                            {eventTypes?.customer.length > 0 &&
                              eventTypes?.customer?.map((item, index) => (
                                <MenuItem key={index} value={item.title}>
                                  <ListItemText primary={item?.title || ""} />
                                </MenuItem>
                              ))}
                          </Select>
                        </FormGroup>
                      </Col>
                    ) : (
                      <Col
                        lg="4"
                        xl="3"
                        md="5"
                        sm="5"
                        xs="12"
                        className="send-mail-input"
                      >
                        <FormGroup className="d-flex flex-column">
                          <label
                            className="form-control-label fontstylerentr titleecolor fontfamilysty mb-2"
                            htmlFor="email-type"
                            style={{
                              fontWeight: "500",
                              fontSize: "16px",
                            }}
                          >
                            Event Type
                          </label>

                          <Select
                            labelId="user-select-label"
                            id="user-select"
                            value={emailFormik.values.mail_type}
                            onChange={(e) => {
                              if (e.target.value) {
                                emailFormik.setFieldValue(
                                  "mail_type",
                                  e.target.value
                                );
                              } else {
                                emailFormik.setFieldValue("mail_type", "");
                              }
                            }}
                            displayEmpty
                            renderValue={(selected) => {
                              return selected || "Select Event";
                            }}
                          >
                            {eventTypes?.customer.length > 0 &&
                              eventTypes?.customer?.map((item, index) => (
                                <MenuItem key={index} value={item.title}>
                                  <ListItemText primary={item?.title || ""} />
                                </MenuItem>
                              ))}
                          </Select>
                        </FormGroup>
                      </Col>
                    )}
                  </Grid>

                  <Row className="mt-3">
                    <Col>
                      <TemplateEditor
                        data={emailFormik.values.Body}
                        setData={(value) => {
                          emailFormik.setFieldValue("body", value);
                        }}
                        setLoader={setLoader}
                        isToolTip={true}
                        type={emailFormik.values.MailType}
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
                      onClick={() => navigate(navigate(-1))}
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
      </Container>
    </>
  );
};

export default Sendmails;
