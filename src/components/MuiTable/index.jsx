import {
  Collapse,
  Divider,
  FormGroup,
  IconButton,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import React, { useEffect, useRef, useState } from "react";
import AccountBilling from "../../assets/image/icons/Account & Billing.svg";
import Activity from "../../assets/image/icons/Activity.svg";
import ManageTeam from "../../assets/image/icons/Manage Team.svg";
import Logout from "../../assets/image/icons/Log out.svg";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  UncontrolledDropdown,
} from "reactstrap";
import SearchIcon from "@mui/icons-material/Search";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import "./style.css";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import routes from "../../routes";
import setting from "../../assets/image/icons/setting.svg";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { handleAuth } from "../Login/Auth";
import QuoteNotificationsPage from "../Notification/QuoteNotification";
import useCountNotifications from "../Notification/countNotifications";
import { Grid } from "@mui/material";
import Notifications from "../Notification/viewallnotification";
import AllDropdown from "../Dropdown/Dropdown";
import { borderColor } from "@mui/system";
import { NoDataFound } from "../Contract Component/Index";
import AxiosInstance from "../../Views/AxiosInstance";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#063164",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));

const ArrowSeparator = () => {
  return (
    <Typography style={{ margin: "0 1px", opacity: "30%" }}>
      <ArrowRightIcon />
    </Typography>
  );
};

// const JobberTable = ({
//   headerData,
//   cellData,
//   CollapseComponent,
//   isCollapse,
//   isNavigate,
//   navigatePath,
// }) => {
//   const [collapseIndex, setCollapseIndex] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleRowClick = (index, id) => {
//     setCollapseIndex(collapseIndex === index ? null : index);
//     if (isNavigate) {
//       const newPath = navigatePath.split("/");
//       navigate(navigatePath, {
//         state: { id, navigats: [...location.state.navigats, `/${newPath[2]}`] },
//       });
//     }
//   };

//   return (
//     <Grid style={{ overflow: "auto" }}>
//       <Table>
//         <TableHead>
//           <TableRow>
//             {isCollapse && (
//               <TableCell
//                 className="bg-orange-color text-white-color"
//                 style={{
//                   width: "10px",
//                   textAlign: "end",
//                 }}
//               />
//             )}
//             {headerData &&
//               headerData?.map((item, index) => (
//                 <TableCell
//                   className="bg-orange-color text-white-color"
//                   key={index}
//                   style={{
//                     fontWeight: "600",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {item}
//                 </TableCell>
//               ))}
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {cellData?.length > 0 ? (
//             cellData?.map((item, index) => (
//               <React.Fragment key={index}>
//                 <TableRow
//                   style={{ cursor: "pointer" }}
//                   onClick={() => {
//                     handleRowClick(index, item.key);
//                   }}
//                 >
//                   {isCollapse && (
//                     <TableCell>
//                       <IconButton size="small">
//                         {collapseIndex === index ? (
//                           <ArrowDropUpIcon className="text-blue-color" />
//                         ) : (
//                           <ArrowDropDownIcon className="text-blue-color" />
//                         )}
//                       </IconButton>
//                     </TableCell>
//                   )}
//                   {item?.value?.map((value, cellIndex) => (
//                     <TableCell
//                       key={cellIndex}
//                       className="text-blue-color"
//                       style={{ color: "#063164" }}
//                     >
//                       {value}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//                 {isCollapse && (
//                   <TableRow>
//                     <TableCell
//                       style={{ paddingBottom: 0, paddingTop: 0 }}
//                       colSpan={headerData?.length + 1}
//                     >
//                       <Collapse
//                         in={collapseIndex === index}
//                         timeout="auto"
//                         unmountOnExit
//                       >
//                         {CollapseComponent && (
//                           <CollapseComponent data={item.component} />
//                         )}
//                       </Collapse>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </React.Fragment>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell
//                 align="center"
//                 className="text-blue-color "
//                 colSpan={headerData?.length}
//               >
//                 Data Not Available
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </Grid>
//   );
// };

const JobberTable = ({
  headerData,
  cellData,
  CollapseComponent,
  isCollapse,
  isDialog = false,
  onDialogOpen,
  isNavigate = false,
  navigatePath,
  setSortField,
  setSortOrder,
  sortOrder,
  sortField,
}) => {
  const [collapseIndex, setCollapseIndex] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRowClick = (index, id, rowData) => {
    setCollapseIndex(collapseIndex === index ? null : index);

    if (isNavigate && navigatePath) {
      const newPath = navigatePath.split("/");
      navigate(navigatePath, {
        state: {
          id,
          navigats: [...(location.state?.navigats || []), `/${newPath[2]}`],
        },
      });
    }

    if (isDialog && onDialogOpen) {
      onDialogOpen(rowData);
    }
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <Grid style={{ overflow: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            {isCollapse && (
              <TableCell
                className="bg-orange-color text-white-color"
                style={{
                  width: "10px",
                  textAlign: "end",
                }}
              />
            )}
            {/* {headerData &&
              headerData?.map((item, index) => (
                <TableCell
                  className="bg-orange-color text-white-color"
                  key={index}
                  style={{
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item || "item not available"}
                </TableCell>
              ))} */}
            {headerData &&
              headerData.map((item, index) => (
                <TableCell
                  className="bg-orange-color text-white-color"
                  key={index}
                  style={{
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort(item.field)}
                >
                  {item.label || "item not available"}
                  {sortField === item.field && (
                    <>
                      {sortOrder === "asc" ? (
                        <ArrowDropUpIcon />
                      ) : (
                        <ArrowDropDownIcon />
                      )}
                    </>
                  )}
                </TableCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cellData?.length > 0 ? (
            cellData.map((item, index) => (
              <React.Fragment key={index}>
                <TableRow
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(index, item.key, item)}
                >
                  {isCollapse && (
                    <TableCell>
                      <IconButton size="small">
                        {collapseIndex === index ? (
                          <ArrowDropUpIcon className="text-blue-color" />
                        ) : (
                          <ArrowDropDownIcon className="text-blue-color" />
                        )}
                      </IconButton>
                    </TableCell>
                  )}

                  {/* Ensure the number of cells matches the header */}
                  {headerData.map((column, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      className="text-blue-color"
                      style={{ color: "#063164" }}
                    >
                      {item?.value[cellIndex] ?? "-"}
                    </TableCell>
                  ))}
                </TableRow>

                {isCollapse && collapseIndex === index && (
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={headerData.length}
                    >
                      <Collapse in={true} timeout="auto" unmountOnExit>
                        {CollapseComponent && (
                          <CollapseComponent data={item.component} />
                        )}
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                align="center"
                className="text-blue-color"
                colSpan={headerData.length}
              >
                <NoDataFound />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Grid>
  );
};
const JobberSearch = ({ search, setSearch }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <FormGroup>
      <Paper
        component="Grid"
        sx={{
          p: "1px 3px",
          display: "flex",
          alignItems: "center",
          boxShadow: "none",
          border: "0.5px solid #fff",
          background: "none",
          height: "38px",
        }}
      >
        <InputBase
          sx={{
            ml: 1,
            flex: 1,
            color: "white",
            "& .MuiInputBase-input::placeholder": {
              color: "white",
              opacity: 1,
            },
          }}
          className="input-search text-white-color"
          placeholder="Enter Search"
          inputProps={{ "aria-label": "search google maps" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
          <SearchIcon style={{ color: "#fff" }} />
        </IconButton>
      </Paper>
    </FormGroup>
  );
};

// const JobberSorting = ({ dropdownItems, onSelect }) => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState("Select Status");

//   const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

//   const handleSelect = (item) => {
//     setSelectedItem(item.text);
//     onSelect(item.text);
//     if (item.onClick) {
//       item.onClick();
//     }
//   };

//   return (
//     <Dropdown
//       isOpen={dropdownOpen}
//       toggle={toggleDropdown}
//       style={{ zIndex: 9 }}
//     >
//       <DropdownToggle
//         caret
//         style={{
//           background: "transparent",
//           borderColor: "white",
//         }}
//       >
//         {selectedItem || "selectedItem not available"}
//       </DropdownToggle>
//       <DropdownMenu>
//         {dropdownItems.map((item, index) => (
//           <DropdownItem
//             className="text-blue-color"
//             key={index}
//             onClick={() => handleSelect(item)}
//           >
//             {item.text || "text not available"}
//           </DropdownItem>
//         ))}
//       </DropdownMenu>
//     </Dropdown>
//   );
// };
// const JobberPagination = ({
//   totalData,
//   currentData,
//   dataPerPage,
//   pageItems,
//   page,
//   setPage,
//   setRowsPerPage,
// }) => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const toggle = () => setDropdownOpen(!dropdownOpen);

//   const handlePrevPage = () => {
//     if (page > 0) {
//       setPage(page - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (page * currentData + currentData < totalData) {
//       setPage(page + 1);
//     }
//   };

//   const startItem = page * currentData + 1;
//   const endItem = Math?.min((page + 1) * currentData, totalData);

//   return (
//     <Grid className="d-flex justify-content-end align-items-center">
//       <Dropdown toggle={toggle} isOpen={dropdownOpen} style={{ zIndex: 9 }}>
//         <DropdownToggle
//           className="text-white-color"
//           caret
//           style={{ background: "none", border: "none" }}
//         >
//           {dataPerPage || "dataPerPage not available"}
//         </DropdownToggle>
//         <DropdownMenu>
//           {pageItems &&
//             pageItems?.map((item, index) => (
//               <DropdownItem
//                 className="text-blue-color"
//                 onClick={() => setRowsPerPage(item)}
//                 key={index}
//               >
//                 {item || "item not available"}
//               </DropdownItem>
//             ))}
//         </DropdownMenu>
//       </Dropdown>
//       <Grid className="d-flex justify-content-between align-items-center text-white-color">
//         <KeyboardArrowLeftIcon
//           sx={{
//             color: page === 0 ? "transparent" : "#fff",
//             cursor: page === 0 ? "default" : "pointer",
//           }}
//           onClick={handlePrevPage}
//         />
//         <Typography className="mx-2">
//           {totalData > 0
//             ? `${startItem} - ${endItem} of ${totalData}`
//             : "0 - 0 of 0"}
//         </Typography>
//         <ChevronRightIcon
//           sx={{
//             color:
//               page * currentData + currentData >= totalData
//                 ? "transparent"
//                 : "#fff",
//             cursor:
//               page * currentData + currentData >= totalData
//                 ? "default"
//                 : "pointer",
//           }}
//           onClick={handleNextPage}
//         />
//       </Grid>
//     </Grid>
//   );
// };

const JobberSorting = ({
  dropdownItems,
  onSelect,
  placeholder = "Select Status",
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(placeholder);

  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

  const handleSelect = (item) => {
    setSelectedItem(item.text);
    onSelect(item.text);
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <Dropdown
      isOpen={dropdownOpen}
      toggle={toggleDropdown}
      style={{ zIndex: 9 }}
    >
      <DropdownToggle
        caret
        style={{
          background: "transparent",
          borderColor: "white",
        }}
      >
        {selectedItem || placeholder}
      </DropdownToggle>
      <DropdownMenu>
        {dropdownItems.map((item, index) => (
          <DropdownItem
            className="text-blue-color"
            key={index}
            onClick={() => handleSelect(item)}
          >
            {item.text || "text not available"}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

const JobberPagination = ({
  totalData,
  currentData,
  dataPerPage,
  pageItems,
  page,
  setPage,
  setRowsPerPage,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(!dropdownOpen);

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page * currentData + currentData < totalData) {
      setPage(page + 1);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    const totalPages = Math.ceil(totalData / newRowsPerPage);
    const newPage = Math.min(page, totalPages - 1);
    setRowsPerPage(newRowsPerPage);
    setPage(newPage);
  };

  const startItem = page * currentData + 1;
  const endItem = Math.min((page + 1) * currentData, totalData);

  return (
    <Grid className="d-flex justify-content-end align-items-center">
      <Dropdown toggle={toggle} isOpen={dropdownOpen} style={{ zIndex: 9 }}>
        <DropdownToggle
          className="text-white-color"
          caret
          style={{ background: "none", border: "none" }}
        >
          {dataPerPage || "dataPerPage not available"}
        </DropdownToggle>
        <DropdownMenu>
          {pageItems &&
            pageItems?.map((item, index) => (
              <DropdownItem
                className="text-blue-color"
                onClick={() => handleRowsPerPageChange(item)}
                key={index}
              >
                {item || "item not available"}
              </DropdownItem>
            ))}
        </DropdownMenu>
      </Dropdown>
      <Grid className="d-flex justify-content-between align-items-center text-white-color">
        <KeyboardArrowLeftIcon
          sx={{
            color: page === 0 ? "transparent" : "#fff",
            cursor: page === 0 ? "default" : "pointer",
          }}
          onClick={handlePrevPage}
        />
        <Typography className="mx-2">
          {totalData > 0
            ? `${startItem} - ${endItem} of ${totalData}`
            : "0 - 0 of 0"}
        </Typography>
        <ChevronRightIcon
          sx={{
            color:
              page * currentData + currentData >= totalData
                ? "transparent"
                : "#fff",
            cursor:
              page * currentData + currentData >= totalData
                ? "default"
                : "pointer",
          }}
          onClick={handleNextPage}
        />
      </Grid>
    </Grid>
  );
};

const MainNav = ({ setIsSidebarDisplay, isSidebarClosed }) => {
  const cdnUrl = process.env.REACT_APP_CDN_API;
  const location = useLocation();
  const navigate = useNavigate();
  const { CompanyName, customers } = useParams();
  const isMediumScreen = useMediaQuery("(max-width:767px)");
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await handleAuth(navigate, location);
        setData(res.data);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };
    fetchData();
  }, [navigate]);

  const useRemoveToken = async () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  const [isNotify, setIsNotify] = useState(false);
  const handleNotificationsClick = () => {
    setIsNotify(true);
  };
  const handleCloseNotifications = () => {
    setIsNotify(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event?.target?.closest(".notification-bar") === null) {
        setIsNotify(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [openCustome, setOpenCustome] = useState(false);
  const [navigateItems, setNaviagateItems] = useState([]);

  const findMatchingNames = () => {
    let matchingNames = [];

    // Check if 'navigats' is available in the state
    if (location?.state?.navigats) {
      location?.state?.navigats.forEach((item) => {
        routes?.forEach((route) => {
          // Check if the route is collapsed and has children
          if (
            route?.isCollapse &&
            route?.children &&
            route?.layout ===
              (CompanyName
                ? `/:CompanyName`
                : `/${location?.pathname.split("/")[1]}`)
          ) {
            route?.children?.forEach((child) => {
              if (child?.path === item) {
                matchingNames = [...matchingNames, child]; // Add child without mutating state
              }
            });
          } else if (
            !route?.isCollapse &&
            route?.layout ===
              (CompanyName
                ? `/:CompanyName`
                : `/${location.pathname.split("/")[1]}`)
          ) {
            if (route?.path === item) {
              matchingNames = [...matchingNames, route]; // Add route without mutating state
            }
          }
        });
      });
      setNaviagateItems(matchingNames);
    } else {
      const path = location?.pathname?.split("/").slice(2);

      const newNavigats = ["/index", `/${path?.join("/")}`];

      newNavigats.forEach((item) => {
        routes?.forEach((route) => {
          // Check for collapsed routes and their children
          if (
            route?.isCollapse &&
            route?.children &&
            route?.layout ===
              (CompanyName
                ? `/:CompanyName`
                : `/${location?.pathname.split("/")[1]}`)
          ) {
            route?.children?.forEach((child) => {
              if (child?.path === item) {
                matchingNames = [...matchingNames, child]; // Add child without mutating state
              }
            });
          } else if (
            !route?.isCollapse &&
            route?.layout ===
              (CompanyName
                ? `/:CompanyName`
                : `/${location.pathname.split("/")[1]}`)
          ) {
            if (route?.path === item) {
              matchingNames = [...matchingNames, route]; // Add route without mutating state
            }
          }
        });
      });

      setNaviagateItems(matchingNames);
    }
    return matchingNames;
  };

  useEffect(() => {
    findMatchingNames();
  }, [location.pathname]);

  const [isSwitchOn, setisSwitchOn] = React.useState({
    invoices: true,
    customers: true,
    quotes: true,
    contracts: true,
    workers: true,
    AppointmentConfirmNotification: true,
    QuoteChangeRequestNotification: true,
    ProductAndServiceCreateNotification: true,
    QuoteConfirmNotification: true,
    contractConfirm: true,
    ManageAccountNotification: true,
    ManageTempletes: true,
    RecurringChargeNotification: true,
    RecurringPaymentNotification: true,
    AddVisitNotifications: true,
    Quotesignature: true,
  });
  const notificationCount = useCountNotifications();

  const handleSwitchChange = (event) => {
    setisSwitchOn((pre) => {
      return { ...pre, [event.target.name]: event.target.checked };
    });
  };

  const [notifications, setNotifications] = useState([]);
  const [loader, setLoader] = useState(true);

  const fetchNotifications = async () => {
    setLoader(true);

    try {
      // const response = await AxiosInstance.get(
      //   // `/notifications/${localStorage.getItem("CompanyId")}`
      // );
      let response;

      if (response?.data.statusCode === 200) {
        const filteredNotifications = response?.data?.notifications?.filter(
          (notification) =>
            notification?.Quote?.QuoteNumber ||
            notification?.Contract?.ContractNumber ||
            notification?.Customer?.FirstName ||
            notification?.Invoice?.InvoiceNumber ||
            notification?.QuoteChangeRequest ||
            notification?.QuoteApprove ||
            notification?.WorkerId ||
            notification?.ProductId ||
            notification?.account_id ||
            notification?.TemplateId ||
            notification?.recurring_charge_id ||
            notification?.recurringId
        );
        setNotifications(filteredNotifications || []);
      } else {
        console.warn("No notifications found in response.");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setNotifications([]);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    // if (tokenDecode) {
    fetchNotifications();
    // }
  }, []);
  return (
    <Grid
      className="my-nav bg-orange-color "
      style={{
        justifyContent: isMediumScreen ? "space-between" : "",
        gap: "40px",
        padding: "10px 67px 10px 0",
        marginBottom: "30px",
        alignItems: "center",
        position: "sticky",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99,
      }}
    >
      <Grid className="toggle-btn d-md-none d-flex px-3 justify-content-between text-white-color">
        <MenuRoundedIcon
          onClick={() => setIsSidebarDisplay(!setIsSidebarDisplay)}
        />
        <Grid
          className="setting+notification"
          style={{ marginRight: "-50px", zIndex: "0" }}
        >
          <Grid
            className="notification-set"
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
            }}
          >
            <Divider
              orientation="vertical"
              flexItem
              style={{
                height: "20px",
                border: "2px solid #FFFF",
                alignItems: "center",
                margin: "5px",
                marginTop: "10px",
              }}
            />
            <Grid
              className="mx-3"
              onClick={() => handleNotificationsClick()}
              style={{
                cursor: "pointer",
                color: "#FFFF",
                display: "flex",
                alignItems: "center",
              }}
            >
              <NotificationsNoneIcon />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid className="d-flex align-items-center justify-content-between my-2 main-nav-responsive-section">
        <Grid
          className="d-flex align-items-center Navigator navigatorBarUrl"
          style={{ marginLeft: !isSidebarClosed ? "285px" : "150px" }}
        >
          <Breadcrumb
            className="text-light breadcrumb"
            listTag="Grid"
            tag="Grid"
            style={{
              border: "1px solid #fff",
              display: "flex",
              alignItems: "center",
              padding: "6px 16px 6px 16px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {navigateItems?.length > 0 &&
              navigateItems?.map((name, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ArrowSeparator key={`separator-${index}`} />}
                  <BreadcrumbItem
                    onClick={() => {
                      if (index === 0) {
                        navigate(
                          `/${
                            CompanyName
                              ? CompanyName
                              : location?.pathname?.split("/")[1]
                          }/index`,
                          {
                            state: { navigats: ["/index"] },
                          }
                        );
                      } else if (index !== navigateItems.length - 1) {
                        navigate(index - navigateItems.length + 1);
                      }
                    }}
                  >
                    {name?.name || "name not available"}
                  </BreadcrumbItem>
                  {index === location?.state?.navigats?.length && (
                    <ArrowSeparator key={`separator-after-${index}`} />
                  )}
                </React.Fragment>
              ))}
          </Breadcrumb>
        </Grid>
        <Grid className="setting-notification d-md-flex d-none settingNotificationIcon">
          <Grid
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
            }}
          >
            <Nav
              className="align-items-center d-md-flex mx-3 justify-content-end"
              navbar
            >
              <UncontrolledDropdown nav>
                <Grid className="">
                  <DropdownToggle className="pr-0" nav>
                    <img src={setting} />
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-arrow bg-orange-color">
                    <DropdownItem
                      className=" d-flex gap-2 align-items-center"
                      tag="Grid"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        if (CompanyName) {
                          navigate(`/${CompanyName}/profile`, {
                            state: {
                              navigats: ["/index", "/profile"],
                            },
                          });
                        } else if (
                          location.pathname?.split("/")[1] === "staff-member"
                        ) {
                          navigate(
                            `/${
                              location?.pathname?.split("/")[1]
                            }/staff-memberprofile`,
                            {
                              state: {
                                navigats: ["/index", "/staff-memberprofile"],
                              },
                            }
                          );
                        } else if (
                          location.pathname?.split("/")[1] === "superadmin"
                        ) {
                          navigate(
                            `/${
                              location?.pathname.split("/")[1]
                            }/SuperAdminProfile`,
                            {
                              state: {
                                navigats: ["/index", "SuperAdminProfile"],
                              },
                            }
                          );
                        } else {
                          navigate(
                            `/${
                              location?.pathname?.split("/")[1]
                            }/customerprofile`,
                            {
                              state: {
                                navigats: ["/index", "/customerprofile"],
                              },
                            }
                          );
                        }
                      }}
                    >
                      {/* <Typography
                        className="text-overflow m-0 "
                        style={{
                          padding: "8px",
                          borderRadius: "5px",
                          color: "#E88C44",
                          fontSize: "12px",
                          backgroundColor: "#FFF",
                        }}
                      > */}
                      {/* {data?.full_name
                          ?.split(" ")
                          ?.map((part) => part.charAt(0).toUpperCase())
                          ?.join("")} */}
                      <>
                        {data?.profileImage ? (
                          <img
                            src={`${cdnUrl}/upload/${data?.profileImage}`}
                            alt="Profile"
                            style={{
                              // borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              borderRadius: "5px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Typography
                            className="text-blue-color text-orange-color bg-white-color"
                            style={{
                              fontWeight: 700,
                              padding: "8px",
                              borderRadius: "4px",
                            }}
                          >
                            {data?.full_name
                              ?.split(" ")
                              ?.map((part) => part.charAt(0).toUpperCase())
                              ?.join("")}
                          </Typography>
                        )}
                      </>
                      {/* </Typography> */}
                      <Grid className="text-light">
                        <Typography
                          className="mb-0"
                          style={{ fontSize: "12px" }}
                        >
                          <Typography
                            className="bold-text"
                            style={{ fontSize: "12px" }}
                          >
                            {data?.full_name || 
                              data?.FirstName + " " + data?.LastName}
                          </Typography>
                        </Typography>
                        <Typography
                          className="mb-0 e-mail"
                          style={{ fontSize: "10px" }}
                        >
                          {data?.EmailAddress || data?.EmailAddress}
                        </Typography>
                      </Grid>
                    </DropdownItem>
                    <Divider sx={{ backgroundColor: "white" }} />
                    {!location?.pathname?.includes("/superadmin") &&
                      !location?.pathname?.includes("/customers") &&
                      !location?.pathname?.includes("/staff-member") && (
                        <>
                          <DropdownItem
                            className="mb-2 text-light"
                            onClick={() => {
                              if (!location?.pathname?.includes("/customers")) {
                                navigate(
                                  CompanyName
                                    ? `/${CompanyName}/materials&labor`
                                    : "/superadmin/materials&labor",
                                  {
                                    state: {
                                      navigats: ["/index", "/materials&labor"],
                                    },
                                  }
                                );
                              }
                            }}
                          >
                            <img src={setting} color="red" />
                            <span className="mx-2" style={{ fontSize: "12px" }}>
                              Setting
                            </span>
                          </DropdownItem>
                          <Divider sx={{ backgroundColor: "white" }} />
                          <DropdownItem
                            className="mb-2 text-light"
                            onClick={() => {
                              if (!location.pathname.includes("/customers")) {
                                navigate(
                                  CompanyName
                                    ? `/${CompanyName}/account-billing`
                                    : "/superadmin/account-billing",
                                  {
                                    state: {
                                      navigats: ["/index", "/account-billing"],
                                    },
                                  }
                                );
                              }
                            }}
                          >
                            <img src={AccountBilling} />
                            <span className="mx-2" style={{ fontSize: "12px" }}>
                              Account & Billing
                            </span>
                          </DropdownItem>
                          <Divider sx={{ backgroundColor: "white" }} />
                          <DropdownItem
                            className="mb-2 text-light"
                            onClick={() => {
                              if (!location.pathname.includes("/customers")) {
                                navigate(
                                  CompanyName
                                    ? `/${CompanyName}/activity `
                                    : "/superadmin/activity",
                                  {
                                    state: {
                                      navigats: ["/index", "/activity"],
                                    },
                                  }
                                );
                              }
                            }}
                          >
                            <img src={Activity} />
                            <span className="mx-2" style={{ fontSize: "12px" }}>
                              Activity
                            </span>
                          </DropdownItem>
                          <Divider sx={{ backgroundColor: "white" }} />
                          <DropdownItem
                            className="mb-2 text-light"
                            onClick={() => {
                              if (!location.pathname.includes("/customers")) {
                                navigate(
                                  CompanyName
                                    ? `/${CompanyName}/manageteam `
                                    : "/superadmin/manageteam",
                                  {
                                    state: {
                                      navigats: ["/index", "/manageteam"],
                                    },
                                  }
                                );
                              }
                            }}
                          >
                            <img src={ManageTeam} />
                            <span className="mx-2" style={{ fontSize: "12px" }}>
                              Manage Team
                            </span>
                          </DropdownItem>
                          <Divider sx={{ backgroundColor: "white" }} />
                        </>
                      )}
                    <DropdownItem
                      onClick={useRemoveToken}
                      className="mb-2 text-light"
                    >
                      <img src={Logout} />
                      <span className="mx-2" style={{ fontSize: "12px" }}>
                        Log out
                      </span>
                    </DropdownItem>
                  </DropdownMenu>
                </Grid>
              </UncontrolledDropdown>
            </Nav>
            <Divider
              orientation="vertical"
              flexItem
              style={{
                height: "20px",
                border: "2px solid #FFFF",
                alignItems: "center",
                margin: "5px",
                marginTop: "10px",
              }}
            />
            <Grid
              className="mx-3"
              onClick={handleNotificationsClick}
              style={{
                cursor: "pointer",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <NotificationsNoneIcon />
              {notificationCount > 0 && (
                <Typography
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    background: "red",
                    borderRadius: "50%",
                    color: "white",
                    padding: "2px 6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {notificationCount}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
        {isNotify && (
          <Grid
            className="notification-bar"
            style={{ border: "1px solid rgba(42, 79, 97, 1)" }}
          >
            <Grid className="w-100 d-flex justify-content-between align-items-center">
              <Typography
                className="text-blue-color heading-four"
                style={{
                  padding: "15px",
                  marginBottom: "0px",
                  fontWeight: "bold",
                }}
              >
                Activity Feed
              </Typography>
              <Button
                className="text-blue-color"
                onClick={handleCloseNotifications}
                style={{
                  marginLeft: "20px",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  color: "#063164",
                  border: "0",
                  padding: "10px",
                }}
              >
                <CloseRoundedIcon />
              </Button>
            </Grid>
            {!openCustome ? (
              <>
                <Grid
                  className="notification-p d-flex justify-content-between align-items-center mb-1"
                  style={{ padding: "17px 1px 11px 6px" }}
                >
                  <Typography
                    className="customise text-blue-color"
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenCustome(!openCustome)}
                  >
                    Customize Feed
                  </Typography>
                  <Typography
                    className="customise text-blue-color"
                    style={{ cursor: "pointer" }}
                  >
                    {notificationCount > 0 && (
                      <Notifications fetchNotifications={fetchNotifications} />
                    )}
                  </Typography>
                </Grid>

                <>
                  {QuoteNotificationsPage === 0 && (
                    <Grid
                      className="solid"
                      style={{ padding: "4px 0 6px 15px" }}
                    >
                      <Grid
                        className="d-flex justify-content-center align-items-center bg-blue-color border-blue-color"
                        style={{
                          borderBottom: "1px solid ",
                          borderTop: "1px solid #063164",
                          borderRadius: "50%",
                          height: "40px",
                          width: "43px",
                          marginLeft: "5px",
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                      >
                        <NotificationsNoneIcon
                          style={{
                            color: "white",
                            height: "35px",
                            width: "26px",
                          }}
                        />
                      </Grid>
                      <Typography
                        className="notification-item text-blue-color"
                        style={{ fontSize: "18px" }}
                      >
                        No activities to report
                      </Typography>
                    </Grid>
                  )}
                </>

                <QuoteNotificationsPage
                  handleCloseNotifications={handleCloseNotifications}
                  isSwitchOn={isSwitchOn}
                  fetchNotifications={fetchNotifications}
                  notifications={notifications}
                />
              </>
            ) : (
              //Customewr Feed Start Here Switch And Name
              <>
                <Grid
                  className="notication-back text-blue-color"
                  onClick={() => setOpenCustome(!openCustome)}
                >
                  {" "}
                  <ArrowBackIosIcon className="text-blue-color" />
                  Back
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Customer
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.customers}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="customers"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Quotes
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.quotes}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="quotes"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Contracts{" "}
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.contracts}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="contracts"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Invoices
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.invoices}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="invoices"
                    />
                  </Typography>
                </Grid>

                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Worker
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.workers}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="workers"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Customer Appointment Confirm
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.AppointmentConfirmNotification}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="AppointmentConfirmNotification"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Worker Quote Confirm
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.QuoteConfirmNotification}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="QuoteConfirmNotification"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Change Request
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.QuoteChangeRequestNotification}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="QuoteChangeRequestNotification"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Materials & Labor
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.ProductAndServiceCreateNotification}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="ProductAndServiceCreateNotification"
                    />
                  </Typography>
                </Grid>

                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Manage Account
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.ManageAccountNotification}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="ManageAccountNotification"
                    />
                  </Typography>
                </Grid>

                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Manage Templates
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.ManageTempletes}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="ManageTempletes"
                    />
                  </Typography>
                </Grid>

                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Reccuring Charge
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.RecurringChargeNotification}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="RecurringChargeNotification"
                    />
                  </Typography>
                </Grid>

                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Reccuring Payment
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.RecurringPaymentNotification}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="RecurringPaymentNotification"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Visit Create
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.AddVisitNotifications}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="AddVisitNotifications"
                    />
                  </Typography>
                </Grid>
                <Grid
                  className="notification-contant d-flex justify-content-between"
                  style={{ padding: "15px", paddingRight: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontWeight: "700",
                    }}
                  >
                    Signatures
                  </Typography>

                  <Typography style={{ marginTop: "5px" }}>
                    <AntSwitch
                      checked={isSwitchOn.Quotesignature}
                      onChange={handleSwitchChange}
                      inputProps={{ "aria-label": "ant design" }}
                      name="Quotesignature"
                    />
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export { JobberTable, JobberPagination, JobberSearch, MainNav, JobberSorting };
