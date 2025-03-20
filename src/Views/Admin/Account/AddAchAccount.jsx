import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Address from "../../../components/Address";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Country } from "country-state-city";
import AxiosInstance from "../../AxiosInstance";
import { useParams } from "react-router-dom";
import AchInfo from "../../../components/Plan/AchInfo";
import { Grid, Button } from "@mui/material";
import showToast from "../../../components/Toast/Toster";
import { Typography } from "@mui/material";
import WhiteButton from "../../../components/Button/WhiteButton";
import BlueButton from "../../../components/Button/BlueButton";

const AddAchAccount = ({
  setIsOpen,
  isOpen,
  isBilling,
  vaultId,
  fetchData,
  CustomerId,
}) => {
  const { companyName } = useParams();
  const planFormik = useFormik({
    initialValues: {
      Number: "",
      Email: "",
      checkname: "",
      checkaba: "",
      checkaccount: "",
      account_holder_type: "",
      account_type: "",
      Address: "",
      City: "",
      State: "",
      Country: "",
      Zip: "",
    },

    validationSchema: Yup.object().shape({
      checkname: Yup.string().required("Account holder is required"),
      checkaba: Yup.string().required("Routing number is required"),
      checkaccount: Yup.string().required("Account number is required"),
      account_holder_type: Yup.string().required(
        "Account holder type is required"
      ),
      account_type: Yup.string().required("Account type is required"),
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
          checkname: values.checkname,
          checkaba: values.checkaba,
          checkaccount: values.checkaccount,
          account_holder_type: values.account_holder_type,
          account_type: values.account_type,
          address1: values.Address,
          city: values.City,
          state: values.State,
          zip: values.Zip,
          country: values.Country,
          phone: values.Number,
          email: values.Email,
          company: companyName,
          CompanyId: localStorage.getItem("CompanyId"),
          customer_vault_id: vaultId,
          type: "ach",
          CustomerId,
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
    } else {
      planFormik.setFieldValue(name, type === "checkbox" ? checked : value);
    }
  };

  const handleZipChange = (event) => {
    const { name, value } = event.target;
    const regex = /^[A-Za-z0-9]*$/;

    if (regex.test(value) || value === "") {
      planFormik.setFieldValue(name, value);
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
      <DialogTitle>Account Information</DialogTitle>
      <DialogContent>
        <AchInfo formik={planFormik} handleChange={handleChange} />
        <Address
          formik={planFormik}
          setSelectedCountry={setSelectedCountry}
          selectedCountry={selectedCountry}
          countries={countries}
          handleChange={handleChange}
          handleZipChange={handleZipChange}     
        />
      </DialogContent>
      <DialogActions>
        <Grid className="d-flex align-items-center justify-content-end gap-2 flex-bottom BlueAndWhiteBtmFlex accountInformationBtn">
          <WhiteButton
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
            onClick={() => {
              planFormik.handleSubmit();
            }}
            label={
              <>
                <Typography className="full-sentence">Add Account</Typography>
              </>
            }
          />
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default AddAchAccount;
