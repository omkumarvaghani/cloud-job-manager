import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import React from "react";

const DollerInput = React.forwardRef(
  (
    {
      name,
      label,
      value,
      placeholder,
      onChange,
      error,
      helperText,
      endAdornment,
      onBlur,
      isRight,
      id,
      handleInputChange,
      handleChange,
      ...props
    },
    ref
  ) => {
    return (
      <FormControl
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#063164",
              borderRadius: "4px",
            },
            "&:hover fieldset": {
              borderColor: "#063164",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#063164",
            },
          },
          "& .MuiInputBase-input": {
            textAlign: isRight && "right",
          },
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            height: "100%",
            textAlign: "center",
            padding: "0 14px",
            boxSizing: "border-box",
          },
          "& .MuiInputLabel-root": {
            color: "#063164",
            fontSize: "15px",
          },
        }}
        style={{ marginLeft: "0", marginBottom: "13px" }}
      >
        <InputLabel htmlFor={name} error={error}>
          {label}
        </InputLabel>
        <OutlinedInput
          id={id}
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          name={name}
          label={label}
          handleInputChange={handleInputChange}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            const newValue = e.target.value.replace(/[^0-9]/g, "");
            onChange(e, newValue);
          }}
          onBlur={onBlur}
          error={error}
          endAdornment={endAdornment}
          helperText={helperText}
          handleChange={handleChange}
          inputProps={{
            pattern: "^[0-9]*$",
          }}
          {...props}
        />
      </FormControl>
    );
  }
);

export default DollerInput;
