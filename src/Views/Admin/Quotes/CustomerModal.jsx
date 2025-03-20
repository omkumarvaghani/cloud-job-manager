// import {
//   Box,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormGroup,
//   IconButton,
//   Typography,
// } from "@mui/material";
// import { Country } from "country-state-city";
// import React, { useEffect, useState } from "react";
// import CloseIcon from "@mui/icons-material/Close";
// import DomainAddOutlinedIcon from "@mui/icons-material/DomainAddOutlined";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import AxiosInstance from "../../AxiosInstance";
// import QuoteUser from "../../../assets/Blue-sidebar-icon/Customermodel.svg";
// import "./style.css";
// import { Grid } from "@mui/material";
// import { LoaderComponent } from "../../../components/Icon/Index";

// import InputText from "../../../components/InputFields/InputText";
// import {
//   Button,
//   Card,
//   CardBody,
//   CardHeader,
//   CardTitle,
//   Input,
//   Label,
// } from "reactstrap";
// import Address from "../../../components/Address";
// import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import showToast from "../../../components/Toast/Toster";
// import BlueButton from "../../../components/Button/BlueButton";
// import WhiteButton from "../../../components/Button/WhiteButton";
// import clientcontact from "../../../assets/White-sidebar-icon/Home.svg";
// import client from "../../../assets/White-sidebar-icon/Customer.svg";

// const CustomerModal = ({
//   isCustomer,
//   setIsCustomer,
//   isProperty,
//   setIsProperty,
//   setFieldValue,
//   values,
//   lineItems,
//   setPropertyData,
//   setCustomersData,
//   formik,
//   source,
// }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { companyName } = useParams();
//   const [customerData, setCustomerData] = useState([]);
//   const [locationData, setLocationData] = useState([]);
//   const [searchInput, setSearchInput] = useState("");
//   const [loader, setLoader] = useState(true);
//   const [selectedCountry, setSelectedCountry] = useState(null);
//   const [countries, setCountries] = useState([]);
//   const [CompanyId, setCompanyId] = useState(localStorage.getItem("CompanyId"));
//   const [isEdited, setIsEdited] = useState(false);

//   // const formik = useFormik({
//   //   initialValues: {
//   //     CompanyId: "",
//   //     FirstName: "",
//   //     LastName: "",
//   //     City: "",
//   //     State: "",
//   //     Zip: "",
//   //     Country: "",
//   //     PhoneNumber: "",
//   //     EmailAddress: "",
//   //     Address: "",
//   //   },
//   //   validationSchema: Yup.object({
//   //     FirstName: Yup.string().required("First Name  Required"),
//   //     LastName: Yup.string().required("Last Name  Required"),
//   //     PhoneNumber: Yup.string()
//   //       .required("Phone number  required")
//   //       .matches(
//   //         /^\(\d{3}\) \d{3}-\d{4}$/,
//   //         "Phone number must be in the format (xxx) xxx-xxxx"
//   //       ),
//   //     EmailAddress: Yup.string()
//   //       .email("Invalid email")
//   //       .required("Email required")
//   //       .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
//   //     City: Yup.string().required(" City Required"),
//   //     State: Yup.string().required(" State Required"),
//   //     Address: Yup.string().required("Address Required"),
//   //     Zip: Yup.string().required("Zip Required"),
//   //     Country: Yup.string().required(" Country Required"),
//   //   }),
//   //   enableReinitialize: true,
//   //   onSubmit: async (values) => {
//   //     if (location?.state?.id) {
//   //       try {
//   //         setLoader(true);
//   //         const response = await AxiosInstance.put(
//   //           `/customer/${location?.state?.id}`,
//   //           values
//   //         );
//   //         if (response?.data?.statusCode === 200) {
//   //           setLoader(false);

//   //           setTimeout(() => {
//   //             showToast.success(response?.data?.message);
//   //           }, 500);
//   //           navigate(
//   //             `/${
//   //               companyName
//   //                 ? companyName + "/customer"
//   //                 : "staff-member" + "/workercustomer"
//   //             }`,
//   //             {
//   //               state: {
//   //                 navigats: location?.state?.navigats.filter(
//   //                   (item) => item !== "/add-customer"
//   //                 ),
//   //               },
//   //             }
//   //           );
//   //         } else if (response?.data?.statusCode === 203) {
//   //           setTimeout(() => {
//   //             showToast.error(response?.data?.message, "error");
//   //           }, 500);
//   //         } else {
//   //           showToast.error("", response?.data?.message, "error");
//   //         }
//   //       } catch (error) {
//   //         if (error.response) {
//   //           console.error(
//   //             "Server responded with an error:",
//   //             error.response?.data
//   //           );
//   //           showToast.error(
//   //             error?.response?.data?.message || "Something went wrong!"
//   //           );
//   //         } else if (error?.request) {
//   //           console.error("No response received:", error?.request);
//   //           showToast.error(
//   //             "No response from the server, please try again later."
//   //           );
//   //         } else {
//   //           console.error("Error during request setup:", error?.message);
//   //           showToast.error("Error occurred while sending request.");
//   //         }
//   //       } finally {
//   //         setSelectedCountry("");
//   //         setLoader(false);
//   //       }
//   //     } else {
//   //       try {
//   //         setLoader(true);
//   //         const response = await AxiosInstance.post(`/customer`, {
//   //           ...values,
//   //           CompanyId: CompanyId,
//   //           AddedAt: new Date(),
//   //         });
//   //         if (response?.data.statusCode === 201) {
//   //           setLoader(false);
//   //           if (location?.state?.previewPage) {
//   //             showToast(response?.data?.message);
//   //             navigate(location?.state?.previewPage, {
//   //               state: {
//   //                 CustomerId: response?.data?.CustomerId,
//   //                 navigats: location?.state?.navigats.filter(
//   //                   (item) => item !== "/add-customer"
//   //                 ),
//   //               },
//   //             });
//   //           } else {
//   //             showToast.success(response?.data?.message);
//   //             setOpenDialog(false);
//   //             fetchData();
//   //           }
//   //         } else {
//   //           showToast.error(response?.data.message, "error");
//   //         }
//   //       } catch (error) {
//   //         if (error?.response) {
//   //           console.error(
//   //             "Server responded with an error:",
//   //             error?.response?.data
//   //           );
//   //           showToast.error(
//   //             error?.response?.data?.message || "Something went wrong!"
//   //           );
//   //         } else if (error?.request) {
//   //           console.error("No response received:", error?.request);
//   //           showToast.error(
//   //             "No response from the server, please try again later."
//   //           );
//   //         } else {
//   //           console.error("Error during request setup:", error?.message);
//   //           showToast.error("Error occurred while sending request.");
//   //         }
//   //       } finally {
//   //         setLoader(false);
//   //       }
//   //     }
//   //   },
//   // });

//   useEffect(() => {
//     setCountries(Country.getAllCountries());
//     if (formik?.values?.Country) {
//       setSelectedCountry(() => {
//         const country = Country.getAllCountries().find(
//           (item) => item?.name === formik?.values?.Country
//         );
//         return country;
//       });
//     }
//   }, [formik]);
//   const fetchTokenData = async () => {
//     if (!CompanyId) {
//       try {
//         const token =
//           localStorage?.getItem("adminToken") ||
//           localStorage?.getItem("workerToken");

//         if (!token) {
//           console.error("Token not found in localStorage");
//           return;
//         }
//         const res = await AxiosInstance.post(`/company/token_data`, {
//           token,
//         });
//         if (res?.data?.data?.CompanyId) {
//           setCompanyId(res?.data?.data?.CompanyId);
//         }
//       } catch (error) {
//         console.error("Error:", error?.message);
//       } finally {
//         setLoader(false);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchTokenData();
//   }, []);

//   const handleClose = (id) => {
//     const isStaffMember = location?.pathname?.includes("/staff-member");

//     const newPath = isStaffMember
//       ? `/staff-member/workerinvoicetable`
//       : `/${companyName}/invoicetable`;

//     navigate(newPath, {
//       state: {
//         CustomerId: id,
//         navigats: [...location?.state?.navigats, newPath],
//       },
//     });
//   };
//   const fetchData = async () => {
//     try {
//       setLoader(true);
//       const res = await AxiosInstance.get(
//         `/customer/get_customer/${CompanyId}`
//       );
//       if (res?.data?.statusCode === 200) {
//         setCustomerData(res?.data?.data);
//         setLoader(false);
//       }
//     } catch (error) {
//       console.error("Error: ", error?.message);
//     } finally {
//       setLoader(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [CompanyId]);

//   useEffect(() => {
//     if (
//       formik?.values?.CustomerId &&
//       formik?.values?.LocationId &&
//       customerData?.length > 0
//     ) {
//       const data = customerData.find(
//         (item) => item?.CustomerId === formik?.values?.CustomerId
//       );
//       setCustomersData(data);
//       const location = data?.location?.find(
//         (item) => item?.LocationId === formik?.values?.LocationId
//       );
//       setPropertyData(location);
//     }
//   }, [formik?.values, customerData]);

//   const filteredCustomers = !isProperty
//     ? customerData?.filter((customer) =>
//         `${customer?.FirstName} ${customer?.LastName}`
//           .toLowerCase()
//           .includes(searchInput?.toLowerCase())
//       )
//     : locationData?.filter((location) =>
//         `${location?.Address} ${location?.City} ${location?.State} ${location?.Country}`
//           .toLowerCase()
//           .includes(searchInput?.toLowerCase())
//       );

//   useEffect(() => {
//     const updateData = () => {
//       if (location?.state?.Customer) {
//         setCustomersData(location?.state?.Customer);
//         setFieldValue("CustomerId", location?.state?.Customer?.CustomerId);
//         if (
//           location?.state?.Customer?.location &&
//           location?.state?.Customer?.location?.length === 1
//         ) {
//           setPropertyData(location?.state?.Customer);
//           setFieldValue(
//             "LocationId",
//             location?.state?.Customer?.location[0]?.LocationId
//           );
//         } else {
//           setLocationData(location?.state?.Customer?.location);
//           setIsCustomer(true);
//           setIsProperty(true);
//         }
//       }
//     };

//     updateData();
//   }, [location?.state?.Customer, customerData]);

//   const [openDialog, setOpenDialog] = useState(false); // State to control dialog visibility

//   const handleDialogClose = () => {
//     setOpenDialog(false); // Close the dialog
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (name === "Country") {
//       formik.setFieldValue(name, value);
//     } else {
//       formik.setFieldValue(name, type === "checkbox" ? checked : value);
//     }
//     setIsEdited(true);
//   };

//   const formatPhoneNumber = (value) => {
//     const PhoneNumber = value.replace(/[^\d]/g, "");
//     const limitedPhoneNumber = PhoneNumber.slice(0, 10);
//     const match = limitedPhoneNumber.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

//     if (match) {
//       let formattedNumber = "";
//       if (match[1].length >= 3) {
//         formattedNumber = `(${match[1]}) `;
//       } else {
//         formattedNumber = match[1];
//       }
//       formattedNumber += match[2];
//       if (match[3]) {
//         formattedNumber += `-${match[3]}`;
//       }

//       return formattedNumber;
//     }
//     return limitedPhoneNumber;
//   };
//   const handlePhoneChange = (e) => {
//     if (formik?.values?.PhoneNumber?.length > e?.target?.value?.length) {
//       formik?.setFieldValue("PhoneNumber", e?.target?.value);
//     } else {
//       const formattedValue = formatPhoneNumber(e.target.value);
//       formik?.setFieldValue("PhoneNumber", formattedValue);
//     }
//     setIsEdited(true);
//   };

//   const handleZipChange = (event) => {
//     const { name, value } = event.target;
//     const regex = /^[A-Za-z0-9]*$/;

//     if (regex.test(value) || value === "") {
//       formik.setFieldValue(name, value);
//     }
//   };
//   return (
//     <>
//       <Dialog
//         open={isCustomer}
//         onClose={() => {
//           setIsCustomer(false);
//           setIsProperty(false);
//         }}
//         style={{ height: "100%" }}
//       >
//         <DialogTitle className="text-blue-color SelectCutomerHead ">
//           Select or Create a Customer
//           <Typography
//             gutterBottom
//             className="px-3 pt-3 text-blue-color SelectCutomerLike"
//           >
//             Which Customer would you like to create this for?
//           </Typography>
//         </DialogTitle>
//         <DialogContent className="selectCustomer_box">
//           <IconButton
//             aria-label="close "
//             onClick={() => {
//               setIsCustomer(!isCustomer);
//               setIsProperty(false);
//             }}
//             sx={{
//               position: "absolute",
//               right: 8,
//               top: 8,
//               color: (theme) => theme.palette.grey[500],
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//           <Box
//             className="mx-3"
//             sx={{
//               border: "1px solid rgba(6, 49, 100, 80%)",
//               borderRadius: "5px",
//             }}
//           >
//             {loader ? (
//               <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
//                 <LoaderComponent loader={loader} height="50" width="50" />
//               </Grid>
//             ) : (
//               <DialogContent Grididers style={{ border: 0 }}>
//                 <Grid
//                   className="mb-3 selectcreatebtns clientSerach_createNew"
//                   style={{ display: "flex", flexWrap: "wrap" }}
//                 >
//                   <Grid
//                     className="flex-grow-1 me-2 mb-2 searchClients"
//                     style={{ minWidth: "0", width: "150px" }}
//                   >
//                     <InputText
//                       id="search"
//                       name="search"
//                       placeholder="Enter search customer"
//                       type="text"
//                       className="text-blue-color border-blue-color customerModelSearch"
//                       style={{
//                         fontSize: "14px",
//                       }}
//                       value={searchInput}
//                       onChange={(e) => setSearchInput(e.target.value)}
//                     />
//                   </Grid>
//                   <Grid className="selectCustomerMOdel">
//                     <Typography
//                       className="mt-2 mb-2 selectCustomerOr text-blue-color"
//                       style={{ textAlign: "center" }}
//                     >
//                       or
//                     </Typography>
//                   </Grid>
//                   <Grid
//                     className="btn bg-button-blue-color text-white-color flex-grow-1 ms-2 mb-2 cratenclientmodal searchClients createNewCutomer"
//                     style={{
//                       minWidth: "0",
//                       fontSize: "14px",
//                       height: "40px",
//                       justifyContent: "start",
//                       display: "flex",
//                       alignItems: "center",
//                     }}
//                     onClick={() => {
//                       navigate(`/${companyName}/add-customer`, {
//                         state: {
//                           previewPage: location?.pathname,
//                           previewData: {
//                             values,
//                             lineItems,
//                             id: location?.state?.id || null,
//                           },
//                           navigats: [
//                             ...location?.state?.navigats,
//                             "/add-customer",
//                           ],
//                         },
//                       });
//                     }}
//                   >
//                     Create new Customer
//                   </Grid>
//                   {/* <Grid
//                     className="btn bg-button-blue-color text-white-color flex-grow-1 ms-2 mb-2 cratenclientmodal searchClients createNewCutomer"
//                     style={{
//                       minWidth: "0",
//                       fontSize: "14px",
//                       height: "40px",
//                       justifyContent: "start",
//                       display: "flex",
//                       alignItems: "center",
//                     }}
//                     onClick={() => setOpenDialog(true)} // Open dialog when clicked
//                   >
//                     Create new Customer
//                   </Grid> */}
//                 </Grid>

//                 {filteredCustomers?.length === 0 && (
//                   <Grid
//                     className="text-center mt-3 text-blue-color"
//                     style={{ fontSize: "14px" }}
//                   >
//                     No customers found
//                   </Grid>
//                 )}

//                 {filteredCustomers?.length > 0 && (
//                   <>
//                     <Typography
//                       className="mt-2 leadSelectCustomer"
//                       style={{
//                         color: "blue",
//                         paddingLeft: "30px",
//                         color: "#07CF10",
//                         fontSize: "14px",
//                         fontWeight: "600",
//                       }}
//                     >
//                       Active
//                     </Typography>

//                     <Grid
//                       style={{
//                         marginLeft: "-15px",
//                         marginRight: "-15px",
//                         marginTop: "-10px",
//                       }}
//                     >
//                       <hr style={{ border: " 1px solid #063164CC" }} />
//                     </Grid>
//                   </>
//                 )}

//                 {!isProperty
//                   ? filteredCustomers?.length > 0 &&
//                     filteredCustomers?.map((item, index) => (
//                       <Grid
//                         className="w-100 mt-3 d-flex justify-content-between text-blue-color customerMOdelUserName"
//                         key={index}
//                         style={{ cursor: "pointer" }}
//                         onClick={() => {
//                           if (item?.location?.length === 1) {
//                             setFieldValue("CustomerId", item?.CustomerId);
//                             setFieldValue(
//                               "LocationId",
//                               item?.location[0]?.LocationId
//                             );
//                             setIsProperty(false);
//                             setIsCustomer(false);
//                             if (source === "Invoice") {
//                               handleClose(item?.CustomerId);
//                             }
//                           } else {
//                             setLocationData(
//                               item?.location.map((location) => ({
//                                 ...location,
//                                 CustomerId: item?.CustomerId,
//                               }))
//                             );
//                             setFieldValue("CustomerId", item?.CustomerId);
//                             setIsProperty(true);
//                           }
//                         }}
//                       >
//                         <Grid style={{ width: "8%" }}>
//                           <img
//                             src={QuoteUser}
//                             className="customerModelUserIcon"
//                           />
//                         </Grid>
//                         <Grid
//                           className="w-100 d-flex justify-content-between propertydetailsmodal"
//                           style={{ fontSize: "14px" }}
//                         >
//                           <Grid className="px-2 w-100 customerDetailAddress">
//                             <Typography
//                               className="py-0 my-0"
//                               style={{ fontSize: "12px" }}
//                             >
//                               {item?.FirstName} {item?.LastName}
//                             </Typography>
//                             {item?.location?.length}{" "}
//                             {item?.location?.length === 1
//                               ? "Property"
//                               : "Properties"}{" "}
//                             | {item?.PhoneNumber}
//                           </Grid>
//                         </Grid>
//                       </Grid>
//                     ))
//                   : filteredCustomers?.length > 0 &&
//                     filteredCustomers?.map((location, index) => (
//                       <Grid
//                         onClick={() => {
//                           setFieldValue("LocationId", location?.LocationId);
//                           setIsProperty(false);
//                           setIsCustomer(false);
//                           if (source === "Invoice") {
//                             handleClose(location?.CustomerId);
//                           }
//                         }}
//                         className="py-2 text-blue-color border-blue-color"
//                         style={{
//                           borderTop: index !== 0 ? "1px solid " : undefined,
//                           display: "flex",
//                           justifyContent: "space-between",
//                         }}
//                         key={index}
//                       >
//                         <Grid className="d-flex align-items-center w-100 secondPropertyOpen">
//                           <Grid
//                             style={{ width: "8%" }}
//                             className="imageOfProperty"
//                           >
//                             <DomainAddOutlinedIcon />
//                           </Grid>
//                           <Grid
//                             className="imageOfProperty"
//                             style={{
//                               fontSize: "13px",
//                             }}
//                           >
//                             <span>{location?.Address || ""} </span>, &nbsp;
//                             <span>{location?.City || ""} </span>, &nbsp;
//                             <br />
//                             <span>{location?.State || ""} </span>, &nbsp;
//                             <span>{location?.Country || ""} </span>
//                           </Grid>
//                         </Grid>
//                         <ChevronRightIcon style={{ color: "#958e8edd" }} />
//                       </Grid>
//                     ))}
//               </DialogContent>
//             )}
//           </Box>
//         </DialogContent>
//       </Dialog>

//       {/* <Dialog open={openDialog} onClose={handleDialogClose}>
//         <DialogTitle
//           style={{ borderBottom: "5px solid " }}
//           className="border-orange-color"
//         >
//           Add Customer
//         </DialogTitle>
//         <DialogContent>
//           <CardTitle
//             tag="Typography"
//             className="text-blue-color mt-3"
//             style={{
//               fontWeight: 600,
//               display: "flex",
//               alignItems: "center",
//             }}
//           >
//             <Grid
//               className="bg-blue-color"
//               style={{
//                 borderRadius: "50%",
//                 marginRight: "10px",
//                 width: "40px",
//                 height: "40px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
//               }}
//             >
//               <img src={client} alt="Client Details" />
//             </Grid>
//             Customer details
//           </CardTitle>
//           <Grid className="my-4 mb-0">
//             <InputText
//               value={formik?.values?.FirstName}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (/^[A-Za-z\s]*$/.test(value)) {
//                   handleChange(e);
//                 }
//               }}
//               onBlur={formik?.handleBlur}
//               error={
//                 formik?.touched?.FirstName && Boolean(formik?.errors?.FirstName)
//               }
//               helperText={
//                 formik?.touched?.FirstName && formik?.errors?.FirstName
//               }
//               name="FirstName"
//               placeholder="Enter first name"
//               label="First Name"
//               type="text"
//               className="text-blue-color w-100 mb-3 "
//               fieldHeight="56px"
//             />
//           </Grid>

//           <Grid className="my-2 mb-0 lastnametxt lastnamemb">
//             <InputText
//               value={formik?.values?.LastName}
//               onChange={(e) => {
//                 const value = e.target.value;
//                 if (/^[A-Za-z\s]*$/.test(value)) {
//                   handleChange(e);
//                 }
//               }}
//               onBlur={formik?.handleBlur}
//               error={
//                 formik?.touched?.LastName && Boolean(formik?.errors?.LastName)
//               }
//               helperText={formik?.touched?.LastName && formik?.errors?.LastName}
//               name="LastName"
//               placeholder="Enter last name"
//               label="Last Name"
//               type="text"
//               className="text-blue-color w-100 customerTopHere"
//               fieldHeight="56px"
//             />
//           </Grid>
//           <Grid className="my-2 phonei">
//             <Typography
//               className="mb-3 text-blue-color phone-number mt-4 heading-five"
//               style={{
//                 fontWeight: 500,
//                 fontSize: "16px",
//               }}
//             >
//               Contact details
//             </Typography>
//           </Grid>

//           <Grid className="my-4 mb-0">
//             <InputText
//               value={formik?.values?.PhoneNumber}
//               onChange={handlePhoneChange}
//               onBlur={formik?.handleBlur}
//               error={
//                 formik?.touched?.PhoneNumber &&
//                 Boolean(formik?.errors?.PhoneNumber)
//               }
//               helperText={
//                 formik?.touched?.PhoneNumber && formik?.errors?.PhoneNumber
//               }
//               name="PhoneNumber"
//               id="PhoneNumber"
//               placeholder="Enter phone number"
//               label="PhoneNumber"
//               type="text"
//               className="text-blue-color w-100 mb-3"
//               fieldHeight="56px"
//             />
//           </Grid>
//           <Grid className="my-2 mb-0 lastnametxt">
//             <InputText
//               value={formik?.values?.EmailAddress}
//               onChange={handleChange}
//               onBlur={formik?.handleBlur}
//               error={
//                 formik?.touched.EmailAddress &&
//                 Boolean(formik?.errors?.EmailAddress)
//               }
//               helperText={
//                 formik?.touched?.EmailAddress && formik?.errors?.EmailAddress
//               }
//               name="EmailAddress"
//               id="EmailAddress"
//               placeholder="Enter mail address"
//               label="Email Address"
//               type="email"
//               className="text-blue-color w-100 customerTopHere"
//               fieldHeight="56px"
//             />
//           </Grid>

//           <CardTitle
//             tag="Typography"
//             className="text-blue-color heading-five mt-3"
//             style={{
//               fontWeight: 600,
//               display: "flex",
//               alignItems: "center",
//             }}
//           >
//             <Grid
//               className="bg-blue-color"
//               style={{
//                 borderRadius: "50%",
//                 marginRight: "10px",
//                 width: "40px",
//                 height: "40px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <img src={clientcontact} alt="Property Details" />
//             </Grid>
//             <span className="" style={{ fontSize: "16pxx" }}>
//               Property details
//             </span>
//           </CardTitle>
//           {!location?.state?.id ||
//           (location?.state?.id && formik?.values?.location?.length <= 1) ? (
//             <Grid className="my-4 mb-0 px-0">
//               <Address
//                 setSelectedCountry={setSelectedCountry}
//                 selectedCountry={selectedCountry}
//                 countries={countries}
//                 handleChange={handleChange}
//                 formik={formik}
//                 handleZipChange={handleZipChange}
//               />
//             </Grid>
//           ) : (
//             <Grid
//               className="my-4 mb-0 px-0 customerAddMOdel"
//               style={{ width: "98%" }}
//             >
//               <Card
//                 style={{ backgroundColor: "rgb(216, 231, 238)" }}
//                 className="w-100 d-flex flex-row justify-content-center align-items-start py-3 px-0 mx-0"
//               >
//                 <Grid
//                   style={{ width: "15%", minHeight: "100%" }}
//                   className="d-flex align-items-start justify-content-center"
//                 >
//                   <LightbulbOutlinedIcon
//                     style={{ color: "rgb(42, 79, 97)", height: "50px" }}
//                   />
//                 </Grid>
//                 <Grid style={{ borderLeft: "1px solid rgb(42, 79, 97)" }}>
//                   <CardHeader
//                     className="border-0 d-flex align-items-center"
//                     style={{
//                       backgroundColor: "rgb(216, 231, 238)",
//                     }}
//                   >
//                     This Customer has multiple properties
//                   </CardHeader>
//                   <CardBody>
//                     Multiple properties can only edited inGrididually. To edit a
//                     property, select if from the Customer's list of properties.
//                   </CardBody>
//                 </Grid>
//               </Card>
//               <FormGroup className="py-3" check inline>
//                 <Input
//                   type="checkbox"
//                   name="billing_same_property"
//                   checked={formik?.values?.billing_same_property}
//                   onChange={handleChange}
//                 />
//                 <Label
//                   check
//                   style={{
//                     color: "rgba(6, 49, 100, 70%)",
//                     fontSize: "12px",
//                   }}
//                 >
//                   Billing address is the same as property address
//                 </Label>
//               </FormGroup>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>

//           <Grid
//             className="d-flex gap-2 justify-content-between button-responsive BlueAndWhiteBtmFlex saveBrnGap"
//             style={{ paddingRight: "35px" }}
//           >
//             <Grid>
//               <WhiteButton
//                 onClick={() => setOpenDialog(false)}
//                 label="Cancel"
//                 className=""
//               />
//             </Grid>
//             {loader ? (
//               <LoaderComponent
//                 height="20"
//                 width="20"
//                 padding="20"
//                 loader={loader}
//               />
//             ) : (
//               <Grid className="gap-3 d-flex  ">
//                 <BlueButton
//                   className=""
//                   onClick={formik?.handleSubmit}
//                   style={{
//                     fontSize: "16px",
//                     opacity: isEdited ? 1 : 0.5,
//                   }}
//                   disabled={!isEdited}
//                   label={
//                     location?.state?.id ? "Update Customer" : "Save Customer"
//                   }
//                 />
//               </Grid>
//             )}
//           </Grid>
//         </DialogActions>
//       </Dialog> */}
//     </>
//   );
// };

// export default CustomerModal;

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DomainAddOutlinedIcon from "@mui/icons-material/DomainAddOutlined";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AxiosInstance from "../../AxiosInstance";
import QuoteUser from "../../../assets/Blue-sidebar-icon/Customermodel.svg";
import "./style.css";
import { Grid } from "@mui/material";
import { LoaderComponent } from "../../../components/Icon/Index";

import InputText from "../../../components/InputFields/InputText";
const CustomerModal = ({
  isCustomer,
  setIsCustomer,
  isProperty,
  setIsProperty,
  setFieldValue,
  values,
  lineItems,
  setPropertyData,
  setCustomersData,
  formik,
  source,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyName } = useParams();
  const [customerData, setCustomerData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loader, setLoader] = useState(true);
  const [companyId, setCompanyId] = useState();

  const fetchTokenData = async () => {
    if (!companyId) {
      try {
        const token =
          localStorage?.getItem("adminToken") ||
          localStorage?.getItem("workerToken");

        if (!token) {
          console.error("Token not found in localStorage");
          return;
        }
        const res = await AxiosInstance.post(`/company/token_data`, {
          token,
        });
        if (res?.data?.data?.companyId) {
          setCompanyId(res?.data?.data?.companyId);
        }
      } catch (error) {
        console.error("Error:", error?.message);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, []);

  const handleClose = (id) => {
    const isStaffMember = location?.pathname?.includes("/staff-member");

    const newPath = isStaffMember
      ? `/staff-member/workerinvoicetable`
      : `/${companyName}/invoicetable`;

    navigate(newPath, {
      state: {
        CustomerId: id,
        navigats: [...location?.state?.navigats, newPath],
      },
    });
  };
  const fetchData = async () => {
    try {
      setLoader(true);
      const res = await AxiosInstance.get(
        `/customer/get_customer/${companyId}`
      );
      if (res?.data?.statusCode === 200) {
        setCustomerData(res?.data?.data);
        setLoader(false);
      }
    } catch (error) {
      console.error("Error: ", error?.message);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  useEffect(() => {
    if (
      formik?.values?.CustomerId &&
      formik?.values?.LocationId &&
      customerData?.length > 0
    ) {
      const data = customerData.find(
        (item) => item?.CustomerId === formik?.values?.CustomerId
      );
      setCustomersData(data);
      const location = data?.location?.find(
        (item) => item?.LocationId === formik?.values?.LocationId
      );
      setPropertyData(location);
    }
  }, [formik?.values, customerData]);

  const filteredCustomers = !isProperty
    ? customerData?.filter((customer) =>
        `${customer?.FirstName} ${customer?.LastName}`
          .toLowerCase()
          .includes(searchInput?.toLowerCase())
      )
    : locationData?.filter((location) =>
        `${location?.Address} ${location?.City} ${location?.State} ${location?.Country}`
          .toLowerCase()
          .includes(searchInput?.toLowerCase())
      );

  useEffect(() => {
    const updateData = () => {
      if (location?.state?.CustomerId) {
        setFieldValue("CustomerId", location?.state?.CustomerId);
      }

      if (location?.state?.Customer) {
        setCustomersData(location?.state?.Customer);
        setFieldValue("CustomerId", location?.state?.Customer?.CustomerId);

        if (
          location?.state?.Customer?.location &&
          location?.state?.Customer?.location?.length === 1
        ) {
          setPropertyData(location?.state?.Customer);
          setFieldValue(
            "LocationId",
            location?.state?.Customer?.location[0]?.LocationId
          );
        } else {
          setLocationData(location?.state?.Customer?.location || []); 
          setIsCustomer(true);
          setIsProperty(true);
        }
      }
    };

    updateData();
  }, [location?.state?.CustomerId]); 

  useEffect(() => {
  const savedData = localStorage.getItem("formData");
  if (savedData) {
    formik.setValues(JSON.parse(savedData)); // Form data restore karna
  }
}, []);


  return (
    <>
      <Dialog
        open={isCustomer}
        onClose={() => {
          setIsCustomer(false);
          setIsProperty(false);
        }}
        style={{ height: "100%" }}
      >
        <DialogTitle className="text-blue-color SelectCutomerHead ">
          Select or Create a Customer
          <Typography
            gutterBottom
            className="px-3 pt-3 text-blue-color SelectCutomerLike"
          >
            Which Customer would you like to create this for?
          </Typography>
        </DialogTitle>
        <DialogContent className="selectCustomer_box">
          <IconButton
            aria-label="close "
            onClick={() => {
              setIsCustomer(!isCustomer);
              setIsProperty(false);
            }}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            className="mx-3"
            sx={{
              border: "1px solid rgba(6, 49, 100, 80%)",
              borderRadius: "5px",
            }}
          >
            {loader ? (
              <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
                <LoaderComponent loader={loader} height="50" width="50" />
              </Grid>
            ) : (
              <DialogContent Grididers style={{ border: 0 }}>
                <Grid
                  className="mb-3 selectcreatebtns clientSerach_createNew"
                  style={{ display: "flex", flexWrap: "wrap" }}
                >
                  <Grid
                    className="flex-grow-1 me-2 mb-2 searchClients"
                    style={{ minWidth: "0", width: "150px" }}
                  >
                    <InputText
                      id="search"
                      name="search"
                      placeholder="Enter search customer"
                      type="text"
                      className="text-blue-color border-blue-color customerModelSearch"
                      style={{
                        fontSize: "14px",
                      }}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </Grid>
                  <Grid className="selectCustomerMOdel">
                    <Typography
                      className="mt-2 mb-2 selectCustomerOr text-blue-color"
                      style={{ textAlign: "center" }}
                    >
                      or
                    </Typography>
                  </Grid>
                  <Grid
                    className="btn bg-button-blue-color text-white-color flex-grow-1 ms-2 mb-2 cratenclientmodal searchClients createNewCutomer"
                    style={{
                      minWidth: "0",
                      fontSize: "14px",
                      height: "40px",
                      justifyContent: "start",
                      display: "flex",
                      alignItems: "center",
                    }}
                    // onClick={() => {
                    //   // Navigate to /add-customer
                    //   navigate(`/${companyName}/add-customer`, {
                    //     state: {
                    //       previewPage: location?.pathname, 
                    //       previewData: {
                    //         values,
                    //         lineItems,
                    //         id: location?.state?.id || null,
                    //       },
                    //       navigats: [
                    //         ...location?.state?.navigats,
                    //         "/add-customer", 
                    //       ],
                    //     },
                    //   });
                    // }}
                    onClick={() => {
                      // Form data ko Local Storage me save karna
                      localStorage.setItem("formData", JSON.stringify(values));
                    
                      navigate(`/${companyName}/add-customer`, {
                        state: {
                          previewPage: location?.pathname,
                          previewData: {
                            values,
                            lineItems,
                            id: location?.state?.id || null,
                          },
                          navigats: [...location?.state?.navigats, "/add-customer"],
                        },
                      });
                    }}
                    
                  >
                    Create new Customer
                  </Grid>
                </Grid>

                {filteredCustomers?.length === 0 && (
                  <Grid
                    className="text-center mt-3 text-blue-color"
                    style={{ fontSize: "14px" }}
                  >
                    No customers found
                  </Grid>
                )}

                {filteredCustomers?.length > 0 && (
                  <>
                    <Typography
                      className="mt-2 leadSelectCustomer"
                      style={{
                        color: "blue",
                        paddingLeft: "30px",
                        color: "#07CF10",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Active
                    </Typography>

                    <Grid
                      style={{
                        marginLeft: "-15px",
                        marginRight: "-15px",
                        marginTop: "-10px",
                      }}
                    >
                      <hr style={{ border: " 1px solid #063164CC" }} />
                    </Grid>
                  </>
                )}

                {!isProperty
                  ? filteredCustomers?.length > 0 &&
                    filteredCustomers?.map((item, index) => (
                      <Grid
                        className="w-100 mt-3 d-flex justify-content-between text-blue-color customerMOdelUserName"
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          if (item?.location?.length === 1) {
                            setFieldValue("CustomerId", item?.CustomerId);
                            setFieldValue(
                              "LocationId",
                              item?.location[0]?.LocationId
                            );
                            setIsProperty(false);
                            setIsCustomer(false);
                            if (source === "Invoice") {
                              handleClose(item?.CustomerId);
                            }
                          } else {
                            setLocationData(
                              item?.location.map((location) => ({
                                ...location,
                                CustomerId: item?.CustomerId,
                              }))
                            );
                            setFieldValue("CustomerId", item?.CustomerId);
                            setIsProperty(true);
                          }
                        }}
                      >
                        <Grid style={{ width: "8%" }}>
                          <img
                            src={QuoteUser}
                            className="customerModelUserIcon"
                          />
                        </Grid>
                        <Grid
                          className="w-100 d-flex justify-content-between propertydetailsmodal"
                          style={{ fontSize: "14px" }}
                        >
                          <Grid className="px-2 w-100 customerDetailAddress">
                            <Typography
                              className="py-0 my-0"
                              style={{ fontSize: "12px" }}
                            >
                              {item?.FirstName} {item?.LastName}
                            </Typography>
                            {item?.location?.length}{" "}
                            {item?.location?.length === 1
                              ? "Property"
                              : "Properties"}{" "}
                            | {item?.PhoneNumber}
                          </Grid>
                        </Grid>
                      </Grid>
                    ))
                  : filteredCustomers?.length > 0 &&
                    filteredCustomers?.map((location, index) => (
                      <Grid
                        onClick={() => {
                          setFieldValue("LocationId", location?.LocationId);
                          setIsProperty(false);
                          setIsCustomer(false);
                          if (source === "Invoice") {
                            handleClose(location?.CustomerId);
                          }
                        }}
                        className="py-2 text-blue-color border-blue-color"
                        style={{
                          borderTop: index !== 0 ? "1px solid " : undefined,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                        key={index}
                      >
                        <Grid className="d-flex align-items-center w-100 secondPropertyOpen">
                          <Grid
                            style={{ width: "8%" }}
                            className="imageOfProperty"
                          >
                            <DomainAddOutlinedIcon />
                          </Grid>
                          <Grid
                            className="imageOfProperty"
                            style={{
                              fontSize: "13px",
                            }}
                          >
                            <span>{location?.Address || ""} </span>, &nbsp;
                            <span>{location?.City || ""} </span>, &nbsp;
                            <br />
                            <span>{location?.State || ""} </span>, &nbsp;
                            <span>{location?.Country || ""} </span>
                          </Grid>
                        </Grid>
                        <ChevronRightIcon style={{ color: "#958e8edd" }} />
                      </Grid>
                    ))}
              </DialogContent>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerModal;
