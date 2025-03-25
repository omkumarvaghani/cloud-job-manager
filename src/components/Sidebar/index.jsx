import React, { useEffect } from "react";
import { useState } from "react";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import "./style.css";
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined";
import logo from "../../assets/image/CMS_LOGO.svg";
import logo2 from "../../assets/image/CMS_LOGO2.svg";
import routes from "../../routes";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { styled } from "@mui/material";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  PopoverBody,
  UncontrolledPopover,
} from "reactstrap";
import { Tooltip, useMediaQuery } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Client from "../../assets/Blue-sidebar-icon/Customer.svg";
import Client2 from "../../assets/orange-icon/Customer.svg";
import Quote from "../../assets/Blue-sidebar-icon/Quote.svg";
import Quote2 from "../../assets/orange-icon/Quote.svg";
import Contract from "../../assets/Blue-sidebar-icon/Contract.svg";
import Contract2 from "../../assets/orange-icon/Contract.svg";
import Invoice from "../../assets/Blue-sidebar-icon/Invoice.svg";
import Invoiceorange from "../../assets/orange-icon/Invoice.svg";
import AxiosInstance from "../../Views/AxiosInstance";
import CreateWhite from "../../assets/White-sidebar-icon/Create.svg";
import { Grid } from "@mui/material";
import { Typography } from "@mui/material";
import WhiteButton from "../Button/WhiteButton";
import { handleAuth } from "../Login/Auth";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: "#E88C44",
    color: "#fff",
    fontSize: "16px",
    borderRadius: "4px",
    border: "2px solid #E88C44",
  },
  [`& .MuiTooltip-arrow`]: {
    color: "#E88C44",
  },
}));

const MyPopoverComponent = ({
  popoverOpen,
  togglePopover,
  handleNavigation,
  CompanyName = "",
  staffData = {},
}) => {
  const location = useLocation();

  return (
    <UncontrolledPopover
      placement="right"
      target="PopoverLegacy"
      trigger="legacy"
      isOpen={popoverOpen}
      toggle={togglePopover}
    >
      <PopoverBody className="d-flex">
        {(!location.pathname.includes("/staff-member") ||
          staffData?.ClientsProperties?.ViewAndEditFullClientAndPropertyInfo ||
          staffData?.ClientsProperties
            ?.ViewEditAndDeleteFullClientAndPropertyInfo) && (
          <Grid
            className="d-flex"
            style={{
              flexDirection: "column",
              borderRight: "2px solid #E88C44",
              paddingRight: "10px",
              cursor: "pointer",
            }}
            onClick={() =>
              handleNavigation(
                CompanyName
                  ? `/${CompanyName}/add-customer`
                  : "/staff-member/add-customer",
                {
                  state: {
                    navigats: [
                      "/index",
                      CompanyName ? "/add-customer" : "/add-customer",
                    ],
                  },
                }
              )
            }
          >
            <img src={Client2} style={{ height: "20px" }} />
            <Typography className="my-1 text-orange-color">Customer</Typography>
          </Grid>
        )}

        {(!location.pathname.includes("/staff-member") ||
          staffData?.Quotes?.ViewCreateAndEdit ||
          staffData?.Quotes?.ViewCreateEditAndDelete) && (
          <Grid
            className="d-flex mx-2"
            style={{
              flexDirection: "column",
              borderRight: "2px solid #E88C44",
              cursor: "pointer",
              paddingRight: "10px",
            }}
            onClick={() =>
              handleNavigation(
                CompanyName
                  ? `/${CompanyName}/add-quotes`
                  : "/staff-member/add-quotes",
                {
                  state: {
                    navigats: [
                      "/index",
                      CompanyName ? "/add-quotes" : "/add-quotes",
                    ],
                  },
                }
              )
            }
          >
            <img src={Quote2} style={{ height: "20px" }} />
            <Typography className="my-1 text-orange-color">Quote</Typography>
          </Grid>
        )}

        {((!location.pathname.includes("/staff-member") && CompanyName) ||
          staffData?.Jobs?.JViewCreateAndEdit ||
          staffData?.Jobs?.JViewCreateEditAndDelete) && (
          <Grid
            className="d-flex"
            style={{
              flexDirection: "column",
              borderRight: "2px solid #E88C44",
              paddingRight: "10px",
              cursor: "pointer",
            }}
            onClick={() =>
              handleNavigation(
                CompanyName
                  ? `/${CompanyName}/add-contract`
                  : "/staff-member/add-contract",
                {
                  state: {
                    navigats: [
                      "/index",
                      CompanyName ? "/add-contract" : "/add-contract",
                    ],
                  },
                }
              )
            }
          >
            <img src={Contract2} style={{ height: "20px" }} />
            <Typography className="my-1 text-orange-color">Contract</Typography>
          </Grid>
        )}

        {(!location.pathname.includes("/staff-member") ||
          staffData?.Invoice?.ViewAndEditFullClientAndPropertyInfo ||
          staffData?.Invoice?.ViewEditAndDeleteFullClientAndPropertyInfo) && (
          <Grid
            className="d-flex mx-2"
            style={{
              flexDirection: "column",
              cursor: "pointer",
            }}
            onClick={() =>
              handleNavigation(
                CompanyName
                  ? `/${CompanyName}/invoice`
                  : "/staff-member/invoice",
                {
                  state: {
                    navigats: [
                      "/index",
                      CompanyName ? "/add-customer" : "/invoice",
                    ],
                  },
                }
              )
            }
          >
            <img src={Invoiceorange} style={{ height: "20px" }} />
            <Typography className="my-1 text-orange-color">Invoice</Typography>
          </Grid>
        )}
      </PopoverBody>
    </UncontrolledPopover>
  );
};

const Sidebar = ({
  layout,
  isSidebarClosed,
  setIsSidebarClosed,
  isSidebarDisplay,
  setIsSidebarDisplay,
  routesData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const isMediumScreen = useMediaQuery("(max-width:767px)");
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [hoveredItemName, setHoveredItemName] = useState("");
  const [themeData, setthemeData] = useState("");
  const [tokenDecode, setTokenDecode] = useState({});
  const fetchDatas = async () => {
    try {
      const res = await handleAuth(Navigate, location);
      setTokenDecode(res?.data);
      setthemeData(res?.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDatas();
  }, []);

  useEffect(() => {
    const updateColors = () => {
      if (themeData && themeData) {
        const Colors = themeData?.Colors;
        for (const key in Colors) {
          if (Object.prototype.hasOwnProperty.call(Colors, key)) {
            const element = Colors[key];
            document.documentElement.style.setProperty(key, element);
          }
        }
      }
    };
    updateColors();
  }, [themeData]);
  const handlePopoverOpen = (event, itemName) => {
    setAnchorEl(event.currentTarget);
    setPopoverOpen(true);
    setHoveredItemName(itemName);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverOpen(false);
    setHoveredItemName("");
  };

  const toggleSidebar = () => {
    setIsSidebarClosed(!isSidebarClosed);
  };
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const dropToggle = () => setDropDownOpen(!dropDownOpen);

  const togglePopover = () => setPopoverOpen(!popoverOpen);
  const closePopover = () => setPopoverOpen(false);

  const createLinks = (props) => {
    const matchPath = (path, layout, CompanyName) => {
      const basePath = CompanyName ? `/${CompanyName}` : layout;
      return `${location.pathname}` === `${basePath}${path}`;
    };

    const findMatchingRoute = (routes, layout, CompanyName) => {
      for (const route of routes) {
        if (!route.isCollapse && matchPath(route.path, layout, CompanyName)) {
          return route;
        }
        if (route.children) {
          const matchingChild = route.children.find((child) =>
            matchPath(child.path, child.layout, CompanyName)
          );
          if (matchingChild) {
            return matchingChild;
          }
        }
      }
      return null;
    };

    const currentProp = findMatchingRoute(routes, layout, CompanyName);

    return props?.map((prop, index) => {
      return (
        <Grid key={index}>
          {prop.layout === layout && prop.isCollapse && prop.isDisplay ? (
            !isSidebarClosed ? (
              <Grid className="d-flex align-items-center">
                <Typography
                  style={{
                    width: "auto",
                    paddingLeft: "0",
                    marginLeft: "0",
                    marginLeft:
                      !isSidebarClosed && currentProp?.module === prop?.module
                        ? "7px"
                        : "30px",
                  }}
                >
                  <ArrowRightOutlinedIcon
                    style={{
                      fontSize: "30px",
                      color:
                        `${location.pathname}` ===
                        `${
                          CompanyName
                            ? `/${CompanyName}` + prop.path
                            : prop.layout + prop.path
                        }`
                          ? "#063164"
                          : "#fff",
                      marginTop: "17px",
                      display:
                        !isSidebarClosed && currentProp?.module === prop?.module
                          ? "block"
                          : "none",
                    }}
                  />
                </Typography>
                <Dropdown
                  className="sideBarEmailLeft"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    boxShadow: "none",
                    justifyContent: "start",
                    marginLeft: "5px",
                  }}
                  isOpen={dropDownOpen}
                  toggle={dropToggle}
                >
                  <DropdownToggle
                    caret
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      boxShadow: "none",
                      width: "198px",
                      textAlign: "left",
                      paddingLeft: "0",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      background:
                        !isSidebarClosed && currentProp?.module === prop?.module
                          ? "#fff"
                          : "transparent",
                      color:
                        !isSidebarClosed && currentProp?.module === prop?.module
                          ? "#063164"
                          : "#fff",
                      borderTopLeftRadius: "24px",
                      borderBottomLeftRadius: "24px",
                      borderTopRightRadius: "0",
                      borderBottomRightRadius: "0",
                      padding: "12px",
                    }}
                  >
                    {!isSidebarClosed && currentProp?.module === prop?.module
                      ? prop.icon2
                      : prop.icon}
                    <Typography
                      className="text nav-text"
                      style={{
                        paddingLeft: "20px",
                        color: "#fff",
                        color:
                          !isSidebarClosed &&
                          currentProp?.module === prop?.module
                            ? "#063164"
                            : "#fff",
                      }}
                    >
                      {prop?.name}
                    </Typography>
                  </DropdownToggle>

                  <DropdownMenu
                    style={{
                      padding: "0 0 0 5px",
                      margin: "0",
                      float: "right",
                    }}
                  >
                    {prop.children &&
                      prop.children?.map((item, index) => (
                        <DropdownItem
                          key={index}
                          style={{
                            padding: "0",
                            margin: "0",
                            width: "100%",
                            paddingRight: "25px",
                            paddingLeft: "0",
                            marginLeft: "0",
                          }}
                          onClick={(e) => {
                            if (isMediumScreen) {
                              setIsSidebarDisplay(!isSidebarDisplay);
                            }
                            e.stopPropagation();
                            navigate(
                              CompanyName
                                ? `/${CompanyName}` + item.path
                                : prop.layout + item.path,
                              {
                                state: {
                                  navigats: item?.path?.includes("/index")
                                    ? [prop?.path, item?.path]
                                    : ["/index", prop?.path, item?.path],
                                },
                              }
                            );
                          }}
                        >
                          <li
                            style={{
                              padding: "0",
                              margin: "0",
                              width: "100%",
                              paddingLeft: "0",
                              marginLeft: "0",
                            }}
                          >
                            <Typography
                              style={{
                                width: "auto",
                                paddingLeft: "0",
                                marginLeft: "0",
                              }}
                            >
                              <ArrowRightOutlinedIcon
                                style={{
                                  fontSize: "30px",
                                  color:
                                    `${location.pathname}` ===
                                    `${
                                      CompanyName
                                        ? `/${CompanyName}` + item.path
                                        : prop.layout + item.path
                                    }`
                                      ? "#063164"
                                      : "#fff",
                                }}
                              />
                            </Typography>
                            <Typography
                              style={{
                                width: "10%",
                                color:
                                  `${location.pathname}` ===
                                  `${
                                    CompanyName
                                      ? `/${CompanyName}` + item.path
                                      : prop.layout + item.path
                                  }`
                                    ? "#063164"
                                    : "#063164",
                              }}
                            >
                              {item.icon2}
                            </Typography>
                            <Typography
                              className="text nav-text"
                              style={{
                                paddingLeft: "15px",
                                color:
                                  `${location.pathname}` ===
                                  `${
                                    CompanyName
                                      ? `/${CompanyName}` + item.path
                                      : prop.layout + item.path
                                  }`
                                    ? "#063164"
                                    : "#063164",
                              }}
                            >
                              {item?.name}
                            </Typography>
                          </li>
                        </DropdownItem>
                      ))}
                  </DropdownMenu>
                </Dropdown>
              </Grid>
            ) : (
              <>
                {prop.layout === layout &&
                  prop.children?.map((item) => (
                    <CustomTooltip
                      title={isSidebarClosed ? item?.name : ""}
                      arrow
                      placement="right"
                    >
                      <li
                        onClick={() => {
                          if (isMediumScreen) {
                            setIsSidebarDisplay(!isSidebarDisplay);
                          }
                          navigate(
                            CompanyName
                              ? `/${CompanyName}` + item.path
                              : prop.layout + item.path,
                            {
                              state: {
                                navigats: item?.path?.includes("/index")
                                  ? [item.path]
                                  : ["/index", item.path],
                              },
                            }
                          );
                        }}
                        className="mb-3"
                        style={{
                          color: "#fff",
                          fontWeight: "400",
                          width: "100%",
                        }}
                      >
                        <Typography
                          style={{
                            background:
                              isSidebarClosed &&
                              currentProp?.name === item?.name
                                ? "#fff"
                                : "transparent",
                            marginLeft:
                              !isSidebarClosed &&
                              currentProp?.name === item?.name
                                ? "100px"
                                : "19px",
                            width: "50px",
                            height: " 100%",
                            padding: "15px",
                            borderRadius: "12px",
                            justifyContent: "center",
                            display: "flex",
                          }}
                          className="side-icon-small"
                        >
                          {isSidebarClosed && currentProp?.name === item?.name
                            ? item.icon2
                            : item.icon}
                        </Typography>
                      </li>
                    </CustomTooltip>
                  ))}
              </>
            )
          ) : (
            prop.layout === layout &&
            prop.isDisplay && (
              <Grid style={{ display: "flex", alignItems: "center" }}>
                {!isSidebarClosed && (
                  <Typography
                    style={{ width: "auto" }}
                    className="Right-arrowww"
                  >
                    <ArrowRightOutlinedIcon
                      style={{
                        fontSize: "35px",
                        color:
                          currentProp?.module === prop?.module
                            ? "#fff"
                            : "transparent",
                      }}
                    />
                  </Typography>
                )}
                <CustomTooltip
                  title={isSidebarClosed ? prop?.name : ""}
                  arrow
                  placement="right"
                >
                  <li
                    onClick={(e) => {
                      if (isMediumScreen) {
                        setIsSidebarDisplay(!isSidebarDisplay);
                      }
                      e.stopPropagation();
                      navigate(
                        CompanyName
                          ? `/${CompanyName}` + prop.path
                          : prop.layout + prop.path,
                        {
                          state: {
                            navigats: prop.path.includes("/index")
                              ? [prop.path]
                              : ["/index", prop.path],
                          },
                        }
                      );
                    }}
                    className="mb-3"
                    style={{
                      color: "#fff",
                      fontWeight: "400",
                      width: "100%",
                      background:
                        !isSidebarClosed && currentProp?.module === prop?.module
                          ? "#fff"
                          : "transparent",
                      borderTopLeftRadius: "24px",
                      borderBottomLeftRadius: "24px",
                      paddingLeft: !isSidebarClosed && "10px",
                    }}
                  >
                    <Typography
                      className="d-flex justify-content-center mx-auto align-items-center"
                      style={{
                        width: isSidebarClosed ? "50px" : "20%",
                        height: "100%",
                        padding: isSidebarClosed && "12px",
                        background:
                          isSidebarClosed &&
                          currentProp?.module === prop?.module
                            ? "#fff"
                            : "transparent",
                        borderRadius: "12px",
                      }}
                    >
                      {currentProp?.module === prop?.module
                        ? prop.icon2
                        : prop.icon}
                    </Typography>
                    {!isSidebarClosed && (
                      <Typography
                        className="text nav-text d-flex justify-content-start align-items-center"
                        style={{
                          paddingLeft: "15px",
                          height: "100%",
                          maxWidth: "100%",
                          width: "100%",
                          color:
                            currentProp?.module === prop?.module
                              ? "#063164"
                              : "#fff",
                        }}
                      >
                        {prop?.name}
                      </Typography>
                    )}
                  </li>
                </CustomTooltip>
              </Grid>
            )
          )}
        </Grid>
      );
    });
  };

  const handleLogoClick = () => {
    navigate(
      `/${CompanyName ? CompanyName : location.pathname.split("/")[0]}/index`,
      {
        state: { navigats: ["/index"] },
      }
    );
  };

  const baseUrl = process.env.REACT_APP_BASE_API;
  const [staffData, setStaffData] = useState({});
  const [navbarOpen, setNavbarOpen] = useState(false);
  const closeNavbar = () => {
    setNavbarOpen(false);
  };
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await AxiosInstance.get(
          `${baseUrl}/worker/get/${localStorage.getItem("worker_id")}`
        );
        setStaffData(response?.data?.data?.permissions);
      } catch (error) {}
    };
    if (location.pathname.includes("/staff-member")) {
      fetchStaffData();
    }
  }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
  const handleNavigation = (path, state) => {
    navigate(path, state);
    if (!isMediumScreen) closePopover();
  };

  return (
    <>
      <nav
        className={`sidebar bg-blue-color sideBarScorrSetHere ${
          isSidebarClosed ? "close" : ""
        } 
         ${isSidebarDisplay ? "my-collapse" : ""}`}
      >
        <header>
          <i
            className=" toggle"
            style={{ cursor: "pointer", color: "#333" }}
            onClick={() => {
              if (isMediumScreen) {
                setIsSidebarDisplay(!isSidebarDisplay);
              } else {
                toggleSidebar();
              }
            }}
          >     
            {!isMediumScreen ? (
              <KeyboardArrowRightRoundedIcon />
            ) : (
              <CloseRoundedIcon />
            )}
          </i>
        </header>
        <Grid
          className="menu-bar"
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
          <Grid
            className="my-logo d-flex justify-content-ceter"
            style={{ marginLeft: isSidebarClosed ? "4px" : "12px" }}
            onClick={handleLogoClick}
          >
            {isSidebarClosed ? (
              <img
                src={logo2}
                alt="img"
                width={"80%"}
                style={{ cursor: "pointer" }}
                className="SidebarSmallloos"
              />
            ) : (
              <img
                src={logo}
                alt="img"
                width={"80%"}
                style={{ cursor: "pointer" }}
                className="SidebarBigLogos"
              />
            )}
          </Grid>
          {(CompanyName || location.pathname.includes("/staff-member")) &&
            (!location.pathname.includes("/staff-member") ||
              staffData?.ClientsProperties
                ?.ViewAndEditFullClientAndPropertyInfo ||
              staffData?.ClientsProperties
                ?.ViewEditAndDeleteFullClientAndPropertyInfo ||
              staffData?.Jobs?.JViewCreateAndEdit ||
              staffData?.Jobs?.JViewCreateEditAndDelete) && (
              <>
                {!isMediumScreen && (
                  <WhiteButton
                    id="PopoverLegacy"
                    type="button"
                    style={{
                      color: "white",
                      background: "transparent",
                      display: "flex",
                      marginLeft: "39px",
                      alignItems: "center",
                      fontWeight: "600",
                      marginTop: "30px",
                      border: "none",
                      marginBottom: "10px",
                    }}
                    className="create-button mb-3 text-white-color"
                    onClick={isMediumScreen ? toggleDropdown : togglePopover}
                    label={
                      <>
                        {isSidebarClosed ? (
                          <img
                            src={CreateWhite}
                            alt="img"
                            style={{
                              marginRight: "32px",
                              marginLeft: "-14px",
                              height: "18px",
                            }}
                            width={"80%"}
                          />
                        ) : (
                          <img
                            src={CreateWhite}
                            alt="img"
                            style={{ marginRight: "23px", marginLeft: "1px" }}
                          />
                        )}
                        {!isSidebarClosed && "Create"}
                      </>
                    }
                  />
                )}
                {isMediumScreen ? (
                  <Dropdown
                    isOpen={dropdownOpen}
                    toggle={toggleDropdown}
                    className="dropdownBottom"
                  >
                    <DropdownToggle
                      className=" drop-down-btn dropdownBotton"
                      caret
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        marginLeft: "38px",
                        marginBottom: "-16px",
                      }}
                    >
                      {isSidebarClosed ? (
                        <img
                          src={CreateWhite}
                          alt="img"
                          style={{
                            marginRight: "32px",
                            marginLeft: "-17px",
                            height: "18px",
                          }}
                          width={"80%"}
                          className="sidebarClosedSideIcon"
                        />
                      ) : (
                        <img
                          src={CreateWhite}
                          alt="img"
                          style={{ marginRight: "23px", marginLeft: "1px" }}
                        />
                      )}
                      {!isSidebarClosed && "Create"}
                    </DropdownToggle>
                    <DropdownMenu>
                      {(!location.pathname.includes("/staff-member") ||
                        staffData?.ClientsProperties
                          ?.ViewAndEditFullClientAndPropertyInfo ||
                        staffData?.ClientsProperties
                          ?.ViewEditAndDeleteFullClientAndPropertyInfo) && (
                        <DropdownItem
                          className="gap-2 d-flex"
                          onClick={() => {
                            if (isMediumScreen) {
                              setIsSidebarDisplay(!isSidebarDisplay);
                            }
                            handleNavigation(
                              CompanyName
                                ? `/${CompanyName}/customer`
                                : "/staff-member/add-customer",
                              {
                                state: {
                                  navigats: [
                                    "/index",
                                    CompanyName ? "/customer" : "/add-customer",
                                  ],
                                },
                              }
                            );
                          }}
                        >
                          <img src={Client} style={{ height: "20px" }} />
                          Customer
                        </DropdownItem>
                      )}
                      {(!location.pathname.includes("/staff-member") ||
                        staffData?.Quotes?.ViewCreateAndEdit ||
                        staffData?.Quotes?.ViewCreateEditAndDelete) && (
                        <DropdownItem
                          className="text-blue-color d-flex gap-2"
                          onClick={() => {
                            if (isMediumScreen) {
                              setIsSidebarDisplay(!isSidebarDisplay);
                            }
                            handleNavigation(
                              CompanyName
                                ? `/${CompanyName}/quotes`
                                : "/staff-member/add-quotes",
                              {
                                state: {
                                  navigats: [
                                    "/index",
                                    CompanyName ? "/quotes" : "/add-quotes",
                                  ],
                                },
                              }
                            );
                          }}
                        >
                          <img src={Quote} style={{ height: "20px" }} />
                          Quote
                        </DropdownItem>
                      )}
                      {((!location.pathname.includes("/staff-member") &&
                        CompanyName) ||
                        staffData?.Jobs?.JViewCreateAndEdit ||
                        staffData?.Jobs?.JViewCreateEditAndDelete) && (
                        <DropdownItem
                          className="d-flex gap-2 text-blue-color"
                          onClick={() => {
                            if (isMediumScreen) {
                              setIsSidebarDisplay(!isSidebarDisplay);
                            }
                            handleNavigation(`/${CompanyName}/contract`, {
                              state: {
                                navigats: ["/index", "/contract"],
                              },
                            });
                          }}
                        >
                          <img src={Contract} style={{ height: "20px" }} />
                          Contract
                        </DropdownItem>
                      )}
                      {((!location.pathname.includes("/staff-member") &&
                        CompanyName) ||
                        staffData?.Jobs?.JViewCreateAndEdit ||
                        staffData?.Jobs?.JViewCreateEditAndDelete) && (
                        <DropdownItem
                          className="d-flex gap-2 text-blue-color"
                          onClick={() => {
                            if (isMediumScreen) {
                              setIsSidebarDisplay(!isSidebarDisplay);
                            }
                            handleNavigation(`/${CompanyName}/invoice`, {
                              state: {
                                navigats: ["/index", "/invoice"],
                              },
                            });
                          }}
                        >
                          <img src={Invoice} style={{ height: "20px" }} />
                          Invoice
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                ) : (
                  <>
                    <MyPopoverComponent
                      popoverOpen={popoverOpen}
                      togglePopover={togglePopover}
                      handleNavigation={handleNavigation}
                      CompanyName={CompanyName}
                      staffData={staffData}
                    />
                  </>
                )}
              </>
            )}
          <Grid className="menu pt-2" style={{ cursor: "pointer" }}>
            {createLinks(routesData ? routesData : routes)}
          </Grid>
        </Grid>
      </nav>
    </>
  );
};

export default Sidebar;
