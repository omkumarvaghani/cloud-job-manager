import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Country } from "country-state-city";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../../Client/style.css";
import AxiosInstance from "../../../AxiosInstance";
import AddCustomerView from "./Views/Index";
import showToast from "../../../../components/Toast/Toster";
import axios from "axios";
import moment from "moment";

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
        const res = await AxiosInstance.post(`/v1/auth/token_data`, {
          token,
        });
        if (res?.data) {
          setCompanyId(res?.data?.data?.companyId);
        }
      } catch (error) {
        console.error("Error:", error?.message);
      }
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, []);

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
    },
    validationSchema: Yup.object({
      FirstName: Yup.string().required("First Name  Required"),
      LastName: Yup.string().required("Last Name  Required"),
      PhoneNumber: Yup.string()
        .required("Phone number  required")
        .matches(
          /^\(\d{3}\) \d{3}-\d{4}$/,
          "Phone number must be in the format (xxx) xxx-xxxx"
        ),
      EmailAddress: Yup.string()
        .email("Invalid email")
        .required("Email required")
        .matches(/^[^@]+@[^@]+\.[^@]+$/, "Email must contain '@' and '.'"),
      City: Yup.string().required(" City Required"),
      State: Yup.string().required(" State Required"),
      Address: Yup.string().required("Address Required"),
      Zip: Yup.string().required("Zip Required"),
      Country: Yup.string().required(" Country Required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (location?.state?.id) {
        try {
          setLoader(true);
          const response = await AxiosInstance.put(
            `/customer/${location?.state?.id}`,
            values
          );
          if (response?.data?.statusCode === 200) {
            setLoader(false);

            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
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
          } else if (response?.data?.statusCode === 203) {
            setTimeout(() => {
              showToast.error(response?.data?.message, "error");
            }, 500);
          } else {
            showToast.error("", response?.data?.message, "error");
          }
        } catch (error) {
          if (error.response) {
            console.error(
              "Server responded with an error:",
              error.response?.data
            );
            showToast.error(
              error?.response?.data?.message || "Something went wrong!"
            );
          } else if (error?.request) {
            console.error("No response received:", error?.request);
            showToast.error(
              "No response from the server, please try again later."
            );
          } else {
            console.error("Error during request setup:", error?.message);
            showToast.error("Error occurred while sending request.");
          }
        } finally {
          setSelectedCountry("");
          setLoader(false);
        }
      } else {
        try {
          setLoader(true);
          const response = await AxiosInstance.post(`/customer`, {
            ...values,
            CompanyId: CompanyId,
            AddedAt: new Date(),
          });
          if (response?.data.statusCode === 201) {
            setLoader(false);
            if (location?.state?.previewPage) {
              showToast(response?.data?.message);
              navigate(location?.state?.previewPage, {
                state: {
                  CustomerId: response?.data?.CustomerId,
                  navigats: location?.state?.navigats.filter(
                    (item) => item !== "/add-customer"
                  ),
                },
              });
            } else {
              showToast.success(response?.data?.message);
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
            showToast.error(response?.data.message, "error");
          }
        } catch (error) {
          if (error?.response) {
            console.error(
              "Server responded with an error:",
              error?.response?.data
            );
            showToast.error(
              error?.response?.data?.message || "Something went wrong!"
            );
          } else if (error?.request) {
            console.error("No response received:", error?.request);
            showToast.error(
              "No response from the server, please try again later."
            );
          } else {
            console.error("Error during request setup:", error?.message);
            showToast.error("Error occurred while sending request.");
          }
        } finally {
          setLoader(false);
        }
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
        const res = await AxiosInstance.get(`/customer/${location?.state?.id}`);
        formik.setValues(res.data.data);
        formik.setValues({
          ...res?.data?.data,
          Address: res?.data?.data?.location[0]?.Address,
          City: res?.data?.data?.location[0]?.City,
          State: res?.data?.data?.location[0]?.State,
          Zip: res?.data?.data?.location[0]?.Zip,
          Country: res?.data?.data?.location[0]?.Country,
        });
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
  const [open, setOpen] = useState(false);

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const initialTimes = {
    Sunday: {
      start: null,
      end: null,
    },
    Monday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Tuesday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Wednesday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Thursday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Friday: {
      start: moment("09:00 AM", "hh:mm A"),
      end: moment("05:00 PM", "hh:mm A"),
    },
    Saturday: {
      start: null,
      end: null,
    },
  };

  const [times, setTimes] = useState(initialTimes);

  const handleTimeChange = (day, type) => (newValue) => {
    const updatedTimes = { ...times };
    updatedTimes[day] = {
      ...updatedTimes[day],
      [type]: newValue ? newValue.format("MM-DD-YYYY HH:mm:ss") : null,
    };
    setTimes(updatedTimes);
    setTimes(updatedTimes);
  };

  const handleSave = async () => {
    const dataToPost = Object.keys(times).map((day) => ({
      day,
      defaultStart: initialTimes[day].start
        ? initialTimes[day].start.format("hh:mm A")
        : null,
      defaultEnd: initialTimes[day].end
        ? initialTimes[day].end.format("hh:mm A")
        : null,
      selectedStart: times[day].start
        ? moment(times[day].start).format("hh:mm A")
        : null,
      selectedEnd: times[day].end
        ? moment(times[day].end).format("hh:mm A")
        : null,
    }));

    try {
      const response = await axios.post("/api/save-times", dataToPost);
    } catch (error) {
      console.error("Error saving times:", error);
    }
  };
  const handleCloseDialog = () => {
    setOpen(false);
  };


    const [isChecked, setIsChecked] = useState({
      Sunday: false,
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: false,
    });
  
    const handleCheckboxChange = (day) => {
      setIsChecked((prev) => ({
        ...prev,
        [day]: !prev[day],
      }));
    };
  

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






        times={times}
        handleSave={handleSave}
        handleTimeChange={handleTimeChange}
        handleOpenDialog={handleOpenDialog}

        handleCloseDialog={handleCloseDialog}
        handleCheckboxChange={handleCheckboxChange}
        isChecked={isChecked}
        open={open}
      />
    </>
  );
}

export default AddClient;
