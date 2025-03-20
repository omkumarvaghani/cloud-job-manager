import { Autocomplete } from "@mui/material";
import React from "react";
import InputText from "./InputText";

const InputDropdown = ({
  options,
  value,
  onChange,
  label,
  name,
  placeholder,
  onTextFieldChange,
  onBlur,
  error,
  helperText,
  type,
  textFieldProps,
  inputValue,
  getOptionLabel,
  filterOptions,
}) => {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel}
      value={value || null}
      autoSelect={true}
      onChange={onChange}
      renderInput={(params) => (
        <InputText     
          value={inputValue}
          onChange={onTextFieldChange}
          onBlur={onBlur}
          error={error}
          helperText={helperText}
          name={name}
          placeholder={placeholder}
          label={label}
          type={type}
          className="text-blue-color w-100 m-0 mb-3"
          style={{
            border: "none",
          }}
          fieldHeight="56px"
          {...params}
          {...textFieldProps}
        />
      )}
      filterOptions={filterOptions}
      noOptionsText="No matching item"
    />
  );
};

export default InputDropdown;
