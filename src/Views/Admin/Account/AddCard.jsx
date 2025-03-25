import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import PaymentInfo from "../../../components/Plan/PaymentInfo";
import Address from "../../../components/Address";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Country } from "country-state-city";
import AxiosInstance from "../../AxiosInstance";
import { useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import showToast from "../../../components/Toast/Toster";

import { Typography } from "@mui/material";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";
const AddCard = ({
  setIsOpen,
  isOpen,
  isBilling,
  vaultId,
  fetchData,
  CustomerId,
}) => {
  const { CompanyName } = useParams();
  const planFormik = useFormik({
    initialValues: {
      FirstName: "",
      LastName: "",
      Number: "",
      Email: "",
      CardNumber: "",
      ExpireMonth: "",
      ExpireYear: "",
      CVVNumber: "",
      Address: "",
      City: "",
      State: "",
      Country: "",
      Zip: "",
    },

    validationSchema: Yup.object().shape({
      FirstName: Yup.string().required("First name is required"),
      LastName: Yup.string().required("Last name is required"),
      CardNumber: Yup.number()
        .required("Card number is required")
        .test(
          "len",
          "Card number must be between 14 and 19 digits",
          (val) =>
            val && val.toString().length >= 14 && val.toString().length <= 19
        )
        .min(0, "Card number cannot be less than 0"),
      ExpireMonth: Yup.string().required("Expire month is required"),
      ExpireYear: Yup.string().required("Expire year is required"),
      CVVNumber: Yup.string().required("CVV number is required"),
      Address: Yup.string().required("Address is required"),
      City: Yup.string().required("City is required"),
      State: Yup.string().required("State is required"),
      Country: Yup.string().required("Country is required"),
      Zip: Yup.string().required("Zip code is required"),
    }),

    onSubmit: async (values) => {
      try {
        const object = {
          first_name: values.FirstName,
          last_name: values.LastName,
          ccnumber: values.CardNumber,
          ccexp: `${values.ExpireMonth}${values.ExpireYear.slice(2, 4)}`,
          address1: values.Address,
          city: values.City,
          state: values.State,
          zip: values.Zip,
          country: values.Country,
          phone: values.Number,
          email: values.Email,
          company: CompanyName,
          CompanyId: localStorage.getItem("CompanyId"),
          customer_vault_id: vaultId,
          type: "card",
          CustomerId: CustomerId || "",
        };

        var url;
        if (!isBilling) {
          url = "/nmi/create-customer-vault";
        } else {
          url = "/nmi/create-customer-billing";
        }

        const res = await AxiosInstance.post(url, object);
        if (res.data.status === 200) {
          showToast.success(res.data.data.message);
          fetchData();
          setIsOpen(false);
        }
      } catch (error) {
        if (error.response.status === 403) {
          showToast.error(error.response?.data?.data);
        } else if (error.response.status === 404) {
          showToast.error(error.response?.data?.data);
        } else {
          showToast.error("Something is wrong, Tyr again after some time!");
        }
      }
    },
  });

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  useEffect(() => {
    setCountries(Country.getAllCountries());
    if (planFormik.values.Country) {
      setSelectedCountry(() => {
        const country = Country.getAllCountries().find(
          (item) => item.name === planFormik.values.Country
        );
        return country;
      });
    }
  }, [planFormik]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "Country") {
      planFormik.setFieldValue(name, value);
    } else if (name === "ExpireYear") {
      if (parseInt(value) === currentYear) {
        setExpireMonth(
          Array.from(
            { length: 12 - currentMonth + 1 },
            (_, i) => i + currentMonth
          )
        );
      } else {
        setExpireMonth(Array.from({ length: 12 }, (_, i) => i + 1));
      }
      planFormik.setFieldValue(name, value);
    } else {
      planFormik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [expireMonth, setExpireMonth] = useState([]);
  const [expireYear, setExpireYear] = useState([]);

  useEffect(() => {
    const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
    setExpireYear(years);

    updateMonths(currentYear);
  }, [currentYear, currentMonth]);

  const updateMonths = (selectedYear) => {
    const startMonth = selectedYear === currentYear ? currentMonth : 1;
    const months = Array.from({ length: 12 - startMonth + 1 }, (_, i) =>
      String(i + startMonth).padStart(2, "0")
    );
    setExpireMonth(months);
  };

  const handleYearChange = (e) => {
    if (e.target.value) {
      const selectedYear = parseInt(e.target.value, 10);
      updateMonths(selectedYear);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
        planFormik.resetForm();
      }}
    >
      <DialogTitle>Card Information </DialogTitle>
      <DialogContent>
        <PaymentInfo
          formik={planFormik}
          handleChange={handleChange}
          expireMonth={expireMonth}
          expireYear={expireYear}
          handleYearChange={handleYearChange}
        />
        <Address
          formik={planFormik}
          setSelectedCountry={setSelectedCountry}
          selectedCountry={selectedCountry}
          countries={countries}
          handleChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Grid className="d-flex align-items-center justify-content-end gap-2 flex-bottom">
          <WhiteButton
            className="p-2 text-white-color"
            style={{
              borderRadius: "4px",
              fontSize: "12px",
            }}
            label={
              <>
                <Typography
                  className="text-blue-color full-sentence"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Typography>
              </>
            }
          />
          <BlueButton
            className="p-2 bg-blue-color text-white-color"
            type="button"
            style={{
              borderRadius: "4px",
              fontSize: "12px",
            }}
            onClick={() => {
              planFormik.handleSubmit();
            }}
            label={<><Typography className="full-sentence">Add Card</Typography></>}
          />
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default AddCard;
