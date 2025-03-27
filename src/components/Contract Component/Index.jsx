import {
  Box,
  FormGroup,
  Table,
  TextField,
  Typography,
  Select,
  MenuItem,
  TableCell,
  TableRow,
  TableBody,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import AxiosInstance from "../../Views/AxiosInstance";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../Login/Auth";
import NoData from "../../assets/image/NoData.svg";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TabContent,
  TabPane,
} from "reactstrap";
import InputText from "../InputFields/InputText";
import { DisplayImage } from "../Files/DisplayFiles";
import { Files } from "../Files";
import { Watch } from "react-loader-spinner";
import "./style.css";
import { Grid } from "@mui/material";
import { Row } from "react-bootstrap";
import showToast from "../Toast/Toster";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import BlueButton from "../Button/BlueButton";
import WhiteButton from "../Button/WhiteButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LoaderComponent } from "../Icon/Index";
import styled from "styled-components";
const InternalNotes = ({
  notes,
  setNotes,
  attachments,
  setAttachments,
  noBorder,
}) => {
  // const handleNoteChange = (event) => {
  //   setNotes(event?.target?.value);
  // };

  const handleNoteChange = (event) => {
    let value = event?.target?.value;
    if (value.length === 1 && value.startsWith(" ")) {
      return;
    }

    setNotes(value);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event?.target?.files);
    setAttachments((prev) => [...prev, ...files]);
  };
  return (
    <>
      <Card
        style={{
          border: noBorder ? "none" : "1px solid black",
          padding: "15px",
          borderRadius: "10px",
        }}
        className="border-blue-color"
      >
        <Typography
          className="text-blue-color internal-notes"
          style={{ fontWeight: 600 }}
        >
          Internal notes and attachments <HelpOutlineOutlinedIcon />
        </Typography>
        <Grid
          className=""
          style={{
            borderRadius: "10px",
          }}
        >
          <TextField
            className="note-details mt-3 text-blue-color border-blue-color"
            name="note"
            label="Note details"
            value={notes}
            onChange={handleNoteChange}
            defaultValue=""
            type="text"
            id="outlined-multiline-static"
            placeholder="Enter notes"
            multiline
            rows={3}
          />
          <Files
            files={attachments}
            setFiles={(value) => setAttachments(value)}
          />
          <DisplayImage
            files={attachments}
            setFiles={(value) => setAttachments(value)}
            IsDeleted={true}
          />
          {/* <hr /> */}
          {/* <Grid>
            <Typography
              style={{ fontSize: "14px" }}
              className="text-blue-color mb-2"
            >
              Link note to related
            </Typography>
            <FormGroup check>
              <Grid className="d-flex gap-2 align-items-center">
                <Input
                  type="checkbox"
                  className="text-blue-color"
                  style={{ marginTop: 0 }}
                />
                <Label
                  className="text-blue-color"
                  style={{ fontSize: "15px", marginBottom: 0 }}
                  check
                >
                  Invoices
                </Label>
              </Grid>
            </FormGroup>
          </Grid> */}
        </Grid>
      </Card>
    </>
  );
};
const OneOffContract = ({
  formik,
  isCalendarVisible,
  setIsCalendarVisible,
}) => {
  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  const handleStartDateChange = (e) => {
    const startDate = e?.target?.value;
    formik.setFieldValue("OneoffJob.StartDate", startDate);

    if (
      formik?.values?.OneoffJob?.EndDate &&
      startDate > formik?.values?.OneoffJob?.EndDate
    ) {
      formik.setFieldValue("OneoffJob.EndDate", startDate);
    }
  };

  const handleEndDateChange = (e) => {
    const endDate = e?.target?.value;
    if (
      formik?.values?.OneoffJob?.StartDate &&
      endDate >= formik?.values?.OneoffJob?.StartDate
    ) {
      formik.setFieldValue("OneoffJob.EndDate", endDate);
    } else if (
      formik?.values?.OneoffJob?.StartDate &&
      endDate < formik?.values?.OneoffJob?.StartDate
    ) {
      formik.setFieldValue(
        "OneoffJob.EndDate",
        formik?.values?.OneoffJob?.StartDate
      );
    }
  };

  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;
    formik.setFieldValue("OneoffJob.StartTime", startTime);

    if (
      formik?.values?.OneoffJob?.EndTime &&
      startTime > formik?.values?.OneoffJob?.EndTime
    ) {
      formik.setFieldValue("OneoffJob.EndTime", startTime);
    }
  };

  const handleEndTimeChange = (e) => {
    const endTime = e.target.value;
    if (
      formik?.values?.OneoffJob?.StartTime &&
      endTime >= formik?.values?.OneoffJob?.StartTime
    ) {
      formik.setFieldValue("OneoffJob.EndTime", endTime);
    } else if (
      formik?.values?.OneoffJob?.StartTime &&
      endTime < formik?.values?.OneoffJob?.StartTime
    ) {
      formik?.setFieldValue(
        "OneoffJob.EndTime",
        formik?.values?.OneoffJob?.StartTime
      );
    }
  };

  return (
    <Col
      className="col-md-4 col-lg-12 col-sm-12 first-tab "
      md={4}
      lg={12}
      sm={12}
    >
      <TabContent
        activeTab={1}
        className="text-start my-3 mx-0"
        style={{ padding: "2px" }}
      >
        <TabPane tabId={1}>
          <Col sm="12" className="d-flex">
            <Card className="mx-0 border-blue-color" style={{ width: "100%" }}>
              <CardHeader
                className="d-flex justify-content-between calenderHead_HideBtn"
                style={{
                  width: "100%",
                  alignItems: "center",
                  padding: "0 10px 0 10px",
                  borderBottom: "none",
                }}
              >
                <Typography
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                  }}
                  className="my-3 text-blue-color calender_head recurringScheTitle"
                >
                  One off Contract Schedule
                </Typography>
                <Typography className="btngotoright">
                  <BlueButton
                    className="btnhideFor"
                    style={{
                      padding: "0 14px 0 14px",
                      fontSize: "12px",
                      marginTop: 0,
                      height: "32px",
                      borderRadius: "2px",
                    }}
                    onClick={toggleCalendarVisibility}
                    label={
                      isCalendarVisible ? "Hide Calendar " : "Show Calendar"
                    }
                  />
                </Typography>
              </CardHeader>
              <CardBody>
                <Row className="d-flex flex-wrap row start-end-date mb-2">
                  {/* Start Date */}
                  <FormGroup className="col-sm-12 col-md-6 start-date d-flex flex-column mb-3 mb-md-0">
                    <Label htmlFor="startDate" className="mt-2 text-blue-color">
                      Start Date
                    </Label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["DatePicker"]}>
                        {/* <DatePicker
                          label="Start Date"
                          value={
                            formik?.values?.OneoffJob?.StartDate &&
                            dayjs(
                              formik?.values?.OneoffJob?.StartDate
                            ).isValid()
                              ? dayjs(formik?.values?.OneoffJob?.StartDate)
                              : null
                          }
                          onChange={(value) => {
                            const startDate =
                              value && dayjs(value).isValid()
                                ? value.toISOString()
                                : null;
                            formik.setFieldValue(
                              "OneoffJob.StartDate",
                              startDate
                            );
                            if (
                              formik?.values?.OneoffJob?.EndDate &&
                              new Date(startDate) >
                                new Date(formik?.values?.OneoffJob?.EndDate)
                            ) {
                              formik.setFieldValue("OneoffJob.EndDate", null);
                            }
                          }}
                          onBlur={formik?.handleBlur}
                          sx={{
                            width: "100%",
                            minWidth: "250px", // Minimum width to prevent shrinking
                            "& .MuiInputBase-root": { borderRadius: "8px" },
                            "& .MuiInputBase-input": { color: "#063164" },
                            "& .MuiInputLabel-root": { color: "#063164" },
                            "& .MuiSvgIcon-root": { color: "#063164" },
                          }}
                        /> */}
                        <DatePicker
                          label="Start Date"
                          value={
                            formik?.values?.OneoffJob?.StartDate &&
                            dayjs(
                              formik?.values?.OneoffJob?.StartDate
                            ).isValid()
                              ? dayjs(formik?.values?.OneoffJob?.StartDate)
                              : null
                          }
                          onChange={(value) => {
                            const startDate =
                              value && dayjs(value).isValid()
                                ? value.toISOString()
                                : null;
                            formik.setFieldValue(
                              "OneoffJob.StartDate",
                              startDate
                            );
                            if (
                              formik?.values?.OneoffJob?.EndDate &&
                              new Date(startDate) >
                                new Date(formik?.values?.OneoffJob?.EndDate)
                            ) {
                              formik.setFieldValue("OneoffJob.EndDate", null);
                            }
                          }}
                          onBlur={formik?.handleBlur}
                          sx={{
                            width: "100%",
                            minWidth: "250px",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#063164", // ✅ Default #063164 border
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#063164", // ✅ Hover par bhi #063164
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#063164", // ✅ Focus hone par bhi red
                                },
                            },
                            "& .MuiInputBase-input": { color: "#063164" },
                            "& .MuiInputLabel-root": { color: "#063164" },
                            "& .MuiSvgIcon-root": { color: "#063164" },
                          }}
                        />
                      </DemoContainer>
                      {formik?.touched?.OneoffJob?.StartDate &&
                        formik?.errors?.OneoffJob?.StartDate && (
                          <Typography
                            style={{
                              color: "red",
                              marginLeft: "10px",
                              fontSize: "13px",
                            }}
                          >
                            {formik?.errors?.OneoffJob?.StartDate}
                          </Typography>
                        )}
                    </LocalizationProvider>
                  </FormGroup>

                  {/* End Date */}
                  <FormGroup className="col-sm-12 col-md-6 end-date d-flex flex-column">
                    <Label htmlFor="endDate" className="mt-2">
                      End Date (optional)
                    </Label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["DatePicker"]}>
                        <DatePicker
                          label="End Date"
                          value={
                            formik?.values?.OneoffJob?.EndDate &&
                            dayjs(formik?.values?.OneoffJob?.EndDate).isValid()
                              ? dayjs(formik?.values?.OneoffJob?.EndDate)
                              : null
                          }
                          onChange={(value) => {
                            const endDate =
                              value && dayjs(value).isValid()
                                ? value.toISOString()
                                : null;
                            if (
                              formik?.values?.OneoffJob?.StartDate &&
                              new Date(endDate) >=
                                new Date(formik?.values?.OneoffJob?.StartDate)
                            ) {
                              formik.setFieldValue(
                                "OneoffJob.EndDate",
                                endDate
                              );
                            } else {
                              formik.setFieldValue("OneoffJob.EndDate", null);
                            }
                          }}
                          onBlur={formik?.handleBlur}
                          minDate={
                            formik?.values?.OneoffJob?.StartDate
                              ? dayjs(formik?.values?.OneoffJob?.StartDate)
                              : undefined
                          }
                          sx={{
                            width: "100%",
                            minWidth: "250px",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#063164", // ✅ Default #063164 border
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#063164", // ✅ Hover par bhi #063164
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#063164", // ✅ Focus hone par bhi red
                                },
                            },
                            "& .MuiInputBase-input": { color: "#063164" },
                            "& .MuiInputLabel-root": { color: "#063164" },
                            "& .MuiSvgIcon-root": { color: "#063164" },
                          }}
                        />
                      </DemoContainer>
                      {formik?.touched?.OneoffJob?.EndDate &&
                        formik?.errors?.OneoffJob?.EndDate && (
                          <Typography
                            style={{
                              color: "red",
                              marginLeft: "10px",
                              fontSize: "13px",
                            }}
                          >
                            {formik?.errors?.OneoffJob?.EndDate}
                          </Typography>
                        )}
                    </LocalizationProvider>
                  </FormGroup>
                </Row>

                <Label htmlFor="startTime" className="text-blue-color mt-2">
                  Start Time & End Time
                </Label>

                <Grid
                  className="d-flex time-section mb-2"
                  style={{ width: "100%" }}
                >
                  <Col
                    className="col-6 border-blue-color"
                    style={{
                      borderBottomLeftRadius: "10px",
                      border: "1px solid rgba(6, 49, 100, 30%)",
                      borderTopLeftRadius: "10px",
                    }}
                  >
                    <Input
                      id="startTime"
                      placeholder="Start time"
                      type="time"
                      name="OneoffJob.StartTime"
                      className="text-blue-color border-blue-color boxShadowNone"
                      onChange={handleStartTimeChange}
                      value={formik?.values?.OneoffJob?.StartTime}
                      style={{
                        fontSize: "14px",
                        border: "none",
                        borderBottomLeftRadius: "10px",
                        borderTopLeftRadius: "10px",
                        height: "40px",
                      }}
                    />
                  </Col>
                  <Col
                    className="col-6 border-blue-color"
                    style={{
                      borderBottomRightRadius: "10px",
                      borderTopRightRadius: "10px",
                      border: "1px solid rgba(6, 49, 100, 30%)",
                      borderLeft: "none",
                    }}
                  >
                    <Input
                      id="EndTime"
                      placeholder="Start time"
                      type="time"
                      name="OneoffJob.EndTime"
                      onChange={handleEndTimeChange}
                      value={formik?.values?.OneoffJob?.EndTime}
                      style={{
                        fontSize: "14px",
                        border: "none",
                        borderBottomRightRadius: "14px",
                        borderTopRightRadius: "14px",
                        height: "40px",
                      }}
                      className="boxShadowNone"
                    />
                  </Col>
                </Grid>
                <Label htmlFor="Repeats" className="mt-2">
                  Repeats
                </Label>
                <Input
                  type="select"
                  name="OneoffJob.Repeats"
                  className="text-blue-color border-blue-color"
                  onChange={(e) => {
                    formik?.handleChange(e);
                  }}
                  value={formik?.values?.OneoffJob?.Repeats}
                  style={{
                    fontSize: "14px",
                    border: "1px solid rgba(6, 49, 100, 30%)",
                    borderRadius: "10px",
                    fontSize: "12px",
                    height: "40px",
                  }}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </Input>

                <Grid>
                  <FormGroup className="my-3 mb-0 d-flex">
                    <Input
                      type="checkbox"
                      name="OneoffJob.ScheduleLetter"
                      onChange={formik?.handleChange}
                      checked={formik?.values?.OneoffJob?.ScheduleLetter}
                    />
                    <Label
                      className="text-blue-color"
                      style={{
                        fontSize: "12px",
                        color: "rgba(6,49,100,0.7)",
                        fontWeight: "400",
                        marginTop: "5px",
                      }}
                    >
                      Schedule letter
                    </Label>
                  </FormGroup>
                </Grid>
              </CardBody>
            </Card>
          </Col>
        </TabPane>
      </TabContent>
    </Col>
  );
};
const RecurringContract = ({
  formik,
  isCalendarVisible,
  setIsCalendarVisible,
}) => {
  const [duration, setDuration] = useState("");
  const [value, setValue] = useState(6);
  const [lastDate, setLastDate] = useState("");
  const [isCardVisible, setIsCardVisible] = useState(true);
  useEffect(() => {
    if (lastDate && formik?.values?.RecuringJob?.StartDate) {
      calculateTotalVisits(
        formik?.values?.RecuringJob?.StartDate,
        lastDate,
        formik?.values?.RecuringJob?.Repeats
      );
    }
  }, [
    lastDate,
    formik?.values?.RecuringJob?.StartDate,
    formik?.values?.RecuringJob?.Repeats,
  ]);

  const handleStartTimeChange = (e) => {
    const StartTime = e?.target?.value;
    formik?.setFieldValue("RecuringJob.StartTime", StartTime);

    if (
      formik?.values?.RecuringJob?.EndTime &&
      StartTime > formik?.values?.RecuringJob?.EndTime
    ) {
      formik.setFieldValue("RecuringJob.EndTime", StartTime);
    }
  };
  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible);
    setIsCardVisible(!isCardVisible);
  };

  const handleEndTimeChange = (e) => {
    const EndTime = e.target.value;
    formik?.setFieldValue("RecuringJob.EndTime", EndTime);

    if (
      formik?.values?.RecuringJob?.StartTime &&
      EndTime < formik?.values?.RecuringJob?.StartTime
    ) {
      formik.setFieldValue("RecuringJob.StartTime", EndTime);
    }
  };

  const handleDurationChange = (e) => {
    const newDuration = e?.target?.value;
    setDuration(newDuration);
    calculateFutureDate(
      value,
      newDuration,
      formik?.values?.RecuringJob?.StartDate
    );
    calculateTotalVisits(
      formik?.values?.RecuringJob?.StartDate,
      lastDate,
      formik?.values?.RecuringJob?.Repeats
    );
    formik.setFieldValue("RecuringJob.Duration", newDuration);
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    formik.setFieldValue("RecuringJob.Frequency", newValue);
  };

  const calculateFutureDate = (num, dur, startDate) => {
    if (num && dur && startDate) {
      const durationNumber = parseInt(num, 10);
      let futureDate;

      switch (dur) {
        case "day(s)":
          futureDate = moment(startDate)?.add(durationNumber, "days");
          break;
        case "week(s)":
          futureDate = moment(startDate)?.add(durationNumber, "weeks");
          futureDate.subtract(1, "days");
          break;
        case "month(s)":
          futureDate = moment(startDate)?.add(durationNumber, "months");
          futureDate.subtract(1, "days");
          break;
        case "year(s)":
          futureDate = moment(startDate)?.add(durationNumber, "years");
          futureDate.subtract(1, "days");
          break;
        default:
          futureDate = moment(startDate);
      }

      setLastDate(futureDate?.format("MMMM DD, YYYY"));
    } else {
      setLastDate("");
    }
  };
  useEffect(() => {
    if (formik?.values?.RecuringJob?.StartDate && duration && value) {
      calculateFutureDate(
        value,
        duration,
        formik?.values?.RecuringJob?.StartDate
      );
    }
  }, [value, duration, formik?.values?.RecuringJob?.StartDate]);

  useEffect(() => {
    if (lastDate && formik?.values?.RecuringJob?.StartDate) {
      const total = calculateTotalVisits(
        formik?.values?.RecuringJob?.StartDate,
        lastDate,
        formik?.values?.RecuringJob?.Repeats
      );
    }
  }, [
    lastDate,
    formik?.values?.RecuringJob?.StartDate,
    formik?.values?.RecuringJob?.Repeats,
  ]);

  const calculateTotalVisits = (startDate, lastDate, Repeats) => {
    if (!startDate || !lastDate) {
      return "-";
    }
    const start = moment(startDate);
    const end = moment(lastDate);

    let totalVisits = 0;
    switch (Repeats) {
      case "Weekly on":
        totalVisits = Math?.floor(end.diff(start, "weeks", true)) + 1;
        break;
      case "Every 2 Weeks on":
        totalVisits = Math?.floor(end.diff(start, "weeks", true) / 2) + 1;
        break;
      case "Monthly on the date":
        totalVisits = Math?.floor(end.diff(start, "months", true)) + 1;
        break;
      default:
        totalVisits = 0;
    }

    return totalVisits > 0 ? totalVisits : "-";
  };

  const [Repeats, setRepeats] = useState(
    formik?.values?.RecuringJob?.Repeats || ""
  );

  const handleRepeatChange = (e) => {
    const selectedValue = e.target.value;
    setRepeats(selectedValue);
    formik.setFieldValue("RecuringJob.Repeats", selectedValue);
  };

  const totalVisits = calculateTotalVisits(
    formik?.values?.RecuringJob?.StartDate,
    lastDate,
    Repeats
  );
  useEffect(() => {
    const durationValue = formik?.values?.RecuringJob?.Duration;

    if (durationValue && formik?.values?.RecuringJob?.StartDate) {
      setDuration(durationValue);
      calculateFutureDate(
        value,
        durationValue,
        formik?.values?.RecuringJob?.StartDate
      );
    }
  }, [
    formik?.values?.RecuringJob?.Duration,
    formik?.values?.RecuringJob?.StartDate,
  ]);

  useEffect(() => {
    if (lastDate && formik.values?.RecuringJob?.StartDate) {
      calculateTotalVisits(
        formik?.values?.RecuringJob?.StartDate,
        lastDate,
        formik?.values?.RecuringJob?.Repeats
      );
    }
  }, [lastDate, formik?.values?.RecuringJob?.StartDate]);

  useEffect(() => {
    const frequency = formik?.values?.RecuringJob?.Frequency;
    if (frequency) {
      setValue(frequency);
    } else {
      setValue(0);
    }
  }, [formik?.values?.RecuringJob?.Frequency]);

  return (
    <Col
      className="col-md-4 col-lg-12 col-sm-12 first-tab mb-2"
      md={4}
      lg={12}
      sm={12}
    >
      <Card className="p-0 border-blue-color">
        <CardHeader
          style={{ display: "flex", justifyContent: "space-between" }}
          className="recurringSchedule_hideCalender"
        >
          <Typography className="calender_head heading-five text-blue-color">
            Recurring Schedule
          </Typography>
          <BlueButton
            className="bg-button-blue-color"
            style={{
              padding: "0 14px 0 14px",
              fontSize: "12px",
              marginTop: 0,
              height: "32px",
              borderRadius: "2px",
            }}
            onClick={toggleCalendarVisibility}
            label={isCalendarVisible ? "Hide Calendarr" : "Show Calendar"}
          />
        </CardHeader>

        <CardBody>
          <FormGroup>
            <Label htmlFor="startDate">Start Date</Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  className="ContrcatWidthDateFormat reccuringStartDate"
                  label="Start Date"
                  value={
                    formik?.values?.RecuringJob?.StartDate &&
                    dayjs(formik?.values?.RecuringJob?.StartDate).isValid()
                      ? dayjs(formik?.values?.RecuringJob?.StartDate)
                      : null
                  }
                  onChange={(value) => {
                    const startDate =
                      value && dayjs(value).isValid()
                        ? value.toISOString()
                        : null;
                    formik.setFieldValue("RecuringJob.StartDate", startDate);
                    if (
                      formik?.values?.RecuringJob?.EndDate &&
                      new Date(startDate) >
                        new Date(formik?.values?.RecuringJob?.EndDate)
                    ) {
                      formik.setFieldValue("RecuringJob.EndDate", null);
                    }
                  }}
                  onBlur={formik?.handleBlur}
                  // sx={{
                  //   "& .MuiInputBase-root": { borderRadius: "8px" },
                  //   "& .MuiInputBase-input": { color: "#063164" },
                  //   "& .MuiInputLabel-root": { color: "#063164" },
                  //   "& .MuiSvgIcon-root": { color: "#063164" },
                  // }}
                  sx={{
                    width: "100%",
                    minWidth: "250px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#063164", // ✅ Default #063164 border
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#063164", // ✅ Hover par bhi #063164
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#063164", // ✅ Focus hone par bhi red
                      },
                    },
                    "& .MuiInputBase-input": { color: "#063164" },
                    "& .MuiInputLabel-root": { color: "#063164" },
                    "& .MuiSvgIcon-root": { color: "#063164" },
                  }}
                />
              </DemoContainer>
              {formik?.touched?.RecuringJob?.StartDate &&
                formik?.errors?.RecuringJob?.StartDate && (
                  <Typography
                    style={{
                      color: "red",
                      marginLeft: "10px",
                      fontSize: "13px",
                    }}
                  >
                    {formik?.errors?.RecuringJob?.StartDate}
                  </Typography>
                )}
            </LocalizationProvider>
          </FormGroup>

          <Label htmlFor="timeRange" className="mt-2">
            Start Time & End Time
          </Label>
          <Grid className="d-flex startEnd_contractTable">
            <Col className="col-6">
              <Input
                id="startTime"
                type="time"
                name="RecuringJob.StartTime"
                className="text-blue-color border-blue-color"
                onChange={handleStartTimeChange}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                value={formik?.values?.RecuringJob?.StartTime}
              />
            </Col>
            <Col className="col-6 contrctEndTimeTopMar">
              <Input
                id="endTime"
                type="time"
                name="RecuringJob.EndTime contractEnd_time "
                className="text-blue-color border-blue-color"
                onChange={handleEndTimeChange}
                style={{
                  borderLeft: "none",
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
                value={formik?.values?.RecuringJob?.EndTime}
              />
            </Col>
          </Grid>
          <FormGroup>
            <Label htmlFor="Repeats" className="mt-2">
              Repeats
            </Label>
            <Input
              type="select"
              className="text-blue-color border-blue-color"
              name="RecuringJob.Repeats"
              onChange={handleRepeatChange}
              value={Repeats}
              style={{ fontSize: "15px" }}
            >
              <option value="">As needed - we won't prompt you</option>
              <option value={`Weekly on`}>
                Weekly on
                {moment(formik?.values?.RecuringJob?.StartDate).format("dddd")}
              </option>
              <option value={`Every 2 Weeks on`}>
                Every 2 Weeks on
                {moment(formik?.values?.RecuringJob?.StartDate).format("dddd")}
              </option>
              <option value={`Monthly on the date`}>
                Monthly on the
                {moment(formik?.values?.RecuringJob?.StartDate).format("Do")} of
                the month
              </option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="duration" className="mt-2">
              Duration
            </Label>
            <Box
              display="flex"
              className="text-blue-color border-blue-color contractDurationInputBox"
              flexDirection="row"
              alignItems="center"
            >
              <TextField
                label=""
                type="number"
                value={value}
                onChange={handleValueChange}
                style={{ width: "80px", marginRight: "10px" }}
                InputProps={{
                  inputProps: { min: 1 },
                }}
                className="text-blue-color border-blue-color durationFIrstBox"
              />
              <Select
                value={duration || ""}
                onChange={handleDurationChange}
                style={{ width: "100%", borderRadius: "10px" }}
                className="text-blue-color border-blue-color durationSecondBox"
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Duration
                </MenuItem>
                <MenuItem className="text-blue-color" value="day(s)">
                  day(s)
                </MenuItem>
                <MenuItem className="text-blue-color" value="week(s)">
                  week(s)
                </MenuItem>
                <MenuItem className="text-blue-color" value="month(s)">
                  month(s)
                </MenuItem>
                <MenuItem className="text-blue-color" value="year(s)">
                  year(s)
                </MenuItem>
              </Select>
            </Box>
          </FormGroup>
          <Grid className="d-flex mt-2">
            <Col
              className="col-4"
              style={{
                borderRight: "0.5px solid rgba(6,49,100, 0.8)",
              }}
              xl={4}
            >
              <Typography
                className="mb-0 text-blue-color"
                color="rgba(6, 49, 100, 30%)"
                style={{ fontSize: "12px" }}
              >
                First
              </Typography>
              <Typography
                className="mb-0 text-blue-color"
                color="rgba(6, 49, 100, 30%)"
                style={{ fontSize: "12px" }}
              >
                {formik?.values?.RecuringJob?.StartDate
                  ? moment(formik?.values?.RecuringJob?.StartDate).format(
                      "MMMM DD, YYYY"
                    )
                  : "-"}
              </Typography>
            </Col>
            <Col
              className="col-4 mx-1"
              style={{
                borderRight: "0.5px solid rgba(6, 49, 100, 0.8)",
              }}
              xl={4}
            >
              <Typography
                className="mb-0 text-blue-color"
                color="rgba(6, 49, 100, 30%)"
                style={{ fontSize: "12px" }}
              >
                Last
              </Typography>
              <Typography
                className="mb-0 text-blue-color"
                color="rgba(6, 49, 100, 30%)"
                style={{ fontSize: "12px" }}
              >
                {lastDate || "-"}
              </Typography>
            </Col>
            <Col className="col-4 mx-1" xl={4}>
              <Typography
                className="mb-0 text-blue-color"
                color="rgba(6, 49, 100, 30%)"
                style={{ fontSize: "12px" }}
              >
                Total
              </Typography>
              <Typography
                className="mb-0 text-blue-color"
                color="rgba(6, 49, 100, 30%)"
                style={{ fontSize: "12px" }}
              >
                {totalVisits || "-"}
              </Typography>
            </Col>
          </Grid>
        </CardBody>
      </Card>
    </Col>
  );
};
const CalendarJOB = ({ isCalendarVisible, setIsCalendarVisible }) => {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setloading] = useState(true);
  const location = useLocation();

  const CustomToolbar = ({ label, onNavigate }) => {
    const goToBack = () => {
      onNavigate("PREV");
    };

    const goToNext = () => {
      onNavigate("NEXT");
    };

    return (
      <Grid className="rbc-toolbar">
        <BlueButton type="button" onClick={goToBack} label="Back" />

        <Typography className="rbc-toolbar-label">{label}</Typography>

        <BlueButton type="button" onClick={goToNext} lable="Next" />
      </Grid>
    );
  };

  const toggleCalendarVisibility = () => {
    setIsCalendarVisible(!isCalendarVisible);
    setIsCardVisible(!isCardVisible);
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const fetchSheduleData = async () => {
    setloading(true);
    try {
      const res = await AxiosInstance.get(
        `/visits/schedule/${localStorage.getItem("CompanyId")}`
      );
      const scheduleData = res.data.data;
      const mappedEvents = scheduleData?.map((item) => ({
        id: item?._id,
        VisitId: item?.VisitId,
        ItemName: item?.ItemName,
        FirstName: item?.FirstName,
        LastName: item?.LastName,
        start: new Date(item?.StartDate),
        end: new Date(item?.EndDate),
        allDay: true,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error:", error?.message);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchSheduleData();
  }, []);
  const calendarRef = useRef(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [isCardVisible, setIsCardVisible] = useState(true);
  const [clickedDate, setClickedDate] = useState(null);
  const navigate = useNavigate();
  const { CompanyName } = useParams();
  const [open, setOpen] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleSlotClick = ({ start }) => {
    const hasEvent = events?.some((event) =>
      moment(event?.start)?.isSame(start, "day")
    );

    if (!hasEvent) {
      setClickedDate(start);
      const { x, y } = mousePosition;
      setAnchorPosition({ top: y, left: x });
    }
  };
  const eventPropGetter = (event) => ({
    style: {
      border: "none",
      color: "black",
      display: "block",
    },
  });
  const handleEventClick = (event) => {
    if (event) {
      setSelectedEvent(event?.extendedProps);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const handlePopoverClose = () => {
    setAnchorPosition(null);
  };

  const renderEventContent = ({ event }) => (
    <Typography>
      <Typography
        style={{ color: "black", fontSize: "smaller", fontWeight: "bold" }}
      >
        {event?.extendedProps?.ItemName}
      </Typography>
    </Typography>
  );

  return (
    <Col className="col-12 mx-2 my-3 mb-0 first-tab" xl={12}>
      <Grid style={{ marginTop: "127px" }} className="calenderHeight">
        {isCalendarVisible && (
          <Grid
            style={{
              position: "relative",
            }}
          >
            {loading && (
              <Grid style={{ position: "absolute", top: "50%", left: "50%" }}>
                <Watch
                  visible={true}
                  height="50"
                  width="50"
                  radius="48"
                  color="#063164"
                  ariaLabel="watch-loading"
                  overflow="hidden"
                />
              </Grid>
            )}
            {isCalendarVisible && (
              <FullCalendar
                plugins={[dayGridPlugin]}
                events={events}
                eventContent={renderEventContent}
                eventClick={(info) => handleEventClick(info?.event)}
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek,dayGridDay",
                }}
                eventPropGetter={eventPropGetter}
                onSelectEvent={handleEventClick}
                onSelectSlot={handleSlotClick}
                popup={true}
                dayMaxEvents={3}
              />
            )}
          </Grid>
        )}
      </Grid>
      <Typography
        open={Boolean(anchorPosition)}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        onClose={handlePopoverClose}
        PaperProps={{
          style: {
            top: anchorPosition ? `${anchorPosition?.top}px` : undefined,
            left: anchorPosition ? `${anchorPosition?.left}px` : undefined,
            position: "absolute",
          },
        }}
      ></Typography>
    </Col>
  );
};

const ClientMessage = ({ formik }) => {
  return (
    <Col className="col-5 order-sm-1 messageinput" xl={5}>
      <FormGroup>
        <InputText
          value={formik?.values?.CustomerMessage}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          error={
            formik?.touched?.CustomerMessage &&
            Boolean(formik?.errors?.CustomerMessage)
          }
          helperText={
            formik?.touched?.CustomerMessage && formik?.errors?.CustomerMessage
          }
          name="CustomerMessage"
          label="CustomerMessage"
          type="text"
          className="text-blue-color w-100 m-0 mb-3"
          fieldHeight="56px"
        />
      </FormGroup>
      <FormGroup>
        <InputText
          value={formik?.values?.ContractDisclaimer}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          error={
            formik?.touched?.ContractDisclaimer &&
            Boolean(formik?.errors?.ContractDisclaimer)
          }
          helperText={
            formik?.touched?.ContractDisclaimer &&
            formik?.errors?.ContractDisclaimer
          }
          name="ContractDisclaimer"
          label="ContractDisclaimer"
          type="text"
          className="text-blue-color w-100 m-0 mb-3"
          fieldHeight="56px"
        />
      </FormGroup>
    </Col>
  );
};

const AddQuoteDiscount = ({ lineItems, formik }) => {
  const [showDiscount, setShowDiscount] = useState(false);
  const [showTax, setShowTax] = useState(false);

  const calculateSubTotal = () => {
    const total = lineItems?.reduce(
      (sum, item) => sum + Number(item.Total || 0),
      0
    );
    return total;
  };

  const subTotal = calculateSubTotal();
  const discountAmount = formik?.values?.Discount
    ? (Number(formik?.values?.Discount) * subTotal) / 100
    : 0;
  const discountedTotal = subTotal - discountAmount;
  const taxAmount = formik?.values?.Tax
    ? (Number(formik?.values?.Tax) * discountedTotal) / 100
    : 0;
  const Total = (discountedTotal + taxAmount)?.toFixed(2);

  return (
    <Col className="col-7 order-sm-2 totalinput" xl={7}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="text-blue-color" style={{ height: "50px" }}>
              Subtotal
            </TableCell>
            <TableCell className="text-end text-blue-color">
              {`$${new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(subTotal ?? 0)}`}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-blue-color" style={{ height: "50px" }}>
              Discount
            </TableCell>
            <TableCell
              className={`d-flex ${
                !showDiscount
                  ? "justify-content-end"
                  : "justify-content-between"
              }`}
            >
              {showDiscount && (
                <Typography
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <InputText
                    value={formik?.values?.Discount}
                    onChange={formik?.handleChange}
                    onBlur={formik?.handleBlur}
                    error={
                      formik?.touched?.Discount &&
                      Boolean(formik?.errors?.Discount)
                    }
                    helperText={
                      formik?.touched?.Discount && formik?.errors?.Discount
                    }
                    name="Discount"
                    label="Discount"
                    type="text"
                    className="text-blue-color w-100 m-0 mb-3"
                    fieldHeight="56px"
                  />
                  <Typography
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                    className="text-blue-color"
                  >
                    %
                  </Typography>
                </Typography>
              )}
              <Typography
                className="text-blue-color underline-u"
                style={{
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "end",
                  marginBottom: "9px",
                }}
                onClick={() => setShowDiscount(!showDiscount)}
              >
                {discountAmount > 0
                  ? `$${discountAmount?.toFixed(2)}`
                  : "Add Discount"}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-blue-color" style={{ height: "50px" }}>
              Tax
            </TableCell>
            <TableCell
              className={`d-flex ${
                !showTax ? "justify-content-end" : "justify-content-between"
              }`}
            >
              {showTax && (
                <Typography
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <InputText
                    value={formik?.values?.Tax}
                    onChange={formik?.handleChange}
                    onBlur={formik?.handleBlur}
                    error={formik?.touched?.Tax && Boolean(formik?.errors?.Tax)}
                    helperText={formik?.touched?.Tax && formik?.errors?.Tax}
                    name="Tax"
                    label="Tax"
                    type="text"
                    className="text-blue-color w-100 m-0 mb-3"
                    fieldHeight="56px"
                  />
                  <Typography
                    className="text-blue-color"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    %
                  </Typography>
                </Typography>
              )}
              <Typography
                className="text-blue-color underline-u"
                style={{
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: "9px",
                }}
                onClick={() => setShowTax(!showTax)}
              >
                {taxAmount > 0 ? `$${taxAmount?.toFixed(2)}` : "Add Tax"}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow className="last-row border-0">
            <TableCell className="border-0 text-blue-color">
              <Typography className="bold-text">Total</Typography>
            </TableCell>
            <TableCell className="text-end border-0 text-blue-color">
              <Typography className="bold-text">${Total}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Col>
  );
};

const Team = ({ setIds = (assignPersonId) => {}, ids, isAddTeam = true }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedState, setCheckedState] = useState(false);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenDecode, setTokenDecode] = useState({});
  const [workerId, setAssignPersonId] = useState([]);
  const [loader, setloader] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchDatas = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDatas();
  }, []);
  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const CompanyId =
        localStorage.getItem("CompanyId") || tokenDecode?.CompanyId;

      if (!CompanyId) {
        console.error("CompanyId is not found in localStorage or tokenDecode.");
        return;
      }

      const response = await AxiosInstance.get(`v1/user/${CompanyId}`);
              
      if (response?.status === 200) {
        setTeamData(response?.data?.data);
      } else {
        console.error("Error fetching team data:", response);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [tokenDecode]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const formikTeam = useFormik({
    initialValues: {
      FullName: "",
      EmailAddress: "",
      MobileNumber: "",
      WorkerId: "",
    },
    validationSchema: Yup.object({
      FullName: Yup.string().required("Full Name is required"),
      EmailAddress: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      MobileNumber: Yup.string()
        .required("Phone number is required")
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "Phone number must be in the format (xxx) xxx-xxxx"
        ),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const CompanyId =
          localStorage.getItem("CompanyId") || tokenDecode?.CompanyId;

        if (!CompanyId) {
          console.error("CompanyId is not found in localStorage");
          return;
        }
        const object = {
          ...values,
          CompanyId: CompanyId,
          WorkerId: values?.WorkerId,
          FullName: values?.FullName,
          EmailAddress: values?.EmailAddress,
          PhoneNumber: values?.MobileNumber,
          AddedAt: new Date(),
          Role:"Worker"
        };

        const response = await AxiosInstance.post(`/v1/user`, object);
        if (response?.data?.statusCode === 200) {
          showToast.success(response?.data?.message);
          toggleModal();
          fetchTeamData();
          formikTeam.resetForm();
        } else if (response?.data?.statusCode === 202) {
          showToast.error(response?.data?.message);
        }
      } catch (error) {
        if (error?.response) {
          console.error(
            "Server responded with an error:",
            error?.response?.data
          );
          setTimeout(() => {
            showToast.error(
              error?.response?.data?.message || "Something went wrong!"
            );
          }, 500);
        } else if (error?.request) {
          console.error("No response received:", error?.request);
          setTimeout(() => {
            showToast.error(
              "No response from the server, please try again later."
            );
          }, 500);
        } else {
          console.error("Error during request setup:", error?.message);
          setTimeout(() => {
            showToast.error("Error occurred while sending request.");
          }, 500);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleRemoveTeam = (team) => {
    setSelectedTeams((prevTeams) =>
      prevTeams.filter(
        (selectedTeam) => selectedTeam?.WorkerId !== team?.WorkerId
      )
    );

    setCheckedState((prevState) => {
      const updatedState = { ...prevState };
      delete updatedState[team?.WorkerId];
      return updatedState;
    });

    setAssignPersonId((prevIds) =>
      prevIds.filter((id) => id !== team?.WorkerId)
    );

    setIds((prevIds) => prevIds.filter((id) => id !== team?.WorkerId));
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOutsideClick = () => {
    toggleDropdown();
  };

  const handleTeamSelect = (event, team) => {
    if (event.target.checked) {
      setSelectedTeams((prevTeams) => [
        ...prevTeams,
        {
          FullName: team?.FullName,
          EmailAddress: team?.EmailAddress,
          WorkerId: team?.WorkerId,
        },
      ]);

      setCheckedState((prevState) => ({
        ...prevState,
        [team?.WorkerId]: true,
      }));

      setIds((prevIds) => [...prevIds, team?.WorkerId]);
      setAssignPersonId((prevIds) => [...prevIds, team?.WorkerId]);
    } else {
      setSelectedTeams((prevTeams) =>
        prevTeams.filter(
          (selectedTeam) => selectedTeam?.WorkerId !== team?.WorkerId
        )
      );

      setCheckedState((prevState) => ({
        ...prevState,
        [team?.WorkerId]: false,
      }));

      setIds((prevIds) => prevIds.filter((id) => id !== team?.WorkerId));
      setAssignPersonId((prevIds) =>
        prevIds.filter((id) => id !== team?.WorkerId)
      );
    }
  };
  const formatPhoneNumber = (value) => {
    const PhoneNumber = value.replace(/[^\d]/g, "");
    const limitedPhoneNumber = PhoneNumber.slice(0, 10);
    const match = limitedPhoneNumber.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

    if (match) {
      let formattedNumber = "";
      if (match[1].length >= 3) {
        formattedNumber = `(${match[1]}) `;
      } else {
        formattedNumber = match[1];
      }
      formattedNumber += match[2];
      if (match[3]) {
        formattedNumber += `-${match[3]}`;
      }

      return formattedNumber;
    }
    return limitedPhoneNumber;
  };
  const handlePhoneChange = (e) => {
    if (formikTeam?.values?.MobileNumber?.length > e.target.value?.length) {
      formikTeam?.setFieldValue("MobileNumber", e.target.value);
    } else {
      const formattedValue = formatPhoneNumber(e.target.value);
      formikTeam?.setFieldValue("MobileNumber", formattedValue);
    }
  };

  return (
    <Col className=" teamAssignBox">
      <Grid className="jobs">
        <Grid className="team-card" style={{ width: "100%" }}>
          <Card
            style={{ height: "140px" }}
            className="teamAndAssign border-blue-color"
          >
            <CardHeader
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "none",
                background: "none",
              }}
              className="team-header"
            >
              <Typography
                className="text-blue-color heading-three"
                style={{ fontWeight: 600 }}
              >
                Team
              </Typography>
              <Grid className="assignbtn">
                <BlueButton
                  className="bg-blue-color text-white-color "
                  outline
                  style={{
                    padding: "0 14px 0 14px",
                    fontSize: "12px",
                    marginTop: 0,
                    height: "32px",
                  }}
                  onClick={toggleDropdown}
                  label="+ Assign"
                />
                {isDropdownOpen && (
                  <Grid
                    maxWidth="md"
                    fullWidth
                    className="assigndrop"
                    style={{
                      position: "absolute",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      borderRadius: "4px",
                      marginTop: "10px",
                      padding: "10px",
                      zIndex: 1000,
                      right: 0,
                    }}
                  >
                    <Card
                      style={{
                        height: "300px",
                      }}
                    >
                      <CardHeader
                        className="text-white-color bg-blue-color"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        Select team
                        <CloseIcon
                          onClick={toggleDropdown}
                          style={{ cursor: "pointer" }}
                        />
                      </CardHeader>
                      <CardBody
                        style={{
                          scrollbarWidth: "thin",
                          overflowY: "auto",
                          height: "100px",
                        }}
                      >
                        <Grid onClick={handleOutsideClick}>
                          {teamData && teamData?.length > 0 ? (
                            teamData.map((person) => (
                              <FormGroup
                                check
                                className="my-3 mb-0"
                                key={person.WorkerId}
                              >
                                <Input
                                  type="checkbox"
                                  checked={
                                    checkedState &&
                                    !!checkedState[person?.WorkerId]
                                  }
                                  onChange={(e) => handleTeamSelect(e, person)}
                                />

                                <Label
                                  style={{
                                    fontSize: "16px",
                                    color: "rgba(6,49,100,0.7)",
                                    fontWeight: "400",
                                    marginBottom: 0,
                                  }}
                                >
                                  {person?.FullName}
                                </Label>
                                <Label
                                  style={{
                                    fontSize: "16px",
                                    color: "rgba(6,49,100,0.7)",
                                    fontWeight: "400",
                                    marginBottom: 0,
                                  }}
                                >
                                  <span> ( {person?.EmailAddress} )</span>
                                </Label>
                              </FormGroup>
                            ))
                          ) : (
                            <Typography>No team members found.</Typography>
                          )}
                        </Grid>

                        <hr />
                      </CardBody>
                      <CardFooter>
                        <BlueButton
                          className="text-blue-color text-white-color text-white-color bg-button-blue-color"
                          style={{
                            border: "none",
                            fontWeight: "400",
                            padding: "8px",
                            fontSize: "12px",
                          }}
                          onClick={toggleModal}
                          label="+ Create Worker"
                        />
                      </CardFooter>
                    </Card>
                    <Modal isOpen={isModalOpen} toggle={toggleModal}>
                      <ModalHeader
                        toggle={toggleModal}
                        className="text-blue-color"
                      >
                        Add new worker
                      </ModalHeader>
                      <ModalBody
                        className="nozindex"
                        style={{ borderBottom: "none" }}
                      >
                        <FormGroup>
                          <Input
                            name="FullName"
                            placeholder="Enter full name"
                            type="text"
                            className="text-blue-color w-100 mb-3  border-blue-color"
                            value={formikTeam?.values?.FullName}
                            onChange={formikTeam?.handleChange}
                            onBlur={formikTeam?.handleBlur}
                            invalid={
                              formikTeam?.touched?.FullName &&
                              Boolean(formikTeam?.errors?.FullName)
                            }
                          />
                          {formikTeam?.touched?.FullName &&
                          formikTeam?.errors?.FullName ? (
                            <Grid className="text-danger AdduserModelBox">
                              {formikTeam?.errors?.FullName}
                            </Grid>
                          ) : null}
                        </FormGroup>
                        <FormGroup className="AdduserModelBoxes">
                          <Input
                            name="EmailAddress"
                            placeholder="Enter email"
                            type="text"
                            className="text-blue-color w-100 mb-3 border-blue-color"
                            value={formikTeam?.values?.EmailAddress}
                            onChange={formikTeam?.handleChange}
                            onBlur={formikTeam?.handleBlur}
                            invalid={
                              formikTeam?.touched?.EmailAddress &&
                              Boolean(formikTeam?.errors?.EmailAddress)
                            }
                          />
                          {formikTeam?.touched?.EmailAddress &&
                          formikTeam?.errors?.EmailAddress ? (
                            <Grid className="text-danger AdduserModelBox">
                              {formikTeam?.errors?.EmailAddress}
                            </Grid>
                          ) : null}
                        </FormGroup>
                        <FormGroup className="AdduserModelBoxes">
                          <Input
                            name="MobileNumber"
                            placeholder="Enter mobile number"
                            type="text"
                            className="text-blue-color w-100 mb-3 border-blue-color"
                            value={formikTeam?.values?.MobileNumber}
                            onChange={handlePhoneChange}
                            onBlur={formikTeam?.handleBlur}
                            invalid={
                              formikTeam?.touched?.MobileNumber &&
                              Boolean(formikTeam?.errors?.MobileNumber)
                            }
                          />
                          {formikTeam?.touched?.MobileNumber &&
                          formikTeam?.errors?.MobileNumber ? (
                            <div className="text-danger">
                              {formikTeam?.errors?.MobileNumber}
                            </div>
                          ) : null}
                        </FormGroup>
                      </ModalBody>
                      <ModalFooter className="adduserModelTop justify-content-between">
                        <WhiteButton
                          onClick={() => {
                            formikTeam.resetForm();
                            toggleModal();
                          }}
                          label="Cancel"
                        />
                        {loading ? (
                          <Grid className="d-flex justify-content-center">
                            <LoaderComponent
                              loader={loader}
                              height="20"
                              width="20"
                            />
                          </Grid>
                        ) : (
                          <BlueButton
                            className="svaeUserModelWidth"
                            onClick={formikTeam?.handleSubmit}
                            label="Save worker"
                          />
                        )}
                      </ModalFooter>
                    </Modal>
                  </Grid>
                )}
              </Grid>
            </CardHeader>
            <CardBody
              className="addignTeamOvefFlowWidth"
              style={{ maxHeight: "100px", overflowY: "auto" }}
            >
              <Grid
                style={{ marginTop: "-10px", height: "18px" }}
                className="assingPersoneSeeHereToAssign"
              >
                {selectedTeams?.map((team, index) => (
                  <Grid
                    key={index}
                    className="tag assignPersonNameHereTo"
                    style={{
                      marginTop: "6px",
                      marginLeft: "10px",
                      gap: "10px",
                    }}
                  >
                    <Typography
                      className="tag-text"
                      style={{ fontSize: "16px" }}
                    >
                      <span>
                        {team?.FullName || "FullName not available"} -
                        {team?.EmailAddress || "EmailAddress not available"}
                      </span>
                    </Typography>
                    <button
                      className="tag-close"
                      onClick={() => handleRemoveTeam(team)}
                      label={"x"}
                    >
                      <span style={{ marginTop: "-1px" }}>x </span>
                    </button>
                  </Grid>
                ))}
              </Grid>
            </CardBody>
          </Card>
        </Grid>
      </Grid>
    </Col>
  );
};
const NoDataFound = ({}) => {
  // const StyledGridOverlay = styled("div")(({ theme }) => ({
  //   display: "flex",
  //   flexDirection: "column",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   height: "100%",
  //   "& .no-results-primary": {
  //     fill: theme?.palette?.mode === "light" ? "#AEB8C2" : "#3D4751",
  //   },
  //   "& .no-results-secondary": {
  //     fill: theme?.palette?.mode === "light" ? "#E8EAED" : "#1D2126",
  //   },
  // }));
  return (
    <>
      {" "}
      {/* <StyledGridOverlay>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          width={96}
          viewBox="0 0 523 299"
          aria-hidden
          focusable="false"
        >
          <path
            className="no-results-primary"
            d="M262 20c-63.513 0-115 51.487-115 115s51.487 115 115 115 115-51.487 115-115S325.513 20 262 20ZM127 135C127 60.442 187.442 0 262 0c74.558 0 135 60.442 135 135 0 74.558-60.442 135-135 135-74.558 0-135-60.442-135-135Z"
          />
          <path
            className="no-results-primary"
            d="M348.929 224.929c3.905-3.905 10.237-3.905 14.142 0l56.569 56.568c3.905 3.906 3.905 10.237 0 14.143-3.906 3.905-10.237 3.905-14.143 0l-56.568-56.569c-3.905-3.905-3.905-10.237 0-14.142ZM212.929 85.929c3.905-3.905 10.237-3.905 14.142 0l84.853 84.853c3.905 3.905 3.905 10.237 0 14.142-3.905 3.905-10.237 3.905-14.142 0l-84.853-84.853c-3.905-3.905-3.905-10.237 0-14.142Z"
          />
          <path
            className="no-results-primary"
            d="M212.929 185.071c-3.905-3.905-3.905-10.237 0-14.142l84.853-84.853c3.905-3.905 10.237-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-84.853 84.853c-3.905 3.905-10.237 3.905-14.142 0Z"
          />
          <path
            className="no-results-secondary"
            d="M0 43c0-5.523 4.477-10 10-10h100c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 53 0 48.523 0 43ZM0 89c0-5.523 4.477-10 10-10h80c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 99 0 94.523 0 89ZM0 135c0-5.523 4.477-10 10-10h74c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 181c0-5.523 4.477-10 10-10h80c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 227c0-5.523 4.477-10 10-10h100c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM523 227c0 5.523-4.477 10-10 10H413c-5.523 0-10-4.477-10-10s4.477-10 10-10h100c5.523 0 10 4.477 10 10ZM523 181c0 5.523-4.477 10-10 10h-80c-5.523 0-10-4.477-10-10s4.477-10 10-10h80c5.523 0 10 4.477 10 10ZM523 135c0 5.523-4.477 10-10 10h-74c-5.523 0-10-4.477-10-10s4.477-10 10-10h74c5.523 0 10 4.477 10 10ZM523 89c0 5.523-4.477 10-10 10h-80c-5.523 0-10-4.477-10-10s4.477-10 10-10h80c5.523 0 10 4.477 10 10ZM523 43c0 5.523-4.477 10-10 10H413c-5.523 0-10-4.477-10-10s4.477-10 10-10h100c5.523 0 10 4.477 10 10Z"
          />
        </svg>
        <Box sx={{ mt: 2 }}>No results found.</Box>
      </StyledGridOverlay> */}
      <Grid>
        <Grid className="d-flex justify-content-center">
          <img src={NoData} />
        </Grid>
        <Typography style={{ fontSize: "14px" }}>No Data Found</Typography>
      </Grid>
    </>
  );
};

export {
  InternalNotes,
  OneOffContract,
  RecurringContract,
  CalendarJOB,
  ClientMessage,
  AddQuoteDiscount,
  Team,
  NoDataFound,
};
