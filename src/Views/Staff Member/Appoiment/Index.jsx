import React, { useState, useEffect } from "react";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
  JobberSorting,
} from "../../../components/MuiTable/index.jsx";
import "./style.css";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import AxiosInstance from "../../AxiosInstance.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LoaderComponent } from "../../../components/Icon/Index.jsx";
import { Grid, Typography } from "@mui/material";
import showToast from "../../../components/Toast/Toster.jsx";

const WorkerAppointments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    handleAuth(navigate, location);
  }, [navigate, location]);

  const baseUrl = process.env.REACT_APP_BASE_API;
  const [modelOpen, setModelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [teamSize, setTeamSize] = useState([]);
  const [totalCount, setCountData] = useState(0);
  const [loader, setLoader] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tokenDecode, setTokenDecode] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(null);
  const fetchTokenDecode = async () => {
    try {
      const res = await handleAuth(navigate, location);
      setTokenDecode(res?.data || {});
    } catch (error) {
      console.error("Error fetching token decode data:", error);
      showToast.error("Failed to fetch authentication data.");
    }
  };

  useEffect(() => {
    fetchTokenDecode();
  }, []);

  const companyId = tokenDecode?.companyId;
  const WorkerId = localStorage.getItem("worker_id");
  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch table data
  const getData = async () => {
    if (companyId && WorkerId) {
      try {
        setLoader(true); // Show overlay loader
        const res = await AxiosInstance.get(
          `${baseUrl}/visits/worker_visits/${companyId}/${WorkerId}`,
          {
            params: {
              pageSize: rowsPerPage,
              pageNumber: page,
              search: search || "",
              statusFilter: selectedStatus || "",
              sortField: sortField,
              sortOrder: sortOrder,
            },
          }
        );

        if (res?.data) {
          setTeamSize(res.data.data || []); // Update table data
          setCountData(res.data.totalCount || 0); // Update count
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoader(false); // Hide overlay loader
      }
    }
  };

  useEffect(() => {
    if (companyId && WorkerId) {
      getData();
    }
  }, [
    rowsPerPage,
    page,
    search,
    companyId,
    WorkerId,
    selectedStatus,
    sortField,
    sortOrder,
  ]);

  const handleRowClick = (item) => {
    if (item && item?.VisitId) {
      navigate(`/staff-member/appointment-confirm?visitId=${item?.VisitId}`);
    } else {
      console.error("Item or VisitId is undefined:", item);
      showToast.error("Failed to navigate to appointment confirmation.");
    }
  };

  const statusStyles = {
    Complete: {
      color: "#089F57",
      fontWeight: "bold",
    },
    pending: {
      color: "#E88C44",
      fontWeight: "bold",
    },
    confirmed: {
      color: "#063164",
      fontWeight: "bold",
    },
  };

  // Table data preparation
  const cellData = teamSize?.map((item, index) => {
    const isConfirmed = item?.ConfirmWorker?.includes(WorkerId);
    const isCompleted = item?.ConfirmComplete?.includes(WorkerId);
    return {
      key: item?.VisitId,
      value: [
        page * rowsPerPage + index + 1,
        item?.ItemName || "ItemName not available",
        <>
          #{" "}
          {item?.ContractData?.ContractNumber || "ContractNumber not available"}
        </>,
        moment(item?.StartDate).format("MM-DD-YYYY"),
        `${item?.Location?.Address || "Address not available"}, ${
          item?.Location?.City || "City not available"
        }, ${item?.Location?.State || "State not available"}, ${
          item?.Location?.Country || "Country not available"
        }`,
        <Typography
          // style={isConfirmed ? statusStyles.confirmed : statusStyles.pending}
          style={
            isConfirmed && isCompleted
              ? statusStyles.Complete
              : isConfirmed
              ? statusStyles.confirmed
              : statusStyles.pending
          }
        >
          {isConfirmed && isCompleted
            ? "Complete"
            : isConfirmed
            ? "Confirmed"
            : "Pending"}
        </Typography>,
      ],
      component: item,
      onClick: () => handleRowClick(item),
    };
  });
  const handleDropdownSelect = (status) => {
    setSelectedStatus(status);
  };

  const dropdownOptions = [
    { text: "All" },
    { text: "Confirmed" },
    { text: "Pending" },
  ];

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3 mt-5">
        <Grid className="d-flex justify-content-start mb-2">
          <Typography
            className="text-blue-color heading-four"
            style={{ fontWeight: 700 }}
          >
            Appointment
          </Typography>
        </Grid>
        <Card style={{ borderRadius: "20px", border: "2px solid #063164" }}>
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header bg-blue-color superAdminCompany customersAddCustomers"
            style={{
              borderBottom: "2px solid #063164",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography
              className="plan text-light heading-thrre tableNameHead"
              variant={"h6"}
              style={{ marginRight: "auto" }}
            >
              Appointment List{" "}
            </Typography>
            <Grid className="plansearch gap-2 d-flex appointmentSearchInput searchBarOfTable">
              <JobberSorting
                dropdownItems={dropdownOptions}
                placeholder="Select status"
                onSelect={handleDropdownSelect}
              />
              <JobberSearch
                search={search}
                setSearch={setSearch}
                style={{ background: "transparent", color: "#fff" }}
              />
            </Grid>
          </CardHeader>
          {loader ? (
            <Grid
              className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5"
              style={{ height: "80vh", marginTop: "25%" }}
            >
              <LoaderComponent loader={loader} height="50" width="50" />
            </Grid>
          ) : (
            <CardBody style={{ padding: "10px 0px" }}>
              <JobberTable
                className=""
                // headerData={[
                //   "Sr No",
                //   "Item Name",
                //   "Contract Number",
                //   "Appointment Date",
                //   "Location",
                //   "Status",
                // ]}
                headerData={[
                  { label: "Sr No." },
                  { label: "Item Name", field: "FirstName" },
                  {
                    label: "Contract Number",
                    field: "ContractNumber",
                  },
                  { label: "Appointment Date", field: "properties.Address" },
                  { label: "Location", field: "properties.Address" },
                  { label: "Status", field: "properties.Address" },
                ]}
                cellData={cellData}
                page={page}
                isNavigate={true}
                navigatePath={"/staff-member/appointment-confirm"}
                setSortField={setSortField}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
              />
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color"
            style={{
              borderTop: "2px solid #063164",
              borderBottomLeftRadius: "20px",
              borderBottomRightRadius: "20px",
            }}
          >
            <JobberPagination
              totalData={totalCount}
              currentData={rowsPerPage}
              dataPerPage={rowsPerPage}
              pageItems={[10, 25, 50, 100]}
              page={page}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
            />
          </CardFooter>
        </Card>
      </Grid>
    </>
  );
};

export default WorkerAppointments;
