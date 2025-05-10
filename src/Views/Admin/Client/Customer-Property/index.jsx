// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
// } from "@mui/material";
// import React, { useEffect, useState } from "react";
// import home from "../../../../assets/image/icons/home.svg";
// import { Country, State, City } from "country-state-city";
// import { useParams } from "react-router-dom";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import AxiosInstance from "../../../AxiosInstance";
// import Address from "../../../../components/Address";
// import "./style.css";
// import { Grid } from "@mui/material";
// import BlueButton from "../../../../components/Button/BlueButton";
// import WhiteButton from "../../../../components/Button/WhiteButton";
// import showToast from "../../../../components/Toast/Toster";
// import  {Typography} from "@mui/material";
// import { WhiteLoaderComponent } from "../../../../components/Icon/Index";

// const CustomerProperty = ({ open, setOpen, data, getData }) => {
//   const baseUrl = process.env.REACT_APP_BASE_API;
//   const { CompanyName } = useParams();
//   const UserId = data?.UserId;

//   var companyId = localStorage.getItem("CompanyId");

//   const formik = useFormik({
//     initialValues: {
//       CompanyId: "",
//       Address: "",
//       City: "",
//       State: "",
//       Zip: "",
//       Country: "",
//     },
//     validationSchema: Yup.object({
//       Address: Yup.string().required("Adress required"),
//       City: Yup.string().required("City required"),
//       State: Yup.string().required("State required"),
//       Zip: Yup.string().required("Zipcode required"),
//       Country: Yup.string().required("Country required"),
//     }),

//     onSubmit: async (values) => {
//       if (open.propertyData) {
//         try {
//           setLoader(true);
//           const response = await AxiosInstance.put(
//             `${baseUrl}/location/${open.propertyData.LocationId}`,
//             values
//           );

//           if (response?.data.statusCode === 200) {
//             const updatedFields = [];

//             if (values?.Address && values?.Address !== open?.propertyData?.Address) {
//               updatedFields.push("Address");
//             }
//             if (values?.City && values?.City !== open?.propertyData?.City) {
//               updatedFields.push("City");
//             }
//             if (values?.Country && values?.Country !== open?.propertyData?.Country) {
//               updatedFields.push("Country");
//             }
//             if (values?.State && values?.State !== open?.propertyData?.State) {
//               updatedFields.push("State");
//             }
//             if (values?.Zip && values?.Zip !== open?.propertyData?.Zip) {
//               updatedFields.push("Zip");
//             }

//             if (updatedFields.length > 1) {
//               showToast.success("Property details updated successfully");
//             } else {
//               updatedFields.forEach(field => {
//                 showToast.success(`${field} updated successfully`);
//               });
//             }

//             getData();
//             setOpen({ isOpen: false, propertyData: null });
//           } else {
//             showToast.error(response?.data.message);
//           }
//         } catch (error) {
//           showToast.error(error.message);
//           console.error("There was an error submitting the form!", error);
//         } setLoader(false);
//       } else {
//         try {
//           setLoader(true);
//           values["CompanyId"] = companyId;
//           values["UserId"] = UserId;
//           const response = await AxiosInstance.post(
//             `${baseUrl}/location`,
//             values
//           );

//           if (response?.data.statusCode === 200) {
//             showToast.success(response?.data.message);
//             getData();
//             setOpen({ isOpen: false, propertyData: "" });
//           } else {
//             showToast.error(response?.data.message);
//           }
//         } catch (error) {
//           showToast.error(error.message);
//           console.error("There was an error submitting the form!", error);
//         } setLoader(false);
//       }
//     },

//   });

//   useEffect(() => {
//     if (open.propertyData) {
//       formik.setValues(open.propertyData);
//     } else {
//       formik.resetForm();
//       setSelectedCountry(null);
//     }
//   }, [open.propertyData]);

//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [loader, setLoader] = useState(false);

//   const [selectedCountry, setSelectedCountry] = useState(null);
//   const [selectedState, setSelectedState] = useState(null);
//   const [selectedCity, setSelectedCity] = useState(null);

//   useEffect(() => {
//     setCountries(Country.getAllCountries());
//     if (open?.propertyData) {
//       setSelectedCountry(() => {
//         const country = Country.getAllCountries().find(
//           (item) => item.name === open?.propertyData.Country
//         );
//         return country;
//       });
//     }
//   }, [open?.propertyData]);

//   useEffect(() => {
//     if (selectedCountry) {
//       setStates(State.getStatesOfCountry(selectedCountry.isoCode));
//       if (open?.propertyData) {
//         setSelectedState(() => {
//           const state = State.getStatesOfCountry(selectedCountry.isoCode).find(
//             (item) => item.name === open?.propertyData.State
//           );
//           return state;
//         });
//       } else {
//         setSelectedState(null);
//         setCities([]);
//       }
//     }
//   }, [selectedCountry]);

//   useEffect(() => {
//     if (selectedState) {
//       setCities(
//         City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
//       );
//       if (open?.propertyData) {
//         setSelectedCity(() => {
//           const state = City.getCitiesOfState(
//             selectedCountry.isoCode,
//             selectedState.isoCode
//           ).find((item) => item.name === open?.propertyData.City);
//           return state;
//         });
//       } else {
//         setSelectedCity(null);
//       }
//     }
//   }, [selectedState]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (name === "Country") {
//       formik.setFieldValue(name, value);
//     } else {
//       formik.setFieldValue(name, type === "checkbox" ? checked : value);
//     }
//   };

//   return (
//     <Dialog
//       open={open.isOpen}
//       onClose={() => {
//         setOpen({ isOpen: false, propertyData: null });
//         setSelectedCity([]);
//         setSelectedState([]);
//         setSelectedCountry([]);
//       }}
//       className="client"
//     >
//       <DialogTitle>
//         <Grid className="w-100 d-flex justify-content-start align-items-center">
//           <Grid
//             className="bg-blue-color"
//             style={{
//               width: "42px",
//               height: "42px",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               borderRadius: "50%",
//             }}
//           >
//             <img src={home} alt="home icon" />
//           </Grid>
//           <Typography
//             className="text-blue-color text-property  newPropertyForUser heading-four fw-medium"
//             style={{
//               justifyContent: "center",
//               display: "flex",
//               alignItems: "center",
//               height: "42px",
//               margin: "0 10px",
//               marginLeft: "10px",
//             }}
//           >
//             {!open.propertyData && "New"} Property for &nbsp;
//             <Typography className="propertyForUserNameHere underline-u fs-5 fw-medium">
//               {" "}
//               {data?.FirstName ? data?.FirstName : ""}&nbsp;
//               {data?.LastName ? data?.LastName : ""}
//             </Typography>
//           </Typography>
//         </Grid>
//       </DialogTitle>
//       <Divider
//         style={{
//           height: "1px",
//           color: "rgba(42, 79, 97, 0.8)",
//           backgroundColor: "rgba(42, 79, 97, 0.8)",
//           margin: "13px 20px",
//           marginBottom: "-10px",
//         }}
//       />
//       <DialogContent>
//         <form onSubmit={formik.handleSubmit}>
//           <Address
//             setSelectedCountry={setSelectedCountry}
//             selectedCountry={selectedCountry}
//             countries={countries}
//             handleChange={handleChange}
//             formik={formik}
//           />
//         </form>
//       </DialogContent>
//       <DialogActions
//         style={{ justifyContent: "space-between", margin: "0 20px 10px 20px" }}
//         className="BlueAndWhiteBtmFlex cancelPropertyModel"
//       >
//         <Grid
//           className="mb-3 "
//           style={{ justifyContent: "space-between", display: "contents" }}
//         >
//           <WhiteButton
//             onClick={() => setOpen({ isOpen: false, propertyData: null })}
//             label="Cancel"
//             className="cancelProperty"
//           />
//           <BlueButton
//             onClick={formik.handleSubmit}
//             label={
//             loader ? (
//               <WhiteLoaderComponent
//                 height="20"
//                 width="20"
//                 padding="20"
//                 loader={loader}
//               />
//             ) : (
//               open?.propertyData ? "Update Property" : "Create Property"
//             )
//           }

//           />
//         </Grid>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default CustomerProperty;

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import home from "../../../../assets/image/icons/home.svg";
import { Country, State, City } from "country-state-city";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../../../AxiosInstance";
import Address from "../../../../components/Address";
import BlueButton from "../../../../components/Button/BlueButton";
import WhiteButton from "../../../../components/Button/WhiteButton";
import showToast from "../../../../components/Toast/Toster";
import { WhiteLoaderComponent } from "../../../../components/Icon/Index";
import "./style.css";

const CustomerProperty = ({ open, setOpen, data, getData }) => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const { CompanyName } = useParams();
  const UserId = data?.UserId;
  const companyId = localStorage.getItem("CompanyId");
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loader, setLoader] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [isChanged, setIsChanged] = useState(false);

  const formik = useFormik({
    initialValues: {
      CompanyId: "",
      Address: "",
      City: "",
      State: "",
      Zip: "",
      Country: "",
    },
    validationSchema: Yup.object({
      Address: Yup.string().required("Address required"),
      City: Yup.string().required("City required"),
      State: Yup.string().required("State required"),
      Zip: Yup.string().required("Zipcode required"),
      Country: Yup.string().required("Country required"),
    }),

    onSubmit: async (values) => {
      // Prevent API call if no changes
      if (!isChanged) {
        showToast.info("No changes detected.");
        return;
      }

      if (open.propertyData) {
        // Update property logic
        try {
          setLoading(true);
          const response = await AxiosInstance.put(
            `${baseUrl}/v1/location/${open.propertyData.LocationId}`,
            values
          );
          if (response?.data.statusCode === 200) {
            showToast.success("Property updated successfully!");
            getData();
            setOpen({ isOpen: false, propertyData: null });
          } else {
            showToast.error(response?.data.message);
          }
        } catch (error) {
          showToast.error(error.message);
          setLoading(true);
        } finally {
          setLoading(false);
        }
      } else {
        // Create property logic
        try {
          setLoading(true);
          values["CompanyId"] = companyId;
          values["UserId"] = UserId;
          const response = await AxiosInstance.post(
            `${baseUrl}/v1/location`,
            values
          );
          if (response?.data.statusCode === 200) {
            showToast.success("Property created successfully!");
            getData();
            setOpen({ isOpen: false, propertyData: "" });
          } else {
            showToast.error(response?.data.message);
          }
        } catch (error) {
          if (error.response && error.response.status === 400) {
            const validationErrors = error.response?.data?.errors;
            if (validationErrors && validationErrors.length > 0) {
              validationErrors.forEach((errorMessage) => {
                showToast.warning(errorMessage);
              });
            }
          } else {
            console.error(
              "Error during submit:",
              error.response?.data || error.message
            );
            showToast.error("An error occurred while submitting data.");
          }
        } finally {
          setLoading(false); // Ensure loading is always reset at the end
        }
      }
    },
  });

  // Sync form values with modal data
  useEffect(() => {
    if (open.propertyData) {
      formik.setValues(open.propertyData);
      setIsChanged(false); // Reset change tracking
    } else {
      formik.resetForm();
      setIsChanged(false);
    }
  }, [open.propertyData]);

  // Track changes
  useEffect(() => {
    const isValuesChanged = Object.keys(formik.values).some(
      (key) =>
        formik.values[key] !== (open.propertyData ? open.propertyData[key] : "")
    );
    setIsChanged(isValuesChanged);
  }, [formik.values, open.propertyData]);

  useEffect(() => {
    if (open.propertyData) {
      formik.setValues(open.propertyData);
      formik.setTouched({});
    } else {
      formik.resetForm();
      setSelectedCountry(null);
    }
  }, [open.propertyData]);

  useEffect(() => {
    setCountries(Country.getAllCountries());
    if (open?.propertyData) {
      setSelectedCountry(() =>
        Country.getAllCountries().find(
          (item) => item.name === open?.propertyData.Country
        )
      );
    }
  }, [open?.propertyData]);

  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry.isoCode));
      if (open?.propertyData) {
        setSelectedState(() =>
          State.getStatesOfCountry(selectedCountry.isoCode).find(
            (item) => item.name === open?.propertyData.State
          )
        );
      } else {
        setSelectedState(null);
        setCities([]);
      }
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      setCities(
        City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
      );
      if (open?.propertyData) {
        setSelectedCity(() =>
          City.getCitiesOfState(
            selectedCountry.isoCode,
            selectedState.isoCode
          ).find((item) => item.name === open?.propertyData.City)
        );
      } else {
        setSelectedCity(null);
      }
    }
  }, [selectedState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      formik.setFieldValue(name, value);
    } else {
      formik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
  };

  const handleZipChange = (event) => {
    const { name, value } = event.target;
    const regex = /^[A-Za-z0-9]*$/;

    if (regex.test(value) || value === "") {
      formik.setFieldValue(name, value);
    }
  };

  return (
    <Dialog
      open={open.isOpen}
      onClose={() => {
        setOpen({ isOpen: false, propertyData: null });
        formik.resetForm();
        setIsChanged(false);
      }}
    >
      <DialogTitle className="borerBommoModel">Edit Property</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit} style={{ marginTop: "20px" }}>
          {/* Address Component */}
          <Address
            setSelectedCountry={setSelectedCountry}
            selectedCountry={selectedCountry}
            countries={countries}
            handleChange={(e) => {
              formik.handleChange(e);
              setIsChanged(true);
            }}
            formik={formik}
            handleZipChange={handleZipChange}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <WhiteButton
          onClick={() => setOpen({ isOpen: false, propertyData: null })}
          label="Cancel"
        />
        <BlueButton
          onClick={formik.handleSubmit}
          label={
            loading ? (
              <WhiteLoaderComponent
                height="20"
                width="20"
                padding="20"
                loader={loading}
              />
            ) : open?.propertyData ? (
              "Update Property"
            ) : (
              "Create Property"
            )
          }
          disabled={!isChanged || !formik.dirty}
        />
      </DialogActions>
    </Dialog>
  );
};

export default CustomerProperty;
