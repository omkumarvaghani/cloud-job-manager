import React, { useEffect, useState } from "react";
import { TextField, FormControl } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import CVV from "../../assets/svg/CVV.svg";
import CardImage from "../../assets/image/icons/CreditCard.png";
import creditCardType from "credit-card-type";
import axios from "axios";
import InputText from "../InputFields/InputText";
import "./style.css";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import * as Yup from "yup";

function PaymentInfo({
  formik,
  handleChange,
  expireMonth,
  expireYear,
  handleYearChange,
  disabled,
}) {
  const [cardImage, setCardImage] = useState(CardImage);
  useEffect(() => {
    const getCardImage = async () => {
      try {
        const sanitizedValue = formik.values.CardNumber.replace(/\D/g, "");
        const cardType = creditCardType(sanitizedValue)[0];

        if (cardType && cardType.type) {
          const sanitizedCardType = cardType.type
            .replace(/[-\s]/g, "")
            .toLowerCase();

          const response = await axios.get(
            `https://logo.clearbit.com/${sanitizedCardType}.com`
          );

          if (response.status === 200) {
            setCardImage(response.config.url);
          } else {
            setCardImage(CardImage);
          }
        } else {
          setCardImage(CardImage);
        }
      } catch (error) {}
    };
    if (formik.values.CardNumber) {
      getCardImage();
    } else {
      setCardImage(CardImage);
    }
  }, [formik.values.CardNumber]);

  const handleCardNumberChange = (e, formik) => {
    let value = e.target.value;

    value = value.replace(/\D/g, "");

    if (value.length > 16) {
      value = value.slice(0, 19);
    }

    let formattedValue = "";
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += " ";
      }
      formattedValue += value[i];
    }

    formik.setFieldValue("CardNumber", formattedValue);
  };

  return (
    <Grid>
      <Grid className="d-flex gap-2 mt-2 first-section-payment">
        <FormControl style={{ marginBottom: "16px" }} className="w-50 form">
          <InputText
            value={formik?.values?.FirstName}
            onChange={formik?.handleChange}
            onBlur={formik?.handleBlur}
            error={
              formik?.touched?.FirstName && Boolean(formik?.errors?.FirstName)
            }
            helperText={formik?.touched?.FirstName && formik?.errors?.FirstName}
            name="FirstName"
            label="First Name"
            type="text"
            className="text-blue-color w-100"
            fieldHeight="56px"
            disable={disabled}
          />
        </FormControl>
        <FormControl style={{ marginBottom: "16px" }} className="w-50 form">
          <InputText
            value={formik?.values?.LastName}
            onChange={formik?.handleChange}
            onBlur={formik?.handleBlur}
            error={
              formik?.touched?.LastName && Boolean(formik?.errors?.LastName)
            }
            helperText={formik?.touched?.LastName && formik?.errors?.LastName}
            name="LastName"
            label="Last Name"
            type="text"
            className="text-blue-color w-100"
            fieldHeight="56px"
            disable={disabled}
          />
        </FormControl>
      </Grid>
      <Grid className="mb-4">
        <InputText
          value={formik?.values?.CardNumber}
          onChange={(e) => handleCardNumberChange(e, formik)}
          onBlur={formik?.handleBlur}
          error={
            formik?.touched?.CardNumber && Boolean(formik?.errors?.CardNumber)
          }
          helperText={formik?.touched?.CardNumber && formik?.errors?.CardNumber}
          name="CardNumber"
          label="Card Number"
          type="text"
          disabled={disabled}
          className="text-blue-color w-100"
          fieldHeight="56px"
          endAdornment={
            <InputAdornment position="end" className="p-0 m-0">
              <img
                src={cardImage}
                alt="CVV"
                style={{
                  padding: 0,
                  margin: 0,
                  width: "36px",
                  height: "30px",
                }}
              />
            </InputAdornment>
          }
        />
      </Grid>
      <Grid className="d-flex gap-2 cvv">
        <Grid className="d-flex gap-2 w-50 date">
          <FormControl
            style={{ marginBottom: "16px" }}
            className="w-100 paymentt"
          >
            <TextField
              select
              id="MM"
              name="ExpireMonth"
              label={formik?.values?.ExpireMonth && "Month"}
              placeholder="MM"
              className="text-blue-color border-blue-color"
              disabled={disabled}
              value={formik?.values?.ExpireMonth}
              onChange={handleChange}
              SelectProps={{
                native: true,
              }}
              InputLabelProps={{
                style: { fontSize: "15px" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderRadius: "6px",
                    padding: "13px 12px",
                    height: "56px",
                  },
                  "&:hover fieldset": {},
                  "&.Mui-focused fieldset": {},
                },
              }}
              error={
                formik?.touched?.ExpireMonth &&
                Boolean(formik?.errors?.ExpireMonth)
              }
              helperText={
                formik?.touched?.ExpireMonth && formik?.errors?.ExpireMonth
              }
            >
              <option value="">Month</option>
              {expireMonth.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </TextField>
          </FormControl>

          <FormControl
            style={{ marginBottom: "16px" }}
            className="w-100 paymentt paymentInformationDateSelect"
          >
            <TextField
              select
              id="YY"
              label={formik?.values?.ExpireYear && "Year"}
              name="ExpireYear"
              placeholder="YY"
              className="text-blue-color border-blue-color"
              disabled={disabled}
              value={formik?.values?.ExpireYear}
              onChange={(e) => {
                handleChange(e);
                handleYearChange(e);
              }}
              SelectProps={{
                native: true,
              }}
              InputLabelProps={{
                style: { fontSize: "15px" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderRadius: "6px",
                    padding: "13px 12px",
                    height: "56px",
                    width: "100%",
                  },
                  "&:hover fieldset": {},
                  "&.Mui-focused fieldset": {},
                },
              }}
              error={
                formik?.touched?.ExpireYear &&
                Boolean(formik?.errors?.ExpireYear)
              }
              helperText={
                formik?.touched?.ExpireYear && formik?.errors?.ExpireYear
              }
            >
              <option value="">Year</option>
              {expireYear.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </TextField>
          </FormControl>
        </Grid>
        <FormControl style={{ marginBottom: "16px" }} className="w-50 abcd">
          <InputText
            value={formik?.values?.CVVNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");

              if (value.length <= 4) {
                formik.setFieldValue("CVVNumber", value);
              }
            }}
            onBlur={formik?.handleBlur}
            error={
              formik?.touched?.CVVNumber && Boolean(formik?.errors?.CVVNumber)
            }
            helperText={formik?.touched?.CVVNumber && formik?.errors?.CVVNumber}
            name="CVVNumber"
            label="CVV"
            type="text"
            className="text-blue-color w-100"
            fieldHeight="56px"
            inputProps={{
              maxLength: 4,
            }}
            endAdornment={
              <InputAdornment position="end" className="p-0 m-0">
                <img
                  src={CVV}
                  alt="CVV"
                  style={{
                    padding: 0,
                    margin: 0,
                    width: "auto",
                  }}
                />
              </InputAdornment>
            }
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default PaymentInfo;
