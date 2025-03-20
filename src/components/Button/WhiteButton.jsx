import React from "react";
import { Button } from "reactstrap";
import "./style.css";

const WhiteButton = ({ className = "", label, ...props }) => {
  return (
    <Button
      {...props}
      className={`footer-buttons outline-button-blue-color text-blue-color backgroundWhiteBtn ${className}`} // Merge custom className
    >
      {label}
    </Button>
  );
};

export default WhiteButton;
