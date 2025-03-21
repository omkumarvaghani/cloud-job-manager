import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  FormControl,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import AxiosInstance from "../../../AxiosInstance.jsx";
import IconButton from "@mui/material/IconButton";
import {
  Card,
  Dropdown,
  DropdownItem,
  Navbar,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Table,
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { Circles } from "react-loader-spinner";
import SettingSidebar from "../../../../components/Setting/SettingSidebar.jsx";
import profilrSec from "../../../../assets/image/icons/profile-img.svg";
import profileIcon from "../../../../assets/image/icons/profile-icon.jpg";
import { InputLabel, Select, MenuItem, Divider } from "@mui/material";
import { Country, State } from "country-state-city";
import sliderindicator from "../../../../assets/image/icons/sliderindicator.svg";
import { ColorRing } from "react-loader-spinner";
import MenuIcon from "@mui/icons-material/Menu";
import InputText from "../../../../components/InputFields/InputText.jsx";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap"; 
import showToast from "../../../../components/Toast/Toster.jsx";
import  {Typography} from "@mui/material";
import WhiteButton from "../../../../components/Button/WhiteButton.jsx";
import { border } from "@mui/system";
import BlueButton from "../../../../components/Button/BlueButton.jsx";


const Industry = () => {
  const cdnUrl = process.env.REACT_APP_CDN_API;

  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_BASE_API;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [profile, setProfile] = useState("");
  const [loader, setLoader] = useState(true);
  const [initialProfile, setInitialProfile] = useState({});
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const adminId = localStorage.getItem("admin_id");

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/admin/profile/${adminId}`);
      setProfile(res?.data?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [adminId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setIsProfileChanged(true);
  };

  const [profileImage, setProfileImage] = useState("");
  const [postLoader, setPostLoader] = useState(false);
  const handleSave = async () => {
    try {
      setPostLoader(true);
      const updatedProfile = { ...profile, profile: uploadedImageUrl };
      const res = await AxiosInstance.put(
        `${baseUrl}/admin/profile/${adminId}`,
        updatedProfile
      );
      if (res?.data?.statusCode === 200) {
        showToast.success(res?.data?.message);
        setIsProfileChanged(false);
        getData();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setPostLoader(false);
    }
  };

  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState([]);
  const [state, setState] = useState([]);

  useEffect(() => {
    const countriesData = Country.getAllCountries();

    const statesData = countriesData.flatMap((country) => {
      return State?.getStatesOfCountry(country?.isoCode);
    });

    const uniqueCountries = countriesData.map((country) => country?.name);
    const uniqueStates = Array.from(
      new Set(statesData?.map((state) => state?.name))
    );

    setCountries(uniqueCountries);
    setStates(uniqueStates);
  }, []);

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("files", file);
      const url = `${cdnUrl}/upload`;

      const result = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const image = result?.data?.files[0]?.filename;
      setUploadedImageUrl(image);
    } catch (error) {
      console.error(error, "imgs");
      throw new Error("Image upload failed");
    }
  };

  const handleFileChange = (event) => {
    const file = event?.target?.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const { CompanyName } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const toggle = () => setIsOpenDropDown(!isOpenDropDown);

  const [selectedRole, setSelectedRole] = useState("Restricted Worker");

  const handleCheckboxChange = (event) => {
    setSelectedRole(event?.target?.value);
  };
  const [selectedSchedule, setSelectedSchedule] = useState("Schedule");

  const handleScheduleCheckboxChange = (event) => {
    setSelectedSchedule(event?.target?.value);
  };
  const [selectedTime, setSelectedTime] = useState("Time");

  const handleTimeCheckboxChange = (event) => {
    setSelectedTime(event?.target?.value);
  };
  const [selectedNotes, setSelectedNotes] = useState("Time");

  const handleNotesCheckboxChange = (event) => {
    setSelectedNotes(event?.target?.value);
  };
  const [selectedExpenses, setSelectedExpenses] = useState("Time");

  const handleExpensesCheckboxChange = (event) => {
    setSelectedExpenses(event?.target?.value);
  };
  const [selectedCustomers, setSelectedCustomers] = useState("Time");

  const handleCustomersCheckboxChange = (event) => {
    setSelectedCustomers(event?.target?.value);
  };
  const [selectedContracts, setSelectedContracts] = useState("Time");

  const handleContractsCheckboxChange = (event) => {
    setSelectedContracts(event?.target?.value);
  };
  const [selectedInvitation, setSelectedInvitation] = useState("Time");

  const handleInvitationCheckboxChange = (event) => {
    setSelectedInvitation(event?.target?.value);
  };

  return (
    <>
      <Grid className="manage-team" style={{ display: "flex" }}>
        <Col className="col-2 h-100 hiren" xl={2}>
          <SettingSidebar />
        </Col>
        <Divider
          className="divider-manageteam border-blue-color"
          orientation="vertical"
          flexItem
          style={{
            marginLeft: "-30px",
            marginRight: "2%",
            marginTop: "-30px",
            borderRight: "2px solid ",
            height: "auto",
            width: "10px",
          }}
        />
        <Navbar
          className="navbar-setting"
          style={{
            zIndex: "9",
            borderRadius: "5px",
            display: "block",
          }}
        >
          <Dropdown
            className="dropdown menus"
            isOpen={isOpenDropDown}
            toggle={toggle}
            style={{ width: "100%" }}
          >
            <DropdownToggle
              style={{
                background: "#E88C44",
                border: "none",
                color: "#FFFF",
              }}
            >
              <IconButton>
                <MenuIcon style={{ color: "#FFFF" }} />
              </IconButton>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem>
                <Typography style={{ fontWeight: 600, marginBottom: "10px" }}>
                  BUSINESS <br /> MANAGEMENT
                </Typography>
              </DropdownItem>
              <DropdownItem>
                <Grid className="d-flex flex-column">
                  <Grid
                    className="sidebar-link-setting"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate(`/${CompanyName}/materials&labor`, {
                        state: { navigats: ["/index", "/materials&labor"] },
                      });
                    }}
                  >
                    Materials & Labor 
                  </Grid>
                  <Grid
                    className="sidebar-link-setting"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate(`/${CompanyName}/profile`, {
                        state: { navigats: ["/index", "/profile"] },
                      });
                    }}
                  >
                    Managr Team
                  </Grid>
                </Grid>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Navbar>

        <Col className="col-10" xl={10}>
          <Grid className="d-flex justify-content-between">
            <Typography className="text-blue-color heading-three">
              <Typography className="bold-text">James Anderson</Typography>
            </Typography>
          </Grid>
          <Card
            style={{
              padding: "40px",
              marginTop: "10px",
              borderRadius: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Row className="row">
              <Col className="d-flex col-lg-8 order-2 order-lg-1" lg={8}>
                <Grid>
                  <InputText
                    value={profile?.full_name}
                    onChange={handleChange}
                    name="full_name"
                    id="full_name"
                    placeholder="Enter full name"
                    label="Full Name"
                    type="text"
                    className="mb-3 my-2"
                    multiline
                    rows={4}
                  />
                  <InputText
                    value={profile?.email}
                    onChange={handleChange}
                    name="email"
                    id="email"
                    placeholder="Enter email address"
                    label="Email Address"
                    type="text"
                    className="mb-3 my-2"
                  />
                  <InputText
                    value={profile?.phone_number}
                    onChange={handleChange}
                    name="phone_number"
                    id="phone_number"
                    placeholder="Enter mobile number"
                    label="Mobile Number"
                    type="number"
                    className="mb-3 my-2"
                  />
                  {/* Street Address */}
                  <InputText
                    value={profile?.street_address || ""}
                    onChange={handleChange}
                    name="treet_address"
                    id="treet_address"
                    placeholder="Enter street address"
                    label="Street Address"
                    type="text"
                    className="mb-3 my-2"
                  />
                  <Grid className="d-flex gap-4">
                    <InputText
                      value={profile?.city}
                      onChange={handleChange}
                      name="city"
                      id="city"
                      placeholder="Enter city"
                      label="City"
                      type="text"
                      className="mb-3 my-2"
                    />
                    <FormControl className="mb-3 my-2" fullWidth>
                      <Autocomplete
                        options={states}
                        getOptionLabel={(option) => option || ""}
                        value={profile?.state || ""}
                        onChange={(_, newValue) => {
                          setProfile((prevState) => ({
                            ...prevState,
                            state: newValue,
                          }));
                          setIsProfileChanged(true);
                        }}
                        renderInput={(params) => (
                          <InputText
                            value={profile?.state}
                            onChange={handleChange}
                            name="state"
                            id="state"
                            placeholder="Select state"
                            label="state"
                            type="text"
                          />
                        )}
                        filterOptions={(options, state) =>
                          options.filter((option) =>
                            option
                              .toLowerCase()
                              .includes(state.inputValue.toLowerCase())
                          )
                        }
                        noOptionsText="No matching item"
                      />
                    </FormControl>
                  </Grid>

                  <Grid className="d-flex gap-4">
                    <InputText
                      value={profile?.zip_code}
                      onChange={handleChange}
                      name="zip_code"
                      id="zip_code"
                      placeholder="Enter zip code"
                      label="ZIP Code"
                      type="number"
                      className="mb-3 my-2"
                    />
                    {/* Country */}
                    <FormControl className="mb-3 my-2" fullWidth>
                      <Autocomplete
                        options={countries}
                        getOptionLabel={(option) => option || ""}
                        value={profile?.country || ""}
                        onChange={(_, newValue) => {
                          setProfile((prevState) => ({
                            ...prevState,
                            country: newValue,
                          }));
                          setIsProfileChanged(true);
                        }}
                        renderInput={(params) => (
                          <InputText
                            value={profile?.country}
                            onChange={handleChange}
                            name="Country"
                            id="Country"
                            placeholder=" Enter select country"
                            label="Country"
                            type="text"
                            className="mb-3 my-2"
                          />
                        )}
                        filterOptions={(options, state) =>
                          options.filter((option) =>
                            option
                              .toLowerCase()
                              .includes(state.inputValue.toLowerCase())
                          )
                        }
                        noOptionsText="No matching item"
                      />
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Personal Information */}
                <Divider
                  orientation="vertical"
                  flexItem
                  className="d-none d-lg-block"
                  style={{
                    marginLeft: "20%",
                    marginRight: "3%",
                    border: "0.5px solid",
                  }}
                />
              </Col>

              <Col className="col-lg-4 d-flex justify-content-center align-items-center flex-column order-1 order-lg-2 mb-2" lg={4}>
                <Grid
                  className="text-center "
                  style={{ marginTop: "0px", marginBottom: "30px" }}
                >
                  <Typography
                    className="text-blue-color"
                    style={{
                      fontSize: "30px",
                      fontWeight: "600",
                    }}
                  >
                    Personal Information 
                  </Typography> 
                </Grid>

                <Grid
                  className="text-center"
                  style={{ marginTop: "0px", marginBottom: "30px" }}
                >
                  <Grid
                    className="d-flex bg-blue-color justify-content-center align-items-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50px",
                      boxShadow: "0 4px 5px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    <img
                      src={
                        profile?.profile
                          ? `${cdnUrl}/upload/${profile?.profile}`
                          : uploadedImageUrl
                          ? `${cdnUrl}/upload/${uploadedImageUrl}`
                          : profileIcon
                      }
                      alt="Profile"
                      style={{
                        borderRadius: "50%",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid>
                  <label htmlFor="upload-button">
                    <WhiteButton
                      component="Typography" 
                      className="border-blue-color text-blue-color"
                      style={{
                        textTransform: "none",
                        border: "1px solid ",
                        marginTop: "20px",
                        fontSize: "12px",
                        cursor: "pointer", 
                        padding: "8px 16px",
                        borderRadius: "4px", 
                        border:"none"
                      }}
                      label="Upload image here..."
                    />
                  </label>
                  <Input
                    id="upload-button"
                    type="file"
                    accept="image/*" 
                    style={{ display: "none" }}
                    onChange={(e) => {
                      handleChange(e); 
                      handleFileChange(e);
                    }}
                  />
                </Grid>

                <Grid style={{ marginTop: "40px" }}>
                  <Typography
                    className="text-blue-color"
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "400",
                    }}
                  >
                    Use this form to update your personal information. Ensure
                    all details are accurate and up-to-date.
                  </Typography>
                </Grid>
                <Grid>
                  <img src={sliderindicator} />
                </Grid>
              </Col>
            </Row>
            <Typography
              className="text-blue-color"
              style={{ fontWeight: 700, fontSize: "18px" }}
            >
              Labor Cost
            </Typography>
            <Col className="d-flex gap-4 col-3" xl={3}>
              <InputText
                value={profile.country}
                onChange={handleChange}
                name="employee_cost"
                id="employee_cost"
                placeholder="Enter employee cost"
                label="Employee Cost"
                type="number"
                className="mb-3 my-2"
              />
            </Col>

            <Grid>
              <Typography
                className="text-blue-color mb-2 my-4"
                style={{ fontWeight: 700, fontSize: "18px" }}
              >
                Availability for online appointments
              </Typography>
              <Typography className="text-blue-color mb-2" style={{ fontSize: "14px" }}>
                Availability is currently limited to online bookings. Ensure
                team members are only bookable when they have set their
                availability.
              </Typography>

              <Col className="col-3 my-5" xl={3}>
                <Table borderless>
                  <TableHead>
                    <TableRow >
                      <TableHead >Sunday</TableHead >
                      <TableCell >Unavailable</TableCell >
                    </TableRow >
                    <TableRow >
                      <TableHead >Monday</TableHead >
                      <TableCell >Monday</TableCell >
                    </TableRow >{" "}
                    <TableRow >
                      <TableHead >Tuesday</TableHead >
                      <TableCell >Tuesday</TableCell >
                    </TableRow >{" "}
                    <TableRow >
                      <TableHead >Wednesday</TableHead >
                      <TableCell >Wednesday</TableCell >
                    </TableRow >{" "}
                    <TableRow >
                      <TableHead >Thursday</TableHead >
                      <TableCell >Thursday</TableCell >
                    </TableRow >{" "}
                    <TableRow >
                      <TableHead >Friday</TableHead >
                      <TableCell >Friday</TableCell >
                    </TableRow >
                    <TableRow >
                      <TableHead >Saturday</TableHead >
                      <TableCell >Saturday</TableCell >
                    </TableRow >
                  </TableHead>
                  <tbody></tbody>
                </Table>
              </Col>
            </Grid>
          </Card>
          <Card
            style={{
              padding: "40px",
              marginTop: "10px",
              borderRadius: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Typography
              style={{ fontWeight: 700, fontSize: "22px" }}
              className="text-blue-color mb-2"
            >
              Communications
            </Typography>
            <Typography style={{ fontWeight: 700 }} className="text-blue-color">
              Email subscriptions
            </Typography>

            <Grid className="d-flex gap-2">
              <Input
                type="checkbox"
                className="border-blue-color"
                style={{ height: "15px", width: "15px", marginTop: "7px" }}
                value="Manager"
                defaultChecked={true}
              />
              <Label check className="ml-2">
                <Typography className="text-blue-color" style={{ fontSize: "14px" }}>
                  Surveys
                </Typography>
                <Typography
                  className="text-blue-color"
                  style={{
                    fontSize: "10px",
                  }}
                >
                  Receive occasional surveys to tell us how we're doing
                </Typography>
              </Label>
            </Grid>
            <Grid className="d-flex gap-2">
              <Input
                type="checkbox"
                className="border-blue-color"
                style={{ height: "15px", width: "15px", marginTop: "7px" }}
                value="Manager"
                defaultChecked={true}
              />
              <Label check className="ml-2">
                <Typography className="text-blue-color" style={{ fontSize: "14px" }}>
                  Error Messages
                </Typography>
                <Typography
                  className="text-blue-color"
                  style={{
                    fontSize: "10px",
                  }}
                >
                  Get notified of warnings and errors in Jobber (E.g.
                  Undeliverable client emails or QuickBooks Online sync errors)
                </Typography>
              </Label>
            </Grid>
          </Card>
          <Card
            style={{
              padding: "40px",
              marginTop: "10px",
              borderRadius: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Typography style={{ fontWeight: 700 }} className="text-blue-color">
              Permissions
            </Typography>

            <Grid className="d-flex gap-2">
              <Input
                type="checkbox"
                className="border-blue-color"
                style={{ height: "15px", width: "15px", marginTop: "7px" }}
                defaultChecked={true}
                disabled
              />
              <Label check className="ml-2">
                <Typography className="text-blue-color" style={{ fontSize: "14px" }}>
                  Make Asministrator
                </Typography>
                <Typography
                  className="text-blue-color"
                  style={{
                    fontSize: "10px",
                  }}
                >
                  Account owners are administrators with full permissions.
                  Adjust permissions by transferring account ownership to
                  another administrator.
                </Typography>
              </Label>
            </Grid>
          </Card>

          <Grid className="text-end">
            <BlueButton
              className="save-profile-btn my-5 text-white-color bg-button-blue-color"
              style={{
                fontSize: "16px",
                textTransform: "none",
              }}
              label= {postLoader ? (
                <ColorRing
                  height="30"
                  colors={["#fff", "#fff", "#fff", "#fff", "#fff"]}
                  ariaLabel="circles-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              ) : (
                "Save my Profile"
              )}
            />
          </Grid>
        </Col>
      </Grid>
    </>
  );
};

export default Industry;
