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
import { Input } from "reactstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AxiosInstance from "../../AxiosInstance";
import { Circles } from "react-loader-spinner";
import { Grid } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import { Typography } from "@mui/material";

const ClientModal = ({
  isClient,
  setIsClient,
  isProperty,
  setIsProperty,
  setFieldValue,
  values,
  lineItems,
  setPropertyData,
  setClientsData,
  formik,
  source,
}) => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [clientData, setClientData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loader, setLoader] = useState(true);
  const [companyId, setCompanyId] = useState(localStorage.getItem("CompanyId"));

  const fetchTokenData = async () => {
    if (!companyId) {
      try {
        const baseUrl = process.env.REACT_APP_BASE_API;
        const token =
          localStorage?.getItem("adminToken") ||
          localStorage?.getItem("workerToken");

        if (!token) {
          console.error("Token not found in localStorage");
          return;
        }
        const res = await AxiosInstance.post(`${baseUrl}/v1/auth/token_data`, {
          token,
        });
        if (res?.data?.data?.companyId) {
          setCompanyId(res?.data?.data?.companyId);
        }
      } catch (error) {
        console.error("Error:", error?.message);
      }
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, []);

  const handleClose = (id) => {
    navigate(`/${CompanyName}/invoicetable`, {
      state: {
        CustomerId: id,
        navigats: [...location?.state?.navigats, "/invoicetable"],
      },
    });
  };

  const fetchData = async () => {
    try {
      const res = await AxiosInstance.get(`/v1/customer/customers${companyId}`);
      setClientData(res?.data?.data); 
    } catch (error) { 
      console.error("Error: ", error?.message);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  useEffect(() => {
    if (
      formik?.values?.CustomerId &&
      formik?.values?.LocationId &&
      clientData?.length > 0
    ) {
      const data = clientData.find(
        (item) => item?.CustomerId === formik?.values?.CustomerId
      );
      setClientsData(data);
      const location = data?.location?.find(
        (item) => item?.LocationId === formik?.values?.LocationId
      );
      setPropertyData(location);
      
    }
  }, [formik?.values, clientData]);

  const filteredClients = !isProperty
    ? clientData?.filter((client) =>
        `${client?.FirstName} ${client?.LastName}`
          .toLowerCase()
          .includes(searchInput?.toLowerCase())
      )
    : locationData?.filter((location) =>
        `${location?.Address} ${location?.City} ${location?.State} ${location?.Country}`
          .toLowerCase()
          .includes(searchInput?.toLowerCase())
      );

  return (
    <>
      <Dialog
        open={isClient}
        onClose={() => {
          setIsClient(false);
          setIsProperty(false);
        }}
        style={{ height: "100%" }}
      >
        <DialogTitle className="text-blue-color">
          Select or Create a Client
          <Typography gutterBottom className="px-3 pt-3 text-blue-color">
            Which client would you like to create this for?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <IconButton
            aria-label="close"
            onClick={() => {
              setIsClient(!isClient);
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
              <DialogContent dividers style={{ border: 0 }}>
                <Grid
                  className=" mb-3 selectcreatebtns"
                  style={{ display: "flex", flexWrap: "wrap" }}
                >
                  <Grid
                    className="flex-grow-1 me-2 mb-2"
                    style={{ minWidth: "0", width: "150px" }}
                  >
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter search customers"
                      type="text"
                      className="text-blue-color w-100 searchclientmodal"
                      style={{
                        fontSize: "14px",
                        paddingTop: "7px",
                        paddingBottom: "7px",
                      }}
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </Grid>
                  <Grid>
                    <Typography
                      className="mt-2 mb-2"
                      style={{ textAlign: "center" }}
                    >
                      or
                    </Typography>
                  </Grid>
                  <Grid
                    className="btn bg-button-blue-color text-white-color flex-grow-1 ms-2 mb-2 cratenclientmodal"
                    style={{ minWidth: "0", fontSize: "14px" }}
                    onClick={() => {
                      navigate(`/${CompanyName}/add-client`, {
                        state: {
                          previewPage: location?.pathname,
                          previewData: {
                            values,
                            lineItems,
                            id: location?.state?.id || null,
                          },
                          navigats: [
                            ...location?.state?.navigats,
                            "/add-client",
                          ],
                        },
                      });
                    }}
                  >
                    Create new Client
                  </Grid>
                </Grid>

                <Typography
                  className="mt-2 "
                  style={{ color: "blue", paddingLeft: "30px" }}
                >
                  Leads
                </Typography>

                <Grid
                  style={{
                    marginLeft: "-15px",
                    marginRight: "-15px",
                    marginTop: "-10px",
                  }}
                >
                  <hr />
                </Grid>
                <Typography gutterBottom>
                  {!isProperty ? (
                    <Typography>
                      {filteredClients?.length > 0 &&
                        filteredClients?.map((item) => (
                          <Grid className="mt-3">
                            <Grid
                              className="w-100 d-flex justify-content-between text-blue-color"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                if (item?.location?.length === 1) {
                                  setFieldValue("CustomerId", item?.CustomerId);
                                  setFieldValue(
                                    "LocationId",
                                    item?.location[0].LocationId
                                  );
                                  setIsProperty(false);
                                  setIsClient(false);
                                  if (source === "Invoice") {
                                    handleClose(item?.CustomerId);
                                  }
                                } else {
                                  setLocationData(
                                    item?.location.map((location) => ({
                                      ...location,
                                      CustomerId: item?.CustomerId,
                                    }))
                                  );
                                  setFieldValue("CustomerId", item?.CustomerId);
                                  setIsProperty(!isProperty);
                                }
                              }}
                            >
                              <Typography style={{ width: "8%" }}>
                                <DomainAddOutlinedIcon />
                              </Typography>
                              <Grid
                                className="w-100 d-flex justify-content-between propertydetailsmodal"
                                style={{ fontSize: "14px" }}
                              >
                                <Typography className="px-2 w-100">
                                  <Typography
                                    className="py-0 my-0"
                                    style={{ fontSize: "12px" }}
                                  >
                                    {item?.FirstName ||
                                      "FirstName not available"}{" "}
                                    {item?.LastName || "LastName not available"}
                                  </Typography>
                                  {item?.location?.length}{" "}
                                  {item?.location?.length === 1
                                    ? "Property"
                                    : "Properties"}{" "}
                                  |{" "}
                                  {item?.PhoneNumber ||
                                    "PhoneNumber not available"}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                    </Typography>
                  ) : (
                    filteredClients?.length > 0 &&
                    filteredClients?.map((location, index) => (
                      <>
                        <Grid
                          onClick={() => {
                            setFieldValue("LocationId", location?.LocationId);
                            setIsProperty(false);
                            setIsClient(false);
                            if (source === "Invoice") {
                              handleClose(location?.CustomerId);
                            }
                          }}
                          className="py-2"
                          style={{
                            borderTop: index !== 0 && "1px solid #333",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Grid
                            style={{
                              padding: "5px",
                              fontSize: "13px",
                            }}
                          >
                            <Typography>{location?.Address || ""} </Typography>,
                            &nbsp;
                            <Typography>{location?.City || ""} </Typography>,
                            &nbsp;
                            <Typography>{location?.State || ""} </Typography>,
                            &nbsp;
                            <Typography>{location?.Country || ""} </Typography>
                          </Grid>
                          <ChevronRightIcon style={{ color: "#958e8edd" }} />
                        </Grid>
                      </>
                    ))
                  )}
                </Typography>
              </DialogContent>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientModal;
