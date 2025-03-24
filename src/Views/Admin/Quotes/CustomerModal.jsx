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
      if (res?.data?.statusCode == 200) {
        setCustomerData(res?.data?.data);
        setLoader(false);
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
      const data = customerData.find(
        (item) => item?.UserId === formik?.values?.UserId
      );
      setCustomersData(data);
      const location = data?.location?.find(
        (item) => item?.LocationId === formik?.values?.LocationId
      );
      setPropertyData(location);
    }
  }, [formik?.values, customerData]);

  const filteredCustomers = !isProperty
    ? customerData?.filter((customer) =>
        `${customer?.FirstName} ${customer?.LastName}`
          .toLowerCase()
          .includes(searchInput?.toLowerCase())
      )
    : locationData?.filter((location) =>
        `${location?.Address} ${location?.City} ${location?.State} ${location?.Country}`
          .toLowerCase()
          .includes(searchInput?.toLowerCase())
      );

  useEffect(() => {
    const updateData = () => {
      if (location?.state?.UserId) {
        setFieldValue("UserId", location?.state?.UserId);
      }
        
      if (location?.state?.Customer) {
        setCustomersData(location?.state?.Customer);
        setFieldValue("UserId", location?.state?.Customer?.UserId);
        if (
          location?.state?.Customer?.location &&
          location?.state?.Customer?.location?.length === 1
        ) {
          setPropertyData(location?.state?.Customer);
          setFieldValue(
            "LocationId",
            location?.state?.Customer?.location[0]?.LocationId
          );
        } else {
          setLocationData(location?.state?.Customer?.location || []);
          setIsCustomer(true);
          setIsProperty(true);
        }
      }
    };

    updateData();
  }, [location?.state?.UserId]);

  useEffect(() => {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      formik.setValues(JSON.parse(savedData)); // Form data restore karna
    }
  }, []);

  return (
    <>
      <Dialog
        open={isCustomer}
        onClose={() => {
          setIsCustomer(false);
          setIsProperty(false);
        }}
        style={{ height: "100%" }}
      >
        <DialogTitle className="text-blue-color SelectCutomerHead ">
          Select or Create a Customer
          <Typography
            gutterBottom
            className="px-3 pt-3 text-blue-color SelectCutomerLike"
          >
            Which Customer would you like to create this for?
          </Typography>
        </DialogTitle>
        <DialogContent className="selectCustomer_box">
          <IconButton
            aria-label="close "
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
              <DialogContent Grididers style={{ border: 0 }}>
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
                      // Form data ko Local Storage me save karna
                      localStorage.setItem("formData", JSON.stringify(values));

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
                        color: "blue",
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
                      <hr style={{ border: " 1px solid #063164CC" }} />
                    </Grid>
                  </>
                )}

                {!isProperty
                  ? filteredCustomers?.length > 0 &&
                    filteredCustomers?.map((item, index) => (
                      <Grid
                        className="w-100 mt-3 d-flex justify-content-between text-blue-color customerMOdelUserName"
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          if (item?.location?.length === 1) {
                            setFieldValue("UserId", item?.UserId);
                            setFieldValue(
                              "LocationId",
                              item?.location[0]?.LocationId
                            );
                            setIsProperty(false);
                            setIsCustomer(false);
                            if (source === "Invoice") {
                              handleClose(item?.UserId);
                            }
                          } else {
                            setLocationData(
                              item?.location?.map((location) => ({
                                ...location,
                                UserId: item?.UserId,
                              }))
                            );
                            setFieldValue("UserId", item?.UserId);
                            setIsProperty(true);
                          }
                        }}
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
                              style={{ fontSize: "12px" }}
                            >
                              {item?.FirstName} {item?.LastName}
                            </Typography>
                            {item?.location?.length}{" "}
                            {item?.location?.length === 1
                              ? "Property"
                              : "Properties"}{" "}
                            | {item?.PhoneNumber}
                          </Grid>
                        </Grid>
                      </Grid>
                    ))
                  : filteredCustomers?.length > 0 &&
                    filteredCustomers?.map((location, index) => (
                      <Grid
                        onClick={() => {
                          setFieldValue("LocationId", location?.LocationId);
                          setIsProperty(false);
                          setIsCustomer(false);
                          if (source === "Invoice") {
                            handleClose(location?.UserId);
                          }
                        }}
                        className="py-2 text-blue-color border-blue-color"
                        style={{
                          borderTop: index !== 0 ? "1px solid " : undefined,
                          display: "flex",
                          justifyContent: "space-between",
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
                            style={{
                              fontSize: "13px",
                            }}
                          >
                            <span>{location?.Address || ""} </span>, &nbsp;
                            <span>{location?.City || ""} </span>, &nbsp;
                            <br />
                            <span>{location?.State || ""} </span>, &nbsp;
                            <span>{location?.Country || ""} </span>
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
    </>
  );
};

export default CustomerModal;
