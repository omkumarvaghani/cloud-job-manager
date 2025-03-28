// import React, { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   TextField,
//   FormControl,
//   InputAdornment,
//   Typography,
// } from "@mui/material";
// import { Col } from "reactstrap";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import "../../components/Contract Component/style.scss";
// import AxiosInstance from "../../Views/AxiosInstance";
// import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import InputText from "../InputFields/InputText";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import InputDropdown from "../InputFields/InputDropdown";
// import dayjs from "dayjs";
// import BlueButton from "../Button/BlueButton";
// import WhiteButton from "../Button/WhiteButton";
// import { Grid } from "@mui/material";
// import showToast from "../Toast/Toster";
// import { WhiteLoaderComponent } from "../Icon/Index";
// import { handleAuth } from "../Login/Auth";
// import { Navigate, useLocation } from "react-router-dom";
// const TimeEmpty = ({
//   open,
//   setOpen,
//   data,
//   ContractId,
//   WorkerId,
//   fetchData,
//   CompanyId,
//   LabourId,
//   setLabourId,
// }) => {
//   const baseUrl = process.env.REACT_APP_BASE_API;
//   const [selectedPerson, setSelectedPerson] = useState(null);
//   const [teamData, setTeamData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [tokenDecode, setTokenDecode] = useState({});
//   const location = useLocation();
//   const fetchDatas = async () => {
//     try {
//       const res = await handleAuth(Navigate, location);
//       setTokenDecode(res?.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };
//   useEffect(() => {
//     fetchDatas();
//   }, []);

//   let fetchLabourData = async () => {
//     try {
//       if (!LabourId || !ContractId) {
//         console.error("LabourId or ContractId is missing!");
//         return;
//       }
//       const labourRes = await AxiosInstance.get(
//         `/labour/labours/${LabourId}/${ContractId}`
//       );
//       formik.setValues({
//         Notes: labourRes?.data?.data?.Notes,
//         Hours: labourRes?.data?.data?.Hours,
//         Minutes: labourRes?.data?.data?.Minutes,
//         LabourCost: labourRes?.data?.data?.LabourCost,
//         StartTime: labourRes?.data?.data?.StartTime,
//         DatePicker: labourRes?.data?.data?.DatePicker,
//         WorkerId: labourRes?.data?.data?.WorkerId,
//       });
//       const person = teamData.find(
//         (teamMember) => teamMember?.WorkerId === labourRes?.data?.data?.WorkerId
//       );
//       setSelectedPerson(person || null);
//     } catch (error) {
//       console.error("Error: ", error?.messae);
//     }
//   };
//   useEffect(() => {
//     fetchLabourData();
//   }, [LabourId]);
//   const formik = useFormik({
//     initialValues: {
//       CompanyId: "",
//       Address: "",
//       WorkerId: "",
//       City: "",
//       State: "",
//       Zip: "",
//       Team: "",
//       ContractId: "",
//       StartTime: null,
//       EndTime: null,
//       Hours: "",
//       Minutes: "",
//       Notes: "",
//       DatePicker: dayjs().toDate(),
//       LabourCost: "",
//       TotalCost: "0.00",
//     },
//     validationSchema: Yup.object({
//       StartTime: Yup.string().required("StartTime required"),
//       EndTime: Yup.string().required("EndTime required"),
//       Hours: Yup.string().required("Hours required"),
//       Minutes: Yup.string().required("Minutes required"),
//       LabourCost: Yup.string().required("LabourCost required"),
//     }),
//     onSubmit: async (values) => {
//       if (!LabourId) {
//         try {
//           setLoading(true);
//           values["CompanyId"] = CompanyId;
//           values["ContractId"] = ContractId;
//           const response = await AxiosInstance.post(
//             `${baseUrl}/labour`,
//             values
//           );
//           if (response?.data?.statusCode === 200) {
//             showToast.success(response?.data?.message);
//             setOpen(false);
//             fetchData();
//           } else {
//             showToast.error(response?.data?.message);
//           }
//         } catch (error) {
//           showToast.error("An error occurred while submitting the form.");
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         try {
//           setLoading(true);
//           values["CompanyId"] = CompanyId;
//           values["ContractId"] = ContractId;
//           const labourId = values.LabourId;
//           const response = await AxiosInstance.put(
//             `/labour/${LabourId}/${ContractId}`,
//             values
//           );
//           if (response?.data?.statusCode === 200) {
//             showToast.success(response?.data?.message);
//             setOpen(false);
//             fetchData();
//           } else {
//             showToast.error(response?.data?.message);
//           }
//         } catch (error) {
//           showToast.error("An error occurred while submitting the form.");
//         } finally {
//           setLoading(false);
//         }
//       }

//       formik.resetForm();
//       setLabourId("");
//       setSelectedPerson(null);
//       setOpen({ isOpen: false, propertyData: null });
//     },
//   });
//   useEffect(() => {
//     if (open?.propertyData) {
//       formik.setValues(open?.propertyData);
//     } else {
//       formik.resetForm();
//     }
//   }, [open?.propertyData]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (name === "Country") {
//       formik.setFieldValue(name, value.name);
//     } else {
//       formik.setFieldValue(name, type === "checkbox" ? checked : value);
//     }
//   };

//   useEffect(() => {
//     const fetchTeamData = async () => {
//       try {
//         setLoading(true);
//         const companyId =
//           localStorage.getItem("CompanyId") || tokenDecode?.companyId;

//         if (!companyId) {
//           console.error(
//             "CompanyId is not found in localStorage or tokenDecode."
//           );
//           return;
//         }

//         const response = await AxiosInstance.get(`/worker/${companyId}`);
//         if (response?.status === 200) {
//           setTeamData(response?.data?.data);
//         } else {
//           console.error("Error fetching team data:", response);
//         }
//       } catch (error) {
//         console.error("Error fetching team data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTeamData();
//   }, [tokenDecode]);

//   const calculateTimeDifference = (start, end) => {
//     if (!start || !end) return { hours: "0", minutes: "0" };

//     const startDate = dayjs(start);
//     const endDate = dayjs(end);
//     if (endDate.isBefore(startDate)) return { hours: "0", minutes: "0" };

//     const diff = endDate.diff(startDate);
//     const diffInHours = Math.floor(diff / (1000 * 60 * 60));
//     const diffInMinutes = Math.floor((diff / (1000 * 60)) % 60);

//     return {
//       hours: diffInHours.toString(),
//       minutes: diffInMinutes.toString(),
//     };
//   };

//   useEffect(() => {
//     if (formik?.values?.StartTime && formik?.values?.EndTime) {
//       const { hours, minutes } = calculateTimeDifference(
//         formik?.values?.StartTime,
//         formik?.values?.EndTime
//       );
//       formik?.setFieldValue("Hours", hours);
//       formik?.setFieldValue("Minutes", minutes);
//     }
//   }, [formik?.values?.StartTime, formik?.values?.EndTime]);

//   useEffect(() => {
//     if (
//       formik?.values?.Hours !== "" &&
//       formik?.values?.Minutes !== "" &&
//       formik?.values?.StartTime
//     ) {
//       const startTime = dayjs(formik?.values?.StartTime);
//       const newEndTime = startTime
//         .add(Number(formik?.values?.Hours), "hour")
//         .add(Number(formik?.values?.Minutes), "minute")
//         .toISOString();

//       formik?.setFieldValue("EndTime", newEndTime);
//     }
//   }, [
//     formik?.values?.Hours,
//     formik?.values?.Minutes,
//     formik?.values?.StartTime,
//   ]);

//   useEffect(() => {
//     const calculateTotalCost = () => {
//       const hours = parseFloat(formik?.values?.Hours) || 0;
//       const minutes = parseFloat(formik?.values?.Minutes) || 0;
//       const labourCost = parseFloat(formik?.values?.LabourCost) || 0;

//       const totalHours = hours + minutes / 60;
//       const totalCost = (totalHours * labourCost).toFixed(2);

//       formik?.setFieldValue("TotalCost", totalCost);
//     };

//     calculateTotalCost();
//   }, [
//     formik?.values?.Hours,
//     formik?.values?.Minutes,
//     formik?.values?.LabourCost,
//   ]);

//   return (
//     <Dialog
//       open={open?.isOpen}
//       onClose={() => {
//         setSelectedPerson(null);
//         formik.resetForm();
//         setOpen({ isOpen: false, propertyData: null });
//       }}
//       className="client"
//     >
//       <DialogTitle className="borerBommoModel">
//         <Grid className="w-100 d-flex justify-content-start align-items-center">
//           <Typography
//             className="text-blue-color text-property heading-four"
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: "42px",
//               margin: "0 10px",
//               // fontWeight: "500",
//                  fontWeight:"bold",
//               fontSize:"18px"
//             }}
//           >
//              New Time Entry
//           </Typography>
//         </Grid>
//       </DialogTitle>
//       <Divider style={{ height: "1px", backgroundColor: "#063164" }} />
//       <DialogContent>
//         <form onSubmit={formik.handleSubmit}>
//           <Grid className="d-flex gap-1">
//             <Col className="col-12 " xl={12}>
//               <Grid className="d-flex gap-1 timeEntryNewTiew gapInputStartAnd">
//                 <Grid
//                   xl={6}
//                   style={{ width: "49.5%", borderRadius: "4px " }}
//                   className="startTImeINput border-blue-color"
//                 >
//                   <LocalizationProvider
//                     dateAdapter={AdapterDayjs}
//                     className="startTImeINput border-blue-color"
//                   >
//                     <TimePicker
//                       label="Start Time"
//                       {...formik.getFieldProps("StartTime")}
//                       value={
//                         formik?.values?.StartTime &&
//                         dayjs(formik?.values?.StartTime).isValid()
//                           ? dayjs(formik?.values?.StartTime)
//                           : null
//                       }
//                       onChange={(value) =>
//                         formik?.setFieldValue(
//                           "StartTime",
//                           value && dayjs(value).isValid()
//                             ? value.toISOString()
//                             : null
//                         )
//                       }
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           borderRadius: "4px",
//                           borderColor: "#063164",
//                         },
//                         "& .MuiInputBase-input": {
//                           color: "#063164",
//                           borderColor: "#063164",
//                         },
//                         "& .MuiInputLabel-root": {
//                           color: "#063164",
//                           borderColor: "#063164",
//                         },
//                         "& .MuiSvgIcon-root": {
//                           color: "#063164",
//                           borderColor: "#063164",
//                         },
//                       }}
//                       onBlur={formik?.handleBlur}
//                     />
//                   </LocalizationProvider>
//                   {formik?.touched?.StartTime && formik?.errors?.StartTime && (
//                     <span
//                       style={{
//                         color: "red",
//                         marginLeft: "10px",
//                         fontSize: "12px",
//                       }}
//                     >
//                       {formik?.errors?.StartTime}
//                     </span>
//                   )}
//                 </Grid>

//                 <Grid
//                   xl={6}
//                   style={{ width: "49.5%", borderRadius: "4px " }}
//                   className="startTImeINput"
//                 >
//                   <LocalizationProvider dateAdapter={AdapterDayjs}>
//                     <TimePicker
//                       label="End   Time"
//                       {...formik?.getFieldProps("EndTime")}
//                       value={
//                         formik?.values?.EndTime &&
//                         dayjs(formik?.values?.EndTime).isValid()
//                           ? dayjs(formik?.values?.EndTime)
//                           : null
//                       }
//                       onChange={(value) =>
//                         formik.setFieldValue(
//                           "EndTime",
//                           value && dayjs(value).isValid()
//                             ? value?.toISOString()
//                             : null
//                         )
//                       }
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           borderRadius: "4px",
//                         },
//                         "& .MuiInputBase-input": {
//                           color: "#063164",
//                         },
//                         "& .MuiInputLabel-root": {
//                           color: "#063164",
//                         },
//                         "& .MuiSvgIcon-root": {
//                           color: "#063164",
//                         },
//                       }}
//                       onBlur={formik?.handleBlur}
//                     />
//                   </LocalizationProvider>
//                   {formik?.touched?.EndTime && formik?.errors?.EndTime && (
//                     <span
//                       style={{
//                         color: "red",
//                         marginLeft: "10px",
//                         fontSize: "12px",
//                       }}
//                     >
//                       {formik?.errors?.EndTime}
//                     </span>
//                   )}
//                 </Grid>
//               </Grid>
//             </Col>
//           </Grid>
//           <Col className="d-flex gap-1 my-2 col-12 timeEntryNewTiew" xl={12}>
//             <Col
//               className="col-6 startTImeINput"
//               style={{ width: "49.5%" }}
//               xl={6}
//             >
//               <InputText
//                 value={formik?.values?.Hours}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value < 0) {
//                     formik?.setFieldValue("Hours", 0);
//                   } else {
//                     formik?.setFieldValue("Hours", value);
//                   }
//                 }}
//                 onBlur={formik?.handleBlur}
//                 error={formik?.touched?.Hours && Boolean(formik?.errors?.Hours)}
//                 helperText={formik?.touched?.Hours && formik?.errors?.Hours}
//                 name="Hours"
//                 placeholder="Enter hours"
//                 label="Hours"
//                 type="number"
//                 className="text-blue-color w-100 mb-2 mx-0"
//                 fieldHeight="56px"
//               />
//             </Col>
//             <Col
//               className="col-6 startTImeINput"
//               style={{ width: "49.5%" }}
//               xl={6}
//             >
//               <InputText
//                 value={formik?.values?.Minutes}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value < 0) {
//                     formik.setFieldValue("Minutes", 0);
//                   } else {
//                     formik.setFieldValue("Minutes", value);
//                   }
//                 }}
//                 onBlur={formik?.handleBlur}
//                 error={
//                   formik?.touched?.Minutes && Boolean(formik?.errors?.Minutes)
//                 }
//                 helperText={formik?.touched?.Minutes && formik?.errors?.Minutes}
//                 name="Minutes"
//                 placeholder="Enter minutes "
//                 label="Minutes"
//                 type="number"
//                 className="text-blue-color w-100 mb-2 mx-0"
//                 fieldHeight="56px"
//               />
//             </Col>
//           </Col>
//           <Col className="col-12 time-compo my-2" xl={12}>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DemoContainer components={["DatePicker"]}>
//                 <DatePicker
//                   label="Basic date picker"
//                   value={
//                     formik?.values?.DatePicker
//                       ? dayjs(formik?.values?.DatePicker)
//                       : null
//                   }
//                   onChange={(value) =>
//                     formik?.setFieldValue(
//                       "DatePicker",
//                       value ? value.toDate() : null
//                     )
//                   }
//                   onBlur={formik?.handleBlur}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       error={
//                         formik?.touched?.DatePicker &&
//                         Boolean(formik?.errors?.DatePicker)
//                       }
//                       helperText={
//                         formik?.touched?.DatePicker &&
//                         formik?.errors?.DatePicker
//                       }
//                     />
//                   )}
//                   sx={{
//                     "& .MuiInputBase-root": {
//                       borderRadius: "8px",
//                     },
//                     "& .MuiInputBase-input": {
//                       color: "#063164",
//                     },
//                     "& .MuiInputLabel-root": {
//                       color: "#063164",
//                     },
//                     "& .MuiSvgIcon-root": {
//                       color: "#063164",
//                     },
//                   }}
//                 />
//               </DemoContainer>
//             </LocalizationProvider>
//           </Col>
//           <Col
//             className="d-flex gap-1 my-2 col-12 timeEntryNewTiew employeLabourCost"
//             xl={12}
//           >
//             <Col
//               className="col-6 startTImeINput"
//               style={{ width: "49.5%" }}
//               xl={12}
//             >
//               <FormControl fullWidth>
//                 <InputDropdown
//                   onChange={(_, newValue) => {
//                     const selectedPersonId = newValue ? newValue.WorkerId : "";
//                     formik.setFieldValue("WorkerId", selectedPersonId);
//                     setSelectedPerson(newValue);
//                   }}
//                   textFieldProps={formik?.getFieldProps("WorkerId")}
//                   options={teamData}
//                   value={selectedPerson || null}
//                   inputValue={selectedPerson ? selectedPerson?.FullName : ""}
//                   onTextFieldChange={formik?.handleChange}
//                   onBlur={formik?.handleBlur}
//                   getOptionLabel={(option) => option?.FullName || ""}
//                   error={
//                     formik?.touched?.WorkerId &&
//                     Boolean(formik?.errors?.WorkerId)
//                   }
//                   helperText={
//                     formik?.touched?.WorkerId && formik?.errors?.WorkerId
//                   }
//                   filterOptions={(options, state) => {
//                     return options?.filter((option) =>
//                       option?.FullName?.toLowerCase()?.includes(
//                         state?.inputValue?.toLowerCase() || ""
//                       )
//                     );
//                   }}
//                   name="Employee"
//                   label="Employee"
//                   type="text"
//                 />
//               </FormControl>
//             </Col>
//             <Col
//               className="col-6 startTImeINput"
//               style={{ width: "49.5%" }}
//               xl={12}
//             >
//               <InputText
//                 value={formik?.values?.LabourCost}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (/^\d*\.?\d*$/.test(value)) {
//                     handleChange({
//                       target: {
//                         name: "LabourCost",
//                         value: Math?.max(0, Number(value)),
//                       },
//                     });
//                   }
//                 }}
//                 onBlur={formik?.handleBlur}
//                 error={
//                   formik?.touched?.LabourCost &&
//                   Boolean(formik?.errors?.LabourCost)
//                 }
//                 helperText={
//                   formik?.touched?.LabourCost && formik?.errors?.LabourCost
//                 }
//                 name="LabourCost"
//                 label="Labour Cost"
//                 type="text"
//                 placeholder="$0.00"
//                 className=" w-100 m-0 mb-3 "
//                 fieldHeight="56px"
//                 endAdornment={
//                   <InputAdornment position="end">
//                     <span
//                       className="text-blue-color"
//                       style={{ fontSize: "12px" }}
//                     >
//                       per hour
//                     </span>
//                   </InputAdornment>
//                 }
//               />
//             </Col>
//           </Col>
//           <i>
//             <Typography
//               className="mb-0 totalCostTimeEntry"
//               style={{ color: "rgba(6, 49, 100, 70%)", fontSize: "14px" }}
//             >
//               Total Cost : ${formik?.values?.TotalCost}
//             </Typography>
//           </i>
//         </form>
//       </DialogContent>
//       <DialogActions className="d-flex justify-content-between mx-3 mb-2 gapBtn BlueAndWhiteBtmFlex ">
//         <WhiteButton
//           onClick={() => {
//             formik.resetForm();
//             setLabourId("");
//             setSelectedPerson(null);
//             setOpen({ isOpen: false, propertyData: null });
//           }}
//           label="Cancel"
//         />
//         <BlueButton
//           className="timeEntryBtn"
//           onClick={() => {
//             formik.handleSubmit();
//             setSelectedPerson(null);
//           }}
//           label={
//             loading ? (
//               <WhiteLoaderComponent
//                 height="20"
//                 width="20"
//                 padding="20"
//                 loader={loading}
//               />
//             ) : (
//               "Save Time Entry"
//             )
//           }
//         />
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default TimeEmpty;

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  FormControl,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Col } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
// import "../../components/Contract Component/style.scss";
import AxiosInstance from "../../Views/AxiosInstance";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import InputText from "../InputFields/InputText";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InputDropdown from "../InputFields/InputDropdown";
import dayjs from "dayjs";
import BlueButton from "../Button/BlueButton";
import WhiteButton from "../Button/WhiteButton";
import { Grid } from "@mui/material";
import showToast from "../Toast/Toster";
import { WhiteLoaderComponent } from "../Icon/Index";
import { handleAuth } from "../Login/Auth";
import { Navigate, useLocation } from "react-router-dom";
import DollerInput from "../InputFields/Doller";
const TimeEmpty = ({
  open,
  setOpen,
  data,
  ContractId,
  WorkerId,
  fetchData,
  CompanyId,
  LabourId,
  setLabourId,
}) => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tokenDecode, setTokenDecode] = useState({});
  const location = useLocation();
  const fetchDatas = async () => {
    try {
      const res = await handleAuth(Navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDatas();
  }, []);

  let fetchLabourData = async () => {
    try {
      if (!LabourId || !ContractId) {
        console.error("LabourId or ContractId is missing!");
        return;
      }
      const labourRes = await AxiosInstance.get(
        `/v1/labour/${LabourId}/${ContractId}`
      );
        console.log(labourRes,"labourReslabourRes")
      formik.setValues({
        Notes: labourRes?.data?.data?.Notes,
        Hours: labourRes?.data?.data?.Hours,
        Minutes: labourRes?.data?.data?.Minutes,
        LabourCost: labourRes?.data?.data?.LabourCost,
        StartTime: labourRes?.data?.data?.StartTime,
        DatePicker: labourRes?.data?.data?.DatePicker,
        WorkerId: labourRes?.data?.data?.WorkerId,
      });
      const person = teamData.find(
        (teamMember) => teamMember?.WorkerId === labourRes?.data?.data?.WorkerId
      );
      setSelectedPerson(person || null);
    } catch (error) {
      console.error("Error: ", error?.messae);
    }
  };
  useEffect(() => {
    fetchLabourData();
  }, [LabourId]);
  const formik = useFormik({
    initialValues: {
      CompanyId: "",
      Address: "",
      WorkerId: "",
      City: "",
      State: "",
      Zip: "",
      Team: "",
      ContractId: "",
      StartTime: "",
      EndTime: "",
      Hours: "",
      Minutes: "",
      Notes: "",
      DatePicker: dayjs().toDate(),
      LabourCost: "",
      TotalCost: "0.00",
    },
    validationSchema: Yup.object({
      StartTime: Yup.string().required("StartTime required"),
      EndTime: Yup.string().required("EndTime required"),
      Hours: Yup.string().required("Hours required"),
      Minutes: Yup.string().required("Minutes required"),
      LabourCost: Yup.string().required("LabourCost required"),
    }),
    onSubmit: async (values) => {
      if (!LabourId) {
        try {
          setLoading(true);
          values["CompanyId"] = CompanyId;
          values["ContractId"] = ContractId;
          const response = await AxiosInstance.post(
            `${baseUrl}/v1/labour`,
            values
          );
          console.log(response, "response");
          console.log(response?.data?.statusCode, "response?.data?.statusCode");
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
            console.error("Error: ", error);
            showToast.error("An error occurred while submitting the form.");
          }
        } finally {
          setLoading(false);
        }
      } else {
        try {
          setLoading(true);
          values["CompanyId"] = CompanyId;
          values["ContractId"] = ContractId;
          const labourId = values.LabourId;
          const response = await AxiosInstance.put(
            `/labour/${LabourId}/${ContractId}`,
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
          setLoading(false);
        }
      }

      formik.resetForm();
      setLabourId("");
      setSelectedPerson(null);
      // setOpen({ isOpen: false, propertyData: null });
    },
  });
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

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const companyId =
          localStorage.getItem("CompanyId") || tokenDecode?.companyId;

        if (!companyId) {
          console.error(
            "CompanyId is not found in localStorage or tokenDecode."
          );
          return;
        }

        const response = await AxiosInstance.get(`/worker/${companyId}`);
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

    fetchTeamData();
  }, [tokenDecode]);

  const calculateTimeDifference = (start, end) => {
    if (!start || !end) return { hours: "0", minutes: "0" };

    const startDate = dayjs(start);
    const endDate = dayjs(end);
    if (endDate.isBefore(startDate)) return { hours: "0", minutes: "0" };

    const diff = endDate.diff(startDate);
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diff / (1000 * 60)) % 60);

    return {
      hours: diffInHours.toString(),
      minutes: diffInMinutes.toString(),
    };
  };

  useEffect(() => {
    if (formik?.values?.StartTime && formik?.values?.EndTime) {
      const { hours, minutes } = calculateTimeDifference(
        formik?.values?.StartTime,
        formik?.values?.EndTime
      );
      formik?.setFieldValue("Hours", hours);
      formik?.setFieldValue("Minutes", minutes);
    }
  }, [formik?.values?.StartTime, formik?.values?.EndTime]);

  useEffect(() => {
    if (
      formik?.values?.Hours !== "" &&
      formik?.values?.Minutes !== "" &&
      formik?.values?.StartTime
    ) {
      const startTime = dayjs(formik?.values?.StartTime);
      const newEndTime = startTime
        .add(Number(formik?.values?.Hours), "hour")
        .add(Number(formik?.values?.Minutes), "minute")
        .toISOString();

      formik?.setFieldValue("EndTime", newEndTime);
    }
  }, [
    formik?.values?.Hours,
    formik?.values?.Minutes,
    formik?.values?.StartTime,
  ]);

  useEffect(() => {
    const calculateTotalCost = () => {
      const hours = parseFloat(formik?.values?.Hours) || 0;
      const minutes = parseFloat(formik?.values?.Minutes) || 0;
      const labourCost = parseFloat(formik?.values?.LabourCost) || 0;

      const totalHours = hours + minutes / 60;
      const totalCost = (totalHours * labourCost).toFixed(2);

      formik?.setFieldValue("TotalCost", totalCost);
    };

    calculateTotalCost();
  }, [
    formik?.values?.Hours,
    formik?.values?.Minutes,
    formik?.values?.LabourCost,
  ]);

  return (
    <Dialog
      open={open?.isOpen}
      onClose={() => {
        setSelectedPerson(null);
        formik.resetForm();
        setOpen({ isOpen: false, propertyData: null });
      }}
      className="client"
    >
      <DialogTitle className="borerBommoModel">
        <Grid className="w-100 d-flex justify-content-start align-items-center">
          <Typography
            className="text-blue-color text-property heading-four"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "42px",
              margin: "0 10px",
              // fontWeight: "500",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            New Time Entry
          </Typography>
        </Grid>
      </DialogTitle>
      <Divider style={{ height: "1px", backgroundColor: "#063164" }} />
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid className="d-flex gap-1">
            <Col className="col-12 " xl={12}>
              <Grid className="d-flex gap-1 timeEntryNewTiew gapInputStartAnd">
                <Grid
                  xl={6}
                  style={{ width: "49.5%", borderRadius: "4px " }}
                  className="startTImeINput border-blue-color"
                >
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    className="startTImeINput border-blue-color"
                  >
                    <TimePicker
                      label="Start Time"
                      {...formik.getFieldProps("StartTime")}
                      value={
                        formik?.values?.StartTime &&
                        dayjs(formik?.values?.StartTime).isValid()
                          ? dayjs(formik?.values?.StartTime)
                          : null
                      }
                      onChange={(value) =>
                        formik?.setFieldValue(
                          "StartTime",
                          value && dayjs(value).isValid()
                            ? value.toISOString()
                            : null
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: "4px",
                          borderColor: "#063164",
                        },
                        "& .MuiInputBase-input": {
                          color: "#063164",
                          borderColor: "#063164",
                        },
                        "& .MuiInputLabel-root": {
                          color: "#063164",
                          borderColor: "#063164",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "#063164",
                          borderColor: "#063164",
                        },
                      }}
                      onBlur={formik?.handleBlur}
                    />
                  </LocalizationProvider>
                  {formik?.touched?.StartTime && formik?.errors?.StartTime && (
                    <span
                      style={{
                        color: "red",
                        marginLeft: "10px",
                        fontSize: "12px",
                      }}
                    >
                      {formik?.errors?.StartTime}
                    </span>
                  )}
                </Grid>

                <Grid
                  xl={6}
                  style={{ width: "49.5%", borderRadius: "4px " }}
                  className="startTImeINput"
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="End   Time"
                      {...formik?.getFieldProps("EndTime")}
                      value={
                        formik?.values?.EndTime &&
                        dayjs(formik?.values?.EndTime).isValid()
                          ? dayjs(formik?.values?.EndTime)
                          : null
                      }
                      onChange={(value) =>
                        formik.setFieldValue(
                          "EndTime",
                          value && dayjs(value).isValid()
                            ? value?.toISOString()
                            : null
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: "4px",
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
                      onBlur={formik?.handleBlur}
                    />
                  </LocalizationProvider>
                  {formik?.touched?.EndTime && formik?.errors?.EndTime && (
                    <span
                      style={{
                        color: "red",
                        marginLeft: "10px",
                        fontSize: "12px",
                      }}
                    >
                      {formik?.errors?.EndTime}
                    </span>
                  )}
                </Grid>
              </Grid>
            </Col>
          </Grid>
          <Col className="d-flex gap-1 my-2 col-12 timeEntryNewTiew" xl={12}>
            <Col
              className="col-6 startTImeINput"
              style={{ width: "49.5%" }}
              xl={6}
            >
              <InputText
                value={formik?.values?.Hours}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    formik?.setFieldValue("Hours", 0);
                  } else {
                    formik?.setFieldValue("Hours", value);
                  }
                }}
                onBlur={formik?.handleBlur}
                error={formik?.touched?.Hours && Boolean(formik?.errors?.Hours)}
                helperText={formik?.touched?.Hours && formik?.errors?.Hours}
                name="Hours"
                placeholder="Enter hours"
                label="Hours"
                type="number"
                className="text-blue-color w-100 mb-2 mx-0"
                fieldHeight="56px"
              />
            </Col>
            <Col
              className="col-6 startTImeINput"
              style={{ width: "49.5%" }}
              xl={6}
            >
              <InputText
                value={formik?.values?.Minutes}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    formik.setFieldValue("Minutes", 0);
                  } else {
                    formik.setFieldValue("Minutes", value);
                  }
                }}
                onBlur={formik?.handleBlur}
                error={
                  formik?.touched?.Minutes && Boolean(formik?.errors?.Minutes)
                }
                helperText={formik?.touched?.Minutes && formik?.errors?.Minutes}
                name="Minutes"
                placeholder="Enter minutes "
                label="Minutes"
                type="number"
                className="text-blue-color w-100 mb-2 mx-0"
                fieldHeight="56px"
              />
            </Col>
          </Col>
          <Col className="col-12 time-compo my-2" xl={12}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  label="Basic date picker"
                  value={
                    formik?.values?.DatePicker
                      ? dayjs(formik?.values?.DatePicker)
                      : null
                  }
                  onChange={(value) =>
                    formik?.setFieldValue(
                      "DatePicker",
                      value ? value.toDate() : null
                    )
                  }
                  onBlur={formik?.handleBlur}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={
                        formik?.touched?.DatePicker &&
                        Boolean(formik?.errors?.DatePicker)
                      }
                      helperText={
                        formik?.touched?.DatePicker &&
                        formik?.errors?.DatePicker
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
          </Col>
          <Col
            className="d-flex gap-1 my-2 col-12 timeEntryNewTiew employeLabourCost"
            xl={12}
          >
            <Col
              className="col-6 startTImeINput"
              style={{ width: "49.5%" }}
              xl={12}
            >
              {/* <FormControl fullWidth>
                <InputDropdown
                  onChange={(_, newValue) => {
                    const selectedPersonId = newValue ? newValue.WorkerId : "";
                    formik.setFieldValue("WorkerId", selectedPersonId);
                    setSelectedPerson(newValue);
                  }}
                  textFieldProps={formik?.getFieldProps("WorkerId")}
                  options={teamData}
                  value={selectedPerson || null}
                  inputValue={selectedPerson ? selectedPerson?.FullName : ""}
                  onTextFieldChange={formik?.handleChange}
                  onBlur={formik?.handleBlur}
                  getOptionLabel={(option) => option?.FullName || ""}
                  error={
                    formik?.touched?.WorkerId &&
                    Boolean(formik?.errors?.WorkerId)
                  }
                  helperText={
                    formik?.touched?.WorkerId && formik?.errors?.WorkerId
                  }
                  filterOptions={(options, state) => {
                    return options?.filter((option) =>
                      option?.FullName?.toLowerCase()?.includes(
                        state?.inputValue?.toLowerCase() || ""
                      )
                    );
                  }}
                  name="Employee"
                  label="Employee"
                  type="text"
                />
              </FormControl> */}
              <FormControl fullWidth>
                <InputDropdown
                  onChange={(_, newValue) => {
                    const selectedPersonId = newValue ? newValue.WorkerId : "";
                    formik.setFieldValue("WorkerId", selectedPersonId);
                    setSelectedPerson(newValue);
                  }}
                  textFieldProps={formik?.getFieldProps("WorkerId")}
                  options={teamData}
                  value={selectedPerson || null}
                  inputValue={
                    selectedPerson
                      ? `${selectedPerson?.FirstName} ${selectedPerson?.LastName}`
                      : ""
                  }
                  onTextFieldChange={formik?.handleChange}
                  onBlur={formik?.handleBlur}
                  getOptionLabel={(option) =>
                    `${option?.FirstName} ${option?.LastName}`.trim()
                  }
                  error={
                    formik?.touched?.WorkerId &&
                    Boolean(formik?.errors?.WorkerId)
                  }
                  helperText={
                    formik?.touched?.WorkerId && formik?.errors?.WorkerId
                  }
                  filterOptions={(options, state) => {
                    return options?.filter((option) =>
                      `${option?.FirstName} ${option?.LastName}`
                        .toLowerCase()
                        .includes(state?.inputValue?.toLowerCase() || "")
                    );
                  }}
                  name="Employee"
                  label="Employee"
                  type="text"
                />
              </FormControl>
            </Col>
            <Col
              className="col-6 startTImeINput"
              style={{ width: "49.5%" }}
              xl={12}
            >
              <DollerInput
                value={formik?.values?.LabourCost}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    handleChange({
                      target: {
                        name: "LabourCost",
                        value: Math?.max(0, Number(value)),
                      },
                    });
                  }
                }}
                onBlur={formik?.handleBlur}
                error={
                  formik?.touched?.LabourCost &&
                  Boolean(formik?.errors?.LabourCost)
                }
                helperText={
                  formik?.touched?.LabourCost && formik?.errors?.LabourCost
                }
                name="LabourCost"
                label="Labour Cost"
                type="text"
                placeholder="Labour Cost"
                className=" w-100 m-0 mb-3 "
                fieldHeight="56px"
                endAdornment={
                  <InputAdornment position="end">
                    <span
                      className="text-blue-color"
                      style={{ fontSize: "12px" }}
                    >
                      per hour
                    </span>
                  </InputAdornment>
                }
              />
            </Col>
          </Col>
          <i>
            <Typography
              className="mb-0 totalCostTimeEntry"
              style={{ color: "rgba(6, 49, 100, 70%)", fontSize: "14px" }}
            >
              Total Cost : ${formik?.values?.TotalCost}
            </Typography>
          </i>
        </form>
      </DialogContent>
      <DialogActions className="d-flex justify-content-between mx-3 mb-2 gapBtn BlueAndWhiteBtmFlex ">
        <WhiteButton
          onClick={() => {
            formik.resetForm();
            setLabourId("");
            setSelectedPerson(null);
            setOpen({ isOpen: false, propertyData: null });
          }}
          label="Cancel"
        />
        <BlueButton
          className="timeEntryBtn"
          onClick={() => {
            formik.handleSubmit();
            setSelectedPerson(null);
          }}
          label={
            loading ? (
              <WhiteLoaderComponent
                height="20"
                width="20"
                padding="20"
                loader={loading}
              />
            ) : (
              "Save Time Entry"
            )
          }
        />
      </DialogActions>
    </Dialog>
  );
};

export default TimeEmpty;
