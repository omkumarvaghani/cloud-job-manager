import React, { useState, useEffect } from "react";
import sendSwal from "../../../components/Swal/sendSwal.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import AxiosInstance from "../../AxiosInstance.jsx";
import Client from "./Views/Reports.jsx";
import showToast from "../../../components/Toast/Toster.jsx";
import { DeleteIcone, EditIcon } from "../../../components/Icon/Index.jsx";
import { Typography } from "@mui/material";

const Reports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [tokenDecode, setTokenDecode] = useState(null);
  const isEdited = true;

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
      getData(res?.data?.companyId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [rowsPerPage, page, search]);

  const getData = async (companyId) => {
    setLoader(true);
    try {
      if (!companyId) {
        console.error("Company ID is not available.");
        return;
      }

      const res = await AxiosInstance.get(`/customer/get/${companyId}`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
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
          const response = await AxiosInstance.delete(`/customer/${id}`, {
            data: { DeleteReason: deleteReason },
          });

          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);

            setcustomersData((prevData) =>
              prevData.filter((customer) => customer.CustomerId !== id)
            );

            getData(tokenDecode?.companyId);
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
      } ,${property?.State || "State not available"} ,${property?.Country || "Country not available"},${
        property?.Zip || "Zip not available"
      } `;
    } else {
      propertyDisplay = `${properties.length} ${
        properties?.length > 1 ? "Properties" : "Property"
      }`;
    }
    return {
      key: item?.CustomerId,
      value: [
        page * rowsPerPage + index + 1,

        `${item?.FirstName || "FirstName not available"} ${item?.LastName || "LastName not available"}`,
        item?.EmailAddress || "EmailAddress not available",

        properties.length === 1 ? (
          propertyDisplay
        ) : (
          <Typography>{propertyDisplay}</Typography>
        ),
        <>
          <EditIcon
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item?.CustomerId);
            }}
          />

          <DeleteIcone
            className="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item?.CustomerId);
            }}
          />
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
        tokenDecode={tokenDecode}
      />
    </>
  );
};

export default Reports;
