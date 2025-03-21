import React from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  Table,
  TabPane,
} from "reactstrap";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import clientdetails from "../../../../assets/White-sidebar-icon/Customer.svg";
import { Box, CircularProgress } from "@mui/material";
import OverView from "../OverView/OverView";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CustomerProperty from "../Customer-Property";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
} from "../../../../components/Icon/Index";
import "./style.css";
import { Grid } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton";
import AllDropdown from "../../../../components/Dropdown/Dropdown";
import { Typography } from "@mui/material";
import WhiteButton from "../../../../components/Button/WhiteButton";
import ContactImage from "../../../../assets/Blue-sidebar-icon/Contact.svg";
import CustomerEmail from "../../../../assets/Blue-sidebar-icon/CustomerEmail.svg";
import BillingHistory from "../Transaction/BillingHistory";
import RecurringCharges from "../RecurringCharges/RecurringCharge";
import RecurringPayments from "../RecurringPayments/RecurringPayments";

const CustomerDetails = ({
  loader,
  navigate,
  data,
  dropdownOpen,
  CompanyName,
  CompanyId,
  location,
  setModelOpen,
  handleMainClick,
  activeTabIdMain,
  handleEditClick,
  setOpen,
  handlePropertyDelete,
  open,
  modelOpen,
  getData,
  loading,
  sendMail,
  toggleDropdown,
  menuItems,
  showPreview,
  closePreview,
  selectedFormat,
  previewFile,
  downloadFile,
  csvData,
  collectSignatureLoader,
}) => {
  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center Typography-5 m-5"
          style={{ height: "80vh", marginTop: "25%" }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
        <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
          <Grid className="d-flex align-items-center justify-content-between">
            <Button
              style={{
                marginRight: "10px",
                width: "50px",
                height: "40px",
                marginBottom: "10px",
                padding: "0px 0px",
                borderRadius: "4px",
                marginTop: "10px",
              }}
              onClick={() => {    
                navigate(
                  `/${
                    CompanyName
                      ? CompanyName + "/customer"
                      : "staff-member" + "/workercustomer"
                  }`,
                  {
                    state: {
                      navigats: location?.state?.navigats.filter(
                        (item) => item !== "/customer"
                      ),
                    },
                  }
                );
              }}   
              className="text-capitalize bg-button-blue-color text-white-color "
            >    
              <ArrowBackOutlinedIcon />
            </Button>
            <Grid className="d-flex">
              <AllDropdown
                isOpen={dropdownOpen}
                toggle={toggleDropdown}
                menuItems={menuItems}
              />
            </Grid>
          </Grid>

          <Card>
            <CardHeader>
              <Grid
                className="customer-header"
                style={{
                  justifyContent: "space-between",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Grid
                  className=" text-blue-color costomerUserName "
                  style={{
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    fontSize: "38px",
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
                    <img src={clientdetails} />
                  </Grid>
                  {data?.FirstName ? data?.FirstName : "-"}&nbsp;
                  {data?.LastName ? data?.LastName : "-"}
                </Grid>
                <Grid className="customer-detail-sec">
                  <Typography className="mb-2 ">
                    <img src={ContactImage} />
                    {data?.PhoneNumber ? (
                      <a
                        className="text-blue-color"
                        style={{
                          textDecoration: "none",
                          fontSize: "14px",
                          paddingLeft: "8px",
                          fontWeight: 500,
                        }}
                        href={`tel:${data?.PhoneNumber}`}
                      >
                        {data?.PhoneNumber || "PhoneNumber not available"}
                      </a>
                    ) : (
                      "-"
                    )}
                  </Typography>
                  <Typography>
                    <img src={CustomerEmail} />

                    {data?.EmailAddress ? (
                      <a
                        className="text-blue-color"
                        style={{
                          textDecoration: "none",
                          fontSize: "14px",
                          paddingLeft: "8px",
                          fontWeight: 500,
                        }}
                        href={`tel:${data?.EmailAddress}`}
                      >
                        {data?.EmailAddress || "EmailAddress not available"}
                      </a>
                    ) : (
                      "-"
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </CardHeader>
            <CardBody>
              <Grid>
                <Nav
                  className="main-tab border-blue-color text-blue-color"
                  tabs
                  style={{
                    display: "flex",
                    overflowX: "auto",
                  }}
                >
                  <NavItem>
                    <NavLink
                      className={`nav-link text-blue-color ${
                        activeTabIdMain === 1 ? "active" : ""
                      }`}
                      onClick={() => handleMainClick(1)}
                      style={{ cursor: "pointer" }}
                    >
                      Summary
                    </NavLink>
                  </NavItem>
                  {CompanyId ? (
                    <>
                    <NavItem>
                    <NavLink
                      className={`nav-link text-blue-color ${
                        activeTabIdMain === 2 ? "active" : ""
                      }`}
                      onClick={() => handleMainClick(2)}
                      style={{ cursor: "pointer" }}
                    >
                      Recurring Charge
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={`nav-link text-blue-color ${
                        activeTabIdMain === 3 ? "active" : ""
                      }`}
                      onClick={() => handleMainClick(3)}
                      style={{ cursor: "pointer" }}
                    >
                      Recurring Payment
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={`nav-link text-blue-color ${
                        activeTabIdMain === 5 ? "active" : ""
                      }`}
                      onClick={() => handleMainClick(5)}
                      style={{ cursor: "pointer" }}
                    >
                      General Ledger
                    </NavLink>
                  </NavItem>
                </>
                  ) : (
                    
                    <Typography style={{ display: "none" }}> </Typography>
                   
                  )}
                </Nav>
              </Grid>
              <TabContent
                style={{ padding: "15px 1px 0px 0px" }}
                activeTab={activeTabIdMain}
                className="text-start"
              >
                <TabPane tabId={1}>
                  <Grid>
                    <Grid>
                      <Grid
                        className="my-2 detail-card flexForDetail"
                        style={{ border: "none", gap: "12px" }}
                      >
                        <Col
                          xs={12}
                          sm={6}
                          md={12}
                          lg={12}
                          className="first-card add_new_pxroperty_card"
                        >
                          <Grid
                            className="address propertyAddBoxScroll p-2 border-blue-color"
                            style={{
                              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                              borderRadius: "8px",
                              border: "0.5px solid ",
                            }}
                          >
                            <CardHeader
                              className="d-flex justify-content-between align-items-center property_addNew"
                              style={{ border: "none" }}
                            >
                              <Typography
                                style={{ fontWeight: 600 }}
                                className="text-blue-color property_tag heading-five"
                              >
                                Properties
                              </Typography>

                              <Grid className="plusNewPropertyToAddPPro ">
                                <BlueButton
                                  className="bg-button-blue-color "
                                  style={{
                                    padding: "3px 10px 3px 10px",
                                    fontSize: "14px",
                                  }}
                                  onClick={() =>
                                    setOpen({
                                      isOpen: true,
                                      propertyData: null,
                                    })
                                  }
                                  label="+ New Property"
                                />
                              </Grid>
                            </CardHeader>
                            <CardBody className="card-body client-details property_addNew boxScrollHEre">
                              <Table
                                borderless
                                className="propertyTableAndItScroll"
                              >
                                <TableHead>
                                  <TableRow className="dataCollapsHere">
                                    <TableCell
                                      className="fw-bold text-blue-color"
                                      style={{
                                        paddingLeft: "20px",
                                        fontSize: "16px",
                                      }}
                                    >
                                      Address
                                    </TableCell>
                                    <TableCell
                                      className="text-center fw-bold text-blue-color"
                                      style={{ fontSize: "16px" }}
                                    >
                                      City
                                    </TableCell>
                                    <TableCell
                                      className="text-center fw-bold text-blue-color"
                                      style={{ fontSize: "16px" }}
                                    >
                                      State
                                    </TableCell>
                                    <TableCell
                                      className="text-center fw-bold text-blue-color"
                                      style={{ fontSize: "16px" }}
                                    >
                                      Country
                                    </TableCell>
                                    <TableCell
                                      className="text-center fw-bold text-blue-color"
                                      style={{ fontSize: "16px" }}
                                    >
                                      Zip
                                    </TableCell>
                                    {CompanyName && (
                                      <TableCell
                                        className="fw-bold text-blue-color"
                                        style={{
                                          textAlign: "center",
                                          fontSize: "16px",
                                        }}
                                      >
                                        Actions
                                      </TableCell>
                                    )}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {data?.location?.map((property, index) => (
                                    <TableRow
                                      style={{
                                        cursor: "pointer",
                                        width: "318px",
                                      }}
                                      key={index}
                                      onClick={() => {
                                        if (CompanyName) {
                                          navigate(
                                            `/${CompanyName}/property-details`,
                                            {
                                              state: {
                                                id: property.LocationId,
                                                navigats: [
                                                  ...location.state.navigats,
                                                  "/property-details",
                                                ],
                                              },
                                            }
                                          );
                                        } else {
                                          navigate(
                                            `/staff-member/worker-property-details`,
                                            {
                                              state: {
                                                id: property.LocationId,
                                                navigats: [
                                                  ...location.state.navigats,
                                                  "/worker-property-details",
                                                ],
                                              },
                                            }
                                          );
                                        }
                                      }}
                                    >
                                      <TableCell
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          paddingLeft: "20px",
                                        }}
                                      >
                                        <MyLocationIcon
                                          className="text-blue-color"
                                          style={{ marginRight: "15px" }}
                                        />
                                        <Typography
                                          className="text-blue-color"
                                          style={{ fontSize: "14px" }}
                                        >
                                          {property?.Address || "Address not available"}
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        className="text-center text-blue-color"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {property.City || "City not available"}
                                      </TableCell>
                                      <TableCell
                                        className="text-center text-blue-color"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {property.State || "State not available"}
                                      </TableCell>
                                      <TableCell
                                        className="text-center text-blue-color"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {property.Country || "Country not available"}
                                      </TableCell>
                                      <TableCell
                                        className="text-center text-blue-color"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {property.Zip || "Zip not available"}
                                      </TableCell>

                                      <TableCell
                                        style={{
                                          whiteSpace: "nowrap",
                                          textAlign: "center",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <EditIcon
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick();
                                            setOpen({
                                              isOpen: true,
                                              propertyData: property,
                                            });
                                          }}
                                        />
                                        <DeleteIcone
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePropertyDelete(
                                              property.LocationId
                                            );
                                          }}
                                          className="customerEditImgToEdit"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardBody>
                          </Grid>
                        </Col>
                      </Grid>
                    </Grid>
                    <Grid>
                      <OverView />
                    </Grid>
                  </Grid>
                </TabPane>
              </TabContent>
              <TabContent
                activeTab={activeTabIdMain}
                className="text-start"
                style={{ padding: "1px 1px 0px 0px" }}
              >
                <TabPane tabId={2} className="p-0">
                  <RecurringCharges />
                </TabPane>
              </TabContent>
              <TabContent
                activeTab={activeTabIdMain}
                className="text-start"
                style={{ padding: "1px 1px 0px 0px" }}
              >
                <TabPane tabId={3} className="p-0">
                  <RecurringPayments />
                </TabPane>
              </TabContent>

              <TabContent
                activeTab={activeTabIdMain}
                className="text-start"
                style={{ padding: "1px 1px 0px 0px" }}
              >
                <TabPane tabId={5} className="p-0">
                  <Col
                    md={12}
                    className="first-card contact_info_histort"
                    style={{ paddingLeft: "15px" }}
                  >
                    {!collectSignatureLoader && !loader && (
                      <BillingHistory data={data} getData={getData} />
                    )}
                  </Col>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Grid>
      )}
      <CustomerProperty
        open={open}
        setOpen={setOpen}
        data={data}
        getData={getData}
      />

      <Dialog
        fullWidth
        open={modelOpen}
        onClose={() => setModelOpen(false)}
        PaperProps={{
          style: {
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          className="colorBlue"
          style={{
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Please Confirm
        </DialogTitle>
        <DialogContent
          dividers
          style={{
            padding: "30px",
            borderTop: "4px solid #e88c44",
            textAlign: "center",
          }}
        >
          <Grid container spacing={3} className="mailConfigurationBox">
            <Grid item xs={12}>
              <Typography
                className="text-blue-color"
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#333",
                }}
              >
                Are you sure you want to resend the
                <strong>Customer Hub login invitation</strong> to:
                <Typography
                  component="span"
                  style={{
                    fontWeight: "bold",
                    marginLeft: "5px",
                  }}
                  className="text-orange-color"
                >
                  {data?.EmailAddress || "the customer's email"}
                </Typography>
                ?
                <br />
                <Typography
                  style={{
                    fontSize: "14px",
                    color: "#555",
                    marginTop: "10px",
                    display: "block",
                  }}
                >
                  Note: Ensure the email address is correct before proceeding.
                </Typography>
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                display: "flex",
                justifyContent: "end",
              }}
              className="mailSendConfiguration"
            >
              {loading ? (
                <Grid className="d-flex justify-content-end">
                  <LoaderComponent
                    height="20"
                    width="20"
                    padding="20"
                    loader={loader}
                  />
                </Grid>
              ) : (
                <>
                  <Button
                    className="text-blue-color border-blue-color nogoback"
                    style={{
                      fontSize: "14px",
                      color: "#063164",
                      border: "1px solid #063164",
                      background: "#fff",
                      textTransform: "none",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    onClick={() => setModelOpen(false)}
                  >
                    No, Go Back
                  </Button>
                  <Button
                    className="bg-blue-color mailSendYesComonent"
                    style={{
                      fontSize: "14px",
                      color: "#fff",
                      textTransform: "none",
                      marginLeft: "15px",
                      backgroundColor: "#063164",
                      border: "none",
                      boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.15)",
                      transition: "all 0.3s ease",
                    }}
                    onClick={sendMail}
                  >
                    Yes, Send Mail
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <Grid></Grid>
    </>
  );
};

export default CustomerDetails;
