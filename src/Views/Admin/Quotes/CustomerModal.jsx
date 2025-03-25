import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DomainAddOutlinedIcon from "@mui/icons-material/DomainAddOutlined";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AxiosInstance from "../../AxiosInstance";
import QuoteUser from "../../../assets/Blue-sidebar-icon/Customermodel.svg";
import "./style.css";
import { Grid } from "@mui/material";
import { LoaderComponent } from "../../../components/Icon/Index";
import InputText from "../../../components/InputFields/InputText";

const CustomerModal = ({
  isCustomer,
  setIsCustomer,
  isProperty,
  setIsProperty,
  setFieldValue,
  values,
  lineItems,
  setPropertyData,
  setCustomersData,
  formik,
  source,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [customerData, setCustomerData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loader, setLoader] = useState(true);
  const [CompanyId, setCompanyId] = useState();

  const fetchTokenData = async () => {
    if (!CompanyId) {
      try {
        const token =
          localStorage?.getItem("adminToken") ||
          localStorage?.getItem("workerToken");

        if (!token) {
          console.error("Token not found in localStorage");
          return;
        }
        const res = await AxiosInstance.post(`/v1/auth/token_data`, {
          token,
        });
        if (res?.data?.data?.CompanyId) {
          setCompanyId(res?.data?.data?.CompanyId);
        }
      } catch (error) {
        console.error("Error:", error?.message);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, []);

  const handleClose = (id) => {
    const isStaffMember = location?.pathname?.includes("/staff-member");

    const newPath = isStaffMember
      ? `/staff-member/workerinvoicetable`
      : `/${CompanyName}/invoicetable`;

    navigate(newPath, {
      state: {
        UserId: id,
        navigats: [...location?.state?.navigats, newPath],
      },
    });
  };

  const fetchData = async () => {
    try {
      setLoader(true);
      const res = await AxiosInstance.get(`/v1/user/get_customer/${CompanyId}`);
      if (res?.data?.statusCode === 200) {
        // Normalize data structure to ensure locations is always an array
        const normalizedData = res?.data?.data.map((customer) => {
          // Handle cases where location might be single object or array
          let locations = [];
          if (customer.location) {
            locations = Array.isArray(customer.location)
              ? customer.location
              : [customer.location];
          }
          return {
            ...customer,
            locations,
          };
        });
        setCustomerData(normalizedData);
      }
    } catch (error) {
      console.error("Error: ", error?.message);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [CompanyId]);

  useEffect(() => {
    if (
      formik?.values?.UserId &&
      formik?.values?.LocationId &&
      customerData?.length > 0
    ) {
      const customer = customerData.find(
        (item) => item?.UserId === formik?.values?.UserId
      );
      if (customer) {
        setCustomersData(customer);
        const location = customer.locations.find(
          (loc) => loc?.LocationId === formik?.values?.LocationId
        );
        if (location) {
          setPropertyData(location);
        }
      }
    }
  }, [formik?.values, customerData]);

  const filteredCustomers = !isProperty
    ? customerData?.filter((customer) => {
        const firstLocation = customer.locations[0] || {};
        return `${firstLocation.FirstName || ""} ${
          firstLocation.LastName || ""
        }`
          .toLowerCase()
          .includes(searchInput?.toLowerCase());
      })
    : locationData?.filter((location) =>
        `${location?.Address || ""} ${location?.City || ""} ${
          location?.State || ""
        } ${location?.Country || ""}`
          .toLowerCase()
          .includes(searchInput?.toLowerCase())
      );

  const handleCustomerClick = (customer) => {
    // Always show properties selection, even if only one property
    setLocationData(customer.locations);
    setFieldValue("UserId", customer.UserId);
    setCustomersData(customer);
    setIsProperty(true);
  };

  const handleLocationClick = (location) => {
    setFieldValue("LocationId", location.LocationId);
    setPropertyData(location);
    setIsProperty(false);
    setIsCustomer(false);

    if (source === "Invoice") {
      handleClose(location.UserId);
    }
  };

  useEffect(() => {
    const updateData = () => {
      if (location?.state?.UserId) {
        setFieldValue("UserId", location?.state?.UserId);
      }

      if (location?.state?.Customer) {
        const customer = location?.state?.Customer;
        // Ensure locations is an array
        let locations = [];
        if (customer.location) {
          locations = Array.isArray(customer.location)
            ? customer.location
            : [customer.location];
        }

        setCustomersData({ ...customer, locations });
        setFieldValue("UserId", customer.UserId);

        setLocationData(locations);
        setIsCustomer(true);
        setIsProperty(true);
      }
    };

    updateData();
  }, [location?.state?.UserId]);

  useEffect(() => {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      formik.setValues(JSON.parse(savedData));
    }
  }, []);

  return (
    <Dialog
      open={isCustomer}
      onClose={() => {
        setIsCustomer(false);
        setIsProperty(false);
      }}
      style={{ height: "100%" }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="text-blue-color SelectCutomerHead">
        {isProperty ? "Select Property" : "Select Customer"}
        <Typography
          gutterBottom
          className="px-3 pt-3 text-blue-color SelectCutomerLike"
        >
          {isProperty ? "Please select a property" : "Please select a customer"}
        </Typography>
      </DialogTitle>
      <DialogContent className="selectCustomer_box">
        <IconButton
          aria-label="close"
          onClick={() => {
            setIsCustomer(false);
            setIsProperty(false);
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          className="mx-3"
          sx={{
            border: "1px solid rgba(6, 49, 100, 80%)",
            borderRadius: "5px",
          }}
        >
          {loader ? (
            <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
              <LoaderComponent loader={loader} height="50" width="50" />
            </Grid>
          ) : (
            <DialogContent style={{ border: 0 }}>
              <Grid
                className="mb-3 selectcreatebtns clientSerach_createNew"
                style={{ display: "flex", flexWrap: "wrap" }}
              >
                <Grid
                  className="flex-grow-1 me-2 mb-2 searchClients"
                  style={{ minWidth: "0", width: "150px" }}
                >
                  <InputText
                    id="search"
                    name="search"
                    placeholder={
                      isProperty
                        ? "Search properties..."
                        : "Search customers..."
                    }
                    type="text"
                    className="text-blue-color border-blue-color customerModelSearch"
                    style={{ fontSize: "14px" }}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </Grid>
                {!isProperty && (
                  <>
                    <Grid className="selectCustomerMOdel">
                      <Typography
                        className="mt-2 mb-2 selectCustomerOr text-blue-color"
                        style={{ textAlign: "center" }}
                      >
                        or
                      </Typography>
                    </Grid>
                    <Grid
                      className="btn bg-button-blue-color text-white-color flex-grow-1 ms-2 mb-2 cratenclientmodal searchClients createNewCutomer"
                      style={{
                        minWidth: "0",
                        fontSize: "14px",
                        height: "40px",
                        justifyContent: "start",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onClick={() => {
                        localStorage.setItem(
                          "formData",
                          JSON.stringify(values)
                        );
                        navigate(`/${CompanyName}/add-customer`, {
                          state: {
                            previewPage: location?.pathname,
                            previewData: {
                              values,
                              lineItems,
                              id: location?.state?.id || null,
                            },
                            navigats: [
                              ...location?.state?.navigats,
                              "/add-customer",
                            ],
                          },
                        });
                      }}
                    >
                      Create New Customer
                    </Grid>
                  </>
                )}
              </Grid>

              {filteredCustomers?.length === 0 && (
                <Grid
                  className="text-center mt-3 text-blue-color"
                  style={{ fontSize: "14px" }}
                >
                  No {isProperty ? "properties" : "customers"} found
                </Grid>
              )}

              {filteredCustomers?.length > 0 && (
                <>
                  <Typography
                    className="mt-2 leadSelectCustomer"
                    style={{
                      paddingLeft: "30px",
                      color: "#07CF10",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Active
                  </Typography>
                  <Grid
                    style={{
                      marginLeft: "-15px",
                      marginRight: "-15px",
                      marginTop: "-10px",
                    }}
                  >
                    <hr style={{ border: "1px solid #063164CC" }} />
                  </Grid>
                </>
              )}

              {!isProperty
                ? filteredCustomers?.map((customer, index) => {
                    const firstLocation = customer.locations[0] || {};
                    return (
                      <Grid
                        className="w-100 mt-3 d-flex justify-content-between text-blue-color customerMOdelUserName"
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCustomerClick(customer)}
                      >
                        <Grid style={{ width: "8%" }}>
                          <img
                            src={QuoteUser}
                            className="customerModelUserIcon"
                            alt="Customer"
                          />
                        </Grid>
                        <Grid
                          className="w-100 d-flex justify-content-between propertydetailsmodal"
                          style={{ fontSize: "14px" }}
                        >
                          <Grid className="px-2 w-100 customerDetailAddress">
                            <Typography
                              className="py-0 my-0"
                              style={{ fontSize: "12px" }}
                            >
                              {firstLocation.FirstName} {firstLocation.LastName}
                            </Typography>
                            {customer.locations.length}{" "}
                            {customer.locations.length === 1
                              ? "Property"
                              : "Properties"}{" "}
                            | {firstLocation.PhoneNumber}
                          </Grid>
                        </Grid>
                      </Grid>
                    );
                  })
                : locationData?.map((location, index) => (
                    <Grid
                      key={index}
                      className="py-2 text-blue-color border-blue-color property-item"
                      style={{
                        borderTop: index !== 0 ? "1px solid #eee" : undefined,
                        display: "flex",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        alignItems: "center",
                        padding: "12px 16px",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                      onClick={() => handleLocationClick(location)}
                    >
                      <Grid className="d-flex align-items-center w-100">
                        <Grid style={{ width: "8%", marginRight: "12px" }}>
                          <DomainAddOutlinedIcon style={{ color: "#063164" }} />
                        </Grid>
                        <Grid style={{ flex: 1 }}>
                          <Typography
                            style={{ fontWeight: 500, fontSize: "14px" }}
                          >
                            {location.Address || "No address"}
                          </Typography>
                          <Typography
                            style={{ fontSize: "12px", color: "#666" }}
                          >
                            {[location.City, location.State, location.Country]
                              .filter(Boolean)
                              .join(", ")}
                          </Typography>
                        </Grid>
                      </Grid>
                      <ChevronRightIcon style={{ color: "#958e8e" }} />
                    </Grid>
                  ))}
            </DialogContent>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerModal;
