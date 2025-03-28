import { FormControl } from "@mui/material";
import React from "react";
import InputText from "../InputFields/InputText";
import InputDropdown from "../InputFields/InputDropdown";
import { Col, Row } from "reactstrap";
import "./style.css";
import { Grid } from "@mui/material";

const Address = ({
  setSelectedCountry,
  selectedCountry,
  countries,
  handleChange,
  formik,
  handleZipChange,
}) => {
  console.log(formik,"formik")
  return (
    <Grid className="d-flex flex-column gap-3 ">
      <InputText
        value={formik?.values?.Address || formik?.values?.Addresses?.Address}
        onChange={handleChange}
        onBlur={formik?.handleBlur}
        error={formik?.touched?.Address && Boolean(formik?.errors?.Address)}
        helperText={formik?.touched?.Address && formik?.errors?.Address}
        type="text"
        name="Address"
        label="Enter Address here..."
        multiline
        rows={2}
        className="text-blue-color w-100 border-blue-color userInfoAddress"
      />
      <Row className="m-0 p-0">
        <Col lg={6} md={12} className="m-0 p-0">
          <InputText
            value={formik?.values?.City}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s]*$/.test(value)) {
                handleChange(e);
              }
            }}
            onBlur={formik?.handleBlur}
            error={formik?.touched?.City && Boolean(formik?.errors?.City)}
            helperText={formik?.touched?.City && formik?.errors?.City}
            name="City"
            label="City"
            type="text"
            className="text-blue-color w-100"
            fieldHeight="56px"
          />
        </Col>
        <Col lg={6} md={12} className="m-0 p-0 mt-3 mt-lg-0 ps-lg-2">
          <InputText
            value={formik?.values?.State}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s]*$/.test(value)) {
                handleChange(e);
              } 
            }}
            onBlur={formik?.handleBlur}
            error={formik?.touched?.State && Boolean(formik?.errors?.State)}
            helperText={formik?.touched?.State && formik?.errors?.State}
            name="State"
            label="State"
            type="text"
            className="text-blue-color w-100"
            fieldHeight="56px"
          />
        </Col>
      </Row>

      <Row className="m-0 p-0">
        <Col lg={6} md={12} className="m-0 p-0">
          <InputText
            value={formik.values.Zip}
            // onChange={handleChange}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z0-9-]*$/.test(value)) {
                handleChange(e);
              }
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.Zip && Boolean(formik.errors.Zip)}
            helperText={formik.touched.Zip && formik.errors.Zip}
            name="Zip"
            label="Zip"
            type="text"
            className="text-blue-color w-100 m-0"
            fieldHeight="56px"
            // pattern="/^[A-Za-z0-9]*$/"
          />
        </Col>
        <Col lg={6} md={12} className="m-0 p-0 mt-3 mt-lg-0 ps-lg-2">
          <FormControl fullWidth>
            <InputDropdown
              onChange={(_, newValue) => {
                setSelectedCountry(newValue);
                handleChange({
                  target: {
                    name: "Country",
                    value: newValue ? newValue?.name : "",
                  },
                });
              }}
              textFieldProps={formik?.getFieldProps("Country")}
              options={[
                { name: "United States" },
                ...countries.filter(
                  (country) => country.name !== "United States"
                ),
              ]}
              value={selectedCountry || null}
              inputValue={formik?.values?.Country}
              onTextFieldChange={formik?.handleChange}
              onBlur={formik?.handleBlur}
              getOptionLabel={(option) => option?.name || "Name not available"}
              error={
                formik?.touched?.Country && Boolean(formik?.errors?.Country)
              }
              helperText={formik?.touched?.Country && formik?.errors?.Country}
              z={(options, state) =>
                options?.filter((option) =>
                  option?.name
                    ?.toLowerCase()
                    .includes(state?.inputValue.toLowerCase())
                )
              }
              name="Country"
              label="Country"
              type="text"
            />
          </FormControl>
        </Col>
      </Row>
    </Grid>
  );
};

export default Address;
