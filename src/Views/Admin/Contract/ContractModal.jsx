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
import AxiosInstance from "../../AxiosInstance";
import { Grid } from "@mui/material";

const JobModal = ({
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
}) => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [clientData, setClienData] = useState([]);
  const [properties, setProperties] = useState([]);

  const fetchData = async () => {
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/client/get_client/${localStorage?.getItem("admin_id")}`
      );
      console.log(res,"resres")
      setClienData(res?.data?.data);
    } catch (error) {
      console.error("Error: ", error?.message);
    }
  };

  useEffect(() => {
    fetchData();
    if (
      formik?.values?.CustomerId &&
      formik?.values?.property_id &&
      clientData.length > 0
    ) {
      const data = clientData.find(
        (item) => item?.CustomerId === formik?.values?.CustomerId
      );
      setClientsData(data);
      const property = data?.properties.find(
        (item) => item?.property_id === formik?.values?.property_id
      );
      setPropertyData(property);
    }
  }, [formik]);

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
              color: (theme) => theme?.palette?.grey[500],
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
            <DialogContent dividers style={{ border: 0 }}>
              <Grid className="d-flex justify-content-between mb-3">
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter Search customers"
                  type="text"
                  className="text-blue-color"
                  style={{
                    fontSize: "14px",
                    width: "40%",
                    paddingTop: "7px",
                    paddingBottom: "7px",
                  }}
                />
                <Typography className="mt-2 ">or</Typography>
                <Grid
                  className="btn bg-button-blue-color text-white-color"
                  style={{ width: "40%", fontSize: "14px" }}
                  onClick={() =>
                    navigate(`/${CompanyName}/add-customer`, {
                      state: {
                        previewPage: location?.pathname,
                        previewData: {
                          values,
                          lineItems,
                          id: location?.state?.id || null,
                        },
                        navigats: [...location?.state?.navigats, "/add-customer"],
                      },
                    })
                  }
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
                {!isProperty ? (
                  <Typography>
                    {clientData?.length > 0 &&
                      clientData?.map((item) => (
                        <Grid className="mt-3">
                          <Grid
                            className="w-100 d-flex justify-content-between text-blue-color"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              if (item?.properties?.length === 1) {
                                setFieldValue("CustomerId", item?.CustomerId);
                                setFieldValue(
                                  "property_id",
                                  item?.properties[0]?.property_id
                                );
                                setIsClient(false);
                              } else {
                                setProperties(
                                  item?.properties?.map((property) => ({
                                    ...property,
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
                              className="w-100 d-flex justify-content-between"
                              style={{ fontSize: "14px" }}
                            >
                              <Typography className="px-2 w-100">
                                <Typography
                                  className="py-0 my-0"
                                  style={{ fontSize: "12px" }}
                                >
                                  {item?.first_name || "first name not available"} {item?.last_name || "last name not available"} (
                                  {item?.CompanyName || "CompanyName not available"})
                                </Typography>
                                {item?.properties?.length || "length not available"}{" "}
                                {item?.properties?.length === 1
                                  ? "Property"
                                  : "Properties"}{" "}
                                | {item?.contact_number}
                              </Typography>
                              <Typography>Active 2 days ago</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                  </Typography>
                ) : (
                  properties?.length > 0 &&
                  properties?.map((property, index) => (
                    <>
                      <Grid
                        onClick={() => {
                          setFieldValue("property_id", property?.property_id);
                          setIsProperty(false);
                          setIsClient(false);
                        }}
                        className="py-2"
                        style={{
                          borderTop: index !== 0 && "1px solid #333",
                        }}
                      >
                        <Grid
                          style={{
                            padding: "5px",
                          }}
                        >
                          <Typography>
                            {property?.street_address1 || ""}{" "}
                            {property?.street_address2 || ""}{" "}
                            {property?.street_address2 || ""}{" "}
                            {property?.city || ""} {property?.state || ""}{" "}
                            {property?.country || ""} {property?.zip_code || ""}
                          </Typography>
                        </Grid>
                      </Grid>
                    </>
                  ))
                )}
            </DialogContent>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobModal;
