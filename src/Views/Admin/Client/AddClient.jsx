import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Country } from "country-state-city";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../Client/style.css";
import AxiosInstance from "../../AxiosInstance";
import AddCustomerView from "./Views/AddCustomer";
import showToast from "../../../components/Toast/Toster";

function AddClient() {
  const location = useLocation();
  const navigate = useNavigate();
  const { CompanyName } = useParams();
  const [loader, setLoader] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [CompanyId, setCompanyId] = useState(localStorage.getItem("CompanyId"));
  const [isEdited, setIsEdited] = useState(false);

  const fetchTokenData = async () => {
    if (!CompanyId) {
      try {
        const token =
          localStorage.getItem("adminToken") ||
          localStorage.getItem("workerToken");

        if (!token) {
          console.error("Token not found in localStorage");
          return;
        }
        const res = await AxiosInstance.post(`/company/token_data`, {
          token,
        });
        if (res?.data) {
          setCompanyId(res?.data?.data?.CompanyId);
        }
      } catch (error) {
        console.error("Error:", error?.message);
      }
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, []);

  // const formik = useFormik({
  //   initialValues: {
  //     CompanyId: "",
  //     FirstName: "",
  //     LastName: "",
  //     City: "",
  //     State: "",
  //     Zip: "",
  //     Country: "",
  //     PhoneNumber: "",
  //     EmailAddress: "",
  //     Address: "",
  //   },
  //   validationSchema: Yup.object({
  //     FirstName: Yup.string().required("First Name  Required"),
  //     LastName: Yup.string().required("Last Name  Required"),
  //     PhoneNumber: Yup.string()
  //       .required("Phone number  required")
  //       .matches(
  //         /^\(\d{3}\) \d{3}-\d{4}$/,
  //         "Phone number must be in the format (xxx) xxx-xxxx"
  //       ),
  //     EmailAddress: Yup.string()
  //       .email("Invalid email")
  //       .required("Email required")
  //       .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
  //     City: Yup.string().required(" City Required"),
  //     State: Yup.string().required(" State Required"),
  //     Address: Yup.string().required("Address Required"),
  //     Zip: Yup.string().required("Zip Required"),
  //     Country: Yup.string().required(" Country Required"),
  //   }),
  //   enableReinitialize: true,
  //   onSubmit: async (values) => {
  //     if (location?.state?.id) {
  //       try {
  //         setLoader(true);
  //         const response = await AxiosInstance.put(
  //           `/customer/${location?.state?.id}`,
  //           values
  //         );
  //         if (response?.data?.statusCode === 200) {
  //           setLoader(false);

  //           setTimeout(() => {
  //             showToast.success(response?.data?.message);
  //           }, 500);
  //           navigate(
  //             `/${
  //               CompanyName
  //                 ? CompanyName + "/customer"
  //                 : "staff-member" + "/workercustomer"
  //             }`,
  //             {
  //               state: {
  //                 navigats: location?.state?.navigats.filter(
  //                   (item) => item !== "/add-customer"
  //                 ),
  //               },
  //             }
  //           );
  //         } else if (response?.data?.statusCode === 203) {
  //           setTimeout(() => {
  //             showToast.error(response?.data?.message, "error");
  //           }, 500);
  //         } else {
  //           showToast.error("", response?.data?.message, "error");
  //         }
  //       } catch (error) {
  //         if (error.response) {
  //           console.error(
  //             "Server responded with an error:",
  //             error.response?.data
  //           );
  //           showToast.error(
  //             error?.response?.data?.message || "Something went wrong!"
  //           );
  //         } else if (error?.request) {
  //           console.error("No response received:", error?.request);
  //           showToast.error(
  //             "No response from the server, please try again later."
  //           );
  //         } else {
  //           console.error("Error during request setup:", error?.message);
  //           showToast.error("Error occurred while sending request.");
  //         }
  //       } finally {
  //         setSelectedCountry("");
  //         setLoader(false);
  //       }
  //     }

  //    //start from he

  //    else {
  //     try {
  //       setLoader(true);
  //       const response = await AxiosInstance.post(`/customer`, {
  //         ...values,
  //         CompanyId: CompanyId,
  //         AddedAt: new Date(),
  //       });

  //       if (response?.data.statusCode === 201) {
  //         setLoader(false);
  //         if (location?.state?.previewPage) {
  //           showToast(response?.data?.message);
  //           navigate(location?.state?.previewPage, {
  //             state: {
  //               CustomerId: response?.data?.CustomerId,
  //               navigats: location?.state?.navigats.filter(
  //                 (item) => item !== "/add-customer"
  //               ),
  //             },
  //           });
  //         } else {
  //           showToast.success(response?.data?.message);
  //           navigate(
  //             `/${
  //               CompanyName
  //                 ? CompanyName + "/customer"
  //                 : "staff-member" + "/workercustomer"
  //             }`,
  //             {
  //               state: {
  //                 navigats: location?.state?.navigats.filter(
  //                   (item) => item !== "/add-customer"
  //                 ),
  //               },
  //             }
  //           );
  //         }
  //       } else if (response?.data.statusCode === 403) {
  //         // Handling 403 status code specifically
  //         showToast.error(response?.data?.message || "Access Forbidden", "error");
  //       } else {
  //         // For other status codes
  //         showToast.error(response?.data?.message, "error");
  //       }
  //     } catch (error) {
  //       if (error?.response) {
  //         const { status, data } = error.response;

  //         if (status === 400 && data?.errors) {
  //           data.errors.forEach((message) => {
  //             const fieldName = message.split(" ")[0];
  //             formik.setFieldError(fieldName, message);
  //             setTimeout(() => {
  //               showToast.warning(`${fieldName}: ${message}`);
  //             }, 300);
  //           });
  //         } else {
  //           showToast.error(data?.message || "Something went wrong!");
  //         }
  //       } else {
  //         console.error("Error during request:", error);
  //         showToast.error(error?.response?.data?.message || "Something went wrong!");
  //       }
  //     } finally {
  //       setLoader(false);
  //     }
  //   }

  //   },
  // });

  const formik = useFormik({
    initialValues: {
      CompanyId: "",
      FirstName: "",
      LastName: "",
      City: "",
      State: "",
      Zip: "",
      Country: "",
      PhoneNumber: "",
      EmailAddress: "",
      Address: "",
      // CustomerId: "",
    },
    validationSchema: Yup.object({
      FirstName: Yup.string().required("First Name Required"),
      LastName: Yup.string().required("Last Name Required"),
      PhoneNumber: Yup.string()
        .required("Phone number required")
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "Phone number must be in the format (xxx) xxx-xxxx"
        ),
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email required")
        .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
      City: Yup.string().required("City Required"),
      State: Yup.string().required("State Required"),
      Address: Yup.string().required("Address Required"),
      Zip: Yup.string().required("Zip Required"),
      Country: Yup.string().required("Country Required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoader(true);
      try {
        // If it's an update, handle PUT request
        if (location?.state?.id) {
          const response = await AxiosInstance.put(
            `/v1/user/${location?.state?.id}`,
            values
          );
          // consol.log(response, "responsess");
          if (response?.data?.statusCode === "200") {
            setLoader(false);
            showToast.success(response?.data?.message);
            // Handle navigatio n after successful update
            navigate(
              `/${
                CompanyName
                  ? CompanyName + "/customer"
                  : "staff-member" + "/workercustomer"
              }`,
              {
                state: {
                  navigats: location?.state?.navigats.filter(
                    (item) => item !== "/add-customer"
                  ),
                },
              }
            );
          } else {
            showToast.error(response?.data?.message, "error");
          }
        }
        // If it's a new customer, handle POST request
        else {
          const response = await AxiosInstance.post(`/v1/user`, {
            ...values,
            CompanyId: CompanyId,
            AddedAt: new Date(),
            Role: "Customer",
          });
          if (response?.data?.statusCode == "200") {
            setLoader(false);
            showToast.success(response?.data?.message);

            if (location?.state?.previewPage) {
              navigate(location?.state?.previewPage, {
                state: {
                  Customer: { ...response?.data.data, ...values },
                  UserId: response?.data.data?.UserId,
                  navigats: location?.state?.navigats.filter(
                    (item) => item !== "/add-customer"
                  ),
                },
              });
            } else {
              navigate(
                `/${
                  CompanyName
                    ? CompanyName + "/customer"
                    : "staff-member" + "/workercustomer"
                }`,
                {
                  state: {
                    navigats: location?.state?.navigats.filter(
                      (item) => item !== "/add-customer"
                    ),
                  },
                }
              );
            }
          } else {
            showToast.error(
              response?.data?.message || "Something went wrong!",
              "error"
            );
          }
        }
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;

          if (status === 400 && data?.errors) {
            data.errors.forEach((message) => {
              const fieldName = message.split(" ")[0];
              formik.setFieldError(fieldName, message);
              setTimeout(() => {
                showToast.warning(`${fieldName}: ${message}`);
              }, 300);
            });
          } else {
            showToast.error(data?.message || "Something went wrong!");
          }
        } else {
          console.error("Error during request:", error);
          showToast.error(
            error?.response?.data?.message || "Something went wrong!"
          );
        }
      } finally {
        setLoader(false);
      }
    },
  });

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
    if (formik?.values?.PhoneNumber?.length > e?.target?.value?.length) {
      formik?.setFieldValue("PhoneNumber", e?.target?.value);
    } else {
      const formattedValue = formatPhoneNumber(e.target.value);
      formik?.setFieldValue("PhoneNumber", formattedValue);
    }
    setIsEdited(true);
  };
  console.log(formik,"formikformik")
  useEffect(() => {
    setCountries(Country.getAllCountries());
    if (formik?.values?.Country) {
      setSelectedCountry(() => {
        const country = Country.getAllCountries().find(
          (item) => item?.name === formik?.values?.Country
        );
        return country;
      });
    }
  }, [formik]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AxiosInstance.get(`/v1/user/${location?.state?.id}`);

        const userProfile = res?.data?.data?.userProfile;
        if (userProfile) {

          formik.setValues({
            FirstName: userProfile?.FirstName || "",
            LastName: userProfile?.LastName || "",
            PhoneNumber: userProfile?.PhoneNumber || "",
            EmailAddress: res?.data?.data?.user?.EmailAddress || "",
            Address: userProfile?.Address || "",
            City: userProfile?.City || "",
            State: userProfile?.State || "",
            Zip: userProfile?.Zip || "",
            Country: userProfile?.Country || "",
          });
        }
      } catch (error) {
        console.error("Error: ", error?.message);
      }
    };

    if (location?.state?.id) {
      fetchData();
    }
  }, [location?.state?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      formik.setFieldValue(name, value);
    } else {
      formik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
    setIsEdited(true);
  };

  const handleZipChange = (event) => {
    const { name, value } = event.target;
    const regex = /^[A-Za-z0-9]*$/;

    if (regex.test(value) || value === "") {
      formik.setFieldValue(name, value);
    }
  };

  const [phoneNumbers, setPhoneNumbers] = useState([""]);

  // const handlePhoneChange = (index, event,target) => {
  //   const newPhoneNumbers = [...phoneNumbers];
  //   const inputValue = event.target.value;

  //   if (phoneNumbers[index].length > inputValue.length) {
  //     newPhoneNumbers[index] = inputValue;
  //   } else {
  //     newPhoneNumbers[index] = formatPhoneNumber(inputValue);
  //   }

  //   setPhoneNumbers(newPhoneNumbers);
  //   formik.setFieldValue("PhoneNumbers", newPhoneNumbers);
  // };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ""]);
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (formik.dirty) {
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
  }, [formik.dirty]);

  return (
    <>
      <AddCustomerView
        formik={formik}
        handleChange={handleChange}
        loader={loader}
        countries={countries}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        handlePhoneChange={handlePhoneChange}
        isEdited={isEdited}
        CompanyName={CompanyName}
        handleZipChange={handleZipChange}
        addPhoneNumber={addPhoneNumber}
        phoneNumbers={phoneNumbers}
      />
    </>
  );
}

export default AddClient;
