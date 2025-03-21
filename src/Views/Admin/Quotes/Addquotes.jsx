// import React, { useEffect, useRef, useState } from "react";
// import "../Client/style.css";
// import { handleAuth } from "../../../components/Login/Auth";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import "./style.css";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { postFile } from "../../../components/Files/Functions";
// import AxiosInstance from "../../AxiosInstance";
// import Previous from "../../../assets/image/icons/Previous.png";
// import sendToast from "../../../components/Toast/sendToast";
// import Addquotes from "./Views/Addquotes";
// import showToast from "../../../components/Toast/Toster";

// function AddQuote() {
//   const productRef = useRef(null);
//   const baseUrl = process.env.REACT_APP_BASE_API;
//   const location = useLocation();
//   const toggle = () => setDropdown(!dropdown);
//   const navigate = useNavigate();
//   const { companyName } = useParams();
//   const [redirectToContract, setRedirectToContract] = useState(false);
//   const [isNumChange, setIsNumChange] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const [titleRef, setTitleRef] = useState(null);
//   const [showDiscount, setShowDiscount] = useState(false);
//   const [isCustomer, setIsCustomer] = useState(false);
//   const [isProperty, setIsProperty] = useState(false);
//   const [loader, setLoader] = useState(false);
//   const [tokenDecode, setTokenDecode] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [dropdown, setDropdown] = useState(false);
//   const [modal, setModal] = useState(false);
//   const [customersData, setCustomersData] = useState({});
//   const [propertyData, setPropertyData] = useState({});
//   const [quotesData, setQuotesData] = useState({});
//   const [showTax, setShowTax] = useState(false);
//   const [lineItems, setLineItems] = useState([
//     {
//       Description: "",
//       Name: "",
//       Attachment: "",
//       Type: "",
//       Unit: "",
//       CostPerUnit: "",
//       Hourly: "",
//       CostPerHour: "",
//       Fixed: "",
//       CostPerFixed: "",
//       Square: "",
//       CostPerSquare: "",
//       Total: "",
//       isNew: true,
//     },
//   ]);
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await handleAuth(navigate, location);
//         setTokenDecode(res?.data);
//         setQuotesData(res?.data?.data);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const [showCosts, setShowCosts] = useState(
//     new Array(lineItems?.length).fill(false)
//   );
//   const [menuIsOpen, setMenuIsOpen] = useState(
//     new Array(lineItems?.length).fill(false)
//   );

//   const addLineItem = () => {
//     setLineItems([
//       ...lineItems,
//       {
//         ProductId: "",
//         Description: "",
//         Name: "",
//         Type: "",
//         Unit: 1,
//         Attachment: "",
//         CostPerUnit: "",
//         Hourly: "",
//         CostPerHour: "",
//         Fixed: "",
//         CostPerFixed: "",
//         Square: "",
//         CostPerSquare: "",
//         Total: "",
//         isNew: true,
//       },
//     ]);
//   };

//   const deleteLineItem = (index) => {
//     const newLineItems = lineItems.filter((_, i) => i !== index);
//     setLineItems(newLineItems);
//   };

//   const handleSelectChange = (index, selectedOption) => {
//     const newLineItems = [...lineItems];

//     newLineItems[index] = {
//       ...newLineItems[index],
//       ProductId: selectedOption?.ProductId,
//       Description: selectedOption?.Description,
//       Name: selectedOption?.Name,
//       Type: selectedOption?.Type,
//       Unit: selectedOption?.Unit,
//       Attachment: selectedOption?.Attachment,
//       CostPerUnit: selectedOption?.CostPerUnit,
//       Hourly: selectedOption?.Hourly,
//       CostPerHour: selectedOption?.CostPerHour,
//       Fixed: selectedOption?.Fixed,
//       CostPerFixed: selectedOption?.CostPerFixed,
//       Square: selectedOption?.Square,
//       CostPerSquare: selectedOption?.CostPerSquare,
//       isNew: true,
//       Total: selectedOption?.Unit
//         ? Number(selectedOption?.Unit || 0) *
//           Number(selectedOption?.CostPerUnit || 0)
//         : selectedOption?.Square
//         ? Number(selectedOption?.Square || 0) *
//           Number(selectedOption?.CostPerSquare || 0)
//         : selectedOption?.Hourly
//         ? Number(selectedOption?.Hourly || 0) *
//           Number(selectedOption?.CostPerHour || 0)
//         : Number(selectedOption?.Fixed || 0) *
//           Number(selectedOption?.CostPerFixed || 0),
//     };

//     setLineItems(newLineItems);
//     setMenuIsOpen((prevState) => {
//       const newState = [...prevState];
//       newState[index] = false;
//       return newState;
//     });
//     // setInputValue("");
//   };

//   const formik = useFormik({
//     initialValues: {
//       Title: "",
//       QuoteId: "",
//       QuoteNumber: 1,
//       CustomerId: "",
//       Notes: "",
//       CompanyId: localStorage.getItem("CompanyId"),
//       LocationId: "",
//       CustomerMessage: "",
//       ContractDisclaimer:
//         "Contract/ Disclaimer\nThis quote is valid for the next 30 days, after which values may be subject to change.",
//       Attachment: [],
//       Discount: "",
//       Tax: "",
//       status: "",
//     },
//     validationSchema: Yup.object({
//       Title: Yup.string().required("Title Required"),
//     }),
//     // onSubmit: async (values) => {
//     //   try {
//     //     const strings = [];

//     //     for (let item of values?.Attachment) {
//     //       if (typeof item !== "string") {
//     //         const string = await postFile(item);
//     //         strings.push(string);
//     //       } else {
//     //         strings.push(item);
//     //       }
//     //     }

//     //     for (let item of lineItems) {
//     //       if (typeof item?.Attachment !== "string") {
//     //         const string = await postFile(item?.Attachment);
//     //         item.Attachment = string;
//     //       }
//     //     }

//     //     const object = {
//     //       ...values,
//     //       details: lineItems,
//     //       SubTotal: calculateSubTotal(),
//     //       Total: Total,
//     //       Attachment: strings,
//     //       role: tokenDecode?.role,
//     //       AddedAt: new Date(),
//     //       CompanyId:
//     //         localStorage.getItem("CompanyId") || tokenDecode?.companyId,
//     //     };

//     //     let response;
//     //     if (!location?.state?.id) {
//     //       setLoading(true);
//     //       response = await AxiosInstance.post(`/quote`, object);
//     //     } else {
//     //       response = await AxiosInstance.put(
//     //         `/quote/${location?.state?.id}`,
//     //         object
//     //       );
//     //     }
//     //     if (response?.data?.statusCode === 200) {
//     //       setTimeout(() => {
//     //         showToast.success(response?.data?.message);
//     //       }, 500);
//     //       if (redirectToContract) {
//     //         navigate(
//     //           companyName
//     //             ? `/${companyName}/add-contract`
//     //             : `/staff-member/add-contract`,
//     //           {
//     //             state: {
//     //               formData: values,
//     //               products: lineItems,
//     //               navigats: [...location?.state?.navigats, "/add-contract"],
//     //               QuoteId: response?.data?.data?.QuoteId,
//     //             },
//     //           }
//     //         );
//     //       } else {
//     //         navigate(
//     //           companyName
//     //             ? `/${companyName}/quotes`
//     //             : `/staff-member/WorkerQuotes`,
//     //           {
//     //             replace: true,
//     //             state: {
//     //               navigats: [
//     //                 "/index",
//     //                 companyName ? "/quotes" : "/WorkerQuotes",
//     //               ],
//     //             },
//     //           }
//     //         );
//     //       }
//     //     } else {
//     //       if (location?.state?.id) {
//     //         setTimeout(() => {
//     //           sendToast(
//     //             "There was an issue generating quote. Please try again later."
//     //           );
//     //         }, 500);
//     //       } else {
//     //         setTimeout(() => {
//     //           sendToast(
//     //             "There was an issue updating quote. Please try again later."
//     //           );
//     //         }, 500);
//     //       }
//     //     }
//     //   } catch (error) {
//     //     if (error.response && error.response.status === 400) {
//     //       const backendErrors = error.response.data.errors;

//     //       // Map backend errors to Formik fields
//     //       const formikErrors = backendErrors.reduce((acc, err) => {
//     //         const field = err.split(" ")[0]; // Extract the field name from the message
//     //         acc[field] = err; // Assign the full error message
//     //         return acc;
//     //       }, {});

//     //       formik.setErrors(formikErrors); // Display errors in Formik fields
//     //     }
//     //   } finally {
//     //     setRedirectToContract(false);
//     //   }
//     // },
//     onSubmit: async (values) => {
//       try {
//         const strings = [];

//         for (let item of values?.Attachment) {
//           if (typeof item !== "string") {
//             const string = await postFile(item);
//             strings.push(string);
//           } else {
//             strings.push(item);
//           }
//         }

//         for (let item of lineItems) {
//           if (typeof item?.Attachment !== "string") {
//             const string = await postFile(item?.Attachment);
//             item.Attachment = string;
//           }
//         }

//         const object = {
//           ...values,
//           details: lineItems,
//           SubTotal: calculateSubTotal(),
//           Total: Total,
//           Attachment: strings,
//           role: tokenDecode?.role,
//           AddedAt: new Date(),
//           CompanyId:
//             localStorage.getItem("CompanyId") || tokenDecode?.companyId,
//         };

//         let response;
//         if (!location?.state?.id) {
//           setLoading(true);
//           response = await AxiosInstance.post(`/quote`, object);
//         } else {
//           response = await AxiosInstance.put(
//             `/quote/${location?.state?.id}`,
//             object
//           );
//         }

//         if (response?.data?.statusCode === 200) {
//           setTimeout(() => {
//             showToast.success(response?.data?.message);
//           }, 500);

//           if (redirectToContract) {
//             navigate(
//               companyName
//                 ? `/${companyName}/add-contract`
//                 : `/staff-member/add-contract`,
//               {
//                 state: {
//                   formData: values,
//                   products: lineItems,
//                   navigats: [...location?.state?.navigats, "/add-contract"],
//                   QuoteId: response?.data?.data?.QuoteId,
//                 },
//               }
//             );
//           } else {
//             navigate(
//               companyName
//                 ? `/${companyName}/quotes`
//                 : `/staff-member/WorkerQuotes`,
//               {
//                 replace: true,
//                 state: {
//                   navigats: [
//                     "/index",
//                     companyName ? "/quotes" : "/WorkerQuotes",
//                   ],
//                 },
//               }
//             );
//           }
//         } else {
//           setTimeout(() => {
//             sendToast(
//               "There was an issue processing the quote. Please try again later."
//             );
//           }, 500);
//         }
//       } catch (error) {
//         if (error.response && error.response.status === 400) {
//           const backendErrors = error.response.data.errors;
//           const formikErrors = backendErrors.reduce((acc, err) => {
//             const field = err.split(" ")[0];
//             acc[field] = err;
//             return acc;
//           }, {});
//           formik.setErrors(formikErrors);
//           showToast.warning("Validation errors: " + backendErrors.join(", "));
//         } else {
//           setTimeout(() => {
//             sendToast("An unexpected error occurred. Please try again later.");
//           }, 500);
//         }
//       } finally {
//         setLoading(false);
//         setRedirectToContract(false);
//       }
//     },
//   });

//   const updateStatus = (status) => {
//     if (status) {
//       formik?.setFieldValue("status", "Awaiting Response");
//       setLoading(true);
//     } else {
//       formik?.setFieldValue("status", "Draft");
//     }
//   };

//   const handleSaveQuote = async (status) => {
//     updateStatus(status);
//     try {
//       setTimeout(async () => {
//         await formik.submitForm();
//       }, 1000);
//     } catch (error) {
//       console.error("Error saving quote: ", error);
//     }
//   };

//   const handleConvertJob = async () => {
//     if (lineItems.length > 0 && lineItems[0].Name !== "") {
//       await formik.setFieldValue("status", "Draft");
//       try {
//         setRedirectToContract(true);
//         await formik.submitForm();
//       } catch (error) {
//         console.error("Error converting job: ", error);
//       }
//     } else {
//       setLoading(false);
//       setIsError(true);
//       productRef.current.focus();
//     }
//   };

//   useEffect(() => {
//     if (lineItems?.length > 0 && lineItems[0]?.Name !== "") {
//       setIsError(false);
//     }
//   }, [lineItems]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(false);
//       if (location?.state?.id) {
//         setLoader(true);
//         try {
//           const res = await AxiosInstance.get(
//             `/quote/quote_details/${location?.state?.id}`
//           );
//           if (res.data?.statusCode === 200) {
//             const data = res?.data?.data;

//             formik.setValues({
//               Title: data?.Title,
//               Firstname: data?.customer?.Firstname,
//               LastName: data?.customer?.LastName,
//               QuoteNumber: data?.QuoteNumber,
//               CustomerId: data?.CustomerId,
//               CompanyId: data.CompanyId,
//               LocationId: data?.LocationId,
//               CustomerMessage: data?.CustomerMessage,
//               ContractDisclaimer: data?.ContractDisclaimer,
//               Notes: data?.Notes,
//               Attachment: data?.Attachment || null,
//               Discount: data?.Discount,
//               Tax: data?.Tax,
//             });

//             setQuotesData(data);
//             setLineItems(
//               data?.products || [
//                 {
//                   Description: "",
//                   Name: "",
//                   Title: "",
//                   Type: "",
//                   Unit: "",
//                   Attachment: "",
//                   CostPerUnit: "",
//                   Hourly: "",
//                   CostPerHour: "",
//                   Fixed: "",
//                   CostPerFixed: "",
//                   Square: "",
//                   CostPerSquare: "",
//                   Total: "",
//                   isNew: true,
//                 },
//               ]
//             );
//           }
//         } catch (error) {
//           console.error("Error: ", error);
//         } finally {
//           setLoader(false);
//         }
//       }
//     };

//     const getNumber = async () => {
//       try {
//         const res = await AxiosInstance.get(
//           `/quote/get_number/${
//             localStorage.getItem("CompanyId") || tokenDecode?.companyId
//           }`
//         );
//         if (res.data?.statusCode === 200) {
//           const nextQuoteNumber = Number(res.data?.quoteNumber) + 1;
//           formik.setValues({
//             ...formik.values,
//             QuoteNumber: nextQuoteNumber,
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching quote number: ", error);
//       }
//     };

//     const initialize = async () => {
//       await getNumber();
//       if (location?.state?.previewData) {
//         formik.setValues(location?.state?.previewData?.values);
//         setLineItems(
//           location.state.previewData?.lineItems || [
//             {
//               Description: "",
//               Name: "",
//               Type: "",
//               Unit: "",
//               Attachment: "",
//               CostPerUnit: "",
//               Hourly: "",
//               CostPerHour: "",
//               Fixed: "",
//               CostPerFixed: "",
//               Square: "",
//               CostPerSquare: "",
//               Total: "",
//               isNew: true,
//             },
//           ]
//         );
//         formik.setFieldValue("CustomerId", location?.state?.CustomerId);
//         formik.setFieldValue("LocationId", location?.state?.LocationId);
//         window.history.replaceState(
//           {
//             id: location?.state?.previewData?.id
//               ? location?.state?.previewData?.id
//               : null,
//           },
//           ""
//         );
//       } else if (location?.state?.id) {
//         await fetchData();
//       }
//     };

//     initialize();
//     fetchData();
//     return () => {
//       formik.resetForm();
//       setLineItems([
//         {
//           FirstName: "",
//           LastName: "",
//           Description: "",
//           Name: "",
//           Attachment: "",
//           Type: "",
//           Unit: "",
//           CostPerUnit: "",
//           Hourly: "",
//           CostPerHour: "",
//           Fixed: "",
//           CostPerFixed: "",
//           Square: "",
//           CostPerSquare: "",
//           Total: "",
//           isNew: true,
//         },
//       ]);
//     };
//   }, [location, tokenDecode]);

//   const calculateSubTotal = () => {
//     const Total = lineItems?.reduce(
//       (sum, item) => sum + Number(item?.Total || 0),
//       0
//     );
//     return Total;
//   };

//   const subTotal = calculateSubTotal();
//   const discountAmount = formik.values.Discount
//     ? (Number(formik?.values?.Discount) * subTotal) / 100
//     : 0;
//   const discountedTotal = Math.max(0, subTotal - discountAmount);
//   const taxAmount = formik?.values?.Tax
//     ? (Number(formik?.values?.Tax) * subTotal) / 100
//     : 0;
//   const Total = (discountedTotal + taxAmount)?.toFixed(2);

//   const handleQuoteNumberChange = async () => {
//     const enteredQuoteNumber = Number(formik?.values?.QuoteNumber);

//     const companyId =
//       localStorage.getItem("CompanyId") || tokenDecode?.companyId;

//     try {
//       const res = await AxiosInstance.post(`/quote/check_number/${companyId}`, {
//         QuoteNumber: enteredQuoteNumber,
//       });

//       if (res?.data?.statusCode === 200) {
//         setTimeout(() => {
//           showToast.success("Quote number is valid and added successfully.");
//         }, 500);

//         setIsNumChange(false);
//       } else if (res?.data?.statusCode === 203) {
//         setTimeout(() => {
//           showToast.error(
//             "Quote number already exists. Please choose a different number."
//           );
//         }, 500);

//         formik.setFieldValue("QuoteNumber", "");
//       } else {
//         setTimeout(() => {
//           showToast.error("Failed to check quote number. Please try again.");
//         }, 500);
//       }
//     } catch (error) {
//       console.error(
//         "Error checking quote number: ",

//         error?.response || error?.message
//       );

//       showToast.error("An error occurred while checking the quote number.");
//     }
//   };
//   return (
//     <>
//       <Addquotes
//         loader={loader}
//         customersData={customersData}
//         quotesData={quotesData}
//         formik={formik}
//         setLoader={setLoader}
//         setIsCustomer={setIsCustomer}
//         setTitleRef={setTitleRef}
//         propertyData={propertyData}
//         Previous={Previous}
//         isNumChange={isNumChange}
//         setIsNumChange={setIsNumChange}
//         handleQuoteNumberChange={handleQuoteNumberChange}
//         lineItems={lineItems}
//         handleSelectChange={handleSelectChange}
//         setLineItems={setLineItems}
//         showCosts={showCosts}
//         setShowCosts={setShowCosts}
//         menuIsOpen={menuIsOpen}
//         setMenuIsOpen={setMenuIsOpen}
//         deleteLineItem={deleteLineItem}
//         isError={isError}
//         setIsError={setIsError}
//         productRef={productRef}
//         addLineItem={addLineItem}
//         subTotal={subTotal}
//         showDiscount={showDiscount}
//         setShowDiscount={setShowDiscount}
//         discountAmount={discountAmount}
//         showTax={showTax}
//         setShowTax={setShowTax}
//         taxAmount={taxAmount}
//         Total={Total}
//         loading={loading}
//         setLoading={setLoading}
//         handleSaveQuote={handleSaveQuote}
//         dropdown={dropdown}
//         toggle={toggle}
//         modal={modal}
//         setModal={setModal}
//         titleRef={titleRef}
//         handleConvertJob={handleConvertJob}
//         isCustomer={isCustomer}
//         isProperty={isProperty}
//         setIsProperty={setIsProperty}
//         setPropertyData={setPropertyData}
//         setCustomersData={setCustomersData}
//         companyName={companyName}
//       />
//     </>
//   );
// }

// export default AddQuote;
import React, { useEffect, useRef, useState } from "react";
import "../Client/style.css";
import { handleAuth } from "../../../components/Login/Auth";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./style.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postFile } from "../../../components/Files/Functions";
import AxiosInstance from "../../AxiosInstance";
import Previous from "../../../assets/image/icons/Previous.png";
import sendToast from "../../../components/Toast/sendToast";
import Addquotes from "./Views/Addquotes";
import showToast from "../../../components/Toast/Toster";

function AddQuote() {
  const productRef = useRef(null);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const location = useLocation();
  const toggle = () => setDropdown(!dropdown);
  const navigate = useNavigate();
  const { companyName } = useParams();
  const [redirectToContract, setRedirectToContract] = useState(false);
  const [isNumChange, setIsNumChange] = useState(false);
  const [isError, setIsError] = useState(false);
  const [titleRef, setTitleRef] = useState(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isProperty, setIsProperty] = useState(false);
  const [loader, setLoader] = useState(false);
  const [tokenDecode, setTokenDecode] = useState({});
  const [loading, setLoading] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [modal, setModal] = useState(false);
  const [customersData, setCustomersData] = useState({});
  const [propertyData, setPropertyData] = useState({});
  const [quotesData, setQuotesData] = useState({});
  const [showTax, setShowTax] = useState(false);
  const [lineItems, setLineItems] = useState([
    {
      Description: "",
      Name: "",
      Attachment: "",
      Type: "",
      Unit: "",
      CostPerUnit: "",
      Hourly: "",
      CostPerHour: "",
      Fixed: "",
      CostPerFixed: "",
      Square: "",
      CostPerSquare: "",
      Total: "",
      isNew: true,
    },
  ]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await handleAuth(navigate, location);
        setTokenDecode(res?.data);
        setQuotesData(res?.data?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const [showCosts, setShowCosts] = useState(
    new Array(lineItems?.length).fill(false)
  );
  const [menuIsOpen, setMenuIsOpen] = useState(
    new Array(lineItems?.length).fill(false)
  );

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        ProductId: "",
        Description: "",
        Name: "",
        Type: "",
        Unit: 1,
        Attachment: "",
        CostPerUnit: "",
        Hourly: "",
        CostPerHour: "",
        Fixed: "",
        CostPerFixed: "",
        Square: "",
        CostPerSquare: "",
        Total: "",
        isNew: true,
      },
    ]);
  };

  const deleteLineItem = (index) => {
    const newLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newLineItems);
  };

  const handleSelectChange = (index, selectedOption) => {
   
    const newLineItems = [...lineItems];

    newLineItems[index] = {
      ...newLineItems[index],
      ProductId: selectedOption?.ProductId,
      Description: selectedOption?.Description,
      Name: selectedOption?.Name,
      Type: selectedOption?.Type,
      Unit: selectedOption?.Unit,
      Attachment: selectedOption?.Attachment,
      CostPerUnit: selectedOption?.CostPerUnit,
      Hourly: selectedOption?.Hourly,
      CostPerHour: selectedOption?.CostPerHour,
      Fixed: selectedOption?.Fixed,
      CostPerFixed: selectedOption?.CostPerFixed,
      Square: selectedOption?.Square,
      CostPerSquare: selectedOption?.CostPerSquare,
      isNew: true,
      Total: selectedOption?.Unit
        ? Number(selectedOption?.Unit || 0) *
          Number(selectedOption?.CostPerUnit || 0)
        : selectedOption?.Square
        ? Number(selectedOption?.Square || 0) *
          Number(selectedOption?.CostPerSquare || 0)
        : selectedOption?.Hourly
        ? Number(selectedOption?.Hourly || 0) *
          Number(selectedOption?.CostPerHour || 0)
        : Number(selectedOption?.Fixed || 0) *
          Number(selectedOption?.CostPerFixed || 0),
    };

    setLineItems(newLineItems);
    setMenuIsOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = false;
      return newState;
    });
    // setInputValue("");
  };

  const formik = useFormik({
    initialValues: {
      Title: "",
      QuoteId: "",
      QuoteNumber: 1,
      CustomerId: "",
      Notes: "",
      CompanyId: localStorage.getItem("CompanyId"),
      LocationId: "",
      CustomerMessage: "",
      ContractDisclaimer:
        "Contract/ Disclaimer\nThis quote is valid for the next 30 days, after which values may be subject to change.",
      Attachment: [],
      Discount: "",
      Tax: "",
      status: "",
    },
    validationSchema: Yup.object({
      Title: Yup.string().required("Title Required"),
    }),

    onSubmit: async (values) => {
      try {
        const strings = [];

        for (let item of values?.Attachment) {
          if (typeof item !== "string") {
            const string = await postFile(item);
            strings.push(string);
          } else {
            strings.push(item);
          }
        }

        for (let item of lineItems) {
          if (typeof item?.Attachment !== "string") {
            const string = await postFile(item?.Attachment);
            item.Attachment = string;
          }
        }

        const object = {
          ...values,
          details: lineItems,
          SubTotal: calculateSubTotal(),
          Total: Total,
          Attachment: strings,
          role: tokenDecode?.role,
          AddedAt: new Date(),
          CompanyId:
            localStorage.getItem("CompanyId") || tokenDecode?.companyId,
        };

        let response;
        if (!location?.state?.id) {
          setLoading(true);
          response = await AxiosInstance.post(`/quote`, object);
        } else {
          response = await AxiosInstance.put(
            `/quote/${location?.state?.id}`,
            object
          );
        }

        if (response?.data?.statusCode === 200) {
          setTimeout(() => {
            showToast.success(response?.data?.message);
          }, 500);
          localStorage.removeItem("formData");

          if (redirectToContract) {
            navigate(
              companyName
                ? `/${companyName}/add-contract`
                : `/staff-member/add-contract`,
              {
                state: {
                  formData: values,
                  products: lineItems,
                  navigats: [...location?.state?.navigats, "/add-contract"],
                  QuoteId: response?.data?.data?.QuoteId,
                },
              }
            );
          } else {
            navigate(
              companyName
                ? `/${companyName}/quotes`
                : `/staff-member/WorkerQuotes`,
              {
                replace: true,
                state: {
                  navigats: [
                    "/index",
                    companyName ? "/quotes" : "/WorkerQuotes",
                  ],
                },
              }
            );
          }
        } else {
          setTimeout(() => {
            sendToast(
              "There was an issue processing the quote. Please try again later."
            );
          }, 500);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          const backendErrors = error.response.data.errors;
          const formikErrors = backendErrors.reduce((acc, err) => {
            const field = err.split(" ")[0];
            acc[field] = err;
            return acc;
          }, {});
          formik.setErrors(formikErrors);
          showToast.warning("Validation errors: " + backendErrors.join(", "));
        } else {
          setTimeout(() => {
            sendToast("An unexpected error occurred. Please try again later.");
          }, 500);
        }
      } finally {
        setLoading(false);
        setRedirectToContract(false);
      }
    },
  });

  // const updateStatus = (status) => {
  //   if (status) {
  //     formik?.setFieldValue("status", "Awaiting Response");
  //     setLoading(true);
  //   } else {
  //     formik?.setFieldValue("status", "Draft");
  //   }
  // };

  // const updateStatus = (status) => {
  //   if (location?.state?.id) {
  //     if (formik?.values?.status === "Draft") {
  //       formik?.setFieldValue("status", "Draft");
  //     } else if (formik?.values?.status === "Awaiting Response") {
  //       formik?.setFieldValue("status", "Awaiting Response");
  //     }
  //   } else {
  //     formik?.setFieldValue("status", "Draft");
  //   }
  // };

  // const updateStatus = (status) => {
  //   formik.setFieldValue("status", "Awaiting Response"); // Fixing status to "Awaiting Response"
  // };
  
  // const handleSubmits = async (values) => {
  //   try {
  //     const strings = [];
  
  //     for (let item of values?.Attachment) {
  //       if (typeof item !== "string") {
  //         const string = await postFile(item);
  //         strings.push(string);
  //       } else {
  //         strings.push(item);
  //       }
  //     }
  
  //     for (let item of lineItems) {
  //       if (typeof item?.Attachment !== "string") {
  //         const string = await postFile(item?.Attachment);
  //         item.Attachment = string;
  //       }
  //     }
  
  //     const object = {
  //       ...values,
  //       details: lineItems,
  //       SubTotal: calculateSubTotal(),
  //       Total: Total,
  //       Attachment: strings,
  //       role: tokenDecode?.role,
  //       AddedAt: new Date(),
  //       CompanyId: localStorage.getItem("CompanyId") || tokenDecode?.companyId,
  //     };
  
  //     let response;
  //     if (!location?.state?.id) {
  //       setLoading(true);
  //       response = await AxiosInstance.post(`/quote`, object);
  //     } else {
  //       response = await AxiosInstance.put(`/quote/${location?.state?.id}`, object);
  //     }
  
  //     if (response?.data?.statusCode === 200) {
  //       setTimeout(() => {
  //         showToast.success(response?.data?.message);
  //       }, 500);
  
  //       if (redirectToContract) {
  //         navigate(
  //           companyName ? `/${companyName}/add-contract` : `/staff-member/add-contract`,
  //           {
  //             state: {
  //               formData: values,
  //               products: lineItems,
  //               navigats: [...location?.state?.navigats, "/add-contract"],
  //               QuoteId: response?.data?.data?.QuoteId,
  //             },
  //           }
  //         );
  //       } else {
  //         navigate(
  //           companyName ? `/${companyName}/quotes` : `/staff-member/WorkerQuotes`,
  //           {
  //             replace: true,
  //             state: {
  //               navigats: ["/index", companyName ? "/quotes" : "/WorkerQuotes"],
  //             },
  //           }
  //         );
  //       }
  //     } else {
  //       setTimeout(() => {
  //         sendToast("There was an issue processing the quote. Please try again later.");
  //       }, 500);
  //     }
  //   } catch (error) {
  //     if (error.response && error.response.status === 400) {
  //       const backendErrors = error.response.data.errors;
  //       const formikErrors = backendErrors.reduce((acc, err) => {
  //         const field = err.split(" ")[0];
  //         acc[field] = err;
  //         return acc;
  //       }, {});
  //       formik.setErrors(formikErrors);
  //       showToast.warning("Validation errors: " + backendErrors.join(", "));
  //     } else {
  //       setTimeout(() => {
  //         sendToast("An unexpected error occurred. Please try again later.");
  //       }, 500);
  //     }
  //   } finally {
  //     setLoading(false);
  //     setRedirectToContract(false);
  //   }
  // };

  // const formik = useFormik({
  //   initialValues: {
  //     Title: "",
  //     QuoteId: "",
  //     QuoteNumber: 1,
  //     CustomerId: "",
  //     Notes: "",
  //     CompanyId: localStorage.getItem("CompanyId"),
  //     LocationId: "",
  //     CustomerMessage: "",
  //     ContractDisclaimer:
  //       "Contract/ Disclaimer\nThis quote is valid for the next 30 days, after which values may be subject to change.",
  //     Attachment: [],
  //     Discount: "",
  //     Tax: "",
  //     status: "",
  //   },
  //   validationSchema: Yup.object({
  //     Title: Yup.string().required("Title Required"),
  //   }),
  //   onSubmit: handleSubmits
  // });

  
  
  
  const updateStatus = (status) => {
    if (status === "Awaiting Response") {
      formik.setFieldValue("status", "Awaiting Response");
    } else if (location?.state?.id) {
      if (formik?.values?.status === "Draft") {
        formik?.setFieldValue("status", "Draft");
      } else if (formik?.values?.status === "Awaiting Response") {
        formik?.setFieldValue("status", "Awaiting Response");
      }
    } else {
      formik.setFieldValue("status", "Awaiting Response");
    }
  };

  // const handleSaveQuote = async (status) => {
  //   if (status === "Awaiting Response" && formik?.values?.status === "Awaiting Response") {
  //     return;
  //   }
  //   updateStatus(status);
  //   try {
  //     setTimeout(async () => {
  //       await formik.submitForm();
  //     }, 1000);
  //   } catch (error) {
  //     console.error("Error saving quote: ", error);
  //   }
  // };

  const handleSaveQuote = async (status) => {
    if (status === "Awaiting Response") {
      formik.setFieldValue("status", "Awaiting Response");
    }
    updateStatus(status);
    try {
      return await formik.submitForm();
    } catch (error) {
      console.error("Error saving quote: ", error);
    }
  };

  const handleConvertJob = async () => {
    if (lineItems.length > 0 && lineItems[0].Name !== "") {
      await formik.setFieldValue("status", "Draft");
      try {
        setRedirectToContract(true);
        await formik.submitForm();
      } catch (error) {
        console.error("Error converting job: ", error);
      }
    } else {
      setLoading(false);
      setIsError(true);
      productRef.current.focus();
    }
  };

  useEffect(() => {
    if (lineItems?.length > 0 && lineItems[0]?.Name !== "") {
      setIsError(false);
    }
  }, [lineItems]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(false);
      if (location?.state?.id) {
        setLoader(true);
        try {
          const res = await AxiosInstance.get(
            `/quote/quote_details/${location?.state?.id}`
          );
          if (res.data?.statusCode === 200) {
            const data = res?.data?.data;

            formik.setValues({
              Title: data?.Title,
              Firstname: data?.customer?.Firstname,
              LastName: data?.customer?.LastName,
              QuoteNumber: data?.QuoteNumber,
              CustomerId: data?.CustomerId,
              CompanyId: data.CompanyId,
              LocationId: data?.LocationId,
              CustomerMessage: data?.CustomerMessage,
              ContractDisclaimer: data?.ContractDisclaimer,
              Notes: data?.Notes,
              Attachment: data?.Attachment || null,
              Discount: data?.Discount,
              Tax: data?.Tax,
            });

            setQuotesData(data);
            setLineItems(
              data?.products || [
                {
                  Description: "",
                  Name: "",
                  Title: "",
                  Type: "",
                  Unit: "",
                  Attachment: "",
                  CostPerUnit: "",
                  Hourly: "",
                  CostPerHour: "",
                  Fixed: "",
                  CostPerFixed: "",
                  Square: "",
                  CostPerSquare: "",
                  Total: "",
                  isNew: true,
                },
              ]
            );
          }
        } catch (error) {
          console.error("Error: ", error);
        } finally {
          setLoader(false);
        }
      }
    };

    const getNumber = async () => {
      try {
        const res = await AxiosInstance.get(
          `/quote/get_number/${
            localStorage.getItem("CompanyId") || tokenDecode?.companyId
          }`
        );
        if (res.data?.statusCode === 200) {
          const nextQuoteNumber = Number(res.data?.quoteNumber) + 1;
          formik.setValues({
            ...formik.values,
            QuoteNumber: nextQuoteNumber,
          });
        }
      } catch (error) {
        console.error("Error fetching quote number: ", error);
      }
    };

    const initialize = async () => {
      await getNumber();
      if (location?.state?.previewData) {
        formik.setValues(location?.state?.previewData?.values);
        setLineItems(
          location.state.previewData?.lineItems || [
            {
              Description: "",
              Name: "",
              Type: "",
              Unit: "",
              Attachment: "",
              CostPerUnit: "",
              Hourly: "",
              CostPerHour: "",
              Fixed: "",
              CostPerFixed: "",
              Square: "",
              CostPerSquare: "",
              Total: "",
              isNew: true,
            },
          ]
        );
        formik.setFieldValue("CustomerId", location?.state?.CustomerId);
        formik.setFieldValue("LocationId", location?.state?.LocationId);
        window.history.replaceState(
          {
            id: location?.state?.previewData?.id
              ? location?.state?.previewData?.id
              : null,
          },
          ""
        );
      } else if (location?.state?.id) {
        await fetchData();
      }
    };

    initialize();
    fetchData();
    return () => {
      formik.resetForm();
      setLineItems([
        {
          FirstName: "",
          LastName: "",
          Description: "",
          Name: "",
          Attachment: "",
          Type: "",
          Unit: "",
          CostPerUnit: "",
          Hourly: "",
          CostPerHour: "",
          Fixed: "",
          CostPerFixed: "",
          Square: "",
          CostPerSquare: "",
          Total: "",
          isNew: true,
        },
      ]);
    };
  }, [location, tokenDecode]);

  const calculateSubTotal = () => {
    const Total = lineItems?.reduce(
      (sum, item) => sum + Number(item?.Total || 0),
      0
    );
    return Total;
  };

  const subTotal = calculateSubTotal();
  const discountAmount = formik.values.Discount
    ? (Number(formik?.values?.Discount) * subTotal) / 100
    : 0;
  const discountedTotal = Math.max(0, subTotal - discountAmount);
  const taxAmount = formik?.values?.Tax
    ? (Number(formik?.values?.Tax) * subTotal) / 100
    : 0;
  const Total = (discountedTotal + taxAmount)?.toFixed(2);

  const handleQuoteNumberChange = async () => {
    const enteredQuoteNumber = Number(formik?.values?.QuoteNumber);

    const companyId =
      localStorage.getItem("CompanyId") || tokenDecode?.companyId;

    try {
      const res = await AxiosInstance.post(`/quote/check_number/${companyId}`, {
        QuoteNumber: enteredQuoteNumber,
      });

      if (res?.data?.statusCode === 200) {
        setTimeout(() => {
          showToast.success("Quote number is valid and added successfully.");
        }, 500);

        setIsNumChange(false);
      } else if (res?.data?.statusCode === 203) {
        setTimeout(() => {
          showToast.error(
            "Quote number already exists. Please choose a different number."
          );
        }, 500);

        formik.setFieldValue("QuoteNumber", "");
      } else {
        setTimeout(() => {
          showToast.error("Failed to check quote number. Please try again.");
        }, 500);
      }
    } catch (error) {
      console.error(
        "Error checking quote number: ",

        error?.response || error?.message
      );

      showToast.error("An error occurred while checking the quote number.");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (formik.dirty || lineItems.some((item) => item.isNew)) {
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
  }, [formik.dirty, lineItems]);

  // Handle Cancel Button Click
  // const handleCancel = () => {
  //   if (formik.dirty || lineItems.some(item => item.isNew)) {
  //     const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
  //     if (confirmCancel) {
  //       navigate(companyName ? `/${companyName}/quotes` : `/staff-member/WorkerQuotes`);
  //     }
  //   } else {
  //     navigate(companyName ? `/${companyName}/quotes` : `/staff-member/WorkerQuotes`);
  //   }
  // };
  return (
    <>
      <Addquotes
        loader={loader}
        customersData={customersData}
        quotesData={quotesData}
        formik={formik}
        // handleSubmits={handleSubmits}
        setLoader={setLoader}
        setIsCustomer={setIsCustomer}
        setTitleRef={setTitleRef}
        propertyData={propertyData}
        Previous={Previous}
        isNumChange={isNumChange}
        setIsNumChange={setIsNumChange}
        handleQuoteNumberChange={handleQuoteNumberChange}
        lineItems={lineItems}
        handleSelectChange={handleSelectChange}
        setLineItems={setLineItems}
        showCosts={showCosts}
        setShowCosts={setShowCosts}
        menuIsOpen={menuIsOpen}
        setMenuIsOpen={setMenuIsOpen}
        deleteLineItem={deleteLineItem}
        isError={isError}
        setIsError={setIsError}
        productRef={productRef}
        addLineItem={addLineItem}
        subTotal={subTotal}
        showDiscount={showDiscount}
        setShowDiscount={setShowDiscount}
        discountAmount={discountAmount}
        showTax={showTax}
        setShowTax={setShowTax}
        taxAmount={taxAmount}
        Total={Total}
        loading={loading}
        setLoading={setLoading}
        handleSaveQuote={handleSaveQuote}
        dropdown={dropdown}
        toggle={toggle}
        modal={modal}
        setModal={setModal}
        titleRef={titleRef}
        handleConvertJob={handleConvertJob}
        isCustomer={isCustomer}
        isProperty={isProperty}
        setIsProperty={setIsProperty}
        setPropertyData={setPropertyData}
        setCustomersData={setCustomersData}
        companyName={companyName}
      />
    </>
  );
}

export default AddQuote;
