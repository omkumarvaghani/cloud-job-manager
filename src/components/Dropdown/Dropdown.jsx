import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import "./style.css"

const AllDropdown = ({
  isOpen,
  toggle,
  menuItems,
  buttonStyles = {},
  menuStyles = {},
  toggleClassName = "",
  menuClassName = "",
}) => {
  return (
    <Dropdown isOpen={isOpen} toggle={toggle} style={{ zIndex: 1 }}>
      <DropdownToggle
        className={`text-blue-color outline moreactionQuoteDetail ${toggleClassName}`}
        style={{
          background: "none",
          border: "1px solid",
          ...buttonStyles,
        }}
      >
        <MoreHorizIcon />
         More Actions
      </DropdownToggle>
      <DropdownMenu
        className={`border-blue-color ${menuClassName}`}
        style={{
          borderRadius: "7px",
          marginTop:"10px",
          border: "1px solid",
          ...menuStyles,
        }}
      >
        {menuItems &&
          menuItems?.length > 0 &&
          menuItems?.map((item, index) => (
            <DropdownItem
              key={index}
              className="text-blue-color"
              onClick={item?.onClick}
            >
              {item?.label || ""}
            </DropdownItem>
          ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default AllDropdown;
