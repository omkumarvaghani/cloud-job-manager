import { useEffect, useState, useRef } from "react";
import {
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import AxiosInstance from "../../Views/AxiosInstance";
import InputText from "../InputFields/InputText";
import InputDropdown from "../InputFields/InputDropdown";
import { Country } from "country-state-city";
import "./style.css";

const AddCardForm = (props) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address1: "",
    city: "",
    country: "",
    state: "",
    zip: "",
  });

  const [data, setData] = useState();
  const [loader, setLoader] = useState(true);

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(
        `/customer/detail/${props?.CustomerId}`
      );
      setData(res?.data?.data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [props.CustomerId]);

  const [countries, setCountries] = useState([]);

  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    if (phoneNumber?.length < 1) {
      return phoneNumber;
    }
    if (phoneNumber?.length <= 3) {
      return `(${phoneNumber}`;
    }
    if (phoneNumber.length <= 6) {
      return `(${phoneNumber?.slice(0, 3)}) ${phoneNumber?.slice(3)}`;
    }
    return `(${phoneNumber?.slice(0, 3)}) ${phoneNumber?.slice(
      3,
      6
    )} - ${phoneNumber?.slice(6, 10)}`;
  };

  const handleChange = (event) => {
    const { name, value } = event?.target;

    if (name === "phone") {
      setFormData({
        ...formData,
        phone: formatPhoneNumber(value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  /* global CollectJS */
  useEffect(() => {
    const fetchData = () => {
      try {
        if (typeof CollectJS !== "undefined") {
          CollectJS.configure({
            callback: async function (response) {
              const responseData = {
                ...formDataRef?.current,
                payment_token: response?.token,
              };
              props.addCardInfo(responseData);
            },
            variant: "inline",
            invalidCss: {
              color: "#B40E3E",
            },
            validCss: {
              color: "#14855F",
            },
            customCss: {
              border: "1px solid #063164",
              borderRadius: "4px",
              height: "46px",
              padding: "16px 14px",
              outline: "none",
              fontSize: "16px",
              boxShadow: "none",
              transition: "border-color 0.2s ease-in-out",
            },
            fields: {
              cvv: {
                placeholder: "CVV *",
              },
              ccnumber: {
                placeholder: "Credit Card *",
              },
              ccexp: {
                placeholder: "MM / YY *",
              },
            },
          });
        } else {
          console.warn("CollectJS is not defined.");
        }
      } catch (error) {
        console.error("An error occurred while configuring CollectJS:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (data) {
      setFormData({
        first_name: data?.FirstName || "FirstName not available",
        last_name: data?.LastName || "LastName not available",
        email: data?.EmailAddress || "EmailAddress not available",
        phone: data?.PhoneNumber || "PhoneNumber not available",
        address1: data?.location?.[0]?.Address || "Address not available",
        city: data?.location?.[0]?.City || "City not available",
        state: data?.location?.[0]?.State || "State not available",
        zip: data?.location?.[0]?.Zip || "Zip not available",
      });
    }
  }, [data]);

  useEffect(() => {
    setCountries(Country.getAllCountries());

    if (data?.location[0]?.Country) {
      const selectedCountry = Country?.getAllCountries()?.find(
        (country) => country?.name === data?.location[0]?.Country
      );
      if (selectedCountry) {
        setFormData((prevData) => ({
          ...prevData,
          country: selectedCountry?.isoCode,
        }));
      }
    }
  }, [data]);

  const handleCountryChange = (event, newValue) => {
    const selectedCountry = newValue ? newValue?.isoCode : "";
    setFormData((prevData) => ({
      ...prevData,
      country: selectedCountry,
    }));
  };

  return (
    <form
      className="show-form"
      onSubmit={handleSubmit}
      style={{ margin: "0px auto" }}
    >
      <Grid className="formInner">
        <Grid container spacing={2} style={{ marginTop: "1px" }}>
          <Grid item xs={12} sm={6}>
            <InputText
              onChange={handleChange}
              name="first_name"
              required
              label="First Name"
              fullWidth
              value={formData?.first_name}
              InputLabelProps={{
                shrink: Boolean(formData?.first_name),
              }}
              className="text-blue-color w-100"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputText
              onChange={handleChange}
              required
              name="last_name"
              label="Last Name"
              fullWidth
              value={formData?.last_name}
              InputLabelProps={{
                shrink: Boolean(formData?.last_name),
              }}
              className="text-blue-color w-100 userLarName"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} style={{ marginTop: "1px" }}>
          <Grid item xs={12} sm={6}>
            <InputText
              onChange={handleChange}
              placeholder="Enter phone number"
              label="Enter phone number"
              required
              name="phone"
              type="tel"
              pattern="^\+?[0-9\-]+$"
              fullWidth
              value={formData?.phone}
              InputLabelProps={{
                shrink: Boolean(formData?.phone),
              }}
              className="text-blue-color w-100 userLarName"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputText
              onChange={handleChange}
              required
              placeholder="Email email"
              label="Enter email"
              name="email"
              type="email"
              fullWidth
              value={formData?.email}
              InputLabelProps={{
                shrink: Boolean(formData?.email),
              }}
              className="text-blue-color w-100 userLarName"
            />
          </Grid>
        </Grid>
        <Grid>
          <Grid>
            <InputText
              onChange={handleChange}
              required
              name="address1"
              label="Address"
              fullWidth
              margin="normal"
              style={{ marginBottom: "15px" }}
              value={formData?.address1}
              InputLabelProps={{
                shrink: Boolean(formData?.address1),
              }}
              className="text-blue-color w-100 userLarName"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputText
              onChange={handleChange}
              required
              name="city"
              label="City"
              fullWidth
              value={formData?.city}
              InputLabelProps={{
                shrink: Boolean(formData?.city),
              }}
              className="text-blue-color w-100 userLarName"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputText
              onChange={handleChange}
              required
              name="state"
              label="State"
              fullWidth
              value={formData?.state}
              InputLabelProps={{
                shrink: Boolean(formData?.state),
              }}
              style={{ marginBottom: "15px" }}
              className="text-blue-color w-100 userLarName"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputText
              onChange={handleChange}
              required
              name="zip"
              label="Zip"
              fullWidth
              value={formData?.zip}
              InputLabelProps={{
                shrink: Boolean(formData?.zip),
              }}
              className="text-blue-color w-100 userLarName"
            />
          </Grid>
          <Grid item xs={12} sm={6} className="userLarName">
            <InputDropdown
              onChange={handleCountryChange}
              options={countries}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => (
                <li {...props} key={option?.isoCode}>
                  {option?.name} ({option?.isoCode})
                </li>
              )}
              value={
                countries?.find((c) => c.isoCode === formData?.country) || null
              }
              name="country"
              label="Country"
              fullWidth
              className="userLarName"
            />
          </Grid>
        </Grid>
        <Typography
          variant="h5"
          className="text-lg cardInfoPayment text-blue-color"
          style={{  marginBottom: "20px" }}
        >
          Card Information
        </Typography>
        <Grid id="payment-fields">
          <Grid container spacing={2} className="monthCvvCardInput">
            <Grid item xs={12}>
              <label
                style={{
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              ></label>
              <Grid className="payment-field" id="ccnumber"></Grid>
            </Grid>
            <Grid item xs={6}>
              <label
                className=""
                style={{
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              ></label>
              <Grid
                className="payment-field monthCardDetailInput"
                id="ccexp"
              ></Grid>
            </Grid>
            <Grid item xs={6}>
              <label
                className=""
                style={{
                  fontFamily: "Poppins",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              ></label>
              <Grid
                className="payment-field monthCardDetailInput"
                id="cvv"
              ></Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid className="d-flex align-items-center justify-content-end gap-2 flex-bottom mt-4 BlueAndWhiteBtmFlex">
        <button
          className="p-2 canceluserAdd"
          style={{
            color: "#fff",
            borderRadius: "4px",
            background: "#fff",
            fontSize: "12px",
          }}
        >
          <span
            className="text-blue-color full-sentence"
            onClick={props?.onHide}
          >
            Cancel
          </span>
        </button>
        <button
          className="p-2 bg-blue-color canceluserAdd"
          type="submit"
          id="payButton"
          style={{
            color: "#fff",
            borderRadius: "4px",
            background: "#fff",
            fontSize: "12px",
          }}
          disabled={props?.loader}
        >
          {props?.loader ? (
            <CircularProgress size={20} style={{ color: "#fff" }} />
          ) : (
            <span>Add Card</span>
          )}
        </button>
      </Grid>
    </form>
  );
};

export default AddCardForm;
