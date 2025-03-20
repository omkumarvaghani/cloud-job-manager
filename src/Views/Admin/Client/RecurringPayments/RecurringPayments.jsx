import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../../components/Login/Auth";
import moment from "moment";
import sendSwal from "../../../../components/Swal/sendSwal";
import showToast from "../../../../components/Toast/Toster";
import * as Yup from "yup";
import { DeleteIcone, EditIcon } from "../../../../components/Icon/Index";
import { DialogContent, Grid } from "@mui/material";
import { Col } from "reactstrap";
import { Typography } from "@mui/material";
import RecurringPayment from "./Views/RecurringPayments";
import { useFormik } from "formik";
import PaymentDisplay from "../../../../assets/Blue-sidebar-icon/PaymentDisplay.svg";
import DialogComponent from "../../../../components/Dialog/Dialog";
import {
  getCardDetails,
  getCardLogo,
  getCardType,
  getRecurringCards,
  getTokenizationKeyCustomer,
} from "../../../../plugins/ApiHandler";
import { addTokenizationScript } from "../../../../plugins/helpers";
import AxiosInstance from "../../../AxiosInstance";

function RecurringPayments() {
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);

  const location = useLocation();
  const { companyName } = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitloading, setsubmitLoading] = useState(false);
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
  const [recurringId, setRecurringId] = useState("");
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
      billing_id: "",
      card_type: "",
      customer_vault_id: "",
      cc_number: "",
      recurringId: "",
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
        .required("Amount is required")
        .matches(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
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
        setsubmitLoading(true);
        const dataToPost = {
          ...values,
          CompanyId: CompanyId,
          CustomerId: CustomerId,
        };
        let res;
        if (recurringChargeId) {
          res = await AxiosInstance.put(
            `/recurring-payment/${recurringChargeId}`,
            dataToPost
          );

          if (res.data.statusCode === 200) {
            showToast.success("Recurring Payment Updated Successfully");
          } else {
            showToast.error(res.data.message);
          }
        } else {
          res = await AxiosInstance.post(
            `/recurring-payment/add-cards`,
            dataToPost
          );

          if (res.data.statusCode === 200) {
            showToast.success("Payment Added Successfully");
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
        setsubmitLoading(false);
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
        `/recurring-payment/${location.state.id}`,
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
    getTabData();
  }, [rowsPerPage, search, page,sortField, sortOrder]);

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
        `/recurring-payment/recurring-payments/${id}`
      );
      if (response.data.statusCode === 200) {
        setPaymentOpen({
          isOpen: true,
          propertyData: response.data.data,
        });
        formik.setValues({
          ...formik.values,
          account_id: response?.data.data?.account_details?.account_id || "",
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
          recurringId: response?.data?.data?.recurringId || "",

          cc_number: response?.data?.data?.cc_number || "",
          billing_id: response?.data.data?.billing_id || "",
          card_type: response?.data?.data?.card_type || "",
          customer_vault_id: response?.data.data?.customer_vault_id || "",
          description: response?.data.data?.description || "",
        });
        setRecurringChargeId(response.data.data.recurringId || "");
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
            `/recurring-payment/deleterecpayment/${id}`,
            {
              data: { DeleteReason: deleteReason },
            }
          );

          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);

            setcustomersData((prevData) =>
              prevData.filter((transactions) => transactions.recurringId !== id)
            );
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error?.message || "An error occurred");
        }
      } else {
        showToast.success("Recurring Payment is safe!", {
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
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const [statusData, setStatusData] = useState(null);

  const handleDialogOpen = () => {
    setAddStatusOpen(true);
  };

  const handleDialogClose = () => {
    setAddStatusOpen(false);
    setStatusData(null);
    setRecurringId(null);
  };

  const cellData = customersData?.map((item, index) => {
    const properties = item?.location || [];

    let propertyDisplay;
    if (properties.length === 1) {
      const property = properties[0];
      propertyDisplay = `${property?.Address || "Address not available"} ,${
        property?.City || "City not available"
      } ,${property?.State || "State not available"} ,${property?.Country || "Country not available"},${
        property?.Zip || "Zip not available"
      } `;
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
      key: item?.recurringId,
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
              handleEditClick(item?.recurringId);
            }}
          />
          &nbsp;
          <DeleteIcone
            className="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item?.recurringId);
            }}
          />
          &nbsp;&nbsp;&nbsp;
          <img
            src={PaymentDisplay}
            alt="img"
            style={{ cursor: "pointer",marginTop:"-6px" }}
            onClick={(e) => {
              handleDialogOpen();
              e.stopPropagation();
              setRecurringId(item?.recurringId);
            }}
          />
        </>,
      ],
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

  const handleSetCardDetails = async (item) => {
    try {
      const cardType = await getCardType(item.cc_bin, item.cc_type);
      const cardLogo = await getCardLogo(item.cc_type);

      return {
        billing_id: item["@attributes"].id,
        cc_number: item.cc_number,
        cc_exp: item.cc_exp,
        cc_type: item.cc_type,
        cc_bin: item.cc_bin,
        customer_vault_id: item.customer_vault_id,
        card_type: cardType,
        card_logo: cardLogo,
      };
    } catch (error) {
      console.error(error, "error in bin check");
      return {};
    }
  };

  const [customerCards, setCustomerCards] = useState([]);
  const [selectCardDropDown, setSelectCardDropDown] = useState(false);
  const togglesCard = () => setSelectCardDropDown(!selectCardDropDown);
  const fetchRecurringCardData = async () => {
    setLoading(true);
    try {
      // const CustomerId = CustomerId;

      try {
        const cardDetails = await getCardDetails({
          CustomerId,
          type: "card",
          CompanyId,
        });

        const cards = [];
        const billingData = cardDetails?.data?.customer;

        if (!billingData) {
          return;
        }

        if (Array.isArray(billingData.billing)) {
          const extractedData = await Promise.all(
            billingData.billing.map((item) => handleSetCardDetails(item))
          );
          cards.push(...extractedData.filter((item) => item));
        } else if (billingData) {
          const extractedData = await handleSetCardDetails(billingData.billing);
          if (extractedData) cards.push(extractedData);
        }

        if (!cards.length) {
          return;
        }

        // customers.push({ ...customer, cards });
        setCustomerCards(cards);

        if (recurringId) {
          const recurringData = await getRecurringCards(recurringId);

          if (recurringData && recurringData?.data) {
            // recurrings.push({
            //   ...recurringData?.data,
            //   recurrings: [
            //     {
            //       billing_id: recurringData?.data.billing_id,
            //       amount: recurringData?.data?.amount,
            //       card_type: recurringData?.data?.card_type,
            //       account_id: recurringData?.data?.account_id,
            //       frequency: recurringData?.data?.frequency,
            //       day_of_month: recurringData?.data?.day_of_month,
            //       day_of_year: recurringData?.data?.day_of_year,
            //       days_after_quarter: recurringData?.data?.days_after_quarter,
            //       month: recurringData?.data?.month,
            //       frequency_interval: recurringData?.data?.frequency_interval,
            //     },
            //   ],
            // });
          } else {
            // recurrings.push({
            //   CustomerId: customer.CustomerId,
            //   customer_vault_id,
            //   CompanyId: companyId || "",
            //   recurrings: [
            //     { billing_id: "", amount: "", card_type: "", account_id: "" },
            //   ],
            // });
          }
        } else {
          return;
        }
      } catch (customerError) {
        console.error(
          `Error processing customer ${CustomerId}: `,
          customerError
        );
      }
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentOpen) {
      fetchRecurringCardData();
    }
  }, [paymentOpen]);

  const [modalShow, setModalShow] = useState(false);
  const [scriptGenerating, setScriptGenerating] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [isPublicKeyAvailable, setIsPublicKeyAvailable] = useState(false);
  const getNmiKey = async (Company_Id) => {
    setScriptGenerating(true);
    setScriptError("");

    try {
      const keyResponse = await getTokenizationKeyCustomer(Company_Id);
      if (keyResponse?.PublicKey) {
        setIsPublicKeyAvailable(true);
      } else {
        setIsPublicKeyAvailable(false);
      }
      await addTokenizationScript(keyResponse?.PublicKey);
    } catch (error) {
      setScriptError(
        error ||
          "Failed to load the tokenization script. Make sure you have suitable internet connection."
      );
    } finally {
      setScriptGenerating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const CompanyId = location?.state?.id;
      await getNmiKey(CompanyId);
    };
    fetchData();
  }, []);

  return (
    <>
      <RecurringPayment
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
        customerCards={customerCards}
        selectCardDropDown={selectCardDropDown}
        togglesCard={togglesCard}
        loading={loading}
        isPublicKeyAvailable={isPublicKeyAvailable}
        scriptError={scriptError}
        scriptGenerating={scriptGenerating}
        setModalShow={setModalShow}
        modalShow={modalShow}
        CustomerId={CustomerId}
        CompanyId={CompanyId}
        fetchRecurringCardData={fetchRecurringCardData}
        submitloading={submitloading}
        companyName={companyName}
        recurringChargeId={recurringChargeId}
        setRecurringChargeId={setRecurringChargeId}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
      <DialogComponent
        addStatusOpen={addStatusOpen}
        handleDialogClose={handleDialogClose}
        setStatusData={setStatusData}
        statusData={statusData}
        recurringId={recurringId}
      />
    </>
  );
}

export default RecurringPayments;
