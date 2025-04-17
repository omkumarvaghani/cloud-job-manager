import React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import "./style.css";

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
    <Dropdown isOpen={isOpen} toggle={toggle} style={{ zIndex: 10 }}>
      <DropdownToggle
        className={`text-blue-color outline moreactionQuoteDetail ${toggleClassName}`}
        style={{
          background: "none",
          border: "1px solid",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "6px",
          fontWeight: 500,
          transition: "all 0.2s ease",
          boxShadow: isOpen ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
          ...buttonStyles,
        }}
      >
        <MoreHorizIcon style={{ fontSize: "20px" }} />
        <span style={{ marginLeft: "4px" }}>More Actions</span>
      </DropdownToggle>
      <DropdownMenu
        className={`border-blue-color ${menuClassName}`}
        style={{
          borderRadius: "8px",
          marginTop: "10px",
          border: "1px solid",
          padding: "6px 0",
          minWidth: "180px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
              style={{
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 400,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                display: "block",
                width: "100%",
                textAlign: "left",
                borderBottom:
                  index !== menuItems.length - 1
                    ? "1px solid rgba(0, 0, 0, 0.25)"
                    : "none",
              }}
            >
              {item?.icon && (
                <span
                  style={{
                    marginRight: "8px",
                    display: "inline-flex",
                    verticalAlign: "middle",
                  }}
                >
                  {item.icon}
                </span>
              )}
              {item?.label || ""}
            </DropdownItem>
          ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default AllDropdown;
