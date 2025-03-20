import React from "react";
import { TextField, FormControl } from "@mui/material";
import InputText from "../InputFields/InputText";
import "./style.css";
import { Grid } from "@mui/material";


function AchInfo({ formik, handleChange, disabled }) {
  return (
    <Grid className="mt-2">
      <Grid className="mb-3">
        <InputText
          value={formik?.values?.checkaba}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          error={formik?.touched?.checkaba && Boolean(formik?.errors?.checkaba)}
          helperText={formik?.touched?.checkaba && formik?.errors?.checkaba}
          name="checkaba"
          label="Routing number "
          type="text"
          disable={disabled}
          className="text-blue-color w-100 accountInformationInputTop"
          fieldHeight="56px"
        />
      </Grid>
      <Grid className="mb-3">
        <InputText
          value={formik?.values?.checkaccount}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          error={
            formik?.touched?.checkaccount && Boolean(formik?.errors?.checkaccount)
          }
          helperText={formik?.touched?.checkaccount && formik?.errors?.checkaccount}
          name="checkaccount"
          label="Account number"
          type="text"
          disable={disabled}
          className="text-blue-color w-100 accountInformationInputTop accountInformationTopMargin"
          fieldHeight="56px"
        />
      </Grid>
      <Grid className="mb-3">
        <InputText
          value={formik?.values?.checkname}
          onChange={formik?.handleChange}
          onBlur={formik?.handleBlur}
          error={formik?.touched?.checkname && Boolean(formik?.errors?.checkname)}
          helperText={formik?.touched?.checkname && formik?.errors?.checkname}
          name="checkname"
          label="Account holder name"
          type="text"
          disable={disabled}
          className="text-blue-color w-100 accountInformationInputTop accountInformationTopMargin"
          fieldHeight="56px"
        />
      </Grid>
      <Grid className="d-flex gap-2 mb-3 selectTypeBoxInputAcc">
        <FormControl style={{ marginBottom: "16px" }} className="w-100">
          <InputText
            select
            name="account_holder_type"
            label={formik?.values?.account_holder_type && "Account holder type"}
            className="text-blue-color border-blue-color accountInformationInputTop accountInformationTopMargin"
            disabled={disabled}
            value={formik?.values?.account_holder_type}
            onChange={handleChange}
            SelectProps={{
              native: true,
            }}
            InputLabelProps={{
              style: { fontSize: "15px" },
            }}
            fieldHeight="56px"
            error={
              formik.touched?.account_holder_type &&
              Boolean(formik?.errors.account_holder_type)
            }
            helperText={
              formik?.touched.account_holder_type &&
              formik?.errors.account_holder_type
            }
          >
            <option value="">Select type</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </InputText>
        </FormControl>
        <FormControl style={{ marginBottom: "16px" }} className="w-100 ">
          <TextField
            select
            label={formik?.values?.account_type && "Account type"}
            name="account_type"
            className="text-blue-color border-blue-color selectTypeUnderDropdownSe"
            disabled={disabled}
            value={formik.values.account_type}
            onChange={(e) => {
              handleChange(e);
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
                "&:hover fieldset": {
                },
                "&.Mui-focused fieldset": {
                },
              },
            }}
            error={
              formik?.touched?.account_type && Boolean(formik?.errors?.account_type)
            }
            helperText={
              formik?.touched?.account_type && formik?.errors?.account_type
            }
          >
            <option value="">Select type</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </TextField>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default AchInfo;
