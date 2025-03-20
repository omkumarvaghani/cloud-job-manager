import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { Grid, Typography } from "@mui/material";
import AxiosInstance from "../../AxiosInstance";
import "./style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Circles } from "react-loader-spinner";
import * as Yup from "yup";
import { Formik, useFormik } from "formik";
import InputText from "../../../components/InputFields/InputText";
import "./style.css";
import BlueButton from "../../../components/Button/BlueButton";
import WhiteButton from "../../../components/Button/WhiteButton";
import showToast from "../../../components/Toast/Toster";

function AddPermision() {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName } = useParams();
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (location?.state?.id) {
        try {
          const res = await AxiosInstance.get(
            `${baseUrl}/permissionsteps/get/${location?.state?.id}`
          );
          formFormik.setValues(res?.data?.data);
        } catch (error) {
          console.error("Error: ", error.message);
        }
      }
    };
    fetchData();
  }, [location]);
  const formFormik = useFormik({
    initialValues: {
      Title: "",
      Description: "",
      Schedule: {
        ViewTheirOwnSchedule: false,
        ViewAndCompleteTheirOwnSchedule: false,
        EditTheirOwnSchedule: false,
        EditEveryonesSchedule: false,
        EditAndDeleteEveryonesSchedule: false,
      },
      TimeTrackingAndTimesheets: {
        ViewAndRecordTheirOwn: false,
        ViewRecordAndEditTheirOwn: false,
        ViewRecordAndEditEveryones: false,
      },
      Notes: {
        ViewNotesOnJobsAndVisitsOnly: false,
        ViewAllNotes: false,
        ViewAndEditAll: false,
        ViewEditAndDeleteAll: false,
      },
      Expenses: {
        ViewRecordAndEditTheirOwn: false,
        ViewRecordAndEditEveryones: false,
      },
      ShowPricing: {
        AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs: false,
      },
      CustomersProperties: {
        ViewCustomerNameAndAddressOnly: false,
        ViewFullCustomerAndPropertyInfo: false,
        ViewAndEditFullCustomerAndPropertyInfo: false,
        ViewEditAndDeleteFullCustomerAndPropertyInfo: false,
      },
      Quotes: {
        ViewOnly: false,
        ViewCreateAndEdit: false,
        ViewCreateEditAndDelete: false,
      },
      Contract: {
        ViewOnly: false,
        ViewCreateAndEdit: false,
        ViewCreateEditAndDelete: false,
      },
      Invoice: {
        ViewOnly: false,
        ViewCreateAndEdit: false,
        ViewCreateEditAndDelete: false,
      },
      Reports: {
        UsersWillOnlyBeAbleToSeeReportsAvailableToThemBasedOnTheirOtherPermissions: false,
      },
    },
    // validateOnChange: false,
    // validateOnBlur: false,
    validationSchema: Yup.object({
      Title: Yup.string().required("Title Required"),
      Description: Yup.string().required("Description Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (location?.state?.id) {
        try {
          setLoader(true);
           
          const response = await AxiosInstance.put(
            `${baseUrl}/permissionsteps/${location?.state?.id}`,
            values
          );
          if (response?.data.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            navigate(`/superadmin/permission`, {
              state: {
                navigats: location?.state?.navigats.filter(
                  (item) => item !== "/add-permission"
                ),
              },
            });
          } else {
            setTimeout(() => {
              showToast.error(response?.data?.message);
            }, 500);
          }
        } catch (error) {
        } finally {
          setLoader(false);
        }
      } else {
        try {
          setLoader(true);
          const response = await AxiosInstance.post(
            `${baseUrl}/permissionsteps`,
            values
          );
          if (response?.data.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            navigate(`/superadmin/permission`, {
              state: {
                navigats: location?.state?.navigats.filter(
                  (item) => item !== "/permission"
                ),
              },
            });
          } else {
            setTimeout(() => {
              showToast.error(response?.data?.message);
            }, 500);
          }
        } catch (error) {
          if (error?.response && error?.response?.status === 400) {
            const errorMessages = error?.response?.data?.errors || [];
            errorMessages.forEach((errorMessage) => {
              showToast.warning(errorMessage);
            });
          } else {
            setTimeout(() => {
              showToast.error(error?.message || "An error occurred");
            }, 500);
          }
        } finally {
          setLoader(false);
        }
      }
    },
  });

  const [checkboxes, setCheckboxes] = useState({
    view: false,
    complete: false,
    editOwn: false,
    editEveryone: false,
    editDeleteEveryone: false,
  });
  const toggleCheckbox = (checkboxName) => {
    setCheckboxes((prevState) => ({
      ...prevState,
      [checkboxName]: !prevState[checkboxName],
    }));
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const first = name.split(".")[0];

    if (first === "Schedule") {
      formFormik.setFieldValue("Schedule.ViewTheirOwnSchedule", false);
      formFormik.setFieldValue(
        "Schedule.ViewAndCompleteTheirOwnSchedule",
        false
      );
      formFormik.setFieldValue("Schedule.EditTheirOwnSchedule", false);
      formFormik.setFieldValue("Schedule.EditEveryonesSchedule", false);
      formFormik.setFieldValue(
        "Schedule.EditAndDeleteEveryonesSchedule",
        false
      );
    } else if (first === "TimeTrackingAndTimesheets") {
      formFormik.setFieldValue(
        "TimeTrackingAndTimesheets.ViewAndRecordTheirOwn",
        false
      );
      formFormik.setFieldValue(
        "TimeTrackingAndTimesheets.ViewRecordAndEditTheirOwn",
        false
      );
      formFormik.setFieldValue(
        "TimeTrackingAndTimesheets.ViewRecordAndEditEveryones",
        false
      );
    } else if (first === "Notes") {
      formFormik.setFieldValue("Notes.ViewNotesOnJobsAndVisitsOnly", false);
      formFormik.setFieldValue("Notes.ViewAllNotes", false);
      formFormik.setFieldValue("Notes.ViewAndEditAll", false);
      formFormik.setFieldValue("Notes.ViewEditAndDeleteAll", false);
    } else if (first === "Expenses") {
      formFormik.setFieldValue("Expenses.ViewRecordAndEditTheirOwn", false);
      formFormik.setFieldValue("Expenses.ViewRecordAndEditEveryones", false);
    } else if (first === "ShowPricing") {
      formFormik.setFieldValue(
        "ShowPricing.AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs",
        false
      );
    } else if (first === "CustomersProperties") {
      formFormik.setFieldValue(
        "CustomersProperties.ViewCustomerNameAndAddressOnly",
        false
      );
      formFormik.setFieldValue(
        "CustomersProperties.ViewFullCustomerAndPropertyInfo",
        false
      );
      formFormik.setFieldValue(
        "CustomersProperties.ViewAndEditFullCustomerAndPropertyInfo",
        false
      );
      formFormik.setFieldValue(
        "CustomersProperties.ViewEditAndDeleteFullCustomerAndPropertyInfo",
        false
      );
    } else if (first === "Quotes") {
      formFormik.setFieldValue("Quotes.ViewOnly", false);
      formFormik.setFieldValue("Quotes.ViewCreateAndEdit", false);
      formFormik.setFieldValue("Quotes.ViewCreateEditAndDelete", false);
    } else if (first === "Contract") {
      formFormik.setFieldValue("Contract.ViewOnly", false);
      formFormik.setFieldValue("Contract.ViewCreateAndEdit", false);
      formFormik.setFieldValue("Contract.ViewCreateEditAndDelete", false);
    } else if (first === "Invoice") {
      formFormik.setFieldValue("Invoice.ViewOnly", false);
      formFormik.setFieldValue("Invoice.ViewCreateAndEdit", false);
      formFormik.setFieldValue("Invoice.ViewCreateEditAndDelete", false);
    }
    formFormik.setFieldValue(name, checked);
  };

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 mt-5 client">
        <Grid className="d-flex navigatePresetLevel">
          <Button
            style={{
              marginRight: "10px",
              width: "50px",
              height: "40px",
              marginBottom: "10px",
              padding: "0px 0px",
              borderRadius: "4px",
            }}
            className="text-capitalize bg-button-blue-color text-white-color"
          >
            <ArrowBackOutlinedIcon
              onClick={() => {
                navigate(-1);
              }}
            />
          </Button>
        </Grid>
        <Card
          className="my-2 col-12 p-4 main-chek border-blue-color"
          style={{ borderRadius: "20px" }}
        >
          <Grid
            style={{ display: "flex", gap: "15px" }}
            className="client-main"
          >
            <Grid
              className="col-lg-6 col-md-6 col-sm-12 text-box"
              style={{ paddingRight: "20px" }}
            >
              <CardTitle
                tag="h5"
                className="text-blue-color"
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  fontSize: "22px",
                }}
              >
                Preset permission levels
              </CardTitle>
              <Grid className="d-flex gap-2 my-4 presetPermissionLevel">
                <Grid className="mb-0">
                  <InputText
                    value={formFormik?.values?.Title}
                    onChange={formFormik?.handleChange}
                    onBlur={formFormik?.handleBlur}
                    error={
                      formFormik?.touched?.Title &&
                      Boolean(formFormik?.errors?.Title)
                    }
                    id="title"
                    name="Title"
                    placeholder="Enter title "
                    label="Title"
                    type="text"
                    className="mb-3 text-blue-color permissionTitleInput"
                  />
                  {formFormik?.touched.Title && formFormik?.errors?.Title && (
                    <Typography className="text-danger">
                      {formFormik?.errors?.Title}
                    </Typography>
                  )}
                </Grid>
                <Grid className="mb-0  lastnametxt lastnamemb">
                  <InputText
                    value={formFormik?.values?.Description}
                    onChange={formFormik?.handleChange}
                    onBlur={formFormik?.handleBlur}
                    error={
                      formFormik?.touched?.Description &&
                      Boolean(formFormik?.errors?.Description)
                    }
                    id="description"
                    name="Description"
                    placeholder="Enter description"
                    label="Description"
                    type="text"
                    className="mb-3 text-blue-color permissionTitleInput presetLevelDesc"
                  />
                  {formFormik?.touched?.Description &&
                    formFormik?.errors?.Description && (
                      <Typography className="text-danger">
                        {formFormik?.errors?.Description}
                      </Typography>
                    )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Card
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Schedule
              </Typography>
              <Grid className="d-flex gap-2 justify-content-between schedule flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="viewCheckbox"
                    name="Schedule.ViewTheirOwnSchedule"
                    checked={formFormik?.values?.Schedule?.ViewTheirOwnSchedule}
                    onChange={handleCheckboxChange}
                  />
                  <Label style={{ cursor: "pointer" }} for="viewCheckbox" check>
                    View their own schedule
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="CompleteCheckbox"
                    name="Schedule.ViewAndCompleteTheirOwnSchedule"
                    checked={
                      formFormik?.values?.Schedule
                        ?.ViewAndCompleteTheirOwnSchedule
                    }
                    onChange={handleCheckboxChange}
                  />
                  <Label
                    style={{ cursor: "pointer" }}
                    for="CompleteCheckbox"
                    check
                  >
                    View and complete their own schedule
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="EditOwnCheckbox"
                    name="Schedule.EditTheirOwnSchedule"
                    checked={formFormik?.values?.Schedule?.EditTheirOwnSchedule}
                    onChange={handleCheckboxChange}
                  />
                  <Label
                    style={{ cursor: "pointer" }}
                    for="EditOwnCheckbox"
                    check
                  >
                    Edit their own schedule
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="EditEveryoneCheckbox"
                    name="Schedule.EditEveryonesSchedule"
                    checked={formFormik?.values?.Schedule?.EditEveryonesSchedule}
                    onChange={handleCheckboxChange}
                  />
                  <Label
                    style={{ cursor: "pointer" }}
                    for="EditEveryoneCheckbox"
                    check
                  >
                    Edit everyone's schedule
                  </Label>
                </FormGroup>
              </Grid>
              <Grid className="d-flex gap-2 justify-content-between mt-4 schedule-last">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="DeleteEveryoneCheckbox"
                    name="Schedule.EditAndDeleteEveryonesSchedule"
                    checked={
                      formFormik?.values?.Schedule
                        ?.EditAndDeleteEveryonesSchedule
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="DeleteEveryoneCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("Edit and delete everyone's schedule")
                    }
                  >
                    Edit and delete everyone's schedule
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Time tracking and timesheets
              </Typography>
              <Grid className="d-flex gap-2 time-tracking justify-content-between flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="ViewAndRecordCheckbox"
                    name="TimeTrackingAndTimesheets.ViewAndRecordTheirOwn"
                    checked={
                      formFormik?.values?.TimeTrackingAndTimesheets
                        ?.ViewAndRecordTheirOwn
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="ViewAndRecordCheckbox"
                    check
                    onClick={() => toggleCheckbox("View and record their own")}
                  >
                    View and record their own
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="ViewRecordCheckbox"
                    name="TimeTrackingAndTimesheets.ViewRecordAndEditTheirOwn"
                    checked={
                      formFormik?.values?.TimeTrackingAndTimesheets
                        ?.ViewRecordAndEditTheirOwn
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="ViewRecordCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View, record, and edit their own")
                    }
                  >
                    View, record, and edit their own
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="RecordEditEveryoneCheckbox"
                    name="TimeTrackingAndTimesheets.ViewRecordAndEditEveryones"
                    checked={
                      formFormik?.values?.TimeTrackingAndTimesheets
                        ?.ViewRecordAndEditEveryones
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="RecordEditEveryoneCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View, record, and edit everyone's")
                    }
                  >
                    View, record, and edit everyone's
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Notes
              </Typography>
              <Grid className="d-flex notes gap-2 justify-content-between flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="ViewnotesCheckbox"
                    name="Notes.ViewNotesOnJobsAndVisitsOnly"
                    checked={
                      formFormik?.values?.Notes?.ViewNotesOnJobsAndVisitsOnly
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="ViewnotesCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox(
                        "View notes on jobs and visits onuhkjh   ly"
                      )
                    }
                  >
                    View notes on contracts and visits only
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="allnotesCheckbox"
                    name="Notes.ViewAllNotes"
                    checked={formFormik?.values?.Notes?.ViewAllNotes}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="allnotesCheckbox"
                    check
                    onClick={() => toggleCheckbox("View all notes")}
                  >
                    View all notes
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="ViewandeditCheckbox"
                    name="Notes.ViewAndEditAll"
                    checked={formFormik?.values?.Notes?.ViewAndEditAll}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="ViewandeditCheckbox"
                    check
                    onClick={() => toggleCheckbox("View and edit all")}
                  >
                    View and edit all
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="deleteallCheckbox"
                    name="Notes.ViewEditAndDeleteAll"
                    checked={formFormik?.values?.Notes?.ViewEditAndDeleteAll}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="deleteallCheckbox"
                    check
                    onClick={() => toggleCheckbox("View, edit, and delete all")}
                  >
                    View, edit, and delete all
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Expenses
              </Typography>
              <Grid className="d-flex Expenses flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="theirownCheckbox"
                    name="Expenses.ViewRecordAndEditTheirOwn"
                    checked={
                      formFormik?.values?.Expenses?.ViewRecordAndEditTheirOwn
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="theirownCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View, record, and edit their own")
                    }
                  >
                    View, record, and edit their own
                  </Label>
                </FormGroup>
                <FormGroup
                  check
                  className="sec-check expenseSecondLine"
                  style={{ marginLeft: "10.8%" }}
                >
                  <Input
                    type="checkbox"
                    id="andeditCheckbox"
                    name="Expenses.ViewRecordAndEditEveryones"
                    checked={
                      formFormik?.values?.Expenses?.ViewRecordAndEditEveryones
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="andeditCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View, record, and edit everyone's")
                    }
                  >
                    View, record, and edit everyone's
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Show pricing
              </Typography>
              <Grid className="d-flex gap-2 flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="AllowseditingCheckbox"
                    name="ShowPricing.AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs"
                    checked={
                      formFormik?.values?.ShowPricing
                        ?.AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="AllowseditingCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox(
                        "Allows editing of quotes, invoices, and line items on contracts."
                      )
                    }
                  >
                    Allows editing of quotes, invoices, and line items on
                    contracts.
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Customers and properties
              </Typography>
              <Grid className="d-flex gap-2 client-check">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="addressonlyCheckbox"
                    name="CustomersProperties.ViewCustomerNameAndAddressOnly"
                    checked={
                      formFormik?.values?.CustomersProperties
                        ?.ViewCustomerNameAndAddressOnly
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="addressonlyCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View Customer name and address only")
                    }
                  >
                    View Customer name and address only
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="propertyinfoCheckbox"
                    name="CustomersProperties.ViewFullCustomerAndPropertyInfo"
                    checked={
                      formFormik?.values?.CustomersProperties
                        ?.ViewFullCustomerAndPropertyInfo
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="propertyinfoCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View full Customer and property info")
                    }
                  >
                    View full Customer and property info
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="fullcustomerCheckbox"
                    name="CustomersProperties.ViewAndEditFullCustomerAndPropertyInfo"
                    checked={
                      formFormik?.values?.CustomersProperties
                        ?.ViewAndEditFullCustomerAndPropertyInfo
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="fullcustomerCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox(
                        "View and edit full customer and property info"
                      )
                    }
                  >
                    View and edit full customer and property info
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="anddeleteCheckbox"
                    name="CustomersProperties.ViewEditAndDeleteFullCustomerAndPropertyInfo"
                    checked={
                      formFormik?.values?.CustomersProperties
                        ?.ViewEditAndDeleteFullCustomerAndPropertyInfo
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="anddeleteCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox(
                        "View, edit, and delete full customer and property info"
                      )
                    }
                  >
                    View, edit, and delete full customer and property info
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Quotes
              </Typography>
              <Grid className="d-flex gap-2 justify-content-between request-check flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="qviewCheckbox"
                    name="Quotes.ViewOnly"
                    checked={formFormik?.values?.Quotes?.ViewOnly}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="qviewCheckbox"
                    check
                    onClick={() => toggleCheckbox("View only")}
                  >
                    View only
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="qCreateCheckbox"
                    name="Quotes.ViewCreateAndEdit"
                    checked={formFormik?.values?.Quotes?.ViewCreateAndEdit}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="qCreateCheckbox"
                    check
                    onClick={() => toggleCheckbox("View, create, and edit")}
                  >
                    View, create, and edit
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="qEditCheckbox"
                    name="Quotes.ViewCreateEditAndDelete"
                    checked={formFormik?.values?.Quotes?.ViewCreateEditAndDelete}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="qEditCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View, create, edit, and delete")
                    }
                  >
                    View, create, edit, and delete
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Contract
              </Typography>
              <Grid className="d-flex gap-2 justify-content-between request-check flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="jViewCheckbox"
                    name="Contract.ViewOnly"
                    checked={formFormik?.values?.Contract?.ViewOnly}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="jViewCheckbox"
                    check
                    onClick={() => toggleCheckbox("View only")}
                  >
                    View only
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="jCreateCheckbox"
                    name="Contract.ViewCreateAndEdit"
                    checked={formFormik?.values?.Contract?.ViewCreateAndEdit}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="jCreateCheckbox"
                    check
                    onClick={() => toggleCheckbox("View, create, and edit")}
                  >
                    View, create, and edit
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="jEditCheckbox"
                    name="Contract.ViewCreateEditAndDelete"
                    checked={
                      formFormik?.values?.Contract?.ViewCreateEditAndDelete
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="jEditCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View, create, edit, and delete")
                    }
                  >
                    View, create, edit, and delete
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Invoice
              </Typography>
              <Grid className="d-flex gap-2 justify-content-between request-check flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="jViewCheckbox"
                    name="Invoice.ViewOnly"
                    checked={formFormik?.values?.Invoice?.ViewOnly}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="jViewCheckbox"
                    check
                    onClick={() => toggleCheckbox("View only")}
                  >
                    View only
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="jCreateCheckbox"
                    name="Invoice.ViewCreateAndEdit"
                    checked={formFormik?.values?.Invoice?.ViewCreateAndEdit}
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="jCreateCheckbox"
                    check
                    onClick={() => toggleCheckbox("View, create, and edit")}
                  >
                    View, create, and edit
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="jEditCheckbox"
                    name="Invoice.ViewCreateEditAndDelete"
                    checked={
                      formFormik?.values?.Invoice?.ViewCreateEditAndDelete
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="jEditCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox("View, create, edit, and delete")
                    }
                  >
                    View, create, edit, and delete
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Card
            className="my-3"
            style={{
              borderRadius: "15px",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
            }}
          >
            <CardBody style={{ padding: "30px" }}>
              <Typography
                className="text-blue-color"
                style={{ fontSize: "18px", fontWeight: 600 }}
              >
                Reports
              </Typography>
              <Grid className="d-flex gap-2 justify-content-between flexColumnForScheduleAll">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="UsersCheckbox"
                    name="Reports.UsersWillOnlyBeAbleToSeeReportsAvailableToThemBasedOnTheirOtherPermissions"
                    checked={
                      formFormik?.values?.Reports
                        ?.UsersWillOnlyBeAbleToSeeReportsAvailableToThemBasedOnTheirOtherPermissions
                    }
                    onChange={handleCheckboxChange}
                  />{" "}
                  <Label
                    style={{ cursor: "pointer" }}
                    for="UsersCheckbox"
                    check
                    onClick={() =>
                      toggleCheckbox(
                        "Users will only be able to see reports available to them based on their other permissions."
                      )
                    }
                  >
                    Users will only be able to see reports available to them
                    based on their other permissions.
                  </Label>
                </FormGroup>
              </Grid>
            </CardBody>
          </Card>
          <Grid
            className="d-flex justify-content-between button-responsive BlueAndWhiteBtmFlex permissionbtnHere"
            style={{ marginTop: "70px" }}
          >
            <Grid>
              <WhiteButton onClick={() => navigate(-1)} label="Cancel" />
            </Grid>
            {loader ? (
              <Grid className="d-flex justify-content-center">
                <Circles
                  height="20"
                  width="20"
                  color="#063164"
                  ariaLabel="circles-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={loader}
                />
              </Grid>
            ) : (
              <Grid className="gap-3 d-flex ">
                <BlueButton
                  // onClick={async (e) => {
                  //   formFormik?.handleSubmit();
                  //   e.preventDefault();

                  //   const isValid = await formFormik?.validateForm();
                  //   formFormik?.setTouched({
                  //     Title: true,
                  //     Description: true,
                  //   });
                  //   if (
                  //     Object.keys(isValid).length === 0 &&
                  //     formFormik?.values.Title
                  //   ) {
                  //     setLoading(true);
                  //   } else {
                  //     showToast.error("Please Fill Required Fields");
                  //   }
                  // }}
                  onClick={() => {
                    formFormik?.handleSubmit();
                  }}
                  label={
                    location?.state?.id
                      ? "Update Permission"
                      : "Save Permission"
                  }
                />
              </Grid>
            )}
          </Grid>
        </Card>
      </Grid>
    </>
  );
}
export default AddPermision;
