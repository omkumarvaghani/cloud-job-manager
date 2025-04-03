import React, { useState, useEffect } from "react";
import Edit from "../../../assets/image/icons/edit.svg";
import Delete from "../../../assets/image/icons/delete.svg";
import swal from "sweetalert";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance.jsx";
import Quote from "./Views/Quote.jsx";
import sendSwal from "../../../components/Swal/sendSwal.jsx";
import { DeleteIcone, EditIcon } from "../../../components/Icon/Index.jsx";
import showToast from "../../../components/Toast/Toster.jsx";
import { useStaffContext } from "../../../components/StaffData/Staffdata.jsx";

const Quotes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [quotesData, setQuotesData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [tokenDecode, setTokenDecode] = useState({});
  const [DateDecode, setDateDecode] = useState({});
  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY");
  const { staffData } = useStaffContext();

  useEffect(() => {
    handleAuth(navigate, location);
  }, []);

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res.data);
      setDateDecode(res.themes);
      if (res?.data?.CompanyId) {
        getData(res?.data?.CompanyId);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [rowsPerPage, page, search, selectedStatus]);
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

  const handleDropdownSelect = (status) => {
    setSelectedStatus(status);
  };

  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  const getData = async (CompanyId) => {
    try {
      setLoader(true);
      const params = {
        pageSize: rowsPerPage,
        pageNumber: page,
        search: search || "",
        statusFilter: selectedStatus || "",
        sortField: sortField,
        sortOrder: sortOrder,
      };

      const res = await AxiosInstance.get(`/v1/quote/get_quotes/${CompanyId}`, {
        params,
      });
      console.log(res,"resres12")
      if (res?.data) {
        setQuotesData(res?.data?.data || []);
        setCountData(res?.data?.totalCount || 0);
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
    if (tokenDecode?.CompanyId) {
      getData(tokenDecode?.CompanyId);
    }
  }, [page, search, sortField, sortOrder]);

  const handleEditClick = (id) => {
    if (CompanyName) {
      navigate(`/${CompanyName}/add-quotes`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-quotes"],
        },
      });
    } else {
      navigate(`/staff-member/add-quotes`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-quotes"],
        },
      });
    }
  };

  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/v1/quote/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode === 200) {
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            getData(tokenDecode?.CompanyId);
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error?.message || "An error occurred");
        }
      } else {
        showToast.success("Quote is safe!", {
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

  const cellData = quotesData?.map((item, index) => {
    return {
      key: item.QuoteId,
      value: [
        page * rowsPerPage + index + 1,
        `${item?.customer?.FirstName || "FirstName not available"} ${
          item?.customer?.LastName || "LastName not available"
        }`,
        <>
          #{item?.QuoteNumber || "QuoteNumber not available"}
          <br />
          {item?.Title || "Title not available"}
        </>,
        `${item?.location?.Address || "Address not available"}, ${
          item?.location?.City || "City not available"
        },${item?.location?.State || "State not available"}, ${
          item?.location?.Country || "Country not available"
        }, ${item?.location?.Zip || "Zip not available"}`,
        moment(item.updatedAt).format(dateFormat),
        <b
          style={{
            color:
              item?.Status === "Awaiting Response"
                ? "orange"
                : item?.Status === "Approved"
                ? "#58cc58"
                : item?.Status === "Request changed"
                ? "#FF33C6"
                : "",
          }}
        >
          {item?.Status}
        </b>,
        <>{`$${new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(item?.Total || 0)}`}</>,
        <>
          {staffData?.Quotes?.ViewCreateAndEdit ||
          staffData?.Quotes?.ViewCreateEditAndDelete ||
          !staffData ? (
            <>
              <EditIcon
                onClick={(e) => {
                  if (item?.Status !== "Canceled") {
                    e.stopPropagation();
                    handleEditClick(item?.QuoteId);
                  }
                }}
                style={{
                  opacity: item?.Status === "Canceled" ? 0.5 : 1,
                  cursor:
                    item?.Status === "Canceled" ? "not-allowed" : "pointer",
                  pointerEvents:
                    item?.Status === "Canceled" ||
                    !(
                      staffData?.Quotes?.ViewCreateAndEdit ||
                      staffData?.Quotes?.ViewCreateEditAndDelete
                    )
                      ? "none"
                      : "auto",
                }}
              />
              <DeleteIcone
                className="customerEditImgToEdit"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item?.QuoteId);
                }}
                style={{
                  pointerEvents: !(
                    staffData?.Quotes?.ViewCreateEditAndDelete ||
                    staffData?.Quotes?.ViewCreateAndEdit ||
                    !staffData
                  )
                    ? "none"
                    : "auto",
                }}
                disabled={staffData?.Quotes?.ViewOnly}
              />
            </>
          ) : null}
        </>,
      ],
    };
  });

  const collapseData = quotesData?.map((item) => ({
    createdAt: item?.createdAt || "No details provided",
  }));

  const dropdownOptions = [
    { text: "All" },
    { text: "Awaiting Response" },
    { text: "Approved" },
    { text: "Draft" },
    { text: "Request changed" },
  ];

  return (
    <>
      <Quote
        loader={loader}
        search={search}
        setSearch={setSearch}
        cellData={cellData}
        collapseData={collapseData}
        page={page}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        CompanyName={CompanyName}
        countData={countData}
        dropdownOptions={dropdownOptions}
        rowsPerPage={rowsPerPage}
        handleDropdownSelect={handleDropdownSelect}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
    </>
  );
};

export default Quotes;
