import React, { useState, useEffect } from "react";
import sendSwal from "../../../components/Swal/sendSwal.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import AxiosInstance from "../../AxiosInstance.jsx";
// import Client from "./Views/Customer.jsx"
import Template from "../Communications/Views/Templates.jsx";
import showToast from "../../../components/Toast/Toster.jsx";
import { DeleteIcone, EditIcon } from "../../../components/Icon/Index.jsx";
import { Typography } from "@mui/material";
import TemplatesViews from "./Views/Templates.jsx";
import moment from "moment";

const Templates = () => {
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
  const [DateDecode, setDateDecode] = useState({});
  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY HH:MM:ss");

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setDateDecode(res.themes);
      setTokenDecode(res?.data);
      getData(res?.data?.companyId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [rowsPerPage, page, search]);

  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY HH:MM:ss");
      }
    };

    handleDateFormat();
  }, [DateDecode]);

  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");
  const getData = async (companyId) => {
    setLoader(true);
    try {
      if (!companyId) {
        console.error("Company ID is not available.");
        return;
      }

      const res = await AxiosInstance.get(`/template/${companyId}`, {
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
    if (tokenDecode?.companyId) {
      getData(tokenDecode?.companyId);
    }
  }, [page, search, sortField, sortOrder]);
  const handleEditClick = (id) => {
    if (companyName) {
      navigate(`/${companyName}/add-templates`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-templates"],
        },
      });
    } else {
      navigate(`/staff-member/add-templates`, {
        state: {
          id,
          navigats: [...location?.state?.navigats, "/add-templates"],
        },
      });
    }
  };

  const handleDelete = (id) => {
    sendSwal().then(async (deleteReason) => {
      if (deleteReason) {
        try {
          const response = await AxiosInstance.delete(`/template/${id}`, {
            data: { DeleteReason: deleteReason },
          });

          if (response?.data?.statusCode === 200) {
            showToast.success(response?.data?.message);

            setcustomersData((prevData) =>
              prevData.filter((item) => item.TemplateId !== id)
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
        showToast.success("Template is safe!", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    });
  };

  const maxCharacters = 40;

  const truncateText = (text, maxCharacters) => {
    if (text.length > maxCharacters) {
      return text.slice(0, maxCharacters) + " ...";
    }
    return text;
  };

  const cellData = customersData?.map((item, index) => {
    if (!item) return {};

    return {
      key: item?.TemplateId || "TemplateId not available",
      value: [
        page * rowsPerPage + index + 1,
        `${item?.Name || "No Name"}`,
        item?.MailType || "No Type",
        item?.Subject || "No Subject",
        <p>{truncateText(item?.Body || "No Body", maxCharacters)}</p>,
        moment(item?.createdAt).format(dateFormat),
        <>
          <EditIcon
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item?.TemplateId);
            }}
          />

          <DeleteIcone
            className="customerEditImgToEdit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item?.TemplateId);
            }}
          />
        </>,
      ],
    };
  });

  const collapseData = customersData?.map((item) => ({
    createdAt: item?.createdAt || "No details provided",
  }));

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogData, setDialogData] = useState(null);

  const handleDialogOpen = (rowData) => {
    const filteredData = customersData?.filter(
      (item) => item?.TemplateId === rowData?.key
    );
    setDialogData(filteredData);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setDialogData(null);
  };

  return (
    <>
      <TemplatesViews
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
        openDialog={openDialog}
        dialogData={dialogData}
        handleDialogOpen={handleDialogOpen}
        handleDialogClose={handleDialogClose}
        customersData={customersData}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
    </>
  );
};

export default Templates;
