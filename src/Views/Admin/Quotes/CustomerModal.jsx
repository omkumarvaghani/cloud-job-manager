import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Grid,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DomainAddOutlinedIcon from "@mui/icons-material/DomainAddOutlined";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AxiosInstance from "../../AxiosInstance";
import QuoteUser from "../../../assets/Blue-sidebar-icon/Customermodel.svg";
import "./style.css";
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
  const locations = useLocation();
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
    const isStaffMember = locations?.pathname?.includes("/staff-member");

    const newPath = isStaffMember
      ? `/staff-member/workerinvoicetable`
      : `/${CompanyName}/invoicetable`;

    navigate(newPath, {
      state: {
        UserId: id,
        navigats: [...locations?.state?.navigats, newPath],
      },
    });
  };

  const fetchData = async () => {
    try {
      setLoader(true);
      const res = await AxiosInstance.get(
        `/v1/customer/get_customer/${CompanyId}`
      );

      if (res?.data?.statusCode === 200) {
        const normalizedData = res?.data?.data.map((customer) => {
          // Ensure locations is always an array, even if empty
          const locations = customer.locations
            ? Array.isArray(customer.locations)
              ? customer.locations
              : [customer.locations]
            : [];

          return {
            ...customer,
            locations,
            FirstName: customer.FirstName || "",
            LastName: customer.LastName || "",
            PhoneNumber: customer.PhoneNumber || "",
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
    if (CompanyId) {
      fetchData();
    }
  }, [CompanyId]);

  useEffect(() => {
    if (
      formik?.values?.UserId &&
      formik?.values?.LocationId &&
      customerData?.length > 0
    ) {
      const data = customerData.find(
        (item) => item?.UserId === formik?.values?.UserId
      );
      if (data) {
        setCustomersData(data);
        console.log(data, "datadatadata");
        const locations = data?.locations?.find(
          (item) => item?.LocationId === formik?.values?.LocationId
        );
        if (locations) {
          setPropertyData(locations);
        }
      }
    }
  }, [formik?.values, customerData]);

  const filteredCustomers = !isProperty
    ? customerData?.filter((customer) =>
        `${customer?.FirstName || ""} ${customer?.LastName || ""}`
          .toLowerCase()
          .includes(searchInput?.toLowerCase())
      )
    : [
        ...new Map(
          locationData?.map((locations) => [
            `${locations?.Address || ""}-${locations?.City || ""}-${
              locations?.State || ""
            }-${locations?.Country || ""}`,
            locations,
          ])
        ).values(),
      ];

  useEffect(() => {
    const updateData = () => {
      if (locations?.state?.UserId) {
        setFieldValue("UserId", locations?.state?.UserId);
      }

      if (locations?.state?.Customer) {
        const customer = locations?.state?.Customer;
        setCustomersData(customer);
        setFieldValue("UserId", customer?.UserId);
        console.log(customer, "customercustomer");
        if (customer?.locations?.length === 1) {
          setPropertyData(customer.locations[0]);
          setFieldValue("LocationId", customer.locations[0]?.LocationId);
        } else {
          setLocationData(customer?.locations || []);
          setIsCustomer(true);
          setIsProperty(customer?.locations?.length > 0);
        }
      }
    };

    updateData();
  }, [locations?.state?.UserId]);

  useEffect(() => {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      formik.setValues(JSON.parse(savedData));
    }
  }, []);

  const handleCustomerSelect = (customer) => {
    if (!customer) return;

    setFieldValue("UserId", customer.UserId);
    setCustomersData(customer);

    if (customer?.locations?.length === 1) {
      // If only one property, select it automatically
      setPropertyData(customer.locations[0]);
      setFieldValue("LocationId", customer.locations[0]?.LocationId);
      setIsCustomer(false);
      if (source === "Invoice") {
        handleClose(customer.UserId);
      }
    } else if (customer?.locations?.length > 1) {
      // Show properties if multiple
      setLocationData(customer.locations);
      setIsProperty(true);
    } else {
      // No properties - just select the customer
      setIsCustomer(false);
      if (source === "Invoice") {
        handleClose(customer.UserId);
      }
    }
  };

  const handlePropertySelect = (property) => {
    if (!property) return;

    setFieldValue("LocationId", property.LocationId);
    setPropertyData(property);
    setIsProperty(false);
    setIsCustomer(false);

    if (source === "Invoice") {
      handleClose(property.UserId);
    }
  };

  return (
    <Dialog
      open={isCustomer}
      onClose={() => {
        setIsCustomer(false);
        setIsProperty(false);
      }}
      style={{ height: "100%" }}
    >
      <DialogTitle className="text-blue-color SelectCutomerHead">
        Select or Create a Customer
        <Typography className="px-3 pt-3 text-blue-color SelectCutomerLike">
          Which Customer would you like to create this for?
        </Typography>
      </DialogTitle>
      <DialogContent className="selectCustomer_box">
        <IconButton
          aria-label="close"
          onClick={() => {
            setIsCustomer(!isCustomer);
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
                    placeholder="Enter search customer"
                    type="text"
                    className="text-blue-color border-blue-color customerModelSearch"
                    style={{
                      fontSize: "14px",
                    }}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </Grid>
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
                    localStorage.setItem("formData", JSON.stringify(values));
                    navigate(`/${CompanyName}/add-customer`, {
                      state: {
                        previewPage: locations?.pathname,
                        previewData: {
                          values,
                          lineItems,
                          id: locations?.state?.id || null,
                        },
                        navigats: [
                          ...locations?.state?.navigats,
                          "/add-customer",
                        ],
                      },
                    });
                  }}
                >
                  Create new Customer
                </Grid>
              </Grid>

              {filteredCustomers?.length === 0 && (
                <Grid
                  className="text-center mt-3 text-blue-color"
                  style={{ fontSize: "14px" }}
                >
                  No customers found
                </Grid>
              )}

              {filteredCustomers?.length > 0 && (
                <>
                  <Typography
                    className="mt-2 leadSelectCustomer"
                    style={{
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
                    <hr style={{ border: " 1px solid #063164CC" }} />
                  </Grid>
                </>
              )}

              {!isProperty
                ? filteredCustomers?.map((item, index) => (
                    <Grid
                      className="w-100 mt-3 d-flex justify-content-between text-blue-color customerMOdelUserName"
                      key={index}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleCustomerSelect(item)}
                    >
                      <Grid style={{ width: "8%" }}>
                        <img
                          src={QuoteUser}
                          className="customerModelUserIcon"
                        />
                      </Grid>
                      <Grid
                        className="w-100 d-flex justify-content-between propertydetailsmodal"
                        style={{ fontSize: "14px" }}
                      >
                        <Grid className="px-2 w-100 customerDetailAddress">
                          <Typography
                            className="py-0 my-0"
                            style={{ fontSize: "12px", fontWeight: "bold" }}
                          >
                            {item?.FirstName} {item?.LastName}
                          </Typography>
                          <Typography
                            style={{ fontSize: "11px", color: "#666" }}
                          >
                            {item?.EmailAddress}
                          </Typography>
                          <Typography style={{ fontSize: "11px" }}>
                            {item?.locations?.length > 0 ? (
                              <>
                                {item.locations.length}{" "}
                                {item.locations.length === 1
                                  ? "Property"
                                  : "Properties"}{" "}
                                | {item?.PhoneNumber}
                              </>
                            ) : (
                              <>No properties | {item?.PhoneNumber}</>
                            )}
                          </Typography>
                          {/* Display primary address if available */}
                          {item?.locations?.length > 0 && (
                            <Typography
                              style={{ fontSize: "11px", marginTop: "4px" }}
                            >
                              Primary Address: {item.locations[0]?.Address},{" "}
                              {item.locations[0]?.City}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  ))
                : filteredCustomers?.map((locations, index) => (
                    <Grid
                      onClick={() => handlePropertySelect(locations)}
                      className="py-2 text-blue-color border-blue-color"
                      style={{
                        borderTop: index !== 0 ? "1px solid " : undefined,
                        display: "flex",
                        justifyContent: "space-between",
                        cursor: "pointer",
                      }}
                      key={index}
                    >
                      <Grid className="d-flex align-items-center w-100 secondPropertyOpen">
                        <Grid
                          style={{ width: "8%" }}
                          className="imageOfProperty"
                        >
                          <DomainAddOutlinedIcon />
                        </Grid>
                        <Grid
                          className="imageOfProperty"
                          style={{ fontSize: "13px" }}
                        >
                          <Typography style={{ fontWeight: "bold" }}>
                            {locations?.Address || "No address specified"}
                          </Typography>
                          <Typography>
                            {locations?.City || ""}
                            {locations?.City && ", "}
                            {locations?.State || ""}
                            {locations?.State && ", "}
                            {locations?.Country || ""}
                          </Typography>
                          {locations?.PostalCode && (
                            <Typography>
                              Postal Code: {locations.PostalCode}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                      <ChevronRightIcon style={{ color: "#958e8edd" }} />
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
