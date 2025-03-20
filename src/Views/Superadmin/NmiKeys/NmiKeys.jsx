import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  Grid,
  Typography,
  CardContent,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import swal from "sweetalert";
import CancelIcon from "@mui/icons-material/Close";
import moment from "moment";
import InputText from "../../../components/InputFields/InputText.jsx";
import { Card } from "reactstrap";
import Delete from "../../../assets/image/icons/delete.svg";
import AxiosInstance from "../../AxiosInstance.jsx";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
} from "../../../components/Icon/Index.jsx";
import "./style.css";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../components/Toast/Toster.jsx";

const NmiKeys = ({ modelOpen, setModelOpen, item, getAllData }) => {
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [nmiId, setNmiId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [teamSize, setTeamSize] = useState([]);
  const [countData, setCountData] = useState(0);
  const [loader, setLoader] = useState(true);
  const [NmiData, setNmiData] = useState([]);
  const [inputValue2, setInputValue2] = useState("");

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/nmikey`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
        },
      });
      setTeamSize(res?.data?.data);
      setCountData(res?.data?.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search, item, getAllData]);
  const handleSubmit = async (values, resetForm) => {
    try {
      let res;
      if (item?.NmiKeyId || nmiId) {
        res = await AxiosInstance.put(
          `${baseUrl}/nmikey/${nmiId || item?.NmiKeyId}`,
          values
        );
        if (res.data.statusCode === 200) {
          setTimeout(() => {
            showToast.success(res.data.message);
            resetForm();
          }, 500);
        } else {
          setTimeout(() => {
            showToast.success(res.data.message);
          }, 500);
        }
      } else {
        res = await AxiosInstance.post(`${baseUrl}/nmikey`, values);
        if (res.data.statusCode === 200) {
          setTimeout(() => {
            showToast.success(res.data.message);
            resetForm();
          }, 500);
        } else {
          setTimeout(() => {
            showToast.success(res.data.message);
          }, 500);
        }
      }
    } catch (error) {
      showToast.error(error.message || "An error occurred");
    } finally {
      getAllData();
      getData();
      setLoader(false);
      setModelOpen(false);
    }
  };

  const handleEditClick = (items) => {

    setSelectedPlan(items);
    setNmiId(items?.NmiKeyId);
    setModelOpen(true);
  };
  const handleDelete = (NmiKeyId) => {
    swal("Are you sure you want to delete?", {
      buttons: ["No", "Yes"],
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await AxiosInstance.delete(
            `${baseUrl}/nmikey/${NmiKeyId}`
          );
          if (response?.data.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data.message);
            }, 500);
            getData();
          } else {
            setTimeout(() => {
              showToast.warning(response?.data.message);
            }, 500);
          }
        } catch (error) {
          console.error("Error:", error);
          setTimeout(() => {
            showToast.error(error.message);
          }, 500);
        }
      }
    });
  };

  const CollapseData = ({ data }) => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={8}>
          <Card>
            <CardContent style={{ backgroundColor: "#D8E7EE" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4} sm={3}>
                  <Typography
                    style={{
                      margin: 0,
                      padding: "0.8rem 0.8rem",
                      backgroundColor: "white",
                      borderRadius: "0.25rem",
                      marginBottom: "7px",
                    }}
                  >
                    Security Key:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography
                    className="text-blue-color"
                    style={{
                      backgroundColor: "white",
                      padding: "0.8rem 0.8rem",
                      borderRadius: "0.25rem",
                      marginBottom: "7px",
                    }}
                  >
                    {data?.SecurityKey || "SecurityKey not available"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={8}>
          <Card>
            <CardContent style={{ backgroundColor: "#D8E7EE" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4} sm={3}>
                  <Typography
                    style={{
                      margin: 0,
                      padding: "0.8rem 0.8rem",
                      backgroundColor: "white",
                      borderRadius: "0.25rem",
                      marginBottom: "7px",
                    }}
                  >
                    Public Key:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography
                    className="text-blue-color"
                    style={{
                      backgroundColor: "white",
                      padding: "0.8rem 0.8rem",
                      borderRadius: "0.25rem",
                      marginBottom: "7px",
                    }}
                  >
                    {data?.PublicKey || "PublicKey not available"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Card>
            <CardContent style={{ backgroundColor: "#D8E7EE" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4} sm={3}>
                  <Typography
                    style={{
                      margin: 0,
                      padding: "0.8rem 0.8rem",
                      backgroundColor: "white",
                      borderRadius: "0.25rem",
                      marginBottom: "7px",
                    }}
                  >
                    Signing Key:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography
                    className="text-blue-color"
                    style={{
                      backgroundColor: "white",
                      padding: "0.8rem 0.8rem",
                      borderRadius: "0.25rem",
                      marginBottom: "7px",
                    }}
                  >
                    {data?.SigningKey || "Signing Key not available"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const cellData = teamSize.map((item, index) => ({
    key: item.CompanyId,
    value: [
      page * rowsPerPage + index + 1,
      item.CompanyName,
      moment(item.createdAt).format("DD/MM/YYYY"),
      <>
        <EditIcon
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(item);
          }}
        />
        <DeleteIcone
          className="mx-1 customerEditImgToEdit"
          src={Delete}
          alt="Delete"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item?.NmiKeyId);
          }}
        />
      </>,
    ],
    component: item,
  }));

  const getNmiData = async () => {
    try {
      const response = await AxiosInstance.get(`${baseUrl}/company/dropdown`);
      setNmiData(response?.data?.data);
    } catch (error) {
      console.error("Error fetching Nmi data:", error);
    }
  };

  useEffect(() => {
    getNmiData();
  }, [item, getAllData]);

  return (
    <>
      <Dialog
        fullWidth
        open={modelOpen}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            setModelOpen(false);
          }
        }}
      >
        <DialogTitle className="text-blue-color borerBommoModel">
          <Grid className="d-flex justify-content-between">
            <Grid>{"NMI Key Form"}</Grid>
            <Grid
              style={{ cursor: "pointer" }}
              onClick={() => setModelOpen(false)}
            >
              <CancelIcon />
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent Grididers style={{ marginTop: "13px" }}>
          <Formik
            initialValues={{
              CompanyId: selectedPlan?.CompanyId || item?.companyId || "",
              CompanyName: selectedPlan?.CompanyName || item?.companyName || "",
              SecurityKey: selectedPlan?.SecurityKey || item?.SecurityKey || "",
              PublicKey: selectedPlan?.PublicKey || item?.PublicKey || "",
              SigningKey: selectedPlan?.SigningKey || item?.SigningKey || "",
            }}
            validationSchema={Yup.object().shape({
              SecurityKey: Yup.string().required("Security Key is Required"),
              CompanyId: Yup.string().required("CompanyId is Required"),
            })}
            onSubmit={(values, { resetForm }) => {
              handleSubmit(values, resetForm);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              setFieldValue,
              setValues,
            }) => (
              <Form>
                <Grid>
                  <Grid spacing={3}>
                    <Grid item xs={12} sm={12} md={6}>
                      <FormControl fullWidth>
                        <Autocomplete
                          className="text-blue-color"
                          options={NmiData || []}
                          getOptionLabel={(option) => option?.companyName || ""}
                          value={
                            NmiData.find(
                              (ind) => ind.companyId === values?.CompanyId
                            ) || null
                          }
                          disabled={item?.companyId}
                          onChange={(_, newValue) => {
                            setFieldValue(
                              "CompanyId",
                              newValue ? newValue?.companyId : ""
                            );
                            setFieldValue(
                              "CompanyName",
                              newValue ? newValue?.companyName : ""
                            );
                          }}
                          onInputChange={(_, newInputValue) => {
                            setInputValue2(newInputValue);
                          }}
                          renderInput={(params) => (
                            <InputText
                              style={{ marginTop: "10px" }}
                              {...params}
                              label="Select Company *"
                              name="CompanyId"
                              size="small"
                              onBlur={handleBlur}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" &&
                                  !NmiData.some(
                                    (ind) =>
                                      ind.companyName.toLowerCase() ===
                                      inputValue2.toLowerCase()
                                  )
                                ) {
                                }
                              }}
                            />
                          )}
                          filterOptions={(options, state) => {
                            return options.filter((option) =>
                              option.companyName
                                .toLowerCase()
                                .includes(state.inputValue.toLowerCase())
                            );
                          }}
                          noOptionsText="No matching company"
                        />
                      </FormControl>

                      {touched.CompanyId && errors.CompanyId ? (
                        <Grid className="text-danger field-error">
                          {errors.CompanyId}
                        </Grid>
                      ) : null}
                    </Grid>
                  </Grid>
                  <Grid spacing={3}>
                    <Grid item>
                      <Grid className="mt-3 mb-4 superadmin-company">
                        <InputText
                          type="text"
                          size="small"
                          fullWidth
                          placeholder="Enter add security key"
                          label="Security Key"
                          name="SecurityKey"
                          value={values?.SecurityKey}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          className="text-blue-color"
                        />
                        {touched.SecurityKey && errors.SecurityKey ? (
                          <Grid className="text-danger">
                            {errors.SecurityKey}
                          </Grid>
                        ) : null}
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Grid className="mt-3 mb-4 superadmin-company">
                        <InputText
                          type="text"
                          size="small"
                          fullWidth
                          placeholder="Enter add public key"
                          label="Public Key"
                          name="PublicKey"
                          value={values?.PublicKey}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          className="text-blue-color"
                        />
                        {touched.PublicKey && errors.PublicKey ? (
                          <Grid className="text-danger">
                            {errors.PublicKey}
                          </Grid>
                        ) : null}
                      </Grid>
                    </Grid>
                    <Grid item>
                      <Grid className="mt-3 mb-4 superadmin-company">
                        <InputText
                          type="text"
                          size="small"
                          fullWidth
                          placeholder="Enter add Signing Key"
                          label="Signing Key"
                          name="SigningKey"
                          value={values?.SigningKey}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          className="text-blue-color"
                        />
                        {touched.SigningKey && errors.SigningKey ? (
                          <Grid className="text-danger">
                            {errors.SigningKey}
                          </Grid>
                        ) : null}
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid style={{ display: "flex", justifyContent: "end" }}>
                    {loader ? (
                      <LoaderComponent loader={loader} height="10" width="20" />
                    ) : (
                      <Button
                        className="mt-3  bg-blue-color nmiFormBtn"
                        type="submit"
                        style={{ color: "white" }}
                      >
                        {item?.NmiKeyId || nmiId ? "Update" : "Add"}
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NmiKeys;
