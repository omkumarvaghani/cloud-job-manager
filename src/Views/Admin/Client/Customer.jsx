import React, { useState, useEffect } from "react";
import sendSwal from "../../../components/Swal/sendSwal.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import AxiosInstance from "../../AxiosInstance.jsx";
import Client from "./Views/Customer.jsx";
import showToast from "../../../components/Toast/Toster.jsx";
import { DeleteIcone, EditIcon } from "../../../components/Icon/Index.jsx";
import { Typography } from "@mui/material";
import { useStaffContext } from "../../../components/StaffData/Staffdata.jsx";
import { TroubleshootOutlined } from "@mui/icons-material";

const Customer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(TroubleshootOutlined);
  const [countData, setCountData] = useState(0);
  const [tokenDecode, setTokenDecode] = useState(null);
  const isEdited = true;
  const { staffData } = useStaffContext();

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
      if (res?.data?.CompanyId) {
        getData(res?.data?.CompanyId);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [rowsPerPage, page, search]);

  // const getData = async (CompanyId) => {
  //   setLoader(true);
  //   try {
  //     if (!CompanyId) {
  //       console.error("Company ID is not available.");
  //       return;
  //     }

  //     const res = await AxiosInstance.get(`/customer/get/${CompanyId}`, {
  //       params: {
  //         pageSize: rowsPerPage,
  //         pageNumber: page,
  //         search: search || "",
  //       },
  //     });

  //     if (res?.data) {
  //       setcustomersData(res.data.data || []);
  //       setCountData(res.data.totalCount || 0);
  //     } else {
  //       console.error("No data received from the server.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     setLoader(false);
  //   }
  // };
  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  const getData = async (CompanyId) => {
    if (!CompanyId) {
      console.error("Company ID is not available.");
      return;
    }

    try {
      const res = await AxiosInstance.get(
        `/v1/customer/customers/${CompanyId}`,
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
        setcustomersData(res?.data?.data || []);
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
      navigate(`/${CompanyName}/add-customer`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-customer"],
        },
      });
    } else {
      navigate(`/staff-member/add-customer`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-customer"],
        },
      });
    }
  };

  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/v1/user/${id}`, {
            data: { DeleteReason: deleteReason },
          });
          if (response?.data?.statusCode == 200) {
            showToast.success(response?.data?.message);

            setcustomersData((prevData) =>
              prevData.filter((customer) => customer.UserId !== id)
            );

            getData(tokenDecode?.CompanyId);
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
    // const properties = item?.location || [];
    const properties = item?.locationsData ? [item.locationsData] : [];
    console.log(item, "item");
    let propertyDisplay;
    if (properties.length === 1) {
      const property = properties[0];
      propertyDisplay = `${property?.Address || "Address not available"}, ${
        property?.City || "City not available"
      }, ${property?.State || "State not available"}, ${
        property?.Country || "Country not available"
      }, ${property?.Zip || "Zip not available"}`;
    } else {
      propertyDisplay = `${properties.length} ${
        properties.length > 1 ? "Properties" : "Property"
      }`;
    }

    return {
      key: item?.UserId,
      value: [
        page * rowsPerPage + index + 1,

        `${item?.profile?.FirstName || "FirstName not available"} ${
          item?.profile?.LastName || "LastName not available"
        }`,
        item?.EmailAddress || "EmailAddress not available",

        properties.length === 1 ? (
          propertyDisplay
        ) : (
          <Typography>{propertyDisplay}</Typography>
        ),
        <>
          {staffData?.CustomersProperties
            ?.ViewAndEditFullCustomerAndPropertyInfo ||
          staffData?.CustomersProperties
            ?.ViewEditAndDeleteFullCustomerAndPropertyInfo ||
          !staffData ? (
            <>
              <EditIcon
                onClick={(e) => {
                  if (item?.Status !== "Canceled") {
                    e.stopPropagation();
                    handleEditClick(item?.UserId);
                  }
                }}
                style={{
                  opacity: item?.Status === "Canceled" ? 0.5 : 1,
                  cursor:
                    item?.Status === "Canceled" ? "not-allowed" : "pointer",
                  pointerEvents:
                    item?.Status === "Canceled" ||
                    !(
                      staffData?.CustomersProperties
                        ?.ViewAndEditFullCustomerAndPropertyInfo ||
                      staffData?.CustomersProperties
                        ?.ViewEditAndDeleteFullCustomerAndPropertyInfo
                    )
                      ? "none"
                      : "auto",
                }}
              />
              <DeleteIcone
                className="customerEditImgToEdit"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item?.UserId);
                }}
                style={{
                  pointerEvents: !(
                    staffData?.CustomersProperties
                      ?.ViewEditAndDeleteFullCustomerAndPropertyInfo ||
                    staffData?.CustomersProperties
                      ?.ViewAndEditFullCustomerAndPropertyInfo ||
                    !staffData
                  )
                    ? "none"
                    : "auto",
                }}
                disabled={staffData?.CustomersProperties?.ViewOnly}
              />
            </>
          ) : null}
        </>,
      ],
    };
  });

  const collapseData = customersData?.map((item) => ({
    createdAt: item?.createdAt || "No details provided",
  }));

  return (
    <>
      <Client
        loader={loader}
        search={search}
        setSearch={setSearch}
        cellData={cellData}
        collapseData={collapseData}
        page={page}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        rowsPerPage={rowsPerPage}
        CompanyName={CompanyName}
        countData={countData}
        isEdited={isEdited}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
    </>
  );
};

export default Customer;
