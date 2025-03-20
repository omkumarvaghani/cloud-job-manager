import React, { useState, useEffect } from "react";
import swal from "sweetalert";
import AxiosInstance from "../../../AxiosInstance.jsx";
import { useFormik } from "formik";
import * as Yup from "yup";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import {
  JobberPagination,
  JobberSearch,
  JobberTable,
} from "../../../../components/MuiTable/index.jsx";
import { Table, CardFooter, CardBody, Card, CardHeader } from "reactstrap";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Navbar,
} from "reactstrap";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import SettingSidebar from "../../../../components/Setting/SettingSidebar.jsx";
import { TableCell, TableHead, TableFooter, TableRow } from "@mui/material";
import "./style.css";
import ActiveUsers from "./Activeuasers.jsx";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import moment from "moment";
import SettingDropdown from "../Materials&Labor/SettingComponent.jsx";
import "./style.css";
import sendSwal from "../../../../components/Swal/sendSwal.jsx";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
} from "../../../../components/Icon/Index.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../../components/Toast/Toster.jsx";
import { Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton.jsx";
import { handleAuth } from "../../../../components/Login/Auth.jsx";

function ManageTeamTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [workerData, setWorkerData] = useState([]);

  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const toggleDropdown = (email) => {
    setActiveDropdown(activeDropdown === email ? null : email);
  };
  const [tokenDecode, setTokenDecode] = useState({});

  const [DateDecode, setDateDecode] = useState({});
  const fetchDatas = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchDatas();
  }, []);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [DateDecode]);

  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  const fetchData = async () => {
    setLoader(true);
    try {
      const companyId = localStorage?.getItem("CompanyId");
      const res = await AxiosInstance.get(`/worker/${companyId}`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      if (res?.data?.statusCode === 200) {
        setWorkerData(res?.data?.data);
        setTotalCount(res?.data?.count);
        setCountData(res?.data?.count);
        setActiveCount(res?.data?.active);
      }
    
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [rowsPerPage, page, search, sortField, sortOrder]);

  const handleClick = (id) => {
    if (id) {
      navigate("/" + companyName + "/add-user", {
        state: { id, navigats: [...location?.state?.navigats, "/add-user"] },
      });
    }
  };

  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/worker/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);
            fetchData();
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error);
        }
      } else {
        showToast.success("Manage Team is safe!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    });
    setTimeout(() => {
      const deleteButton = document.querySelector(".swal-button--confirm");
      if (deleteButton) {
        deleteButton.disabled = true;
      }
    }, 0);
  };

  const formik = useFormik({
    initialValues: {},
    validationSchema: Yup.object({}),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const object = {
          ...values,
          companyId: localStorage?.getItem("CompanyId"),
        };

        let response;
        if (location?.state?.id) {
          response = await AxiosInstance.put(`/worker/${location?.state?.id}`, {
            IsActive: false,
          });
        } else {
          response = await AxiosInstance.post(`/worker`, object);
        }

        if (response?.data?.statusCode === 200) {
          setTimeout(() => {
            showToast.success(response?.data?.message);
          }, 500);
          navigate(-1);
        } else if (response?.data?.statusCode === 202) {
          setTimeout(() => {
            showToast.error(response?.data?.message);
          }, 500);
        } else {
          setTimeout(() => {
            showToast.error("", response?.data?.message, "error");
          }, 500);
        }
      } catch (error) {
        setTimeout(() => {
          showToast.error("", error?.message, "error");
        }, 500);
        console.error("There was an error submitting the form!", error);
      }
    },
  });

  const sendMail = async (WorkerId) => {
    const willSendMail = await swal({
      title: "Are you sure?",
      text: "Are you sure you want to send the email?",
      icon: "warning",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Yes",
          closeModal: true,
          value: true,
          className: "bg-orange-color",
        },
      },
      dangerMode: true,
    });

    if (willSendMail) {
      try {
        const response = await AxiosInstance.post(
          `/worker/send_mail/${WorkerId}`
        );
        if (response?.data?.statusCode === 200) {
          setTimeout(() => {
            showToast.success(response?.data?.message);
          }, 500);
        } else {
          setTimeout(() => {
            showToast.error(response?.data?.message);
          }, 500);
        }
      } catch (error) {
        console.error("Error to send mail", error);
        setTimeout(() => {
          showToast.error("An error occurred while sending the email.");
        }, 500);
      }
    }
  };

  const handleEditClick = (id) => {
    navigate(`/${companyName}/add-customer`, {
      state: {
        id,
        navigats: [...location.state.navigats, "/add-customer"],
      },
    });
  };

  const cellData = workerData?.map((user, index) => {
    return {
      key: user?.WorkerId,
      value: [
        // <Grid
        //   className="bg-blue-color text-white-color"
        //   style={{
        //     display: "flex",
        //     alignItems: "center",
        //     justifyContent: "center",
        //     borderRadius: "50%",
        //     padding: "10px",
        //     width: "40px",
        //     height: "40px",
        //   }}
        // >
        //   {user?.FullName?.split(" ")
        //     .map((part) => part.charAt(0).toUpperCase())
        //     .join("")}
        // </Grid>,
        <Grid
        className="bg-blue-color text-white-color"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          padding: "10px",
          width: "40px",
          height: "40px",
        }}
      >
        {`${user?.FirstName?.charAt(0).toUpperCase()}${user?.LastName?.charAt(0).toUpperCase()}`}
      </Grid>,
        `${user?.FirstName || "FirstName not available"} ${user?.LastName || "LastName not available"}`,
        user?.EmailAddress || "EmailAddress not available",
        moment(user?.createdAt).format(dateFormat),
        <Grid
          style={{
            color: user?.IsActive ? "green" : "red",
            fontWeight: 700,
          }}
        >
          {user?.IsActive ? "Active" : "Deactive" || "IsActive not available"}
        </Grid>,
        <>
          <Dropdown
            isOpen={activeDropdown === user?.EmailAddress}
            toggle={() => toggleDropdown(user?.EmailAddress)}
            onClick={(e) => e.stopPropagation()}
            style={{
              zIndex: activeDropdown === user?.EmailAddress ? 9999 : 0,
            }}
          >
            <DropdownToggle
              className="text-blue-color outline border-blue-color"
              style={{
                background: "none",
                border: "none ",
              }}
            >
              <MoreHorizIcon />
            </DropdownToggle>
            <DropdownMenu
              container="body"
              style={{
                position: "absolute",
                zIndex: activeDropdown === user?.EmailAddress ? 9998 : 1,
                padding: "5px",
                minWidth: "150px",
              }}
            >
              <DropdownItem
                style={{
                  fontSize: "14px",
                  padding: "5px 10px",
                }}
                onClick={() => {
                  sendMail(user?.WorkerId);
                }}
                className="text-blue-color"
              >
                <MarkEmailReadOutlinedIcon
                  className="icones-dropdown texxt-blue-color"
                  style={{
                    fontSize: "16px",
                    marginRight: "5px",
                  }}
                />
                Resend Invitation
              </DropdownItem>
              <DropdownItem
                style={{
                  fontSize: "14px",
                  padding: "5px 10px",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={async () => {
                  swal({
                    title: "Are you sure?",
                    text: "Do you want to change the worker's status?",
                    icon: "warning",
                    buttons: {
                      cancel: "Cancel",
                      confirm: {
                        text: "Yes, change status",
                        closeModal: true,
                        value: true,
                        className: "bg-orange-color",
                      },
                    },
                    dangerMode: true,
                  }).then(async (confirmation) => {
                    if (confirmation) {
                      try {
                        const newStatus = !user?.IsActive;
                        const response = await AxiosInstance.put(
                          `/worker/${user?.WorkerId}`,
                          { IsActive: newStatus }
                        );

                        if (response?.data.statusCode === 200) {
                          const successMessage = newStatus
                            ? "Worker activated successfully"
                            : "Worker deactivated successfully";
                          setTimeout(() => {
                            showToast.success(successMessage);
                          }, 500);
                          fetchData();
                        } else {
                          setTimeout(() => {
                            showToast.error(response?.data.message);
                          }, 500);
                        }
                      } catch (error) {
                        console.error("Error:", error);
                        setTimeout(() => {
                          showToast.error(
                            "Failed to update the worker's status"
                          );
                        }, 500);
                      }
                    }
                  });
                }}
              >
                <NoAccountsIcon
                  className="icones-dropdown"
                  style={{
                    fontSize: "16px",
                    color: user?.IsActive ? "red" : "green",
                    marginRight: "5px",
                  }}
                />
                <Typography
                  style={{
                    color: user?.IsActive ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  {user?.IsActive ? "Deactivate" : "Activate"}
                </Typography>
              </DropdownItem>

              <DropdownItem
                style={{
                  fontSize: "14px",
                  padding: "5px 10px",
                  alignItems: "center",
                  marginLeft: "2px",
                  display: "flex",
                }}
                onClick={() => handleDelete(user?.WorkerId)}
                className="text-blue-color"
              >
                <DeleteIcone />
                <Typography className="mx-1">Delete</Typography>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </>,
      ],
    };
  });
  const collapseData = workerData?.map((user) => ({
    createdAt: user?.createdAt || "No details provided",
  }));

  return (
    <>
      <Grid>
        <Grid className="d-flex">
          <Col className="col-2 h-100 hiren" xl={2}>
            <SettingSidebar />
          </Col>
          <Col
            className="d-flex col-12 col-lg-10 col-md-12 justify-content-center manageteam-content addProductServiceSideLine"
            style={{
              position: "relative",
              zIndex: "9",
              borderLeft: "0.5px solid rgba(6, 49, 100, 30%)",
              paddingLeft: "20px",
              marginTop: "-30px",
            }}
            xl={10}
            lg={10}
            md={12}
          >
            <Grid
              style={{
                width: "100%",
                marginLeft: "0%",
                justifyContent: "center",
              }}
            >
              <Grid>
                <Grid className="d-block justify-content-between">
                  <Navbar
                    className="navbar-setting"
                    style={{
                      zIndex: "9",
                      borderRadius: "5px",
                    }}
                  ></Navbar>
                  <Grid className="d-flex justify-content-between manageTeamAddWorker">
                    <Typography
                      className="text-blue-color page-heading mb-1"
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        lineHeight: "28px",
                        marginTop: "5%",
                      }}
                    >
                      Manage Team
                    </Typography>
                    <Grid className="d-flex justify-content-end mb-4  align-items-center mt-3">
                      <BlueButton
                        style={{
                          position: "relative",
                          zIndex: "9999",
                        }}
                        onClick={() => {
                          navigate(`/${companyName}/add-user`, {
                            state: {
                              navigats: [
                                ...location?.state?.navigats,
                                "/add-user",
                              ],
                            },
                          });
                        }}
                        className="bg-button-blue-color adduserbtn add-user addWorkerUser"
                        label="+ Add Worker"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid>
                <Typography className="text-blue-color">
                  Include or oversee team members requiring login access to the
                  contract management system both in the office and in the
                  field. Assign them to contract sites or enable them to use
                  more features within the contract management system.
                </Typography>
              </Grid>
              <SettingDropdown
                isOpenDropDown={isOpenDropDown}
                toggle={toggle}
                companyName={companyName}
              />
              <Grid className="justify-content-center align-items-center mb-3">
                <Grid className="row mt-5" style={{ gap: "20px" }}>
                  <Col
                    className="col-lg-3 col-md-12 d-flex justify-content-between activeusers"
                    lg={12}
                    md={12}
                  >
                    <ActiveUsers
                      totalCount={totalCount}
                      activeCount={activeCount}
                    />
                  </Col>
                  <Col className="col-lg-12 col-md-12 t-head" lg={12} md={12}>
                    <Card
                      className="border-blue-color"
                      style={{
                        borderRadius: "20px",
                        border: "1px solid",
                        padding: 0,
                      }}
                    >
                      <CardHeader
                        className="d-flex justify-content-between align-items-center table-header border-blue-color bg-blue-color customerList_searchbar customersAddCustomers"
                        style={{
                          borderBottom: "1px solid",
                          borderTopLeftRadius: "15px",
                          borderTopRightRadius: "15px",
                        }}
                      >
                        <Typography className="quot text-light customerList_head heading-five tableNameHead fw-medium">
                          Workers List
                        </Typography>
                        {/* <Grid className=" customersearch d-flex customer_searchBar searchBarOfTable">
                          <JobberSearch
                            search={search}
                            setSearch={setSearch}
                            style={{
                              background: "transparant",
                              color: "white",
                            }}
                          />
                        </Grid> */}
                      </CardHeader>
                      {loader ? (
                        <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
                          <LoaderComponent
                            height="50"
                            width="50"
                            loader={loader}
                          />
                        </Grid>
                      ) : (
                        <CardBody style={{ padding: "10px 0px" }}>
                          <JobberTable
                            style={{ whiteSpace: "nowrap" }}
                            // headerData={[
                            //   "Profile",
                            //   "Name ",
                            //   "Eamil",
                            //   "Last Login",
                            //   "Status",
                            //   "Action",
                            // ]}
                            headerData={[
                              { label: "Profile", field: "" },
                              { label: "Name", field: "Name" },
                              { label: "Eamil", field: "EmailAddress" },
                              { label: "Last Login", field: "createdAt" },
                              { label: "Status", field: "" },
                              { label: "Action" },
                            ]}
                            setSortField={setSortField}
                            setSortOrder={setSortOrder}
                            sortOrder={sortOrder}
                            sortField={sortField}
                            cellData={cellData}
                            collapseData={collapseData}
                            isCollapse={false}
                            page={page}
                            isNavigate={true}
                            navigatePath={
                              companyName
                                ? `/${companyName}/add-user`
                                : `/staff-member/ClientDetails`
                            }
                          />
                        </CardBody>
                      )}
                      <CardFooter
                        className="bg-orange-color border-blue-color text-blue-color "
                        style={{
                          borderTop: "1px solid",
                          borderBottomLeftRadius: "20px",
                          borderBottomRightRadius: "20px",
                        }}
                      >
                        <JobberPagination
                          totalData={countData}
                          currentData={rowsPerPage}
                          dataPerPage={rowsPerPage}
                          pageItems={[10, 25, 50]}
                          page={page}
                          setPage={setPage}
                          setRowsPerPage={setRowsPerPage}
                        />
                      </CardFooter>
                    </Card>
                  </Col>
                </Grid>
              </Grid>
            </Grid>
          </Col>
        </Grid>
      </Grid>
    </>
  );
}

export default ManageTeamTable;
