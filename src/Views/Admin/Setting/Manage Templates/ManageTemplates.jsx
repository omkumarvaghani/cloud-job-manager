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
import {
  Table,
  CardFooter,
  CardBody,
  Card,
  CardHeader,
  Label,
  Input,
} from "reactstrap";
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
  WhiteLoaderComponent,
} from "../../../../components/Icon/Index.jsx";
import {
  FormGroup,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { withStyles } from "@mui/material/styles";

import { Row, Col } from "react-bootstrap";
import showToast from "../../../../components/Toast/Toster.jsx";
import { Typography } from "@mui/material";
import BlueButton from "../../../../components/Button/BlueButton.jsx";
import styled from "styled-components";
import toast from "react-hot-toast";
import Company from "../../../Superadmin/Company/Index.jsx";

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
  const [accessType, setAccessType] = useState(null);

  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const toggleDropdown = (email) => {
    setActiveDropdown(activeDropdown === email ? null : email);
  };

  const CustomSwitch = styled(Switch)(({ theme }) => ({
    "& .MuiSwitch-switchBase": {
      color: "#ffffff",
      "&.Mui-checked": {
        color: "#152B51",
      },
      "&.Mui-checked + .MuiSwitch-track": {
        backgroundColor: "#152B51",
      },
    },
  }));

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
        setLoader(true);
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
      } finally {
        setLoader(false);
      }
    },
  });

  const sendMail = async (WorkerId) => {
    const willSendMail = await swal(
      "Are you sure you want to send the email?",
      {
        buttons: ["No", "Yes"],
      }
    );

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
        <Grid
          className="bg-blue-color text-white-color"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            padding: "10px",
          }}
        >
          {user?.FullName?.split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("")}
        </Grid>,
        `${user?.FullName}`,
        user?.EmailAddress,
        moment(user?.createdAt).format("ll"),
        <Grid
          style={{
            color: user?.IsActive ? "green" : "red",
            fontWeight: 700,
          }}
        >
          {user?.IsActive ? "Active" : "Deactive"}
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
  const [age, setAge] = React.useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  const [eventsData, setEventsData] = useState([]);
  const companyId = localStorage?.getItem("CompanyId");
  const fetchData = async () => {
    if (companyId) {
      try {
        const response = await AxiosInstance.get(
          `/template/settings/${companyId}`
        );
        if (response?.data.statusCode === 200) {
          setEventsData(response?.data.templates);
        } else {
          setEventsData([]);
        }
      } catch (error) {
        console.error("Error: ", error);
        setEventsData([]);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const handleSelectChange = (event, itemIndex) => {
    const selectedTemplateName = event.target.value;
    setEventsData((prevData) =>
      prevData.map((item, index) => {
        if (index === itemIndex) {
          return {
            ...item,
            templates: item.templates.map((template) => ({
              ...template,
              IsActive: template.Name === selectedTemplateName,
            })),
            selectedTemplateId: item.templates.find(
              (template) => template.Name === selectedTemplateName
            )?.TemplateId,
          };
        }
        return item;
      })
    );
  };

  const handleToggle = async (currentStatus, itemIndex) => {
    try {
      setEventsData((prevData) => {
        const updatedEventsData = prevData.map((item, index) =>
          index === itemIndex ? { ...item, is_enabled: currentStatus } : item
        );

        return updatedEventsData;
      });
    } catch (error) {
      console.error("Error updating mail preference:", error);
    }
  };

  const saveChanges = async () => {
    try {
      let enabledArray = {};
      setLoader(true);
      for (const item of eventsData) {
        if (item.selectedTemplateId) {
          await AxiosInstance.put(
            `/template/settings/${item.selectedTemplateId}`,
            {
              IsActive: true,
            }
          );
        }
        enabledArray[item.type] = item.is_enabled;
      }

      const response = await AxiosInstance.put(`/mailPreference`, {
        CompanyId: localStorage.getItem("CompanyId"),
        enabledArray: enabledArray,
      });
      if (response.status === 200) {
        toast.success("Templates saved!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
      fetchData();
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {loader ? (
        <Grid
          className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
          style={{
            textAlign: "center",
            alignItems: "center",
            marginTop: "25%",
            // width:"100vh",
            height: "70vh",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <LoaderComponent loader={loader} height="50" width="50" />
        </Grid>
      ) : (
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
                        className="text-blue-color page-heading mb-5"
                        style={{
                          fontSize: "27px",
                          fontWeight: "700",
                          lineHeight: "28px",
                          marginTop: "5%",
                          textDecoration: "underline",
                        }}
                      >
                        Manage Templates
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <SettingDropdown
                  isOpenDropDown={isOpenDropDown}
                  toggle={toggle}
                  companyName={companyName}
                />
                <Grid className=" settings-menu  mb-3">
                  <>
                    <Grid className=" mt-3 template-dropdown-select">
                      {eventsData?.length > 0 &&
                        eventsData.map((item, itemIndex) => (
                          <Row
                            style={{ justifyContent: "start" }}
                            key={itemIndex}
                          >
                            <Col
                              xl={4}
                              ms={4}
                              sm={12}
                              className="mb-3 manage-account-bottom"
                            >
                              <Grid
                                style={{
                                  display: "flex",
                                  flexDirection: "colum",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  class="form-checkbox border-blue-color"
                                  id="form-checkbox"
                                  checked={
                                    item.is_enabled ? item.is_enabled : false
                                  }
                                  onChange={(e) =>
                                    handleToggle(e.target.checked, itemIndex)
                                  }
                                  // style={{boxShadow: ""}}
                                ></input>

                                <label
                                  className="form-control-label fontstylerentr titleecolor fontfamilysty"
                                  htmlFor="email-type"
                                  style={{
                                    fontWeight: "600",
                                    fontSize: "16px",
                                    width: "300px",
                                    marginTop: "8px",
                                  }}
                                >
                                  {item?.type}
                                </label>
                              </Grid>
                            </Col>
                            <Col
                              xl={6}
                              ms={6}
                              sm={12}
                              className="template-dropdown"
                            >
                              <Select
                                labelId="user-select-label"
                                id="user-select"
                                value={
                                  item?.templates.find((elem) => elem.IsActive)
                                    ?.Name || ""
                                }
                                onChange={(e) =>
                                  handleSelectChange(e, itemIndex)
                                }
                                displayEmpty
                                renderValue={(selected) =>
                                  selected || "Select Template"
                                }
                                disabled={!item.is_enabled}
                                style={{ width: "65%" }}
                                className="border-blue-color border-blue-color text-blue-color template-dropdown-select"
                         
                              >
                                {item?.templates?.length > 0 ? (
                                  item.templates.map((elem, index) => (
                                    <MenuItem
                                      className="border-blue-color"
                                      key={index}
                                      value={elem.Name}
                                    >
                                      <ListItemText
                                        primary={elem?.Name || ""}
                                      />
                                    </MenuItem>
                                  ))
                                ) : (
                                  <MenuItem
                                    onClick={() => {
                                      navigate(
                                        `/${companyName}/add-templates`,
                                        {
                                          state: {
                                            navigats: [
                                              ...location?.state?.navigats,
                                              "/add-templates",
                                            ],
                                          },
                                        }
                                      );
                                    }}
                                  >
                                    <ListItemText primary="Add Template" />
                                  </MenuItem>
                                )}
                              </Select>
                            </Col>
                          </Row>
                        ))}
                      <Grid>
                        {/* <BlueButton
                        onClick={saveChanges}
                        label="Save"
                        className="my-3"
                      /> */}
                        <BlueButton
                          className="mt-3 bg-button-blue-color"
                          type="submit"
                          style={{ color: "white" }}
                          onClick={saveChanges}
                          label={
                            loader ? (
                              <WhiteLoaderComponent
                                height="20"
                                width="20"
                                padding="20"
                                loader={loader}
                              />
                            ) : (
                              "Save"
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </>
                </Grid>
              </Grid>
            </Col>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default ManageTeamTable;
