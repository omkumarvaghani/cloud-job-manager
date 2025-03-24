import React from "react";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormGroup,
  Input,
  Label,
  Table,
} from "reactstrap";
import client from "../../../../../assets/White-sidebar-icon/Customer.svg";
import clientcontact from "../../../../../assets/White-sidebar-icon/Home.svg";
import Address from "../../../../../components/Address";
import InputText from "../../../../../components/InputFields/InputText";
import { Row, Col } from "react-bootstrap";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import BlueButton from "../../../../../components/Button/BlueButton";
import WhiteButton from "../../../../../components/Button/WhiteButton";

import SettingSidebar from "../../../../../components/Setting/SettingSidebar";
import { LoaderComponent } from "../../../../../components/Icon/Index";
// import "./style.css";
import moment from "moment";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const Index = ({
  formik,
  handleChange,
  loader,
  countries,
  selectedCountry,
  setSelectedCountry,
  handlePhoneChange,
  isEdited,
  CompanyName,
  handleZipChange,
  times,
  handleSave,
  handleTimeChange,
  handleOpenDialog,
  handleCloseDialog,
  handleCheckboxChange,
  isChecked,
  open,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <Grid className="d-flex">
        <Col className=" col-2 h-100 hiren" xl={2}>
          <SettingSidebar />
        </Col>
        <Col
          className=" product-service-table col-10  addProductServiceSideLine productRemove"
          style={{
            borderLeft: "0.5px solid rgba(6, 49, 100, 30%)",
            paddingLeft: "20px",
            marginTop: "-30px",
          }}
          xl={10}
        >
          <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
            <Grid className="d-flex align-items-center text-white-color">
              <Button
                style={{
                  marginRight: "10px",
                  width: "50px",
                  height: "40px",
                  marginBottom: "10px",
                  padding: "0px 0px",
                  borderRadius: "4px",
                }}
                onClick={() => {
                  // navigate(-1);
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
                className="text-capitalize bg-button-blue-color"
              >
                <ArrowBackOutlinedIcon />
              </Button>
              <Typography
                className="text-blue-color heading-two mb-2 edit_customer_function"
                style={{ fontWeight: 700, fontSize: "30px" }}
              >
                Company settings
              </Typography>
            </Grid>
            <Card
              className="my-2 col-12 p-4 border-blue-color"
              style={{ borderRadius: "20px" }}
            >
              <Grid style={{}} className="client-main customerSevenFlex">
                <Row
                  className="col-lg-12 col-md-12 CustomerRightRemove"
                  //   style={{ paddingRight: "20px" }}
                >
                  <Col>
                    <CardTitle
                      tag="Typography"
                      className="text-blue-color"
                      style={{
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
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
                      Customer details
                    </CardTitle>

                    <Grid className="my-4 mb-0">
                      <InputText
                        value={formik?.values?.FirstName}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[A-Za-z\s]*$/.test(value)) {
                            handleChange(e);
                          }
                        }}
                        onBlur={formik?.handleBlur}
                        error={
                          formik?.touched?.FirstName &&
                          Boolean(formik?.errors?.FirstName)
                        }
                        helperText={
                          formik?.touched?.FirstName &&
                          formik?.errors?.FirstName
                        }
                        name="FirstName"
                        placeholder="Enter Company Name"
                        label="Company Name"
                        type="text"
                        className="text-blue-color w-100 mb-3 "
                        fieldHeight="56px"
                      />
                    </Grid>

                    <Grid className=" mb-0">
                      <InputText
                        value={formik?.values?.PhoneNumber}
                        onChange={handlePhoneChange}
                        onBlur={formik?.handleBlur}
                        error={
                          formik?.touched?.PhoneNumber &&
                          Boolean(formik?.errors?.PhoneNumber)
                        }
                        helperText={
                          formik?.touched?.PhoneNumber &&
                          formik?.errors?.PhoneNumber
                        }
                        name="PhoneNumber"
                        id="PhoneNumber"
                        placeholder="Enter phone number"
                        label="PhoneNumber"
                        type="text"
                        className="text-blue-color w-100 mb-3"
                        fieldHeight="56px"
                      />
                    </Grid>
                    <Grid className=" mb-0 lastnametxt lastnamemb">
                      <InputText
                        value={formik?.values?.LastName}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[A-Za-z\s]*$/.test(value)) {
                            handleChange(e);
                          }
                        }}
                        onBlur={formik?.handleBlur}
                        error={
                          formik?.touched?.LastName &&
                          Boolean(formik?.errors?.LastName)
                        }
                        helperText={
                          formik?.touched?.LastName && formik?.errors?.LastName
                        }
                        name="LastName"
                        placeholder="Enter website URL"
                        label="Website URL"
                        type="text"
                        className="text-blue-color w-100 customerTopHere"
                        fieldHeight="56px"
                      />
                    </Grid>
                    <Grid className="my-2 mb-0 lastnametxt">
                      <InputText
                        value={formik?.values?.EmailAddress}
                        onChange={handleChange}
                        onBlur={formik?.handleBlur}
                        error={
                          formik?.touched.EmailAddress &&
                          Boolean(formik?.errors?.EmailAddress)
                        }
                        helperText={
                          formik?.touched?.EmailAddress &&
                          formik?.errors?.EmailAddress
                        }
                        name="EmailAddress"
                        id="EmailAddress"
                        placeholder="Enter mail address"
                        label="Email Address"
                        type="email"
                        className="text-blue-color w-100 customerTopHere"
                        fieldHeight="56px"
                      />
                    </Grid>
                  </Col>
                </Row>
                <Row
                  className=" col-lg-12 col-md-12 mt-3 CustomerRightRemove"
                  //   style={{ paddingRight: "12px" }}
                >
                  <Col>
                    <CardTitle
                      tag="Typography"
                      className="text-blue-color heading-five"
                      style={{
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
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
                        }}
                      >
                        <img src={clientcontact} alt="Property Details" />
                      </Grid>
                      <span className="" style={{ fontSize: "16pxx" }}>
                        Property details
                      </span>
                    </CardTitle>
               
                    {!location?.state?.id ||
                    (location?.state?.id &&
                      formik?.values?.location?.length <= 1) ? (
                      <Grid className="my-4 mb-0 px-0">
                        <Address
                          setSelectedCountry={setSelectedCountry}
                          selectedCountry={selectedCountry}
                          countries={countries}
                          handleChange={handleChange}
                          formik={formik}
                          handleZipChange={handleZipChange}
                        />
                      </Grid>
                    ) : (
                      <Grid
                        className="my-4 mb-0 px-0 customerAddMOdel"
                        style={{ width: "98%" }}
                      >
                        <Card
                          style={{ backgroundColor: "rgb(216, 231, 238)" }}
                          className="w-100 d-flex flex-row justify-content-center align-items-start py-3 px-0 mx-0"
                        >
                          <Grid
                            style={{ width: "15%", minHeight: "100%" }}
                            className="d-flex align-items-start justify-content-center"
                          >
                            <LightbulbOutlinedIcon
                              style={{
                                color: "rgb(42, 79, 97)",
                                height: "50px",
                              }}
                            />
                          </Grid>
                          <Grid
                            style={{ borderLeft: "1px solid rgb(42, 79, 97)" }}
                          >
                            <CardHeader
                              className="border-0 d-flex align-items-center"
                              style={{
                                backgroundColor: "rgb(216, 231, 238)",
                              }}
                            >
                              This Customer has multiple properties
                            </CardHeader>
                            <CardBody>
                              Multiple properties can only edited inGrididually.
                              To edit a property, select if from the Customer's
                              list of properties.
                            </CardBody>
                          </Grid>
                        </Card>
                        <FormGroup className="py-3" check inline>
                          <Input
                            type="checkbox"
                            name="billing_same_property"
                            checked={formik?.values?.billing_same_property}
                            onChange={handleChange}
                          />
                          <Label
                            check
                            style={{
                              color: "rgba(6, 49, 100, 70%)",
                              fontSize: "12px",
                            }}
                          >
                            Billing address is the same as property address
                          </Label>
                        </FormGroup>
                      </Grid>
                    )}
                  </Col>
                </Row>
              </Grid>
              <Grid>
                <Grid className="sub-Grid">
                  <Typography
                    className="text-blue-color labor labor-top"
                    style={{ fontWeight: 700, fontSize: "18px" }}
                  >
                    Schedule
                  </Typography>

                  <Typography
                    className="text-blue-color labor labor-top"
                    style={{ fontWeight: 600, fontSize: "16px" }}
                  >
                    Business hours
                  </Typography>
                  <Typography className="text-blue-color labor labor-top">
                    Business hours set your default availability for online
                    booking, team members, and request forms.
                  </Typography>
                </Grid>
                <Grid className="mt-4 d-flex justify-content-between align-items-start manageTeamTimeScheduleFlex">
                  {/* Scrollable container for the table */}
                  <Grid style={{ width: "424px", overflowX: "auto" }}>
                    <Table className="w-100">
                      {/* <TableBody>
                        {Object.keys(times).map((day) => (
                          <tr key={day}>
                            <td>{day}</td>
                            <td colSpan={2}>
                              {!isChecked[day]
                                ? "Unavailable" // ✅ If unchecked, show "Unavailable" in full row
                                : `${moment(times[day].start).format(
                                    "hh:mm A"
                                  )} - ${moment(times[day].end).format(
                                    "hh:mm A"
                                  )}`}
                            </td>
                          </tr>
                        ))}
                      </TableBody> */}
                      <TableBody>
                        {Object.keys(times).map((day) => (
                          <tr key={day}>
                            <td>{day}</td>
                            <td colSpan={2}>
                              {!isChecked[day] ||
                              !times[day].start ||
                              !times[day].end
                                ? "Unavailable"
                                : `${moment(times[day].start).format(
                                    "hh:mm A"
                                  )} - ${moment(times[day].end).format(
                                    "hh:mm A"
                                  )}`}
                            </td>
                          </tr>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>

                  {/* Edit button */}
                  <Button className="editBtnRightSide">
                    <Typography
                      style={{ borderBottom: "2px solid" }}
                      className="border-blue-color"
                      onClick={handleOpenDialog}
                    >
                      Edit
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
              <Grid
                className="d-flex justify-content-between button-responsive BlueAndWhiteBtmFlex saveBrnGap"
                style={{ marginTop: "70px" }}
              >
                <Grid>
                  <WhiteButton
                    onClick={() => navigate(-1)}
                    label="Cancel"
                    className=""
                  />
                </Grid>
                {loader ? (
                  <LoaderComponent
                    height="20"
                    width="20"
                    padding="20"
                    loader={loader}
                  />
                ) : (
                  <Grid
                    className="gap-3 d-flex  "
                    style={{
                      paddingRight: "25px",
                    }}
                  >
                    <BlueButton
                      className=""
                      onClick={formik?.handleSubmit}
                      style={{
                        fontSize: "16px",
                        opacity: isEdited ? 1 : 0.5,
                      }}
                      disabled={!isEdited}
                      label={"Update Setting"}
                    />
                  </Grid>
                )}
              </Grid>
            </Card>
          </Grid>
        </Col>
      </Grid>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        className="client"
        maxWidth="md"
      >
        <DialogTitle style={{ fontSize: "20px" }} className="borerBommoModel">
          <Grid className="w-100 d-flex justify-content-start align-items-center">
            <Typography
              className="text-blue-color text-property heading-four "
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "42px",
                margin: "0 10px",
              }}
            >
              Edit Schedule
            </Typography>
          </Grid>
        </DialogTitle>
        <Divider
          style={{
            height: "1px",
            backgroundColor: "rgba(42, 79, 97, 0.8)",
            minWidth: "400px",
          }}
        />
        <DialogContent style={{ minWidth: "400px", overflowX: "auto" }}>
          <form>
            {Object.keys(times).map((day) => (
              <Grid className="d-flex align-items-center my-3" key={day}>
                <Col className="col-4 d-flex" xl={4}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(day)}
                      checked={isChecked[day]}
                    />
                    <Label check>{day}</Label>
                  </FormGroup>
                </Col>
                <Col className="col-8 d-flex gap-1" xl={8}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Start Time"
                      value={isChecked[day] ? dayjs(times[day].start) : null}
                      onChange={handleTimeChange(day, "start")}
                      disabled={!isChecked[day]} // ✅ Checkbox unchecked ho to disable
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <TimePicker
                      label="End Time"
                      value={isChecked[day] ? dayjs(times[day].end) : null}
                      onChange={handleTimeChange(day, "end")}
                      disabled={!isChecked[day]} // ✅ Checkbox unchecked ho to disable
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Col>
              </Grid>
            ))}
          </form>
        </DialogContent>
        <DialogActions
          className="editScheduleModelBox  justify-content-between "
          style={{ minWidth: "400px", marginLeft: "10px" }}
        >
          <WhiteButton
            className=""
            style={{
              backgroundColor: "#fff",
              border: "1px solid rgba(6, 49, 100, 0.8)",
              color: "rgba(6, 49, 100, 1)",
            }}
            onClick={handleCloseDialog}
            label="Cancel"
          />
          <BlueButton
            className="bg-button-blue-color createButton"
            style={{ color: "#fff", marginRight: "19px" }}
            onClick={() => {
              handleSave();
              handleCloseDialog();
            }}
            label="Save"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Index;
