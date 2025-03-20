import React from "react";
import { Button } from "reactstrap";
import "./style.css"


const BlueButton = ({className = "", label, ...props }) => {
  return (
    <Button {...props} className={`text-capitalize bg-blue-color text-white-color backgroundBlurBtn ${className}`}>
      {label}
    </Button>
  );
};

export default BlueButton;





