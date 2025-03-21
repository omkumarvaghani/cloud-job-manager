import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../../components/Login/Auth";
import moment from "moment";
import sendSwal from "../../../../components/Swal/sendSwal";
import showToast from "../../../../components/Toast/Toster";
import * as Yup from "yup";
import { DeleteIcone, EditIcon } from "../../../../components/Icon/Index";
import { Grid } from "@mui/material";
import { Col } from "reactstrap";
import { Typography } from "@mui/material";
import RecurringCharge from "./view/RecurringCharge";
import { useFormik } from "formik";
import AxiosInstance from "../../../AxiosInstance";

function RecurringCharges() {
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const { CompanyName } = useParams();

  const location = useLocation();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [countData, setCountData] = useState(0);
  const [Singlerecurringcharge, setSinglerecurringcharge] = useState(false);

  const SinglecardToggle = () =>
    setSinglerecurringcharge(!Singlerecurringcharge);
  const [recurringChargeId, setRecurringChargeId] = useState("");
  const CompanyId = localStorage?.getItem("CompanyId");
  const CustomerId = location?.state?.id;
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [AssetAccounts, setAssetAccounts] = useState([]);
  const [LiabilityAccounts, setLiabilityAccounts] = useState([]);
  const [EquityAccounts, setEquityAccounts] = useState([]);
  const [RevenueAccounts, setRevenueAccounts] = useState([]);
  const [ExpenseAccounts, setExpenseAccounts] = useState([]);
  const [recAccounts, setRecAccounts] = useState([]);
  const [oneTimeAccounts, setoneTimeAccounts] = useState([]);
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [weekdayDropdownOpen, setWeekdayDropdownOpen] = useState(false);

  const toggleWeekdayDropdown = () =>
    setWeekdayDropdownOpen(!weekdayDropdownOpen);
  const [selectChargeDropDown, setSelectChargetDropDown] = useState(false);
  const toggles1 = () => setSelectChargetDropDown(!selectChargeDropDown);
  const toggleFrequencyDropdown = () =>
    setFrequencyDropdownOpen(!frequencyDropdownOpen);
  const [addBankAccountDialogOpen, setAddBankAccountDialogOpen] =
    useState(false);

  const fetchAccounts = async () => {
    if (localStorage.getItem("CompanyId")) {
      try {
        const res = await AxiosInstance.get(
          `/account/accounts/${localStorage.getItem("CompanyId")}`
        );
        if (res.data.statusCode === 200) {
          const filteredData1 = res.data.data.filter(
            (item) => item.account_type === "Asset"
          );
          const filteredData2 = res.data.data.filter(
            (item) => item.account_type === "Liability"
          );
          const filteredData3 = res.data.data.filter(
            (item) => item.account_type === "Equity"
          );
          const filteredData4 = res.data.data.filter(
            (item) => item.account_type === "Revenue"
          );
          const filteredData5 = res.data.data.filter(
            (item) => item.account_type === "Expense"
          );
          setAssetAccounts(filteredData1);
          setLiabilityAccounts(filteredData2);
          setEquityAccounts(filteredData3);
          setRevenueAccounts(filteredData4);
          setExpenseAccounts(filteredData5);
        } else if (res.data.statusCode === 201) {
          setRecAccounts();
          setoneTimeAccounts();
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };
  useEffect(() => {
    fetchAccounts();
  }, [localStorage.getItem("CompanyId")]);

  const formik = useFormik({
    initialValues: {
      CompanyId: CompanyId,
      CustomerId: CustomerId,
      recurring_charge_id: "",
      account_id: selectedAccountId || "",
      account_name: "",
      description: "",
      amount: "",
      frequency_interval: "",
      frequency: selectedFrequency || "",
      day_of_month: "",
      weekday: "",
      day_of_year: "",
      month: "",
      days_after_quarter: "",
    },
    validationSchema: Yup.object({
      account_id: Yup.string().required("Account is required"),
      frequency: Yup.string().required("Frequency is required"),
      amount: Yup.string()
        .required("Amount is required"),
        // .matches(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
      frequency_interval: Yup.number().when("frequency", {
        is: (freq) => freq === "Every n Months" || freq === "Every n Weeks",
        then: (schema) =>
          schema
            .required("Frequency interval is required")
            .min(1, "Must be at least 1"),
        otherwise: (schema) => schema.notRequired(),
      }),
      day_of_month: Yup.number().when("frequency", {
        is: (freq) => freq === "Monthly" || freq === "Every n Months",
        then: (schema) =>
          schema
            .required("Day of the month is required")
            .min(1)
            .max(28, "Day must be between 1 and 28"),
        otherwise: (schema) => schema.notRequired(),
      }),
      day_of_year: Yup.number().when("frequency", {
        is: "Yearly",
        then: (schema) =>
          schema
            .required("Day of year is required")
            .min(1)
            .max(28, "Day must be between 1 and 28"),
        otherwise: (schema) => schema.notRequired(),
      }),
      month: Yup.number().when("frequency", {
        is: "Yearly",
        then: (schema) =>
          schema
            .required("Month is required")
            .min(1)
            .max(12, "Month must be between 1 and 12"),
        otherwise: (schema) => schema.notRequired(),
      }),
      weekday: Yup.string().when("frequency", {
        is: "Weekly",
        then: (schema) => schema.required("Weekday is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      days_after_quarter: Yup.number().when("frequency", {
        is: "Quarterly",
        then: (schema) =>
          schema
            .required("Days after quarter is required")
            .min(0)
            .max(90, "Value must be between 0 and 90"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const dataToPost = {
          ...values,
          CompanyId: CompanyId,
          CustomerId: CustomerId,
        };
        let res;
        if (recurringChargeId) {
          res = await AxiosInstance.put(
            `/recurring-charge/updatereccharge/${recurringChargeId}`,
            dataToPost
          );

          if (res.data.statusCode === 200) {
            showToast.success("Recurring Charge Updated Successfully");
          } else {
            showToast.error(res.data.message);
          }
        } else {
          res = await AxiosInstance.post(`/recurring-charge`, dataToPost);

          if (res.data.statusCode === 200) {
            showToast.success("Charge Added Successfully");
          } else {
            showToast.error(res.data.message);
          }
        }

        if (res.data.statusCode === 200) {
          formik.resetForm();
          setSelectedFrequency("");
          setSelectedAccountId("");
          setPaymentOpen(false);
          getTabData();
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
        getTabData();
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (formik.values.frequency === "Yearly") {
      formik.setFieldValue("weekday", "");
      formik.setFieldValue("frequency_interval", "");
      formik.setFieldValue("day_of_month", "");
    } else if (
      formik.values.frequency === "Weekly" ||
      formik.values.frequency === "Every n Weeks"
    ) {
      formik.setFieldValue("day_of_month", "");
      formik.setFieldValue("day_of_year", "");
      formik.setFieldValue("month", "");
    } else if (formik.values.frequency === "Quarterly") {
      formik.setFieldValue("day_of_month", "");
      formik.setFieldValue("weekday", "");
      formik.setFieldValue("day_of_year", "");
      formik.setFieldValue("month", "");
    } else if (formik.values.frequency === "Monthly") {
      formik.setFieldValue("day_of_year", "");
      formik.setFieldValue("weekday", "");
      formik.setFieldValue("month", "");
    } else if (formik.values.frequency === "Every n Months") {
      formik.setFieldValue("weekday", "");
      formik.setFieldValue("day_of_year", "");
      formik.setFieldValue("month", "");
    }
  }, [formik.values.frequency]);
  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  const getTabData = async () => {
    setLoader(true);
    try {
      const res = await AxiosInstance.get(
        `/recurring-charge/${location.state.id}`,
        {
          params: {
            pageSize: rowsPerPage,
            pageNumber: page,
            search: search || "",
            sortField: sortField,
            sortOrder: sortOrder,
          },
        }
      );
      if (res?.data) {
        setcustomersData(res.data.data || []);
        setCountData(res.data.totalCount || 0);
      } else {
        console.error("No data received from the server.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    getTabData(location.state.id);
  }, [rowsPerPage, search, page, sortField, sortOrder]);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (dateFormat?.Format) {
        setDateFormat(dateFormat?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [dateFormat]);

  const handleEditClick = async (id) => {
    try {
      const response = await AxiosInstance.get(
        `/recurring-charge/recurring/${id}`
      );
      if (response.data.statusCode === 200) {
        setPaymentOpen({
          isOpen: true,
          propertyData: response.data.data,
        });
        formik.setValues({
          ...formik.values,
          account_id: response?.data.data?.account_details?.account_id || "",
          description: response?.data.data?.description || "",
          amount: response?.data.data?.amount || "",
          frequency: response?.data?.data?.frequency || "",
          frequency_interval: response?.data.data?.frequency_interval || "",
          day_of_month: response?.data?.data?.day_of_month || "",
          weekday: response?.data?.data?.weekday || "",
          month: response?.data?.data?.month || "",
          account_name:
            response?.data?.data?.account_details?.account_name || "",
          day_of_year: response?.data?.data?.day_of_year || "",
          days_after_quarter: response?.data?.data?.days_after_quarter || "",
          recurring_charge_id: response?.data?.data?.recurring_charge_id || "",
        });
        setRecurringChargeId(response.data.data.recurring_charge_id || "");
      } else {
        showToast.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast.error("Error fetching details");
    }
  };
  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(
            `/recurring-charge/deletereccharge/${id}`,
            {
              data: { DeleteReason: deleteReason },
            }
          );

          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);

            setcustomersData((prevData) =>
              prevData.filter(
                (transactions) => transactions.recurring_charge_id !== id
              )
            );
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error?.message || "An error occurred");
        }
      } else {
        showToast.success("Customer is safe!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    });

    setTimeout(() => {
      const deleteButton = document?.querySelector(".swal-button--confirm");
      if (deleteButton) {
        deleteButton.disabled = true;
      }
    }, 0);
  };
  const cellData = customersData?.map((item, index) => {
    const properties = item?.location || [];

    let propertyDisplay;
    if (properties.length === 1) {
      const property = properties[0];
      propertyDisplay = `${property?.Address || "Address not available"} ,${
        property?.City || "City not available"
      } ,${property?.State || "State not available"} ,${
        property?.Country || "Country not available"
      },${property?.Zip || "Zip not available"} `;
    } else {
      propertyDisplay = `${properties.length} ${
        properties?.length > 1 ? "Properties" : "Property"
      }`;
    }

    const CycleData = () => {
      if (
        item?.frequency?.toLowerCase() === "every n months" ||
        item?.frequency?.toLowerCase() === "every n weeks"
      ) {
        const frequencyValue = item?.frequency_interval;
        return item.frequency.replace("n", frequencyValue);
      }
      return item?.frequency || "frequency not available";
    };

    return {
      key: item?.recurring_charge_id,
      value: [
        page * rowsPerPage + index + 1,

        CycleData(),
        item?.account_name || "account_name not available",
        // `$${item?.amount?.toFixed(2) ?? ") not available"}`,
        `$${
          new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(item?.amount || 0.0) ?? ") not available"
        }`,
        item?.description || "description not available",
        moment(item.createdAt).format(dateFormat),
        item?.nextDueDate
          ? moment(item.nextDueDate).isValid()
            ? moment(item.nextDueDate).format(dateFormat)
            : "n/a"
          : "n/a",
        <>
          <EditIcon
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item?.recurring_charge_id);
            }}
          />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <DeleteIcone
            className="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item?.recurring_charge_id);
            }}
          />
        </>,
      ],
      component: item,
      component: item,
    };
  });
  const CollapseData = ({ data }) => {
    const fieldsToShow = [
      { label: "Days After Quarter", value: data?.days_after_quarter },
      { label: "Month", value: data?.month },
      { label: "Day of Year", value: data?.day_of_year },
      { label: "Day of Month", value: data?.day_of_month },
      { label: "Weekday", value: data?.weekday },
      { label: "Frequency Interval", value: data?.frequency_interval },
    ];

    const validFields = fieldsToShow.filter(
      (field) =>
        field.value !== null && field.value !== undefined && field.value !== ""
    );

    return (
      <Grid className="d-flex gap-4 mt-3 mb-3 w-100">
        <Col className="card col-8 productDetaillTable">
          <Grid
            className="card-body w-100"
            style={{ backgroundColor: "#D8E7EE" }}
          >
            {validFields.length > 0 && (
              <Grid>
                {validFields.map((field, index) => (
                  <Grid
                    key={index}
                    className="d-flex flex-row justify-content-between gap-2 mt-1"
                  >
                    <Typography className="text-blue-color">
                      {field.label}:{" "}
                    </Typography>
                    <Typography className="text-blue-color">
                      {field.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Col>
      </Grid>
    );
  };
  const [modelOpen, setModelOpen] = useState(false);

  const [formData, setFormData] = useState({
    account_id: "",
    account_type: "",
    account_name: "",
    notes: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async () => {
    try {
      setLoader(true);
      const dataToSend = {
        ...formData,
        CompanyId: localStorage.getItem("CompanyId"),
      };
      let response;
      if (formData.account_id) {
        response = await AxiosInstance.put(
          `/account/${formData.account_id}`,
          dataToSend
        );
      } else {
        response = await AxiosInstance.post("/account", dataToSend);
      }
      if (response?.data?.statusCode === 200) {
        setTimeout(() => {
          showToast.success(response?.data?.message);
        }, 500);
        // Clear form data after successful submission
        setFormData({
          account_id: "",
          account_type: "",
          account_name: "",
          notes: "",
        });
        fetchAccounts();
      } else {
        setTimeout(() => {
          showToast.error(response?.data?.message);
        }, 500);
      }
    } catch (error) {
      console.error(
        "Error during submit:",
        error.response?.data || error.message
      );
      showToast.error("An error occurred while submitting data.");
    } finally {
      setLoader(false);
    }
  };

  const handleCloseDialog = () => {
    setModelOpen(false);
    setFormData({
      account_id: "",
      account_type: "",
      account_name: "",
      notes: "",
    });
  };

  return (
    <>
      <RecurringCharge
        loader={loader}
        navigate={navigate}
        SinglecardToggle={SinglecardToggle}
        search={search}
        setSearch={setSearch}
        page={page}
        CollapseData={CollapseData}
        setRowsPerPage={setRowsPerPage}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        formik={formik}
        paymentOpen={paymentOpen}
        setSelectedAccountId={setSelectedAccountId}
        setSelectedFrequency={setSelectedFrequency}
        addBankAccountDialogOpen={addBankAccountDialogOpen}
        setAddBankAccountDialogOpen={setAddBankAccountDialogOpen}
        AssetAccounts={AssetAccounts}
        toggles1={toggles1}
        selectChargeDropDown={selectChargeDropDown}
        toggleWeekdayDropdown={toggleWeekdayDropdown}
        weekdayDropdownOpen={weekdayDropdownOpen}
        toggleFrequencyDropdown={toggleFrequencyDropdown}
        frequencyDropdownOpen={frequencyDropdownOpen}
        fetchAccounts={fetchAccounts}
        setPaymentOpen={setPaymentOpen}
        cellData={cellData}
        countData={countData}
        loading={loading}
        location={location}
        CompanyName={CompanyName}
        handleCloseDialog={handleCloseDialog}
        setModelOpen={setModelOpen}
        handleSubmit={handleSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        recurringChargeId={recurringChargeId}
        setRecurringChargeId={setRecurringChargeId}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
    </>
  );
}

export default RecurringCharges;
