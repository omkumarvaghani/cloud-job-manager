import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  FormGroup,
  Typography,
  TableRow,
  TableCell,
} from "@mui/material";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Table,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../../Views/AxiosInstance";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import InputText from "../InputFields/InputText";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "./style.css";
import { useLocation, useNavigate } from "react-router-dom";
import { handleAuth } from "../Login/Auth";
import BlueButton from "../Button/BlueButton";
import WhiteButton from "../Button/WhiteButton";
import { Grid } from "@mui/material";
import showToast from "../Toast/Toster";
import TableBody from "@mui/material/TableBody";
import { width } from "@mui/system";
import { WhiteLoaderComponent } from "../Icon/Index";
const Visit = ({
  open,
  setOpen,
  data,
  ContractId,
  contractData,
  CompanyId,

  fetchData,
  VisitId,
  setVisitId,
  CustomerId,
}) => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const LocationId = contractData.LocationId;
  const [teamData, setTeamData] = useState([]);
  const fetchVisitData = async () => {
    try {
      if (!VisitId || !ContractId) {
        console.error("VisitId or ContractId is missing!");
        return;
      }
      const visitRes = await AxiosInstance.get(
        `/v1/visit/${VisitId}/${ContractId}`
      );
      formik.setValues({
        ItemName: visitRes?.data?.data?.ItemName,
        Note: visitRes?.data?.data?.Note,
        StartTime: visitRes?.data?.data?.StartTime,
        EndTime: visitRes?.data?.data?.EndTime,
        StartDate: visitRes?.data?.data?.StartDate,
        EndDate: visitRes?.data?.data?.EndDate,
        WorkerId: visitRes?.data?.data?.WorkerId,
      });
      const members = teamData.filter((item) =>
        visitRes?.data?.data?.WorkerId?.includes(item?.WorkerId)
      );

      if (members && members.length > 0) {
        setSelectedTeams(
          members?.map((member) => ({
            FirstName: member?.FirstName,
            LastName: member?.LastName,
            EmailAddress: member?.EmailAddress,
            WorkerId: member?.WorkerId,
          }))
        );
        setCheckedState((prevState) => {
          const updatedState = { ...prevState };

          members.forEach((member) => {
            updatedState[member?.WorkerId] = true;
          });

          return updatedState;
        });
        setAssignPersonId(members?.map((member) => member?.WorkerId));
      }
    } catch (error) {
      console.error("Error: ", error?.message);
    }
  };

  useEffect(() => {
    fetchVisitData();
  }, [VisitId, teamData]);

  const formik = useFormik({
    initialValues: {
      CompanyId: "",
      ContractId: "",
      WorkerId: "",
      CustomerId: "",
      LocationId: "",
      ItemName: "",
      EndDate: "",
      StartDate: "",
    },
    validationSchema: Yup.object({
      ItemName: Yup.string().required("Item Name Is required"),
      StartDate: Yup.string().required("Start Date is required"),
      EndDate: Yup.string().required("End date is required"),
    }),

    onSubmit: async (values) => {
      if (!VisitId) {
        try {
          setLoader(true);

          values["CompanyId"] = CompanyId;
          values["ContractId"] = ContractId;
          values["WorkerId"] = assignPersonId;
          values["CustomerId"] = CustomerId;
          values["LocationId"] = LocationId;
          const response = await AxiosInstance.post(
            `${baseUrl}/v1/visit`,
            values
          );
          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);
            setOpen(false);
            fetchData();
          } else {
            showToast.error(response?.data?.message);
          }
        } catch (error) {
          if (error?.response?.status === 400) {
            const errorMessages = error?.response?.data?.errors || [];
            errorMessages.forEach((message) => {
              const fieldName = message.split(" ")[0];
              const userFriendlyFieldName =
                fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
              showToast.warning(`${userFriendlyFieldName}: ${message}`);
              formik.setFieldError(fieldName, message);
            });
          } else {
            showToast.error("An error occurred while submitting the form.");
          }
        } finally {
          setLoader(false);
        }
      } else {
        try {
          setLoader(true);
          values["CompanyId"] = CompanyId;
          values["ContractId"] = ContractId;
          values["WorkerId"] = assignPersonId;
          values["CustomerId"] = CustomerId;
          values["LocationId"] = LocationId;

          const response = await AxiosInstance.put(
            `/visits/${VisitId}/${ContractId}`,
            values
          );
          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);
            setOpen(false);
            fetchData();
          } else {
            showToast.error(response?.data?.message);
          }
        } catch (error) {
          showToast.error("An error occurred while submitting the form.");
        } finally {
          setLoader(false);
        }
      }
      formik.resetForm();
      setVisitId("");
      setSelectedTeams([]);
      setCheckedState("");
      setAssignPersonId([]);
      // setOpen({ isOpen: false, propertyData: null });
    },
  });

  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (open?.propertyData) {
      formik.setValues(open?.propertyData);
    } else {
      formik.resetForm();
    }
  }, [open?.propertyData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      formik.setFieldValue(name, value.name);
    } else {
      formik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
  };

  const [tokenDecode, setTokenDecode] = useState({});

  const fetchDatas = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDatas();
  }, []);

  const [isAnyTime, setIsAnyTime] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [checkedState, setCheckedState] = useState(false);
  const [loader, setLoader] = useState(false);
  const [assignPersonId, setAssignPersonId] = useState([]);
  const [ids, setIds] = useState([]);

  const fetchallData = async () => {
    try {
      const companyId =
        localStorage.getItem("CompanyId") || tokenDecode?.companyId;

      if (!companyId) {
        console.error("CompanyId is not found in localStorage or tokenDecode.");
        return;
      }

      const response = await AxiosInstance.get(`/v1/worker/get/${companyId}`);
      if (response?.status === 200) {
        if (response?.data && Array.isArray(response?.data?.data)) {
          setTeamData(response?.data?.data);
        } else {
          console.error("Unexpected response structure:", response?.data);
        }
      } else {
        console.error("Error fetching team data:", response);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };
  useEffect(() => {
    fetchallData();
  }, [tokenDecode]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await handleAuth(navigate, location);
        setTokenDecode(res?.data);
      } catch (error) {
        console.error("Error fetching token decode:", error);
      }
    };

    fetchToken();
    fetchallData();
  }, []);

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

  const handleTeamSelect = (event, team) => {
    if (event?.target?.checked) {
      setSelectedTeams((prevTeams) => [
        ...prevTeams,
        {
          FirstName: team?.FirstName,
          LastName: team?.LastName,
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOutsideClick = () => {
    toggleDropdown();
  };

  const handleFullNameChange = (e, index) => {
    const newTeamData = [...teamData];
    newTeamData[index].FullName = e.target.value;
    setTeamData(newTeamData);
  };

  const handleDialogClose = () => {
    formik.resetForm();
    setVisitId("");
    setSelectedTeams([]);
    setAssignPersonId([]);
    setOpen({ isOpen: false, propertyData: null });
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open?.isOpen}
      onClose={handleDialogClose}
      className="client"
    >
      <DialogTitle className="borerBommoModel">
        <Grid className=" d-flex justify-content-start align-items-center">
          <Typography
            className="text-blue-color text-property newTimeEntryAddContract heading-four"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "42px",
              margin: "0 10px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Scheduled a Visit
          </Typography>
        </Grid>
      </DialogTitle>
      <Divider
        style={{ height: "1px", backgroundColor: "rgba(42, 79, 97, 0.8)" }}
      />
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid className="mb-2 d-flex itemNote_contractDetail shceduleVisitAddress">
            <Col
              className="col-6 visit_itemNoteDetail"
              style={{ marginRight: "5px" }}
              xl={6}
              md={6}
            >
              <InputText
                value={formik?.values?.ItemName}
                onChange={handleChange}
                onBlur={formik?.handleBlur}
                error={
                  formik?.touched?.ItemName && Boolean(formik?.errors?.ItemName)
                }
                helperText={
                  formik?.touched?.ItemName && formik?.errors?.ItemName
                }
                name="ItemName"
                placeholder="Enter item name"
                label="Visit Title"
                type="text"
                className="text-blue-color mb-2 mx-0 shceduleVisitItemNameInout visitTitleTag"
                fieldHeight="56px"
                style={{ width: "82%" }}
                InputLabelProps={{
                  shrink:
                    Boolean(formik?.values?.ItemName) ||
                    formik?.touched?.ItemName,
                }}
              />
              <TextField
                className="Note-details text-blue-color my-2 shceduleVistFormI shceduleVisitItemNameInoutsss"
                id="Note"
                name="Note"
                label="Note details"
                value={formik?.values?.Note}
                onChange={handleChange}
                onBlur={formik?.handleBlur}
                multiline
                rows={5}
                defaultValue=""
                placeholder="Enter notes "
                type="text"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#063164",
                    },
                    "&:hover fieldset": {
                      borderColor: "#063164",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#063164",
                    },
                    "& input": {
                      height: "23px",
                      alignItems: "start",
                    },
                  },
                }}
                InputProps={{
                  readOnly: false,
                }}
                InputLabelProps={{
                  shrink:
                    Boolean(formik?.values?.Note) || formik?.touched?.Note,
                  shrink:
                    Boolean(formik?.values?.Note) || formik?.touched?.Note,
                }}
              />
            </Col>
            <Col className="col-6 contract_visitDetail" xl={6}>
              <Typography
                className="mb-0 Sub-title text-blue-color"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Contract details
              </Typography>
              <hr style={{ border: "0.5px solid #063164CC" }} />
              <Table borderless>
                <TableBody className="Contract-table-detail">
                  <TableRow>
                    <TableCell>Contract#</TableCell>
                    <TableCell>{contractData?.ContractNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>
                      {contractData?.customer?.FirstName ||
                        "FirstName not available"}{" "}
                      {contractData?.customer?.LastName ||
                        "LastName not available"}{" "}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phone</TableCell>
                    <TableCell>{contractData?.customer?.PhoneNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>
                      {contractData?.location?.Address ||
                        "Address not available"}{" "}
                      {contractData?.location?.City || "City not available"}{" "}
                      {contractData?.location?.State || "State not available"}{" "}
                      {contractData?.location?.Country ||
                        "Country not available"}{" "}
                      {contractData?.location?.Zip || "Zip not available"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Col>
          </Grid>
          <hr />
          <Grid className="d-flex startDate_visitSchedulePart">
            <Grid>
              <Grid>
                <Grid
                  style={{ display: "flex" }}
                  className="startAndEndTimeSchedule"
                >
                  <Grid>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["DatePicker"]}>
                        <DatePicker
                          className="timeentryremoveWIdth"
                          label="Start Date"
                          value={
                            formik?.values?.StartDate &&
                            dayjs(formik?.values?.StartDate).isValid()
                              ? dayjs(formik?.values?.StartDate)
                              : null
                          }
                          onChange={(value) => {
                            const startDate =
                              value && dayjs(value).isValid()
                                ? dayjs(value).format("YYYY-MM-DD")
                                : null;

                            formik.setFieldValue("StartDate", startDate);

                            if (
                              formik?.values?.EndDate &&
                              new Date(startDate) >
                                new Date(formik?.values?.EndDate)
                            ) {
                              formik.setFieldValue("EndDate", null);
                            }
                          }}
                          onBlur={formik?.handleBlur}
                          sx={{
                            "& .MuiInputBase-root": { borderRadius: "8px" },
                            "& .MuiInputBase-input": { color: "#063164" },
                            "& .MuiInputLabel-root": { color: "#063164" },
                            "& .MuiSvgIcon-root": { color: "#063164" },
                          }}
                        />
                      </DemoContainer>
                      {formik?.touched?.StartDate &&
                        formik?.errors?.StartDate && (
                          <Typography
                            style={{
                              color: "red",
                              marginLeft: "10px",
                              fontSize: "13px",
                            }}
                          >
                            {formik?.errors?.StartDate}
                          </Typography>
                        )}
                    </LocalizationProvider>
                  </Grid>
                  <Grid>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["DatePicker"]}>
                        <DatePicker
                          className="timeentryremoveWIdth"
                          label="End Date"
                          value={
                            formik?.values?.EndDate &&
                            dayjs(formik?.values?.EndDate).isValid()
                              ? dayjs(formik?.values?.EndDate)
                              : null
                          }
                          onChange={(value) => {
                            const endDate =
                              value && dayjs(value).isValid()
                                ? dayjs(value).format("YYYY-MM-DD")
                                : null;

                            if (
                              formik?.values?.StartDate &&
                              new Date(endDate) >=
                                new Date(formik?.values?.StartDate)
                            ) {
                              formik.setFieldValue("EndDate", endDate);
                            }
                          }}
                          onBlur={formik?.handleBlur}
                          minDate={
                            formik?.values?.StartDate
                              ? dayjs(formik?.values?.StartDate)
                              : undefined
                          }
                          sx={{
                            "& .MuiInputBase-root": { borderRadius: "8px" },
                            "& .MuiInputBase-input": { color: "#063164" },
                            "& .MuiInputLabel-root": { color: "#063164" },
                            "& .MuiSvgIcon-root": { color: "#063164" },
                          }}
                        />
                      </DemoContainer>
                      {formik?.touched?.EndDate && formik?.errors?.EndDate && (
                        <Typography
                          style={{
                            color: "red",
                            marginLeft: "10px",
                            fontSize: "13px",
                          }}
                        >
                          {formik?.errors?.EndDate}
                        </Typography>
                      )}
                    </LocalizationProvider>
                  </Grid>
                </Grid>
                <Grid style={{ visibility: isAnyTime ? "hidden" : "visible" }}>
                  <Grid
                    style={{ display: "flex" }}
                    className="startAndEndTimeSchedule"
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["TimePicker"]}>
                        <TimePicker
                          className="timeentryremoveWIdth"
                          label="Start Time"
                          value={
                            formik?.values?.StartTime &&
                            dayjs(formik?.values?.StartTime).isValid()
                              ? dayjs(formik?.values?.StartTime)
                              : null
                          }
                          onChange={(value) =>
                            formik.setFieldValue(
                              "StartTime",
                              value && dayjs(value).isValid()
                                ? value.toISOString()
                                : null
                            )
                          }
                          onBlur={formik.handleBlur}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              error={
                                formik?.touched?.StartTime &&
                                Boolean(formik?.errors?.StartTime)
                              }
                              helperText={
                                formik?.touched?.StartTime &&
                                formik?.errors?.StartTime
                              }
                            />
                          )}
                          sx={{
                            "& .MuiInputBase-root": {
                              borderRadius: "8px",
                            },
                            "& .MuiInputBase-input": {
                              color: "#063164",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#063164",
                            },
                            "& .MuiSvgIcon-root": {
                              color: "#063164",
                            },
                          }}
                        />
                      </DemoContainer>
                    </LocalizationProvider>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer components={["TimePicker"]}>
                        <TimePicker
                          className="timeentryremoveWIdth"
                          label="End Time"
                          {...formik?.getFieldProps("EndTime")}
                          value={
                            formik?.values?.EndTime &&
                            dayjs(formik?.values?.EndTime).isValid()
                              ? dayjs(formik?.values?.EndTime)
                              : null
                          }
                          onChange={(value) =>
                            formik?.setFieldValue(
                              "EndTime",
                              value && dayjs(value).isValid()
                                ? value.toISOString()
                                : null
                            )
                          }
                          onBlur={formik?.handleBlur}
                          error={
                            formik?.touched?.EndTime &&
                            Boolean(formik?.errors?.EndTime)
                          }
                          helperText={
                            formik?.touched?.EndTime && formik?.errors?.EndTime
                          }
                          sx={{
                            "& .MuiInputBase-root": {
                              borderRadius: "8px",
                            },
                            "& .MuiInputBase-input": {
                              color: "#063164",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#063164",
                            },
                            "& .MuiSvgIcon-root": {
                              color: "#063164",
                            },
                          }}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Grid>

              <Grid className="checkbox-group my-2">
                <input
                  type="checkbox"
                  id="any-time"
                  name="any-time"
                  checked={isAnyTime}
                  onChange={(e) => setIsAnyTime(e.target.checked)}
                />
                <label htmlFor="any-time">Any Time</label>
              </Grid>
            </Grid>
            <Grid
              style={{
                height: "160px",
                backgroundColor: "#063164CC ",
                width: "2px",
              }}
              className="scheduleLineItem"
            ></Grid>
            <Grid
              className="user-assignment mx-5 user_visitSchedule"
              style={{ marginLeft: "23px" }}
            >
              <Grid
                style={{ justifyContent: "space-between", display: "flex" }}
                className="visitScheduleBtn"
              >
                <Typography
                  className="visitScheduleMOdelBottom"
                  style={{
                    color: "#243a73",
                    fontSize: "26px",
                    fontWeight: "600",
                  }}
                >
                  Visit Schedule
                </Typography>
                <Grid
                  className="assignbtn assignBtnDropDown"
                  style={{ marginTop: "8px", position: "relative" }}
                >
                  <Grid className="assignBtnWidth">
                    <BlueButton
                      className="bg-blue-color "
                      outline
                      style={{
                        padding: "0 14px 0 14px",
                        fontSize: "12px",
                        marginTop: 0,
                        height: "32px",
                        color: "#fff",
                      }}
                      onClick={toggleDropdown}
                      label="+ Assign"
                    />
                  </Grid>
                  {isDropdownOpen && (
                    <Grid
                      className="assigndrop"
                      style={{
                        position: "absolute",
                        bottom: "40px",
                        left: 0,
                        zIndex: 10,
                        width: "100%",
                      }}
                    >
                      <Card
                        style={{
                          height: "300px",
                          right: "200px",
                          width: "280px",
                        }}
                        className="selectTeamModel"
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
                            overflowY: "auto",
                            height: "150px",
                          }}
                        >
                          <Grid onClick={handleOutsideClick}>
                            {teamData && teamData?.length > 0 ? (
                              teamData?.map((person) => (
                                <FormGroup
                                  check
                                  className="my-3 mb-0"
                                  key={person?._id}
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    flexDirection: "row",
                                  }}
                                >
                                  <Input
                                    type="checkbox"
                                    checked={
                                      checkedState &&
                                      !!checkedState[person?.WorkerId]
                                    }
                                    onChange={(e) =>
                                      handleTeamSelect(e, person)
                                    }
                                  />

                                  <Grid>
                                    <Label
                                      style={{
                                        fontSize: "16px",
                                        color: "rgba(6,49,100,0.7)",
                                        fontWeight: "400",
                                        marginBottom: 0,
                                      }}
                                    >
                                      {`${person?.FirstName} ${person?.LastName}` ||
                                        "Name not available"}
                                    </Label>
                                    <Label
                                      style={{
                                        fontSize: "16px",
                                        color: "rgba(6,49,100,0.7)",
                                        fontWeight: "400",
                                        marginBottom: 0,
                                      }}
                                    >
                                      (
                                      {person?.EmailAddress ||
                                        "EmailAddress not available"}{" "}
                                      )
                                    </Label>
                                  </Grid>
                                </FormGroup>
                              ))
                            ) : (
                              <Typography>No team members found.</Typography>
                            )}
                          </Grid>
                        </CardBody>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              <Typography className="text-blue-color"></Typography>
              <Col className="col-12 " xl={12}>
                <Card className="shceduleAssignForm">
                  <CardHeader
                    style={{
                      display: "none",
                      justifyContent: "space-between",
                      borderBottom: "none",
                      background: "none",
                    }}
                    className="team-header vistSheduled_visit"
                  ></CardHeader>
                  <CardBody style={{ overflowY: "auto" }}>
                    <Grid style={{ marginTop: "-10px", height: "18px" }}>
                      {selectedTeams?.map((team, index) => (
                        <Grid
                          key={index}
                          className="tag slectShowNameModel"
                          style={{
                            marginTop: "5px",
                            marginLeft: "10px",
                            height: "66px",
                            width: "100%",
                          }}
                        >
                          <Typography
                            className="tag-text"
                            style={{
                              fontSize: "16px",
                              padding: "14px 1px 1px 1px",
                            }}
                          >
                            {`${team?.FirstName} ${team?.LastName}` ||
                              "Name not available"}
                            -(
                            {team?.EmailAddress || "EmailAddress not available"}
                            )
                          </Typography>
                          <button
                            className="tag-close"
                            onClick={() => handleRemoveTeam(team)}
                          >
                            <span> x </span>
                          </button>
                        </Grid>
                      ))}
                    </Grid>
                  </CardBody>
                </Card>
              </Col>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions className="d-flex justify-content-between mx-3 mb-2 BlueAndWhiteBtmFlex gapBtn">
        <WhiteButton
          onClick={() => {
            formik.resetForm();
            setVisitId("");
            setSelectedTeams([]);
            setCheckedState("");
            setAssignPersonId([]);
            setOpen({ isOpen: false, propertyData: null });
          }}
          label="Cancel"
        />
        <BlueButton
          // onClick={async (e) => {
          //   e.preventDefault();
          //   const isValid = await formik.validateForm();
          //   formik.setTouched({
          //     StartDate: true,
          //     EndDate: true,
          //     ItemName: true,
          //   });

          //   if (Object.keys(isValid).length === 0) {
          //     formik.handleSubmit();
          //   } else showToast.error("Please Fill Required Fields");
          // }}
          onClick={async (e) => {
            e.preventDefault();
            formik.handleSubmit();
          }}
          label={
            loader ? (
              <WhiteLoaderComponent
                height="20"
                width="20"
                padding="20"
                loader={loader}
              />
            ) : (
              "Save Visits"
            )
          }
        />
      </DialogActions>
    </Dialog>
  );
};
export default Visit;
