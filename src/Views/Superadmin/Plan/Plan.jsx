import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
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
import FormControl from "@mui/material/FormControl";
import swal from "sweetalert";
import "./style.css";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  FormGroup,
} from "reactstrap";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import AxiosInstance from "../../AxiosInstance.jsx";
import CancelIcon from "@mui/icons-material/Close";
import InputText from "../../../components/InputFields/InputText.jsx";
import InputDropdown from "../../../components/InputFields/InputDropdown.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DeleteIcone,
  EditIcon,
  LoaderComponent,
} from "../../../components/Icon/Index.jsx";
import BlueButton from "../../../components/Button/BlueButton.jsx";
import WhiteButton from "../../../components/Button/WhiteButton.jsx";
import showToast from "../../../components/Toast/Toster.jsx";
import DollartInput from "../../../components/InputFields/Doller.jsx";

const Plan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planId, setPlanId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [teamSize, setTeamSize] = useState([]);
  const [countData, setCountData] = useState(0);
  const [loader, setLoader] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const getData = async () => {
    try {
      const res = await AxiosInstance.get(`${baseUrl}/plan`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      setTeamSize(res.data?.data);
      setCountData(res.data?.count);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search,sortField, sortOrder]);

  const [isMostPopular, setIsMostPopular] = useState(
    selectedPlan ? selectedPlan.IsMostpopular : false
  );

  useEffect(() => {
    if (selectedPlan) {
      setIsMostPopular(selectedPlan.IsMostpopular);
    }
  }, [selectedPlan]);

  const handleSubmit = async (values, resetForm) => {
    try {
      setLoader(true);
      values.IsMostpopular = isMostPopular;
      let res;
      if (!planId) {
        res = await AxiosInstance.post(`${baseUrl}/plan`, values);
        if (res.data.statusCode === 200) {
          setModelOpen(false);
          getData();
          setTimeout(() => {
            showToast.success(res.data.message);
            setIsMostPopular(false);
            setSelectedMonth(null);
            setSelectedDay(null);
            resetForm();
          }, 500);
        } else if (res.data.statusCode === 202) {
          const userConfirmed = await swal({
            title: "Are you sure?",
            text: "The most popular plan already exists. Do you want to replace it with the new plan?",
            icon: "warning",
            buttons: {
              cancel: "Cancel",
              confirm: {
                text: "Proceed",
                closeModal: true,
                value: true,
                className: "bg-orange-color",
              },
            },
            dangerMode: true,
          });

          if (userConfirmed) {
            values.confirmReplace = true;
            res = await AxiosInstance.post(`${baseUrl}/plan`, values);
            if (res.data.statusCode === 200) {
              setModelOpen(false);
              getData();
              setTimeout(() => {
                showToast.success(res.data.message);
                setIsMostPopular(false);
                setSelectedMonth(null);
                setSelectedDay(null);
                resetForm();
              }, 500);
            }
          }
        } else {
          setTimeout(() => {
            showToast.error(res.data.message);
          }, 500);
        }
      } else {
        res = await AxiosInstance.put(`${baseUrl}/plan/${planId}`, values);
        if (res.data.statusCode === 200) {
          setModelOpen(false);
          getData();
          setTimeout(() => {
            showToast.success(res.data.message);
            setIsMostPopular(false);
            setSelectedMonth(null);
            setSelectedDay(null);
            resetForm();
          }, 500);
        } else if (res.data.statusCode === 202) {
          setTimeout(() => {
            showToast.success(res.data.message);
          }, 500);
        } else {
          setTimeout(() => {
            showToast.error(res.data.message);
          }, 500);
        }
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
  };

  

  const handleEditClick = (item) => {
    setSelectedPlan(item);
    setSelectedDay({ name: item?.DayOfMonth, code: item?.DayOfMonth });
    setSelectedMonth({
      name: item?.MonthFrequency,
      code: item?.MonthFrequency,
    });
    setPlanId(item?.PlanId);
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
          const response = await AxiosInstance.delete(`${baseUrl}/plan/${id}`);
          if (response?.data.statusCode === 200) {
            setTimeout(() => {
              setTimeout(() => {
                showToast.success(response?.data.message);
              }, 500);
            }, 500);
            getData();
          } else if (response?.data.statusCode === 201) {
            setTimeout(() => {
              showToast.warning(response?.data.message);
            }, 500);
          } else {
            setTimeout(() => {
              showToast.error("", response?.data.message, "error");
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
          showToast.success("Plan is safe!", {
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
        <Grid className="card col-8">
          <Grid
            className="card-body w-100"
            style={{ backgroundColor: "#D8E7EE" }}
          >
            <Grid className="d-flex w-100 flex-row justify-content-between gap-2">
              <Typography className="text-blue-color">Description: </Typography>
              <Typography
                className="text-blue-colo "
                style={{
                  backgroundColor: "white",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                  width: "100%",
                  fontSize: "15px",
                  marginBottom: "7px",
                }}
              >
                {data?.PlanDetail || "PlanDetail not available"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const cellData = teamSize?.map((item, index) => {
    const createdAt = new Date(item.createdAt);

    const formattedDate = `${(createdAt.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${createdAt
      .getDate()
      .toString()
      .padStart(2, "0")}-${createdAt.getFullYear()}`;

    return {
      key: item.PlanId,
      value: [
        page * rowsPerPage + index + 1,
        item?.PlanName || "PlanName not available",
        <>
          $
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(item?.PlanPrice ?? 0)}
        </>,

        item?.MonthFrequency || "MonthFrequency not available",
        formattedDate,
        <>
          <EditIcon
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item);
            }}
          />
          <DeleteIcone
            className="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item?.PlanId);
            }}
          />
        </>,
      ],
      component: item,
    };
  });

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 mt-5">
        <Grid className="d-flex justify-content-end mb-2">
          <BlueButton
            onClick={() => {
              setSelectedPlan(null);
              setSelectedDay(null);
              setSelectedMonth(null);
              setModelOpen(true);
              setPlanId(null);
            }}
            label=" Add Plan"
            className="add-plan-super"
          />
        </Grid>
        <Card
          style={{
            borderRadius: "20px",
            border: "2px solid #063164",
            whiteSpace: "nowrap",
          }}
        >
          <CardHeader
            className="d-flex border-blue-color justify-content-between align-items-center table-header bg-blue-color customersAddCustomers"
            style={{
              borderBottom: "2px solid ",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography className="plan text-light heading-five tableNameHead  fw-medium">
              Plans
            </Typography>
            <Grid className="plansearch d-flex searchBarOfTable">
              <JobberSearch
                search={search}
                setSearch={setSearch}
                style={{ background: "transparant", color: "#fff" }}
              />
            </Grid>
          </CardHeader>
          {loader ? (
            <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
              <LoaderComponent loader={loader} height="50" width="50" />
            </Grid>
          ) : (
            <CardBody style={{ padding: "10px 0px" }}>
              <JobberTable
                // headerData={[
                //   "Plan Name",
                //   "Plan Price",
                //   "Month Frequency",
                //   "Created At",
                //   "Action",
                // ]}
                headerData={[
                  { label: "Sr No." },
                  { label: "Plan Name", field: "PlanName" },
                  { label: "Plan Price", field: "PlanPrice" },
                  { label: "Month Frequency", field: "MonthFrequency" },
                  { label: "Created At", field: "createdAt" },
                  { label: "Action" },
                ]}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
                cellData={cellData}
                CollapseComponent={(data) => CollapseData(data)}
                isCollapse={true}
                page={page}
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
      <Dialog
        fullWidth
        open={modelOpen}
        // onClose={() => setModelOpen(false)}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            setModelOpen(false);
          }
        }}
        disableEscapeKeyDown
      >
        <DialogTitle className="text-blue-color borerBommoModel ">
          <Grid className="d-flex justify-content-between">
            <Grid>{"Plan Form"}</Grid>
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
              PlanName: selectedPlan ? selectedPlan.PlanName : "",
              PlanPrice: selectedPlan ? selectedPlan.PlanPrice : "",
              PlanDetail: selectedPlan ? selectedPlan.PlanDetail : "",
              MonthFrequency: selectedMonth ? selectedMonth.code : "",
              DayOfMonth: selectedDay ? selectedDay.code : "",
              IsMostpopular: selectedPlan ? selectedPlan.IsMostpopular : false,
            }}
            validationSchema={Yup.object().shape({
              PlanName: Yup.string().required("Plan Name Required"),
              PlanPrice: Yup.string().required("Plan Price Required"),
              PlanDetail: Yup.string().required("Plan Details Required"),
              MonthFrequency: Yup.string().required("Month Frequency Required"),
              DayOfMonth: Yup.number().required("Day Of Month Required"),
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
            }) => (
              <Form>
                <Grid>
                  <Grid spacing={2} className="mt-3 pla-company">
                    <Grid item xs={12} sm={6} md={4}>
                      <InputText
                        type="text"
                        size="small"
                        fullWidth
                        placeholder="Enter add title"
                        label="Title "
                        name="PlanName"
                        value={values?.PlanName}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        inputProps={{
                          style: {},
                        }}
                        className="text-blue-color border-blue-color"
                      />
                      {touched.PlanName && errors.PlanName ? (
                        <Grid className="text-danger">{errors.PlanName}</Grid>
                      ) : null}
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    spacing={2}
                    className="mt-1 pla-company costDetialPlan"
                  >
                    <Grid item xs={12} className="topPlanInput">
                      <InputText
                        type="text"
                        size="small"
                        fullWidth
                        placeholder="Enter add plan details"
                        label="Plan Details"
                        name="PlanDetail"
                        value={values?.PlanDetail}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        inputProps={{
                          style: {},
                        }}
                        className="text-blue-color border-blue-color"
                      />
                      {touched.PlanDetail && errors.PlanDetail ? (
                        <Grid className="text-danger">{errors.PlanDetail}</Grid>
                      ) : null}
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} className="mt-1 mb-3 pla-company">
                    <Grid item xs={12} className="topPlanInput">
                      <DollartInput
                        type="number"
                        size="small"
                        fullWidth
                        placeholder="Enter Cost Per Billing Cycle"
                        label="Cost Per Billing Cycle"
                        name="PlanPrice"
                        value={values?.PlanPrice}
                        onBlur={handleBlur}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value < 0) {
                            e.target.value = 0;
                          }
                          handleChange(e);
                        }}
                        className="text-blue-color border-blue-color"
                        inputProps={{
                          style: {
                            height: "40px",
                          },
                          min: "0",
                        }}
                      />
                      {touched.PlanPrice && errors.PlanPrice ? (
                        <Grid className="text-danger">{errors.PlanPrice}</Grid>
                      ) : null}
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} className="plan_billing">
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputDropdown
                          onChange={(_, newValue) => {
                            setSelectedMonth(newValue);
                            setFieldValue(
                              "MonthFrequency",
                              newValue ? newValue.code : ""
                            );
                          }}
                          isOptionEqualToValue={(option, value) =>
                            option.code === value.code
                          }
                          options={[
                            { name: "1", code: "1" },
                            { name: "2", code: "2" },
                            { name: "3 (Quarterly)", code: "3 (Quarterly)" },
                            { name: "4", code: "4" },
                            { name: "5", code: "5" },
                            {
                              name: "6 (Bi-Annually)",
                              code: "6 (Bi-Annually)",
                            },
                            { name: "7", code: "7" },
                            { name: "8", code: "8" },
                            { name: "9", code: "9" },
                            { name: "10", code: "10" },
                            { name: "11", code: "11" },
                            { name: "12 (Annually)", code: "12 (Annually)" },
                          ]}
                          value={selectedMonth || null}
                          inputValue={values.MonthFrequency}
                          onTextFieldChange={handleChange}
                          onBlur={handleBlur}
                          getOptionLabel={(option) => option.name || ""}
                          z={(options, state) => {
                            return options.filter((option) =>
                              option.name
                                .toLowerCase()
                                .includes(state.inputValue.toLowerCase())
                            );
                          }}
                          name="MonthFrequency"
                          label="Plan Billing Interval"
                          type="text"
                        />
                        {touched.MonthFrequency && errors.MonthFrequency ? (
                          <Grid className="text-danger mb-0">
                            {errors.MonthFrequency}
                          </Grid>
                        ) : null}
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    {/* Dropdown for Charge on Day of Month */}
                    <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        className="charge_box chargeBOXINPUT"
                      >
                        <InputDropdown
                          onChange={(_, newValue) => {
                            setSelectedDay(newValue);
                            setFieldValue(
                              "DayOfMonth",
                              newValue ? newValue.code : ""
                            );
                          }}
                          isOptionEqualToValue={(option, value) =>
                            option?.code === value?.code
                          }
                          options={[
                            { name: "1", code: "1" },
                            { name: "2", code: "2" },
                            { name: "3", code: "3" },
                            { name: "4", code: "4" },
                            { name: "5", code: "5" },
                            { name: "6", code: "6" },
                            { name: "7", code: "7" },
                            { name: "8", code: "8" },
                            { name: "9", code: "9" },
                            { name: "10", code: "10" },
                            { name: "11", code: "11" },
                            { name: "12", code: "12" },
                            { name: "13", code: "13" },
                            { name: "14", code: "14" },
                            { name: "15", code: "15" },
                            { name: "16", code: "16" },
                            { name: "17", code: "17" },
                            { name: "18", code: "18" },
                            { name: "19", code: "19" },
                            { name: "20", code: "20" },
                            { name: "21", code: "21" },
                            { name: "22", code: "22" },
                            { name: "23", code: "23" },
                            { name: "24", code: "24" },
                            { name: "25", code: "25" },
                            { name: "26", code: "26" },
                            { name: "27", code: "27" },
                            { name: "28", code: "28" },
                          ]}
                          value={selectedDay || null}
                          inputValue={values.DayOfMonth}
                          onTextFieldChange={handleChange}
                          onBlur={handleBlur}
                          getOptionLabel={(option) => option.name || ""}
                          z={(options, state) => {
                            return options.filter((option) =>
                              option.name
                                .toLowerCase()
                                .includes(state.inputValue.toLowerCase())
                            );
                          }}
                          name="DayOfMonth"
                          label="Charge on Day of Month"
                          type="text"
                        />
                        {touched.DayOfMonth && errors.DayOfMonth ? (
                          <Grid className="text-danger">
                            {errors.DayOfMonth}
                          </Grid>
                        ) : null}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormGroup switch className="my-3 planFormSwitchDown">
                        <Input
                          type="switch"
                          checked={isMostPopular}
                          style={{ cursor: "pointer" }}
                          onChange={(event) => {
                            setIsMostPopular(event.target.checked);
                            setFieldValue(
                              "IsMostpopular",
                              event.target.checked
                            );
                          }}
                        />
                        Most Popular Plan
                      </FormGroup>
                    </Grid>
                  </Grid>

                  <Grid className="d-flex justify-content-between mb-1 flexPlanButn">
                    <WhiteButton
                      className="planCancelBtn"
                      onClick={() => setModelOpen(false)}
                      label="Cancel"
                      style={{ marginTop: "13px" }}
                    />
                    {loader ? (
                      <LoaderComponent loader={loader} height="20" width="20" />
                    ) : (
                      <BlueButton
                        className="mt-3 text-capitalize bg-blue-color form-update-btn"
                        label={selectedPlan ? "Update" : "Add"}
                      />
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

export default Plan;
