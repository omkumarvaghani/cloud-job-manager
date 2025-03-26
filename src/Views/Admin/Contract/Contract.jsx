import React, { useState, useEffect } from "react";
import "./style.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance.jsx";
import ContractView from "./views/Contract.jsx";
import sendSwal from "../../../components/Swal/sendSwal.jsx";
import { DeleteIcone, EditIcon } from "../../../components/Icon/Index.jsx";
import showToast from "../../../components/Toast/Toster.jsx";
import { useStaffContext } from "../../../components/StaffData/Staffdata.jsx";

const Contract = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customerData, setCustomerData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [tokenDecode, setTokenDecode] = useState(null);
  const [DateDecode, setDateDecode] = useState({});
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
  const getData = async (CompanyId) => {
    setLoader(true);
    try {
      const res = await AxiosInstance.get(`/v1/contract/${CompanyId}`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          statusFilter: selectedStatus || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      if (res?.data) {
        setCustomerData(res?.data?.data || []);
        setCountData(res?.data?.totalCount || 0);
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
      navigate(`/${CompanyName}/add-contract`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-contract"],
        },
      });
    } else {
      navigate(`/staff-member/add-contract`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-contract"],
        },
      });
    }
  };

  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/contract/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data.statusCode === 200) {
            setCustomerData((prevData) =>
              prevData.filter((item) => item?.ContractId !== id)
            );
            setTimeout(() => {
              showToast.success(response?.data?.message);
            }, 500);
            getData(tokenDecode?.CompanyId);
          } else {
            showToast.warning(response?.data?.message);
          }
        } catch (error) {
          console.error("Error:", error);
          showToast.error(error);
        }
      } else {
        showToast.success("Contract is safe!", {
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

  const cellData =
    customerData &&
    customerData?.length > 0 &&
    customerData?.map((item, index) => {
      const properties = item?.properties || [];
      let propertyDisplay;
      if (properties?.length === 1) {
        const property = properties[0];
        propertyDisplay = `${
          property?.street_address1 || "street address1 not available"
        }
       ${property?.street_address2 || "street address2 not available"}
       ${property?.street_address3 || "street address3 not available"} ${
          property?.city || "city not available"
        } 
       ${property?.state || "state not available"} 
      ${property?.country || "country not available"} 
      ${property?.zip_code || "zip code not available"}`;
      } else {
        propertyDisplay = `${properties?.length} ${
          properties.length > 1 ? "Properties" : "Property"
        }`;
      }

      return {
        key: item?.ContractId,
        value: [
          page * rowsPerPage + index + 1,
          `${item?.customer?.FirstName || "FirstName not available"} ${
            item?.customer?.LastName || "LastName not available"
          }`,
          <>
            #{item?.ContractNumber || "ContractNumber not available"}
            <br />
            {item?.Title || "Title not available"}
          </>,
          <div
            dangerouslySetInnerHTML={{
              __html: `${item?.location?.Address || "Address not available"}, ${
                item?.location?.City || "City not available"
              }<br>${item?.location?.State || "State not available"}, ${
                item?.location?.Country || "Country not available"
              }, ${item?.location?.Zip || "Zip not available"}`,
            }}
          />,
          item?.RecuringJob?.StartDate
            ? moment(item?.RecuringJob?.StartDate).format(dateFormat)
            : item?.OneoffJob?.StartDate
            ? moment(item?.OneoffJob?.StartDate).format(dateFormat)
            : "-",

          <b
            style={{
              color:
                item?.Status === "Unscheduled"
                  ? "#E88C44"
                  : item?.Status === "Today"
                  ? "#089F57"
                  : item?.Status === "Upcoming"
                  ? "#089F57"
                  : item?.Status === "Scheduled"
                  ? "#C8CC00"
                  : item?.Status === "Converted"
                  ? "#1f104f"
                  : "",
            }}
          >
            {item?.Status}
          </b>,
          <>{`$${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(item?.Total ?? 0)}`}</>,
          // <>
          //   <EditIcon
          //     onClick={(e) => {
          //       e.stopPropagation();
          //       handleEditClick(item?.ContractId);
          //     }}
          //   />
          //   <DeleteIcone
          //     className="customerEditImgToEdit"
          //     onClick={(e) => {
          //       e.stopPropagation();
          //       handleDelete(item?.ContractId);
          //     }}
          //   />
          // </>,
          <>
            {staffData?.Contract?.ViewCreateAndEdit ||
            staffData?.Contract?.ViewCreateEditAndDelete ||
            !staffData ? (
              <>
                <EditIcon
                  onClick={(e) => {
                    if (item?.Status !== "Canceled") {
                      e.stopPropagation();
                      handleEditClick(item?.ContractId);
                    }
                  }}
                  style={{
                    opacity: item?.Status === "Canceled" ? 0.5 : 1,
                    cursor:
                      item?.Status === "Canceled" ? "not-allowed" : "pointer",
                    pointerEvents:
                      item?.Status === "Canceled" ||
                      !(
                        staffData?.Contract?.ViewCreateAndEdit ||
                        staffData?.Contract?.ViewCreateEditAndDelete
                      )
                        ? "none"
                        : "auto",
                  }}
                />
                <DeleteIcone
                  className="customerEditImgToEdit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item?.ContractId);
                  }}
                  style={{
                    pointerEvents: !(
                      staffData?.Contract?.ViewCreateEditAndDelete ||
                      staffData?.Contract?.ViewCreateAndEdit ||
                      !staffData
                    )
                      ? "none"
                      : "auto",
                  }}
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
    { text: "Unscheduled" },
    { text: "Scheduled" },
    { text: "Converted" },
    { text: "Upcoming" },
    { text: "Today" },
  ];

  return (
    <>
      <ContractView
        loader={loader}
        search={search}
        setSearch={setSearch}
        cellData={cellData}
        page={page}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        CompanyName={CompanyName}
        countData={countData}
        rowsPerPage={rowsPerPage}
        dropdownOptions={dropdownOptions}
        handleDropdownSelect={handleDropdownSelect}
        dateFormat={dateFormat}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
    </>
  );
};

export default Contract;
