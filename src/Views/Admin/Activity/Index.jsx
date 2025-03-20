import React, { useState, useEffect } from "react";
import {
  JobberTable,
  JobberSearch,
  JobberPagination,
  JobberSorting,
} from "../../../components/MuiTable/index.jsx";
import swal from "sweetalert";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { handleAuth } from "../../../components/Login/Auth.jsx";
import moment from "moment";
import AxiosInstance from "../../AxiosInstance.jsx";
import "./style.css";
import { Grid } from "@mui/material";
import { LoaderComponent } from "../../../components/Icon/Index.jsx";
import { Typography } from "@mui/material";

const Quotes = () => {
  useEffect(() => {
    handleAuth(navigate, location);
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { companyName } = useParams();
  const baseUrl = process.env.REACT_APP_BASE_API;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [quotesData, setQuotesData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [countData, setCountData] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const [search2, setSearch2] = useState("");
  const [companyData, setCompanyData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [sortField, setSortField] = useState("asc");
  const [sortOrder, setSortOrder] = useState("desc");

  const getData = async () => {
    try {
      const res = await AxiosInstance.get(
        `${baseUrl}/activitylog/${localStorage.getItem("CompanyId")}`,
        {
          params: {
            pageSize: rowsPerPage,
            pageNumber: page,
            search: search || "",
            actionFilter: selectedStatus || "",
            sortField: sortField,
            sortOrder: sortOrder,
          },
        }
      );
      setQuotesData(res.data.data);
      setCountData(res.data.totalRecords);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    getData();
  }, [rowsPerPage, page, search, selectedStatus, sortField, sortOrder]);

  const cellData = quotesData?.map((item, index) => {
    return {
      key: item?.ActivityId,
      value: [
        page * rowsPerPage + index + 1,
        `${item?.ActivityBy || "ActivityBy not availabel"} - ${
          item?.ActivityByUsername || "Username not available"
        }`,
        `${item?.Action || "Action not available"} - ${
          item?.Entity || "Entity not available"
        }`,
        `${item?.Activity?.description || "Description not available"}`,
        `${item?.Reason || "Reason not available"}`,
        moment(item?.createdAt).format("MM-DD-YYYY - hh:mm:a"),
      ],
    };
  });

  const collapseData = quotesData?.map((item) => ({
    createdAt: item.createdAt || "No details provided",
  }));
  const handleDropdownSelect = (status) => {
    setSelectedStatus(status);
  };

  const dropdownOptions = [
    { text: "All" },
    { text: "Create" },
    { text: "Update" },
    { text: "Delete" },
  ];

  return (
    <>
      <Grid className="justify-content-center align-items-center mb-3">
        <Grid className="d-flex justify-content-between mb-2 align-items-center"></Grid>
        <Card
          className="border-blue-color"
          style={{
            borderRadius: "20px",
            border: "2px solid",
            padding: 0,
          }}
        >
          <CardHeader
            className="d-flex justify-content-between align-items-center table-header border-blue-color bg-blue-color customersAddCustomers"
            style={{
              borderBottom: "2px solid",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
            }}
          >
            <Typography
              className="quot text-light heading-five tableNameHead"
              style={{ marginRight: "auto" }}
            >
              Activity
            </Typography>
            <Grid className="d-flex gap-2 searchBarOfTable">
              <JobberSorting
                dropdownItems={dropdownOptions}
                placeholder="Select status"
                onSelect={handleDropdownSelect}
              />
              {/* <JobberSearch
                search={search}
                setSearch={setSearch}
                style={{
                  background: "transparant",
                  color: "#fff",
                }}
              /> */}
            </Grid>
          </CardHeader>
          {loader ? (
            <Grid className="d-flex flex-direction-row justify-content-center align-items-center p-5 m-5">
              <LoaderComponent height="50" width="50" loader={loader} />
            </Grid>
          ) : (
            <CardBody style={{ padding: "10px 0px" }}>
              <JobberTable
                // headerData={[
                //   "Sr No.",
                //   "Activity By ",
                //   "Action ",
                //   "Details",
                //   "Reason",
                //   "Date & Time",
                // ]}
                headerData={[
                  { label: "Sr No.", field: "ActivityId" },
                  { label: "Activity By", field: "customerData.FirstName" },
                  { label: "Action", field: "QuoteNumber" },
                  { label: "Details", field: "locationData.Address" },
                  { label: "Reason", field: "Created At" },
                  { label: "Date & Time", field: "Status" },
                  // { label: "Total", field: "Total" },
                ]}
                cellData={cellData}
                collapseData={collapseData}
                isCollapse={false}
                page={page}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                sortField={sortField}
                isNavigate={true}
                setSortField={setSortField} 
              />
            </CardBody>
          )}
          <CardFooter
            className="bg-orange-color border-blue-color"
            style={{
              borderTop: "2px solid ",
              borderBottomLeftRadius: "20px",
              borderBottomRightRadius: "20px",
            }}
          >
            <JobberPagination
              totalData={countData}
              currentData={rowsPerPage}
              dataPerPage={rowsPerPage}
              pageItems={[10, 25, 50]}
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

export default Quotes;
