import { TextField } from "@mui/material";
import React from "react";

const InputText = React.forwardRef(
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
      fieldHeight,
      select,
      children,
      defaultValue,
      disable,
      autoComplete = "off",
      isRight,
      ...props
    },
    ref
  ) => {
    return (
      // <TextField
      //   id={name}
      //   name={name}
      //   value={value}
      //   label={label}
      //   placeholder={placeholder}
      //   inputRef={ref}
      //   onChange={onChange}
      //   select={select}
      //   defaultValue={defaultValue}
      //   sx={{
      //     "& .MuiOutlinedInput-root": {
      //       "& fieldset": {
      //         borderColor: "#063164",
      //         borderRadius: "4px",
      //       },
      //       "&:hover fieldset": {
      //         borderColor: "#063164",
      //       },
      //       "&.Mui-focused fieldset": {
      //         borderColor: "#063164",
      //       },
      //     },
      //     "& .MuiInputBase-input": {
      //       textAlign: isRight && "right", // Align text to the right
      //     },
      //     "& .MuiSelect-select": {
      //       display: "flex",
      //       alignItems: "center",
      //       height: "100%",
      //       textAlign: "center",
      //       padding: "0 14px",
      //       boxSizing: "border-box",
      //     },
      //     "& .MuiInputLabel-root": {
      //       color: "#063164",
      //       fontSize: "15px",
      //     },
      //   }}
      //   InputProps={{
      //     readOnly: false,
      //     endAdornment,
      //     inputProps: {
      //       autoComplete: "new-password",
      //     },
      //   }}
      //   InputLabelProps={{
      //     style: { color: "#063164", fontSize: "15px" },
      //   }}
      //   error={error}
      //   autoComplete="off"
      //   helperText={helperText}
      //   {...props}
      //   disabled={disable}
      // >
      //   {children}
      // </TextField>
      <TextField
        id={name}
        name={name}
        value={value}
        label={label}
        placeholder={placeholder}
        inputRef={ref}
        onChange={(e) => {
          let inputValue = e.target.value;
          if (inputValue.length === 1 && inputValue.startsWith(" ")) {
            inputValue = "";
          }
          if (onChange) {
            onChange({ target: { name, value: inputValue } });
          }
        }}
        select={select}
        defaultValue={defaultValue}
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
        InputProps={{
          readOnly: false,
          endAdornment,
          inputProps: {
            autoComplete: "new-password",
          },
        }}
        InputLabelProps={{
          style: { color: "#063164", fontSize: "15px" },
        }}
        error={error}
        autoComplete="off"
        helperText={helperText}
        {...props}
        disabled={disable}
      >
        {children}
      </TextField>
    );
  }
);

export default InputText;
