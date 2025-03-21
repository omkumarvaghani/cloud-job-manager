import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance.jsx";
import { useFormik } from "formik";
import * as Yup from "yup";
import { postFile } from "../../../components/Files/Functions.jsx";
import InvoiceViews from "./Views/Invoice.jsx";
import sendSwal from "../../../components/Swal/sendSwal.jsx";
import { DeleteIcone, EditIcon } from "../../../components/Icon/Index.jsx";
import showToast from "../../../components/Toast/Toster.jsx";
import { Typography } from "@mui/material";
import moment from "moment";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import { useStaffContext } from "../../../components/StaffData/Staffdata.jsx";

const Invoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loader, setLoader] = useState(true);
  const [isCustomer, setIsCustomer] = useState(false);
  const [source, setModalSource] = useState(false);
  const [countData, setCountData] = useState(0);
  const [isProperty, setIsProperty] = useState(false);
  const [propertyData, setPropertyData] = useState({});
  const [customersData, setCustomersData] = useState({});
  const [loading, setLoading] = useState(false);
  const { staffData } = useStaffContext();

  const [invoiceData, setInvoiceData] = useState([]);
  const [tokenDecode, setTokenDecode] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [lineItems, setLineItems] = useState([
    {
      Description: "",
      Name: "",
      Type: "",
      Units: "",
      Attachment: "",
      CostPerUnit: "",
      Cost: "",
      Markup: "",
      Total: "",
      isNew: true,
    },
  ]);

  const [DateDecode, setDateDecode] = useState({});
  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
      if (res?.data?.companyId) {
        getData(res?.data?.companyId);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // useEffect(() => {
  // }, [staffData]);

  useEffect(() => {
    fetchData();
  }, [rowsPerPage, page, search, selectedStatus]);

  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY");
      }
    };

    handleDateFormat();
  }, [DateDecode]);
  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  // const [staffData, setStaffData] = useState(undefined);

  const getData = async (companyId) => {
    setLoader(true);
    try {
      const res = await AxiosInstance.get(`/invoice/${companyId}`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          statusFilter: selectedStatus || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      if (res?.data?.statusCode === 200) {
        setInvoiceData(res?.data?.data || []); // Store invoice data if needed
        setCountData(res?.data?.totalCount || 0); // Store count data if needed
        // setStaffData(res?.data?.staffData || []); // Store staff data here
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (tokenDecode?.companyId) {
      getData(tokenDecode?.companyId);
    }
  }, [page, search, sortField, sortOrder]);
  const handleEditClick = (id) => {
    if (CompanyName) {
      navigate(`/${CompanyName}/addinvoice`, {
        state: {
          invoiceId: id,
          navigats: [...location?.state?.navigats, "/addinvoice"],
        },
      });
    } else {
      navigate(`/staff-member/workeraddinvoice`, {
        state: {
          invoiceId: id,
          navigats: [...location?.state?.navigats, "/addinvoice"],
        },
      });
    }
  };

  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/invoice/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode === 200) {
            setInvoiceData((prevData) =>
              prevData.filter((item) => item?.InvoiceId !== id)
            );
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            getData(tokenDecode?.companyId);
          } else {
            showToast.warning("", response?.data?.message, "error");
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error);
        }
      } else {
        showToast.success("Invoice is safe!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    });
    setTimeout(() => {
      const deleteButton = document.querySelector(".swal-button--confirm");
      if (deleteButton) {
        deleteButton.disabled = true;
      }
    }, 0);
  };

  const formik = useFormik({
    initialValues: {
      Title: "",
      InvoiceNumber: 1,
      CustomerId: "",
      CompanyId: localStorage.getItem("CompanyId"),
      LocationId: "",
      CustomerMessage: "",
      ContractDisclaimer:
        "Contract/ Disclaimer\nThis quote is valid for the next 30 days, after which values may be subject to change.",
      Attachment: [],
      Discount: "",
    },
    validationSchema: Yup.object({
      Title: Yup.string().required("Title is Required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const strings = [];
        for (let item of values?.Attachment) {
          if (typeof item !== "string") {
            const string = await postFile(item);
            strings.push(string);
          } else {
            strings.push(item);
          }
        }

        for (let item of lineItems) {
          if (typeof item?.Attachment !== "string") {
            const string = await postFile(item?.Attachment);
            item.Attachment = string;
          }
        }
        const object = {
          ...values,
          details: lineItems,
          Attachment: strings,
        };
        let response;
        if (!location?.state?.id) {
          response = await AxiosInstance.post(`${baseUrl}/invoice`, object);
        } else {
          response = await AxiosInstance.put(
            `${baseUrl}/invoice/${location?.state?.id}`,
            object
          );
        }
        showToast.success(response?.message);

        if (response.status === 200) {
          showToast.success(response?.message);
          navigate(`/${CompanyName}/invoice`, {
            state: {
              navigats: location?.state?.navigats.filter(
                (item) => item !== "/AddInvoice"
              ),
            },
          });
        }
      } catch (error) {
        showToast.error("", error?.message, "error");

        console.error("Error: ", error);
      }
    },
  });
  const cellData = invoiceData?.map((item, index) => {
    return {
      key: item?.InvoiceId,
      value: [
        page * rowsPerPage + index + 1,
        <>
          {item?.customer?.FirstName || "FirstName not available"}{" "}
          {item?.customer?.LastName || "LastName not available"}
        </>,
        <>
          #{item?.InvoiceNumber || "InvoiceNumber not available"}
          <br />
          {item?.Subject
            ? item?.Subject
            : item?.account_name || "account_name not available"}
        </>,
        <>
          <br />
          {item?.location &&
            Object.entries(item?.location)
              .map(([key, value]) => value || "value not available")
              .join(", ")}
        </>,
        // item?.DueDate
        //   ? typeof item?.DueDate === "number"
        //     ? new Date(item?.DueDate).toLocaleDateString("en-US")
        //     : new Date(item?.DueDate).toLocaleDateString("en-US")
        //   : "-"
        moment(item?.DueDate).format(dateFormat),
        `$${new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item?.Total ?? 0)}` || ")}` not available",
        `$${new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item?.invoiceAccount ?? 0)}`,

        <Typography
          style={{
            color:
              item?.Status === "Paid"
                ? "#089F57"
                : item?.Status === "Unpaid"
                ? "#F82C50"
                : item?.Status === "Canceled"
                ? "#FF0000"
                : "#E88C44",
            fontWeight: 500,
          }}
        >
          {item?.Status || "Status not available"}
        </Typography>,
        <>
          {staffData?.Invoice?.ViewCreateAndEdit ||
          staffData?.Invoice?.ViewCreateEditAndDelete ||
          !staffData ? (
            <>
              <EditIcon
                onClick={(e) => {
                  if (item?.Status !== "Canceled") {
                    e.stopPropagation();
                    handleEditClick(item?.InvoiceId);
                  }
                }}
                style={{
                  opacity: item?.Status === "Canceled" ? 0.5 : 1,
                  cursor:
                    item?.Status === "Canceled" ? "not-allowed" : "pointer",
                  pointerEvents:
                    item?.Status === "Canceled" ||
                    !(
                      staffData?.Invoice?.ViewCreateAndEdit ||
                      staffData?.Invoice?.ViewCreateEditAndDelete
                    )
                      ? "none"
                      : "auto",
                }}
              />
              <DeleteIcone
                className="customerEditImgToEdit"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item?.InvoiceId);
                }}
                style={{
                  pointerEvents: !(
                    staffData?.Invoice?.ViewCreateEditAndDelete ||
                    staffData?.Invoice?.ViewCreateAndEdit ||
                    !staffData
                  )
                    ? "none"
                    : "auto",
                }}
                disabled={staffData?.Invoice?.ViewOnly}
              />
            </>
          ) : null}
        </>,
      ],
    };
  });
  const handleDropdownSelect = (status) => {
    setSelectedStatus(status);
  };
  const dropdownOptions = [
    { text: "All" },
    { text: "Paid" },
    { text: "Unpaid" },
    { text: "Canceled" },
  ];
  return (
    <>
      <InvoiceViews
        loader={loader}
        search={search}
        setSearch={setSearch}
        cellData={cellData}
        setIsCustomer={setIsCustomer}
        setModalSource={setModalSource}
        page={page}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        CompanyName={CompanyName}
        countData={countData}
        rowsPerPage={rowsPerPage}
        isCustomer={isCustomer}
        formik={formik}
        lineItems={lineItems}
        propertyData={propertyData}
        setPropertyData={setPropertyData}
        isProperty={isProperty}
        setIsProperty={setIsProperty}
        customersData={customersData}
        setCustomersData={setCustomersData}
        source={source}
        staffData={staffData}
        // setStaffData={setStaffData}
        dropdownOptions={dropdownOptions}
        handleDropdownSelect={handleDropdownSelect}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
    </>
  );
};

export default Invoice;
