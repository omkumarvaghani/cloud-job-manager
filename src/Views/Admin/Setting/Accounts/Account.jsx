import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Typography, Grid } from "@mui/material";
import { handleAuth } from "../../../../components/Login/Auth";
import AxiosInstance from "../../../AxiosInstance";
import sendSwal from "../../../../components/Swal/sendSwal";
import showToast from "../../../../components/Toast/Toster";
import { DeleteIcone, EditIcon } from "../../../../components/Icon/Index";
import Accounts from "./Views/Account";
import { Col } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
const Account = () => {
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
    handleAuth(navigate, location);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { companyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [tokenDecode, setTokenDecode] = useState(null);
  const isEdited = true;
  const CompanyId = localStorage.getItem("CompanyId");
  const companyId = tokenDecode?.companyId;
  const [modelOpen, setModelOpen] = useState(false);

  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  const getData = async () => {
    setLoader(true);
    try {
      const activeCompanyId = CompanyId || companyId;

      if (!activeCompanyId) {
        console.error("Company ID is not available.");
        return;
      }

      const res = await AxiosInstance.get(`/account/${activeCompanyId}`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
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
    if (CompanyId || companyId) {
      getData();
    }
  }, [rowsPerPage, page, search, CompanyId, companyId, sortField, sortOrder]);
  const handleEditClick = async (account_id) => {
    try {
      const response = await AxiosInstance.get(
        `/account/get_account/${account_id}`
      );

      formik.setValues({
        account_id: response.data.data.account_id || "",
        account_type: response.data.data.account_type || "",
        account_name: response.data.data.account_name || "",
        notes: response.data.data.notes || "",
      });
      setModelOpen(true);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  // const handleSubmit = async () => {
  //   try {
  //     const dataToSend = {
  //       ...formData,
  //       CompanyId: localStorage.getItem("CompanyId"),
  //     };
  //     let response;
  //     if (formData.account_id) {
  //       response = await AxiosInstance.put(
  //         `/account/${formData.account_id}`,
  //         dataToSend
  //       );
  //     } else {
  //       response = await AxiosInstance.post("/account", dataToSend);
  //     }
  //     if (response?.data?.statusCode === 200) {
  //       setTimeout(() => {
  //         showToast.success(response?.data?.message);
  //       }, 500);
  //     } else {
  //       setTimeout(() => {
  //         showToast.error(response?.data?.message);
  //       }, 500);
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error during submit:",
  //       error.response?.data || error.message
  //     );
  //     showToast.error("An error occurred while submitting data.");
  //   }
  // };

  const formik = useFormik({
    initialValues: {
      account_id: "",
      account_type: "",
      account_name: "",
      notes: "",
    },
    validationSchema: Yup.object({
      account_type: Yup.string().required("Account Type is required"),
      account_name: Yup.string().required("Account Name is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const dataToSend = {
          ...values,
          CompanyId: localStorage.getItem("CompanyId"),
        };
        let response;
        if (values.account_id) {
          response = await AxiosInstance.put(
            `/account/${values.account_id}`,
            dataToSend
          );
        } else {
          response = await AxiosInstance.post("/account", dataToSend);
        }

        if (response?.data?.statusCode === 200) {
          showToast.success(response?.data?.message);
          getData();
          setModelOpen(false);
          resetForm();
        } else {
          showToast.error(response?.data?.message);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          const validationErrors = error.response?.data?.errors;
          if (validationErrors && validationErrors.length > 0) {
            validationErrors.forEach((errorMessage) => {
              showToast.warning(errorMessage);
            });
          }
        } else {
          console.error(
            "Error during submit:",
            error.response?.data || error.message
          );
          showToast.error("An error occurred while submitting data.");
        }
      }
    },
  });

  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/account/${id}`, {
            data: { DeleteReason: deleteReason },
          });

          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);

            setcustomersData((prevData) =>
              prevData.filter((customer) => customer.account_id !== id)
            );

            getData();
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
  const cellData = customersData?.map((item, index) => {
    return {
      key: item?.account_id,
      value: [
        page * rowsPerPage + index + 1,
        `${item?.account_name || "account name not available"} `,
        item?.account_type || "account type not available",
        item?.notes || "notes not available",

        <Grid>
          <EditIcon
            className="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item?.account_id);
            }}
          />

          <DeleteIcone
            className="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item?.account_id);
            }}
          />
        </Grid>,
      ],
      collapseContent: item,
    };
  });

  const collapseData = customersData?.map((item) => ({
    notes: item?.notes || "No details provided",
  }));
  const handleCloseDialog = () => {
    setModelOpen(false);
    formik.resetForm();
    // setFormData({
    //   account_id: "",
    //   account_type: "",
    //   account_name: "",
    //   notes: "",
    // });
  };

  return (
    <>
      <Accounts
        loader={loader}
        search={search}
        setSearch={setSearch}
        cellData={cellData}
        collapseData={collapseData}
        page={page}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        rowsPerPage={rowsPerPage}
        companyName={companyName}
        countData={countData}
        isEdited={isEdited}
        modelOpen={modelOpen}
        setModelOpen={setModelOpen}
        handleSubmit={formik.handleSubmit}
        formData={formData}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        handleInputChange={handleInputChange}
        handleEditClick={handleEditClick}
        handleCloseDialog={handleCloseDialog}
        setFormData={setFormData}
        formik={formik}
        // setSortField={setSortField}
        // setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
    </>
  );
};

export default Account;
