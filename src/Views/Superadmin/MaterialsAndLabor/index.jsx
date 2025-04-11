import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  Grid,
  Typography,
} from "@mui/material";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
} from "../../../components/MuiTable/index.jsx";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Delete from "../../../assets/image/icons/delete.svg";
import swal from "sweetalert";
import { useLocation, useParams } from "react-router-dom";
import "./style.css";
import { Card, CardBody, CardFooter, CardHeader, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance.jsx";
import CancelIcon from "@mui/icons-material/Close";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import InputText from "../../../components/InputFields/InputText.jsx";
import { postFile } from "../../../components/Files/Functions.jsx";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
} from "../../../components/Icon/Index.jsx";
import BlueButton from "../../../components/Button/BlueButton.jsx";
import WhiteButton from "../../../components/Button/WhiteButton.jsx";
import { Row, Col } from "react-bootstrap";
import showToast from "../../../components/Toast/Toster.jsx";
import Doller from "../../../components/InputFields/Doller.jsx";

const ProductAndService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productAndService, setProductAndService] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [selectedUnitsAndHours, setSelectedUnitsAndHours] = useState(null);
  const [showHoursSection, setShowHoursSection] = useState(false);
  const [showUnitsSection, setShowUnitsSection] = useState(false);
  const [showSquaresSection, setShowSquaresSection] = useState(false);
  const [showFixedSection, setShowFixedSection] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/materialslabor`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      setProductAndService(res.data?.data);
      setCountData(res.data?.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search, sortField, sortOrder]);
  const handleEditClick = (item) => {
    setSelectedProduct(item);
    setSelectedAdminId(item?.ProductId);
    setSelectedProductAndService({ Type: item?.Type });
    setSelectedUnitsAndHours({
      Type:
        item?.Unit && item?.CostPerUnit
          ? "Unit"
          : item?.Square && item?.CostPerSquare
          ? "Sq. Ft."
          : item?.Fixed && item?.CostPerFixed
          ? "Fixed"
          : "Hourly",
    });
    if (item?.Unit && item?.CostPerUnit) {
      setShowUnitsSection(true);
      setShowSquaresSection(false);
      setShowHoursSection(false);
      setShowFixedSection(false);
    }
    if (item?.Hourly && item?.CostPerHour) {
      setShowHoursSection(true);
      setShowUnitsSection(false);
      setShowSquaresSection(false);
      setShowFixedSection(false);
    }
    if (item?.Square && item?.CostPerSquare) {
      setShowSquaresSection(true);
      setShowHoursSection(false);
      setShowUnitsSection(false);
      setShowFixedSection(false);
    }
    if (item?.Fixed && item?.CostPerFixed) {
      setShowFixedSection(true);
      setShowSquaresSection(false);
      setShowHoursSection(false);
      setShowUnitsSection(false);
    }
    setModelOpen(true);
  };

  // Delete
  const handleDelete = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover!",
      icon: "warning",

      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Delete",
          closeModal: true,
          value: true,
          className: "bg-orange-color",
        },
      },
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const response = await AxiosInstance.delete(
            `${baseUrl}/materialslabor/${id}`
          );
          if (response?.data.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data.message);
            }, 500);
            getData();
          } else {
            setTimeout(() => {
              showToast.warning("", response?.data.message, "error");
            }, 500);
          }
        } catch (error) {
          console.error("Error:", error);
          setTimeout(() => {
            showToast.error(error);
          }, 500);
        }
      } else {
        setTimeout(() => {
          showToast.success("Materials & Labor is safe!", {
            position: "top-center",
            autoClose: 1000,
          });
        }, 500);
      }
    });
  };

  const CollapseData = ({ data }) => {
    return (
      <Grid className="d-flex gap-4">
        <Col
          className="card col-8"
          style={{ borderRadius: "12px", width: "100%" }}
          xl={8}
        >
          <Grid
            className="card-body w-100 bg-orange-color"
            style={{ borderRadius: "12px" }}
          >
            <Grid className="d-flex w-100 flex-row justify-content-between gap-2">
              <Typography className="text-white-color">
                Description:{" "}
              </Typography>
              <span
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "100%",
                  marginBottom: "7px",
                }}
                className="text-blue-color"
              >
                {data?.Description || "Description not available"}
              </span>
            </Grid>
          </Grid>
        </Col>
      </Grid>
    );
  };

  const cellData = productAndService?.map((item, index) => {
    let displayValue = "-";
    if (item?.Hourly) {
      displayValue = `Hourly : ${item?.Hourly}`;
    } else if (item?.Unit) {
      displayValue = `Unit : ${item?.Unit}`;
    } else if (item?.Square) {
      displayValue = `Sq. Ft. : ${item?.Square}`;
    } else if (item?.Fixed) {
      displayValue = `Fixed : ${item?.Fixed}`;
    }

    return {
      key: item.ProductId,
      value: [
        page * rowsPerPage + index + 1,
        item?.Type ? item?.Type : "-",
        item?.Name ? item?.Name : "-",
        displayValue,
        [
          `$${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(
            item.CostPerHour ||
              item.CostPerUnit ||
              item.CostPerSquare ||
              item.CostPerFixed ||
              0.0
          )}`,
        ],
        moment(item.updatedAt).format("MM-DD-YYYY"),
        <>
          <EditIcon
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item);
            }}
          />
          <DeleteIcone
            className="customerEditImgToEdit"
            src={Delete}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.ProductId);
            }}
          />
        </>,
      ],
      component: item,
    };
  });

  const [selectedProductAndService, setSelectedProductAndService] =
    useState(null);
  const productsAndService = [{ Type: "Materials" }, { Type: "Labor" }];
  const UnitsAndHours = [
    ...(selectedProductAndService?.Type === "Materials"
      ? [{ Type: "Unit" }, { Type: "Sq. Ft." }]
      : []),
    ...(selectedProductAndService?.Type === "Labor"
      ? [{ Type: "Hourly" }, { Type: "Fixed" }]
      : []),
  ];

  return (
    <>
      <Grid className="d-flex">
        <Col className="col-12 product-services-content" xl={12}>
          <Typography
            className="text-blue-color heading-two"
            style={{ fontWeight: 700 }}
          >
            Materials & Labor
          </Typography>
          <Typography className="text-blue-color mb-4">
            By keeping your materials and labor information updated, you can
            more easily create accurate quotes, contracts, and invoices.
          </Typography>
          <Grid className=" justify-content-between align-items-center">
            <Grid className="d-flex justify-content-end mb-2 align-items-center">
              <BlueButton
                onClick={() => {
                  setModelOpen(true);
                  setSelectedProduct(null);
                  setSelectedProductAndService(null);
                  setSelectedAdminId(null);
                  setSelectedUnitsAndHours(null);
                  setShowFixedSection(null);
                  setShowSquaresSection(null);
                  setShowHoursSection(null);
                  setShowUnitsSection(null);
                }}
                label="Add Materials & Labor"
              />
            </Grid>
            <Card
              className="border-blue-color"
              style={{
                borderRadius: "20px",
                border: "2px solid ",
                padding: 0,
              }}
            >
              <CardHeader
                className="d-flex justify-content-between align-items-center table-header bg-blue-color product-service-p"
                style={{
                  borderBottom: "2px solid ",
                  borderTopLeftRadius: "15px",
                  borderTopRightRadius: "15px",
                }}
              >
                <Typography className="produc text-light prodeuct_table heading-five fw-medium">
                  Materials & Labor{" "}
                </Typography>
                <Grid className=" d-flex permission-search">
                  <JobberSearch
                    search={search}
                    setSearch={setSearch}
                    style={{ background: "transparant", color: "white" }}
                  />
                </Grid>
              </CardHeader>
              {loader ? (
                <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
                  <LoaderComponent loader={loader} height="50" width="50" />
                </Grid>
              ) : (
                <CardBody style={{ padding: "10px 0px", whiteSpace: "nowrap" }}>
                  <JobberTable
                    // headerData={[
                    //   "Sr no",
                    //   "Type",
                    //   "Name",
                    //   "Measurement",
                    //   "Cost",
                    //   "Date",
                    //   "Action",
                    // ]}
                    headerData={[
                      { label: "Sr No.", field: "" },
                      { label: "Type", field: "Type" },
                      { label: "Name", field: "Name" },
                      { label: "Measurement", field: "CostPerUnit" },
                      { label: "Cost", field: "Cost" },
                      { label: "Date", field: "createdAt" },
                      { label: "Action", field: "" },
                    ]}
                    setSortField={setSortField}
                    setSortOrder={setSortOrder}
                    sortOrder={sortOrder}
                    sortField={sortField}
                    cellData={cellData}
                    CollapseComponent={(data) => CollapseData(data)}
                    isCollapse={true}
                    page={page}
                    isNavigate={false}
                  />
                </CardBody>
              )}
              <CardFooter
                className="bg-orange-color border-blue-color"
                style={{
                  borderTop: "2px solid ",
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
          </Grid>
        </Col>
      </Grid>
      <Dialog
        fullWidth
        open={modelOpen}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            setModelOpen(false);
          }
        }}
      >
        <DialogTitle className="borerBommoModel">
          <Grid className="d-flex justify-content-between add-product-service">
            <Grid>
              {selectedAdminId
                ? "Edit  Materials & Labor"
                : "Add   Materials & Labor"}
            </Grid>
            <Grid
              style={{ cursor: "pointer" }}
              onClick={(e) => setModelOpen(false)}
            >
              <CancelIcon />
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent dividers>
          <Formik
            initialValues={{
              Type: selectedProduct ? selectedProduct.Type : "",
              Name: selectedProduct ? selectedProduct.Name : "",
              Description: selectedProduct ? selectedProduct.Description : "",
              Unit: selectedProduct ? selectedProduct.Unit : "",
              CostPerUnit: selectedProduct ? selectedProduct.CostPerUnit : "",
              Hourly: selectedProduct ? selectedProduct.Hourly : "",
              CostPerHour: selectedProduct ? selectedProduct.CostPerHour : "",
              Square: selectedProduct ? selectedProduct.Square : "",
              CostPerSquare: selectedProduct
                ? selectedProduct.CostPerSquare
                : "",
              Fixed: selectedProduct ? selectedProduct.Fixed : "",
              CostPerFixed: selectedProduct ? selectedProduct.CostPerFixed : "",
              Attachment: selectedProduct ? selectedProduct.Attachment : "",
              UnitsAndHoursType: selectedProduct
                ? selectedProduct.Unit && selectedProduct.CostPerUnit
                  ? "Unit"
                  : selectedProduct.Square && selectedProduct.CostPerSquare
                  ? "Sq. Ft."
                  : selectedProduct.Fixed && selectedProduct.CostPerFixed
                  ? "Fixed"
                  : "Hourly"
                : "",
            }}
            enableReinitialize
            validationSchema={Yup.object().shape({
              Type: Yup.string().required("Type Required"),
              Name: Yup.string().required("Name Required"),
              Description: Yup.string().required("Description Required"),
              CostPerUnit:
                showUnitsSection &&
                Yup.number().required("Cost per Unit required"),
              CostPerHour:
                showHoursSection &&
                Yup.number().required("Cost per Hourly required"),
              CostPerSquare:
                showSquaresSection &&
                Yup.number().required("Cost per square foot required"),
            })}
            onSubmit={async (values, { resetForm }) => {
              try {
                setLoader(true);
                if (values?.Attachment) {
                  const imageForm = new FormData();
                  imageForm.append("files", imageForm);
                  const image = await postFile();
                  values["Attachment"] = image;
                }

                const object = {
                  Type: values?.Type,
                  Name: values?.Name,
                  Description: values?.Description,
                  Attachment: values?.Attachment,
                  AdminId: localStorage.getItem("admin_id") || "",

                  ...(values?.UnitsAndHoursType === "Unit"
                    ? {
                        CostPerUnit: values?.CostPerUnit,
                        Unit: values?.Unit || 1,
                        CostPerSquare: null,
                        Square: null,
                        CostPerHour: null,
                        Hourly: null,
                        CostPerFixed: null,
                        Fixed: null,
                      }
                    : values?.UnitsAndHoursType === "Sq. Ft."
                    ? {
                        CostPerSquare: values?.CostPerSquare,
                        Square: values?.Square || 1,
                        CostPerHour: null,
                        Hourly: null,
                        CostPerUnit: null,
                        Unit: null,
                        CostPerFixed: null,
                        Fixed: null,
                      }
                    : values?.UnitsAndHoursType === "Fixed"
                    ? {
                        CostPerFixed: values?.CostPerFixed,
                        Fixed: values?.Fixed || 1,
                        CostPerSquare: null,
                        CostPerHour: null,
                        Hourly: null,
                        CostPerUnit: null,
                        Unit: null,
                      }
                    : {
                        CostPerHour: values?.CostPerHour,
                        Hourly: values?.Hourly || 1,
                        CostPerUnit: null,
                        Unit: null,
                        CostPerSquare: null,
                        Square: null,
                        CostPerFixed: null,
                        Fixed: null,
                      }),
                };

                let res;
                if (!selectedProduct) {
                  res = await AxiosInstance.post(`/materialslabor`, object);
                } else {
                  res = await AxiosInstance.put(
                    `/materialslabor/${selectedAdminId}`,
                    object
                  );
                }

                if (res.data.statusCode === 200) {
                  setModelOpen(false);
                  getData();
                  showToast.success(res.data.message);
                  resetForm(values);
                } else if (res.data.statusCode === 201) {
                  getData();
                  showToast.error(res.data.message);
                } else {
                  showToast.error(
                    res.data.message || "An unexpected error occurred"
                  );
                }
              } catch (error) {
                if (error.response && error.response.status === 400) {
                  const errorMessages = error.response.data.errors || [];
                  errorMessages.forEach((errorMessage) => {
                    showToast.warning(errorMessage);
                  });
                } else {
                  setTimeout(() => {
                    showToast.error(error.message || "An error occurred");
                  }, 500);
                }
              } finally {
                setLoader(false);
              }
            }}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              setFieldValue,
            }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Grid className="form-wrap">
                      <Grid spacing={3}>
                        <Grid item>
                          <FormControl fullWidth>
                            <Autocomplete
                              options={productsAndService}
                              getOptionLabel={(option) => option.Type || ""}
                              value={selectedProductAndService || null}
                              onChange={(_, newValue) => {
                                setSelectedProductAndService(newValue);
                                setSelectedUnitsAndHours(null);
                                setShowFixedSection(null);
                                setShowSquaresSection(null);
                                setShowHoursSection(null);
                                setShowUnitsSection(null);
                                handleChange({
                                  target: {
                                    name: "Type",
                                    value: newValue ? newValue.Type : "",
                                  },
                                });
                              }}
                              renderInput={(params) => (
                                <InputText
                                  className="text-blue-color border-blue-color"
                                  {...params}
                                  label="Select Type *"
                                  name="Type"
                                  size="small"
                                  onBlur={handleBlur}
                                />
                              )}
                              filterOptions={(options, state) => {
                                return options.filter((option) =>
                                  option.Type.toLowerCase().includes(
                                    state.inputValue.toLowerCase()
                                  )
                                );
                              }}
                              noOptionsText="No matching Type"
                            />
                          </FormControl>
                          {touched.Type && errors.Type && (
                            <Grid className="text-danger field-error">
                              {errors.Type}
                            </Grid>
                          )}
                        </Grid>

                        <Grid item xs={12}>
                          <Grid className="my-4 superadmin-company">
                            <InputText
                              type="text"
                              size="small"
                              fullWidth
                              placeholder="Enter product name"
                              label="Product Name "
                              name="Name"
                              value={values.Name}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              className="text-blue-color border-blue-color"
                            />
                            {touched.Name && errors.Name && (
                              <Grid className="text-danger">{errors.Name}</Grid>
                            )}
                          </Grid>
                        </Grid>

                        <Grid item xs={12}>
                          <Grid className="mt-4">
                            <FormGroup>
                              <Input
                                id="exampleText"
                                placeholder="Enter description"
                                name="Description"
                                type="textarea"
                                value={values.Description}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="text-blue-color border-blue-color"
                              />
                            </FormGroup>
                            {touched.Description && errors.Description && (
                              <Grid className="text-danger">
                                {errors.Description}
                              </Grid>
                            )}
                          </Grid>
                        </Grid>

                        <Grid item xs={12}>
                          <Row className="d-flex justify-content-between my-3 ">
                            <Autocomplete
                              className="text-blue-color border-blue-color"
                              options={UnitsAndHours}
                              getOptionLabel={(option) => option.Type || ""}
                              value={selectedUnitsAndHours || null}
                              onChange={(_, newValue) => {
                                setSelectedUnitsAndHours(newValue);
                                setShowUnitsSection(newValue?.Type === "Unit");
                                setShowHoursSection(
                                  newValue?.Type === "Hourly"
                                );
                                setShowSquaresSection(
                                  newValue?.Type === "Sq. Ft."
                                );
                                setShowFixedSection(newValue?.Type === "Fixed");
                                handleChange({
                                  target: {
                                    name: "UnitsAndHoursType",
                                    value: newValue ? newValue.Type : "",
                                  },
                                });
                              }}
                              renderInput={(params) => (
                                <InputText
                                  {...params}
                                  label="Cost Type *"
                                  name="UnitsAndHoursType"
                                  size="small"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className={
                                    touched?.UnitsAndHoursType &&
                                    !selectedUnitsAndHours
                                      ? "error-border"
                                      : ""
                                  }
                                  error={
                                    touched?.UnitsAndHoursType &&
                                    !selectedUnitsAndHours
                                  }
                                />
                              )}
                              filterOptions={(options, state) => {
                                return options.filter((option) =>
                                  option.Type.toLowerCase().includes(
                                    state.inputValue.toLowerCase()
                                  )
                                );
                              }}
                              noOptionsText="No matching Type"
                            />

                            {showUnitsSection && (
                              <Grid item className="d-flex gap-2 pt-3">
                                <Doller
                                  value={values?.CostPerUnit}
                                  onBlur={handleBlur}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                      handleChange({
                                        target: {
                                          name: "CostPerUnit",
                                          value: Math.max(0, Number(value)),
                                        },
                                      });
                                    }
                                  }}
                                  name="CostPerUnit"
                                  placeholder="Enter Unit"
                                  label="Cost"
                                  type="number"
                                  className="w-100"
                                  error={
                                    touched?.CostPerUnit &&
                                    Boolean(errors?.CostPerUnit)
                                  }
                                  helperText={
                                    touched?.CostPerUnit && errors?.CostPerUnit
                                  }
                                />
                              </Grid>
                            )}

                            {showHoursSection && (
                              <Grid item xs={12} className="d-flex gap-2 pt-3">
                                <Doller
                                  value={values?.CostPerHour}
                                  onBlur={handleBlur}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                      handleChange({
                                        target: {
                                          name: "CostPerHour",
                                          value: Math.max(0, Number(value)),
                                        },
                                      });
                                    }
                                  }}
                                  name="CostPerHour"
                                  placeholder="Enter Hour"
                                  label="Cost"
                                  type="number"
                                  className="w-100"
                                  error={
                                    touched.CostPerHour &&
                                    Boolean(errors.CostPerHour)
                                  }
                                  helperText={
                                    touched.CostPerHour && errors.CostPerHour
                                  }
                                />
                              </Grid>
                            )}

                            {showSquaresSection && (
                              <Grid item className="d-flex gap-2 pt-3">
                                <Doller
                                  value={values?.CostPerSquare}
                                  onBlur={handleBlur}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                      handleChange({
                                        target: {
                                          name: "CostPerSquare",
                                          value: Math.max(0, Number(value)),
                                        },
                                      });
                                    }
                                  }}
                                  name="CostPerSquare"
                                  placeholder="Enter Square"
                                  label="Cost"
                                  type="number"
                                  className="w-100"
                                  error={
                                    touched.CostPerSquare &&
                                    Boolean(errors.CostPerSquare)
                                  }
                                  helperText={
                                    touched.CostPerSquare &&
                                    errors.CostPerSquare
                                  }
                                />
                              </Grid>
                            )}

                            {showFixedSection && (
                              <Grid item className="d-flex gap-2 pt-3">
                                <Doller
                                  value={values?.CostPerFixed}
                                  onBlur={handleBlur}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                      handleChange({
                                        target: {
                                          name: "CostPerFixed",
                                          value: Math.max(0, Number(value)),
                                        },
                                      });
                                    }
                                  }}
                                  name="CostPerFixed"
                                  placeholder="Enter Fixedk"
                                  label="Cost"
                                  type="number"
                                  className="w-100"
                                  error={
                                    touched.CostPerFixed &&
                                    Boolean(errors.CostPerFixed)
                                  }
                                  helperText={
                                    touched.CostPerFixed && errors.CostPerFixed
                                  }
                                />
                              </Grid>
                            )}
                          </Row>
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          className="d-flex justify-content-between mt-4 mb-0 BlueAndWhiteBtmFlex planFormBrn"
                        >
                          <WhiteButton
                            onClick={() => setModelOpen(false)}
                            label="Cancel"
                          />
                          {loader ? (
                            <LoaderComponent
                              loader={loader}
                              height="20"
                              width="20"
                            />
                          ) : (
                            <BlueButton
                              label={selectedProduct ? "Update" : "Create"}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
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

export default ProductAndService;
