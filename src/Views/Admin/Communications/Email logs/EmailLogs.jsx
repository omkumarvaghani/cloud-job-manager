import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Client from "./views/EmailLogs.jsx";
import { handleAuth } from "../../../../components/Login/Auth.jsx";
import AxiosInstance from "../../../AxiosInstance.jsx";
import moment from "moment";

const EmailLogs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { CompanyName } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customersData, setcustomersData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const isEdited = true;
  const [DateDecode, setDateDecode] = useState({});
  const [dateFormat, setDateFormat] = useState("MM-DD-YYYY HH:MM:ss");
  const [tokenDecode, setTokenDecode] = useState(null);
  const fettchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data);
      if (res?.data?.companyId) {
        getData(res?.data?.companyId);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fettchData();
  }, [rowsPerPage, page, search]);

  const fetchData = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setDateDecode(res.themes);
      getData(res.data.companyId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [rowsPerPage, page, search]);

  // useEffect(() => {
  //   const handleDateFormat = () => {
  //     if (DateDecode?.Format) {
  //       setDateFormat(DateDecode?.Format);
  //     } else {
  //       setDateFormat("MM-DD-YYYY HH:MM:ss");
  //     }
  //   };

  //   handleDateFormat();
  // }, [DateDecode]);
  useEffect(() => {
    const handleDateFormat = () => {
      if (DateDecode?.Format) {
        setDateFormat(DateDecode?.Format);
      } else {
        setDateFormat("MM-DD-YYYY HH:mm:ss"); // Fixed: "MM" -> "mm" for minutes
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

      const res = await AxiosInstance.get(`/email-log/logs/${companyId}`, {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page,
          search: search || "",
          sortField: sortField,
          sortOrder: sortOrder,
        },
      });
      if (res?.data) {
        setcustomersData(res.data.emails || []);
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

  const cellData = customersData?.map((item, index) => ({
    key: item?.EmailId || index,
    value: [
      page * rowsPerPage + index + 1,
      `${item?.FirstName || "FirstName not available"} ${item?.LastName || ""}`,
      item?.email || "email not available",
      item?.Subject || "Subject not available",
      moment(item?.createdAt).format(dateFormat),
      item.openedAt
        ? moment(new Date(Number(item.openedAt))).format("MM-DD-YYYY HH:mm")
        : "Not Opened",
    ],
  }));
  const collapseData = customersData?.map((item) => ({
    createdAt: item?.createdAt || "No details provided",
  }));

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogData, setDialogData] = useState(null);
  const handleDialogOpen = (rowData) => {
    const filteredData = customersData?.filter(
      (item) => item?.EmailId === rowData?.key
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
        handleDialogOpen={handleDialogOpen}
        handleDialogClose={handleDialogClose}
        openDialog={openDialog}
        dialogData={dialogData}
        customersData={customersData}
        dateFormat={dateFormat}
        setSortField={setSortField}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        sortField={sortField}
      />
    </>
  );
};

export default EmailLogs;
